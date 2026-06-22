LEAVE_TYPES = ["casual", "sick", "earned", "unpaid", "other"]

LEAVE_TYPE_LABELS = {
    "casual": "Casual Leave",
    "sick": "Sick Leave",
    "earned": "Earned / Privilege Leave",
    "unpaid": "Unpaid Leave",
    "other": "Other",
}

LEAVE_STATUSES = ["draft", "pending", "approved", "rejected", "cancelled"]

LEAVE_STATUS_LABELS = {
    "draft": "Draft",
    "pending": "Pending Approval",
    "approved": "Approved",
    "rejected": "Rejected",
    "cancelled": "Cancelled",
}

HALF_DAY_PERIODS = ["morning", "afternoon"]

HALF_DAY_PERIOD_LABELS = {
    "morning": "Morning",
    "afternoon": "Afternoon",
}

EDITABLE_STATUSES = {"draft", "rejected"}

EMPLOYEE_CANCELLABLE_STATUSES = {"draft", "pending"}

MIN_REASON_LENGTH = 10

MIN_REJECTION_NOTE_LENGTH = 3

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"pending", "cancelled"},
    "pending": {"approved", "rejected", "cancelled"},
    "rejected": {"pending", "cancelled", "draft"},
    "approved": {"cancelled"},
    "cancelled": set(),
}
