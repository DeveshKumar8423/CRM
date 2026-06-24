"""Workflow execution engine (Phase 1)."""

from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from models import (
    ActivityLog,
    ClientNote,
    Deal,
    FollowUpReminder,
    Lead,
    LeaveRequest,
    User,
    Workflow,
    WorkflowRun,
    WorkflowSettings,
)
from services.notification_service import notify_role, notify_user
from workflow_config import (
    CONDITION_TYPES,
    FIELD_WHITELIST,
    MAX_ACTIONS_PER_WORKFLOW,
    MAX_NOTIFICATIONS_PER_RUN,
    TRIGGER_CATALOG,
)

_workflow_depth = 0


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _float(v) -> float:
    return float(v or 0)


def valid_trigger(trigger_type: str) -> bool:
    return any(t["key"] == trigger_type for t in TRIGGER_CATALOG)


def valid_module(module: str) -> bool:
    from workflow_config import WORKFLOW_MODULES
    return module in WORKFLOW_MODULES


def generate_workflow_code(db: Session, company_id: int, prefix: str = "WFL") -> str:
    year = _utcnow().year
    pattern = f"{prefix}-{year}-%"
    count = (
        db.query(func.count(Workflow.id))
        .filter(Workflow.company_id == company_id, Workflow.workflow_code.like(pattern))
        .scalar()
    )
    return f"{prefix}-{year}-{int(count or 0) + 1:04d}"


def generate_run_number(db: Session, company_id: int, prefix: str = "WFL-RUN") -> str:
    year = _utcnow().year
    pattern = f"{prefix}-{year}-%"
    count = (
        db.query(func.count(WorkflowRun.id))
        .filter(WorkflowRun.company_id == company_id, WorkflowRun.run_number.like(pattern))
        .scalar()
    )
    return f"{prefix}-{year}-{int(count or 0) + 1:04d}"


def load_record(db: Session, company_id: int, record_type: str, record_id: int):
    if record_type == "deal":
        return db.query(Deal).filter(Deal.id == record_id, Deal.company_id == company_id).first()
    if record_type == "lead":
        return db.query(Lead).filter(Lead.id == record_id, Lead.company_id == company_id).first()
    if record_type == "leave":
        return db.query(LeaveRequest).filter(LeaveRequest.id == record_id, LeaveRequest.company_id == company_id).first()
    return None


def record_snapshot(record_type: str, record) -> dict[str, Any]:
    if record is None:
        return {}
    if record_type == "deal":
        return {
            "id": record.id,
            "title": record.title,
            "stage": record.stage,
            "expected_value": _float(record.expected_value),
            "assigned_to_id": record.assigned_to_id,
            "contact_id": record.contact_id,
            "lead_id": record.lead_id,
            "updated_at": record.updated_at.isoformat() if record.updated_at else None,
        }
    if record_type == "lead":
        return {
            "id": record.id,
            "name": record.name,
            "status": record.status,
            "city": record.city,
            "assigned_to_id": record.assigned_to_id,
            "contact_id": record.contact_id,
            "updated_at": record.updated_at.isoformat() if record.updated_at else None,
        }
    if record_type == "leave":
        return {
            "id": record.id,
            "status": record.status,
            "total_days": _float(record.total_days),
            "leave_type": record.leave_type,
            "employee_id": record.employee_id,
        }
    return {"id": getattr(record, "id", None)}


def _record_link_path(record_type: str, record_id: int) -> str | None:
    paths = {
        "deal": f"/deals/{record_id}",
        "lead": f"/leads/{record_id}",
        "leave": f"/leaves/{record_id}",
    }
    return paths.get(record_type)


def interpolate(template: str, data: dict[str, Any]) -> str:
    if not template:
        return ""
    result = template

    def repl(match: re.Match) -> str:
        key = match.group(1).strip()
        val = data.get(key)
        return "" if val is None else str(val)

    return re.sub(r"\{\{([^}]+)\}\}", repl, result)


def matches_trigger_config(trigger_config: dict, payload: dict) -> bool:
    if not trigger_config:
        return True
    for key, expected in trigger_config.items():
        if expected is None or expected == "":
            continue
        actual = payload.get(key)
        if actual != expected:
            return False
    return True


def _get_field_value(field: str, record: dict, payload: dict) -> Any:
    if field in record:
        return record.get(field)
    return payload.get(field)


def evaluate_condition(
    condition: dict,
    record: dict,
    payload: dict,
    db: Session,
    company_id: int,
) -> tuple[bool, str]:
    ctype = condition.get("type", "")
    field = condition.get("field", "")
    value = condition.get("value")
    actual = _get_field_value(field, record, payload)

    if ctype == "field_equals":
        return str(actual) == str(value), f"{field} == {value}"
    if ctype == "field_not_equals":
        return str(actual) != str(value), f"{field} != {value}"
    if ctype == "field_gt":
        return _float(actual) > _float(value), f"{field} > {value}"
    if ctype == "field_gte":
        return _float(actual) >= _float(value), f"{field} >= {value}"
    if ctype == "field_lt":
        return _float(actual) < _float(value), f"{field} < {value}"
    if ctype == "field_lte":
        return _float(actual) <= _float(value), f"{field} <= {value}"
    if ctype == "field_in":
        options = value if isinstance(value, list) else [value]
        return str(actual) in [str(o) for o in options], f"{field} in {options}"
    if ctype == "field_contains":
        return str(value).lower() in str(actual or "").lower(), f"{field} contains {value}"
    if ctype == "owner_is":
        return int(actual or 0) == int(value or 0), f"owner is {value}"
    if ctype == "owner_role_is":
        owner_id = record.get("assigned_to_id") or record.get("employee_id")
        if not owner_id:
            return False, "no owner"
        user = db.query(User).filter(User.id == owner_id, User.company_id == company_id).first()
        return bool(user and user.role == value), f"owner role is {value}"
    if ctype == "record_linked":
        target = condition.get("field", "contact_id")
        return bool(record.get(target)), f"{target} linked"
    if ctype == "days_since":
        ts = record.get(field.replace("days_since_", "") if field.startswith("days_since_") else "updated_at")
        if not ts:
            return False, "no timestamp"
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        days = int(value or 0)
        return (_utcnow() - ts).days >= days, f"{field} older than {days}d"
    return False, f"unknown condition {ctype}"


def evaluate_conditions(
    conditions: list[dict],
    record: dict,
    payload: dict,
    db: Session,
    company_id: int,
) -> tuple[bool, list[dict]]:
    if not conditions:
        return True, []
    results: list[dict] = []
    for cond in conditions:
        ctype = cond.get("type", "")
        if ctype not in CONDITION_TYPES:
            results.append({"condition": cond, "passed": False, "detail": "invalid type"})
            return False, results
        passed, detail = evaluate_condition(cond, record, payload, db, company_id)
        results.append({"condition": cond, "passed": passed, "detail": detail})
        if not passed:
            return False, results
    return True, results


def _run_as_user(db: Session, company_id: int, settings: WorkflowSettings) -> User | None:
    role = settings.default_run_as_role or "Admin"
    return (
        db.query(User)
        .filter(User.company_id == company_id, User.role == role, User.status == "active")
        .order_by(User.id.asc())
        .first()
    )


def execute_action(
    action: dict,
    *,
    db: Session,
    company_id: int,
    record_type: str,
    record,
    record_data: dict,
    actor_id: int | None,
    run_as: User | None,
    dry_run: bool,
    notifications_sent: list[int],
) -> dict:
    atype = action.get("type", "")
    result: dict[str, Any] = {"type": atype, "status": "ok", "detail": ""}

    try:
        if atype == "notify.role":
            role = action.get("role", "Manager")
            title = interpolate(action.get("title", "Workflow alert"), record_data)
            message = interpolate(action.get("message", ""), record_data)
            link = _record_link_path(record_type, record_data.get("id", 0))
            if dry_run:
                result["detail"] = f"Would notify role {role}: {title}"
            else:
                notes = notify_role(
                    db,
                    company_id=company_id,
                    role=role,
                    category="workflow",
                    title=title,
                    message=message,
                    link_path=link,
                )
                notifications_sent.extend([n.id for n in notes])
                result["detail"] = f"Notified role {role} ({len(notes)} users)"
            return result

        if atype == "notify.user":
            user_id = int(action.get("user_id", 0))
            title = interpolate(action.get("title", "Workflow alert"), record_data)
            message = interpolate(action.get("message", ""), record_data)
            link = _record_link_path(record_type, record_data.get("id", 0))
            if dry_run:
                result["detail"] = f"Would notify user {user_id}"
            else:
                note = notify_user(
                    db,
                    company_id=company_id,
                    user_id=user_id,
                    category="workflow",
                    title=title,
                    message=message,
                    link_path=link,
                )
                notifications_sent.append(note.id)
                result["detail"] = f"Notified user {user_id}"
            return result

        if atype == "notify.record_owner":
            owner_id = record_data.get("assigned_to_id") or record_data.get("employee_id")
            if not owner_id:
                result["status"] = "skipped"
                result["detail"] = "No record owner"
                return result
            title = interpolate(action.get("title", "Workflow alert"), record_data)
            message = interpolate(action.get("message", ""), record_data)
            link = _record_link_path(record_type, record_data.get("id", 0))
            if dry_run:
                result["detail"] = f"Would notify owner {owner_id}"
            else:
                note = notify_user(
                    db,
                    company_id=company_id,
                    user_id=int(owner_id),
                    category="workflow",
                    title=title,
                    message=message,
                    link_path=link,
                )
                notifications_sent.append(note.id)
                result["detail"] = f"Notified owner {owner_id}"
            return result

        if atype == "assign.owner":
            user_id = int(action.get("user_id", 0))
            if record_type not in FIELD_WHITELIST or "assigned_to_id" not in FIELD_WHITELIST[record_type]:
                result["status"] = "failed"
                result["detail"] = "Assign not allowed for record type"
                return result
            if dry_run:
                result["detail"] = f"Would assign to user {user_id}"
            elif record is not None:
                record.assigned_to_id = user_id
                result["detail"] = f"Assigned to user {user_id}"
            return result

        if atype == "update.field":
            field = action.get("field", "")
            value = action.get("value")
            allowed = FIELD_WHITELIST.get(record_type, [])
            if field not in allowed:
                result["status"] = "failed"
                result["detail"] = f"Field {field} not whitelisted"
                return result
            if dry_run:
                result["detail"] = f"Would set {field} = {value}"
            elif record is not None:
                setattr(record, field, value)
                result["detail"] = f"Updated {field}"
            return result

        if atype == "create.reminder":
            due_days = int(action.get("due_in_days", 1))
            title = interpolate(action.get("title", "Workflow follow-up"), record_data)
            notes = action.get("notes")
            priority = action.get("priority", "normal")
            creator = actor_id or (run_as.id if run_as else None)
            if dry_run:
                result["detail"] = f"Would create reminder in {due_days}d: {title}"
            else:
                reminder = FollowUpReminder(
                    company_id=company_id,
                    title=title,
                    notes=notes,
                    reminder_type="call",
                    status="pending",
                    priority=priority,
                    due_at=_utcnow() + timedelta(days=due_days),
                    created_by_id=creator,
                    assigned_to_id=record_data.get("assigned_to_id"),
                    deal_id=record_data.get("id") if record_type == "deal" else record_data.get("deal_id"),
                    lead_id=record_data.get("id") if record_type == "lead" else record_data.get("lead_id"),
                    contact_id=record_data.get("contact_id"),
                )
                db.add(reminder)
                db.flush()
                result["detail"] = f"Created reminder {reminder.id}"
            return result

        if atype == "create.client_note":
            contact_id = record_data.get("contact_id")
            if not contact_id:
                result["status"] = "skipped"
                result["detail"] = "No linked contact"
                return result
            title = interpolate(action.get("title", "Workflow note"), record_data)
            body = interpolate(action.get("body", action.get("message", "")), record_data)
            author_id = actor_id or (run_as.id if run_as else None)
            if not author_id:
                result["status"] = "failed"
                result["detail"] = "No author for client note"
                return result
            if dry_run:
                result["detail"] = f"Would create client note: {title}"
            else:
                note = ClientNote(
                    company_id=company_id,
                    contact_id=contact_id,
                    deal_id=record_data.get("id") if record_type == "deal" else None,
                    lead_id=record_data.get("id") if record_type == "lead" else None,
                    author_id=author_id,
                    note_type="note",
                    title=title,
                    body=body or title,
                )
                db.add(note)
                db.flush()
                result["detail"] = f"Created client note {note.id}"
            return result

        if atype == "log.activity":
            message = interpolate(action.get("message", "Workflow executed"), record_data)
            if dry_run:
                result["detail"] = f"Would log: {message}"
            else:
                db.add(
                    ActivityLog(
                        user_id=actor_id,
                        action="workflow_action",
                        details=message,
                    )
                )
                result["detail"] = "Activity logged"
            return result

        result["status"] = "failed"
        result["detail"] = f"Unknown action {atype}"
    except Exception as exc:  # noqa: BLE001
        result["status"] = "failed"
        result["detail"] = str(exc)
    return result


def rate_limit_exceeded(db: Session, company_id: int, settings: WorkflowSettings) -> bool:
    since = _utcnow() - timedelta(hours=1)
    count = (
        db.query(func.count(WorkflowRun.id))
        .filter(
            WorkflowRun.company_id == company_id,
            WorkflowRun.triggered_at >= since,
            WorkflowRun.is_dry_run.is_(False),
        )
        .scalar()
    )
    return int(count or 0) >= int(settings.rate_limit_per_hour or 500)


def run_workflow(
    db: Session,
    workflow: Workflow,
    settings: WorkflowSettings,
    *,
    trigger_type: str,
    record_type: str,
    record_id: int,
    payload: dict,
    actor_id: int | None = None,
    dry_run: bool = False,
) -> WorkflowRun:
    global _workflow_depth  # noqa: PLW0603
    run = WorkflowRun(
        company_id=workflow.company_id,
        workflow_id=workflow.id,
        run_number=generate_run_number(db, workflow.company_id),
        trigger_type=trigger_type,
        record_type=record_type,
        record_id=record_id,
        is_dry_run=dry_run,
        status="skipped",
    )
    db.add(run)
    db.flush()

    record = load_record(db, workflow.company_id, record_type, record_id)
    if not record:
        run.status = "failed"
        run.error_message = "Record not found"
        run.completed_at = _utcnow()
        return run

    record_data = record_snapshot(record_type, record)
    record_data.update(payload)

    if not matches_trigger_config(workflow.trigger_config_json or {}, payload):
        run.conditions_result_json = [{"detail": "Trigger config mismatch", "passed": False}]
        run.completed_at = _utcnow()
        return run

    passed, cond_results = evaluate_conditions(
        workflow.conditions_json or [],
        record_data,
        payload,
        db,
        workflow.company_id,
    )
    run.conditions_result_json = cond_results
    if not passed:
        run.completed_at = _utcnow()
        return run

    actions = (workflow.actions_json or [])[:MAX_ACTIONS_PER_WORKFLOW]
    if not actions:
        run.status = "failed"
        run.error_message = "No actions configured"
        run.completed_at = _utcnow()
        return run

    run_as = _run_as_user(db, workflow.company_id, settings)
    notifications_sent: list[int] = []
    action_results: list[dict] = []
    failures = 0
    successes = 0

    if _workflow_depth >= 1 and not dry_run:
        run.status = "skipped"
        run.error_message = "Recursion depth limit"
        run.completed_at = _utcnow()
        return run

    _workflow_depth += 1
    try:
        for action in actions:
            if len(notifications_sent) >= MAX_NOTIFICATIONS_PER_RUN and action.get("type", "").startswith("notify."):
                action_results.append({"type": action.get("type"), "status": "skipped", "detail": "Notification cap"})
                continue
            ar = execute_action(
                action,
                db=db,
                company_id=workflow.company_id,
                record_type=record_type,
                record=record if not dry_run else None,
                record_data=record_data,
                actor_id=actor_id,
                run_as=run_as,
                dry_run=dry_run,
                notifications_sent=notifications_sent,
            )
            action_results.append(ar)
            if ar.get("status") == "failed":
                failures += 1
            elif ar.get("status") == "ok":
                successes += 1
    finally:
        _workflow_depth -= 1

    run.actions_result_json = action_results
    if failures and successes:
        run.status = "partial"
    elif failures:
        run.status = "failed"
        run.error_message = "; ".join(a.get("detail", "") for a in action_results if a.get("status") == "failed")
    else:
        run.status = "executed"

    run.completed_at = _utcnow()
    if not dry_run:
        workflow.run_count = int(workflow.run_count or 0) + 1
        workflow.last_run_at = run.completed_at
    return run


def process_event(
    db: Session,
    *,
    company_id: int,
    settings: WorkflowSettings,
    trigger_type: str,
    record_type: str,
    record_id: int,
    payload: dict | None = None,
    actor_id: int | None = None,
    dry_run: bool = False,
    workflow_id: int | None = None,
) -> list[WorkflowRun]:
    if not settings.is_enabled and not dry_run:
        return []

    if not dry_run and rate_limit_exceeded(db, company_id, settings):
        return []

    payload = payload or {}
    q = db.query(Workflow).filter(
        Workflow.company_id == company_id,
        Workflow.trigger_type == trigger_type,
    )
    if workflow_id:
        q = q.filter(Workflow.id == workflow_id)
    else:
        q = q.filter(Workflow.is_active.is_(True))
    workflows = q.order_by(Workflow.priority.asc(), Workflow.id.asc()).all()

    runs: list[WorkflowRun] = []
    for wf in workflows:
        run = run_workflow(
            db,
            wf,
            settings,
            trigger_type=trigger_type,
            record_type=record_type,
            record_id=record_id,
            payload=payload,
            actor_id=actor_id,
            dry_run=dry_run,
        )
        runs.append(run)
        if wf.stop_on_match and run.status == "executed":
            break
    return runs
