from __future__ import annotations

INSPECTION_STATUSES = ["pending", "passed", "failed", "waived", "cancelled"]
TEMPLATE_STATUSES = ["draft", "active", "archived"]
CAPA_STATUSES = ["open", "in_progress", "verified", "closed"]
ALERT_STATUSES = ["open", "acknowledged", "resolved"]
ALERT_TYPES = [
    "inspection_failed",
    "inspection_overdue",
    "repeat_failure",
    "capa_overdue",
]
ALERT_SEVERITIES = ["low", "medium", "high", "critical"]
POINT_TYPES = ["incoming", "in_process", "final", "return", "other"]
POINT_TRIGGERS = ["manual", "on_po_receipt", "on_wo_qc_pending", "on_so_confirm"]
REFERENCE_TYPES = ["work_order", "purchase_order", "sales_order", "manual", "return"]
CAPA_ACTION_TYPES = [
    "rework",
    "scrap",
    "vendor_return",
    "process_change",
    "training",
    "other",
]

DEFAULT_INSPECTION_PREFIX = "QC"
DEFAULT_CAPA_PREFIX = "CAPA"
DEFAULT_REPEAT_FAIL_THRESHOLD = 3
DEFAULT_OVERDUE_HOURS = 24
DEFAULT_NOTIFY_ROLES = ["Manager", "Admin"]

SEED_INSPECTION_POINTS = [
    {
        "code": "INCOMING_GRN",
        "name": "Incoming GRN",
        "point_type": "incoming",
        "trigger": "on_po_receipt",
        "sort_order": 1,
    },
    {
        "code": "WO_IN_PROCESS",
        "name": "Work order — in process",
        "point_type": "in_process",
        "trigger": "manual",
        "sort_order": 2,
    },
    {
        "code": "WO_FINAL",
        "name": "Work order — final",
        "point_type": "final",
        "trigger": "on_wo_qc_pending",
        "sort_order": 3,
    },
]

DEFAULT_CHECKLIST = [
    {
        "key": "visual",
        "label": "Visual inspection — no defects",
        "required": True,
        "input_type": "pass_fail",
        "spec": None,
    },
    {
        "key": "dimensions",
        "label": "Dimensions within spec",
        "required": True,
        "input_type": "pass_fail",
        "spec": None,
    },
    {
        "key": "packaging",
        "label": "Packaging OK",
        "required": False,
        "input_type": "pass_fail",
        "spec": None,
    },
]
