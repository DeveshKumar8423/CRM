from __future__ import annotations

WO_STATUSES = [
    "draft",
    "planned",
    "released",
    "in_progress",
    "qc_pending",
    "completed",
    "cancelled",
]
BOM_STATUSES = ["draft", "active", "archived"]
QC_STATUSES = ["pending", "passed", "failed", "waived"]
WO_PRIORITIES = ["low", "normal", "high"]

WO_STATUS_LABELS = {
    "draft": "Draft",
    "planned": "Planned",
    "released": "Released",
    "in_progress": "In progress",
    "qc_pending": "QC pending",
    "completed": "Completed",
    "cancelled": "Cancelled",
}
BOM_STATUS_LABELS = {
    "draft": "Draft",
    "active": "Active",
    "archived": "Archived",
}
QC_STATUS_LABELS = {
    "pending": "Pending",
    "passed": "Passed",
    "failed": "Failed",
    "waived": "Waived",
}

DEFAULT_WO_PREFIX = "WO"
DEFAULT_QC_PREFIX = "QC"
DEFAULT_OUTPUT_QTY = 1
DEFAULT_SCRAP_PCT = 0

DEFAULT_CHECKLIST = [
    {"key": "visual", "label": "Visual inspection", "required": True},
    {"key": "dimensions", "label": "Dimensions within spec", "required": True},
    {"key": "packaging", "label": "Packaging OK", "required": False},
]

STATUS_TRANSITIONS = {
    "draft": ["planned", "cancelled"],
    "planned": ["released", "draft", "cancelled"],
    "released": ["in_progress", "cancelled"],
    "in_progress": ["qc_pending", "cancelled"],
    "qc_pending": ["completed", "in_progress", "cancelled"],
    "completed": [],
    "cancelled": [],
}
