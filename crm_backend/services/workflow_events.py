"""Workflow event dispatcher (Phase 1)."""

from __future__ import annotations

from sqlalchemy.orm import Session

from models import WorkflowSettings
from services.workflow_engine import process_event


def _get_settings(db: Session, company_id: int) -> WorkflowSettings:
    settings = db.query(WorkflowSettings).filter(WorkflowSettings.company_id == company_id).first()
    if settings:
        return settings
    settings = WorkflowSettings(company_id=company_id)
    db.add(settings)
    db.flush()
    return settings


def emit_workflow_event(
    db: Session,
    *,
    company_id: int,
    trigger_type: str,
    record_type: str,
    record_id: int,
    payload: dict | None = None,
    actor_id: int | None = None,
) -> None:
    """Evaluate active workflows for a domain event. Commits workflow side effects."""
    try:
        settings = _get_settings(db, company_id)
        if not settings.is_enabled:
            return
        process_event(
            db,
            company_id=company_id,
            settings=settings,
            trigger_type=trigger_type,
            record_type=record_type,
            record_id=record_id,
            payload=payload or {},
            actor_id=actor_id,
            dry_run=False,
        )
        db.commit()
    except Exception:
        db.rollback()


def emit_deal_lifecycle(
    db: Session,
    *,
    company_id: int,
    deal_id: int,
    old_stage: str | None,
    new_stage: str,
    actor_id: int | None = None,
) -> None:
    if old_stage and old_stage != new_stage:
        emit_workflow_event(
            db,
            company_id=company_id,
            trigger_type="deal.stage_changed",
            record_type="deal",
            record_id=deal_id,
            payload={"from_stage": old_stage, "to_stage": new_stage},
            actor_id=actor_id,
        )
    if new_stage == "won" and old_stage != "won":
        emit_workflow_event(
            db,
            company_id=company_id,
            trigger_type="deal.won",
            record_type="deal",
            record_id=deal_id,
            payload={"to_stage": new_stage},
            actor_id=actor_id,
        )
    elif new_stage == "lost" and old_stage != "lost":
        emit_workflow_event(
            db,
            company_id=company_id,
            trigger_type="deal.lost",
            record_type="deal",
            record_id=deal_id,
            payload={"to_stage": new_stage},
            actor_id=actor_id,
        )
