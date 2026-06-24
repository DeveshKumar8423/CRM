"""Workflow Builder module constants (Phase 1)."""

from __future__ import annotations

DEFAULT_WORKFLOW_PREFIX = "WFL"
DEFAULT_RUN_PREFIX = "WFL-RUN"
DEFAULT_MAX_ACTIVE = 50
DEFAULT_RATE_LIMIT_PER_HOUR = 500
DEFAULT_RUN_AS_ROLE = "Admin"
MAX_ACTIONS_PER_WORKFLOW = 10
MAX_NOTIFICATIONS_PER_RUN = 25

WORKFLOW_MODULES = ("sales", "finance", "inventory", "hr", "operations", "platform")
RUN_STATUSES = ("skipped", "executed", "partial", "failed")

CONDITION_TYPES = (
    "field_equals",
    "field_not_equals",
    "field_gt",
    "field_gte",
    "field_lt",
    "field_lte",
    "field_in",
    "field_contains",
    "owner_role_is",
    "owner_is",
    "record_linked",
    "days_since",
)

ACTION_TYPES = (
    "notify.role",
    "notify.user",
    "notify.record_owner",
    "assign.owner",
    "update.field",
    "create.reminder",
    "create.client_note",
    "log.activity",
)

FIELD_WHITELIST: dict[str, list[str]] = {
    "deal": ["stage", "assigned_to_id"],
    "lead": ["status", "assigned_to_id"],
}

CONDITION_FIELDS: dict[str, list[dict]] = {
    "deal": [
        {"field": "stage", "label": "Stage", "type": "string"},
        {"field": "expected_value", "label": "Expected value", "type": "number"},
        {"field": "title", "label": "Title", "type": "string"},
        {"field": "assigned_to_id", "label": "Assigned to (user id)", "type": "number"},
    ],
    "lead": [
        {"field": "status", "label": "Status", "type": "string"},
        {"field": "name", "label": "Name", "type": "string"},
        {"field": "city", "label": "City", "type": "string"},
        {"field": "assigned_to_id", "label": "Assigned to (user id)", "type": "number"},
    ],
    "leave": [
        {"field": "status", "label": "Status", "type": "string"},
        {"field": "total_days", "label": "Total days", "type": "number"},
        {"field": "leave_type", "label": "Leave type", "type": "string"},
    ],
    "invoice": [
        {"field": "status", "label": "Status", "type": "string"},
        {"field": "grand_total", "label": "Grand total", "type": "number"},
        {"field": "outstanding_amount", "label": "Outstanding", "type": "number"},
    ],
}

TRIGGER_CATALOG: list[dict] = [
    {"key": "lead.created", "module": "sales", "label": "Lead created", "record_type": "lead"},
    {"key": "lead.status_changed", "module": "sales", "label": "Lead status changed", "record_type": "lead"},
    {"key": "deal.created", "module": "sales", "label": "Deal created", "record_type": "deal"},
    {"key": "deal.stage_changed", "module": "sales", "label": "Deal stage changed", "record_type": "deal", "config_fields": ["from_stage", "to_stage"]},
    {"key": "deal.won", "module": "sales", "label": "Deal won", "record_type": "deal"},
    {"key": "deal.lost", "module": "sales", "label": "Deal lost", "record_type": "deal"},
    {"key": "quotation.status_changed", "module": "sales", "label": "Quotation status changed", "record_type": "quotation"},
    {"key": "quotation.submitted_for_approval", "module": "sales", "label": "Quotation submitted for approval", "record_type": "quotation"},
    {"key": "sales_order.confirmed", "module": "sales", "label": "Sales order confirmed", "record_type": "sales_order"},
    {"key": "invoice.created", "module": "finance", "label": "Invoice created", "record_type": "invoice"},
    {"key": "invoice.issued", "module": "finance", "label": "Invoice issued", "record_type": "invoice"},
    {"key": "invoice.payment_recorded", "module": "finance", "label": "Payment recorded", "record_type": "invoice"},
    {"key": "expense.submitted", "module": "finance", "label": "Expense submitted", "record_type": "expense"},
    {"key": "expense.approved", "module": "finance", "label": "Expense approved", "record_type": "expense"},
    {"key": "purchase_order.submitted", "module": "finance", "label": "PO submitted", "record_type": "purchase_order"},
    {"key": "vendor_bill.submitted", "module": "finance", "label": "Vendor bill submitted", "record_type": "vendor_bill"},
    {"key": "product.low_stock", "module": "inventory", "label": "Product low stock", "record_type": "product"},
    {"key": "stock_movement.recorded", "module": "inventory", "label": "Stock movement recorded", "record_type": "stock_movement"},
    {"key": "leave.submitted", "module": "hr", "label": "Leave submitted", "record_type": "leave"},
    {"key": "leave.approved", "module": "hr", "label": "Leave approved", "record_type": "leave"},
    {"key": "leave.rejected", "module": "hr", "label": "Leave rejected", "record_type": "leave"},
    {"key": "timesheet.submitted", "module": "hr", "label": "Timesheet submitted", "record_type": "timesheet"},
    {"key": "work_order.status_changed", "module": "operations", "label": "Work order status changed", "record_type": "work_order"},
    {"key": "quality.inspection_failed", "module": "operations", "label": "QC inspection failed", "record_type": "quality_inspection"},
    {"key": "field_service.sla_breached", "module": "operations", "label": "Field service SLA breached", "record_type": "field_service_order"},
    {"key": "subscription.renewal_due", "module": "operations", "label": "Subscription renewal due", "record_type": "subscription"},
    {"key": "rental.return_overdue", "module": "operations", "label": "Rental return overdue", "record_type": "rental_contract"},
    {"key": "reminder.overdue", "module": "platform", "label": "Reminder overdue", "record_type": "reminder"},
]

ACTION_CATALOG: list[dict] = [
    {"key": "notify.role", "label": "Notify role", "fields": ["role", "title", "message"]},
    {"key": "notify.user", "label": "Notify user", "fields": ["user_id", "title", "message"]},
    {"key": "notify.record_owner", "label": "Notify record owner", "fields": ["title", "message"]},
    {"key": "assign.owner", "label": "Assign owner", "fields": ["user_id"]},
    {"key": "update.field", "label": "Update field", "fields": ["field", "value"]},
    {"key": "create.reminder", "label": "Create reminder", "fields": ["title", "due_in_days", "priority", "notes"]},
    {"key": "create.client_note", "label": "Create client note", "fields": ["title", "body"]},
    {"key": "log.activity", "label": "Log activity", "fields": ["message"]},
]

WORKFLOW_TEMPLATES: list[dict] = [
    {
        "key": "large_deal_negotiation",
        "name": "Large deal negotiation alert",
        "description": "Notify Manager when high-value deals enter negotiation",
        "module": "sales",
        "trigger_type": "deal.stage_changed",
        "trigger_config_json": {"to_stage": "negotiation"},
        "conditions_json": [{"type": "field_gte", "field": "expected_value", "value": 500000}],
        "actions_json": [
            {"type": "notify.role", "role": "Manager", "title": "Large deal in negotiation", "message": "Deal {{title}} moved to negotiation at ₹{{expected_value}}"},
            {"type": "create.reminder", "due_in_days": 2, "title": "Follow up negotiation", "priority": "high"},
        ],
        "priority": 10,
        "stop_on_match": False,
    },
    {
        "key": "leave_hr_review",
        "name": "Long leave HR review",
        "description": "Notify Manager when leave exceeds 3 days",
        "module": "hr",
        "trigger_type": "leave.submitted",
        "trigger_config_json": {},
        "conditions_json": [{"type": "field_gt", "field": "total_days", "value": 3}],
        "actions_json": [
            {"type": "notify.role", "role": "Manager", "title": "Long leave submitted", "message": "Leave request for {{total_days}} days needs review"},
        ],
        "priority": 20,
        "stop_on_match": False,
    },
    {
        "key": "deal_won_notify",
        "name": "Deal won celebration",
        "description": "Notify team when a deal is won",
        "module": "sales",
        "trigger_type": "deal.won",
        "trigger_config_json": {},
        "conditions_json": [],
        "actions_json": [
            {"type": "notify.role", "role": "Manager", "title": "Deal won", "message": "Deal {{title}} was won!"},
            {"type": "log.activity", "message": "Workflow: deal won notification sent for {{title}}"},
        ],
        "priority": 30,
        "stop_on_match": False,
    },
]

TRIGGER_RECORD_TYPE: dict[str, str] = {t["key"]: t["record_type"] for t in TRIGGER_CATALOG}
