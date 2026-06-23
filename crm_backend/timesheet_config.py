TIMESHEET_STATUSES = ["draft", "submitted", "approved", "rejected"]

TIMESHEET_STATUS_LABELS = {
    "draft": "Draft",
    "submitted": "Submitted",
    "approved": "Approved",
    "rejected": "Rejected",
}

EDITABLE_STATUSES = {"draft", "rejected"}

ALLOWED_TRANSITIONS = {
    "draft": {"submitted"},
    "submitted": {"approved", "rejected"},
    "rejected": {"submitted"},
    "approved": set(),
}

MIN_HOURS = 0.25
MAX_HOURS = 24.0
MIN_DESCRIPTION_LENGTH = 5
