PROJECT_STATUSES = ["draft", "active", "on_hold", "completed", "cancelled"]

PROJECT_STATUS_LABELS = {
    "draft": "Draft",
    "active": "Active",
    "on_hold": "On Hold",
    "completed": "Completed",
    "cancelled": "Cancelled",
}

PROJECT_TYPES = ["client", "internal"]

PROJECT_TYPE_LABELS = {
    "client": "Client",
    "internal": "Internal",
}

PROJECT_STAGES = ["kickoff", "discovery", "execution", "review", "closure"]

PROJECT_STAGE_LABELS = {
    "kickoff": "Kickoff",
    "discovery": "Discovery",
    "execution": "Execution",
    "review": "Review",
    "closure": "Closure",
}

TASK_STATUSES = ["todo", "in_progress", "blocked", "done", "cancelled"]

TASK_STATUS_LABELS = {
    "todo": "To Do",
    "in_progress": "In Progress",
    "blocked": "Blocked",
    "done": "Done",
    "cancelled": "Cancelled",
}

OPEN_TASK_STATUSES = ["todo", "in_progress", "blocked"]

PROJECT_PRIORITIES = ["low", "normal", "high"]

PROJECT_PRIORITY_LABELS = {
    "low": "Low",
    "normal": "Normal",
    "high": "High",
}

MEMBER_ROLES = ["manager", "member"]

MEMBER_ROLE_LABELS = {
    "manager": "Manager",
    "member": "Member",
}

TERMINAL_PROJECT_STATUSES = ["completed", "cancelled"]

LOCKED_TASK_PROJECT_STATUSES = ["completed", "cancelled"]
