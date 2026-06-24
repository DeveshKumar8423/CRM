"""Maintenance / CMMS module constants (Phase 1)."""

DEFAULT_WORK_ORDER_PREFIX = "MWO"
DEFAULT_ASSET_CODE_PREFIX = "AST"
DEFAULT_PM_INTERVAL_DAYS = 90
DEFAULT_CRITICAL_DOWNTIME_ALERT_HOURS = 4
DEFAULT_NOTIFY_ROLES = ["Admin", "Manager"]

ASSET_STATUSES = ("operational", "under_maintenance", "breakdown", "retired")
ASSET_CRITICALITIES = ("low", "medium", "high", "critical")

MWO_TYPES = ("preventive", "breakdown", "inspection", "other")
MWO_PRIORITIES = ("low", "normal", "high", "urgent")
MWO_STATUSES = ("draft", "open", "in_progress", "waiting_parts", "completed", "cancelled")

OPEN_MWO_STATUSES = ("draft", "open", "in_progress", "waiting_parts")
OPEN_BREAKDOWN_STATUSES = ("draft", "open", "in_progress", "waiting_parts")

MWO_STATUS_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"open", "cancelled"},
    "open": {"in_progress", "waiting_parts", "cancelled"},
    "in_progress": {"waiting_parts", "completed", "cancelled"},
    "waiting_parts": {"in_progress", "completed", "cancelled"},
    "completed": set(),
    "cancelled": set(),
}

SEED_ASSET_CATEGORIES = [
    {"name": "Production machine", "sort_order": 1},
    {"name": "Vehicle", "sort_order": 2},
    {"name": "Utility", "sort_order": 3},
]
