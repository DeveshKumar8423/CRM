"""Field Service module constants (Phase 1)."""

DEFAULT_ORDER_PREFIX = "FSO"
DEFAULT_SLA_HOURS = 48
DEFAULT_NOTIFY_ROLES = ["Admin", "Manager"]
URGENT_UNASSIGNED_HOURS = 4

FSO_TYPES = ("installation", "inspection", "repair", "amc_visit", "other")
FSO_PRIORITIES = ("low", "normal", "high", "urgent")
FSO_STATUSES = (
    "draft",
    "scheduled",
    "dispatched",
    "in_progress",
    "waiting_parts",
    "completed",
    "cancelled",
    "rescheduled",
)

OPEN_FSO_STATUSES = ("draft", "scheduled", "dispatched", "in_progress", "waiting_parts", "rescheduled")
ACTIVE_VISIT_STATUSES = ("scheduled", "dispatched", "in_progress", "waiting_parts")

FSO_STATUS_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"scheduled", "cancelled"},
    "scheduled": {"dispatched", "cancelled", "rescheduled"},
    "dispatched": {"in_progress", "cancelled", "rescheduled"},
    "in_progress": {"waiting_parts", "completed", "cancelled"},
    "waiting_parts": {"in_progress", "completed", "cancelled"},
    "rescheduled": {"scheduled"},
    "completed": set(),
    "cancelled": set(),
}

PARTS_ISSUE_STATUSES = ("scheduled", "dispatched", "in_progress", "waiting_parts")
