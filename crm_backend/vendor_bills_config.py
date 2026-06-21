"""Vendor bill statuses, transitions, and defaults."""

VENDOR_BILL_STATUSES = [
    "draft",
    "submitted",
    "under_review",
    "approved",
    "rejected",
    "partially_paid",
    "paid",
    "overdue",
    "cancelled",
    "closed",
]

VENDOR_BILL_STATUS_LABELS = {
    "draft": "Draft",
    "submitted": "Submitted",
    "under_review": "Under Review",
    "approved": "Approved",
    "rejected": "Rejected",
    "partially_paid": "Partially Paid",
    "paid": "Paid",
    "overdue": "Overdue",
    "cancelled": "Cancelled",
    "closed": "Closed",
}

EDITABLE_STATUSES = {"draft", "rejected"}

PAYABLE_STATUSES = {"approved", "partially_paid", "overdue"}

FINAL_STATUSES = {"paid", "closed", "cancelled"}

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"submitted", "cancelled"},
    "submitted": {"under_review", "approved", "rejected", "cancelled"},
    "under_review": {"approved", "rejected", "cancelled"},
    "rejected": {"draft", "cancelled"},
    "approved": {"partially_paid", "paid", "overdue", "cancelled"},
    "partially_paid": {"paid", "overdue", "cancelled"},
    "overdue": {"partially_paid", "paid", "cancelled"},
    "paid": {"closed"},
    "cancelled": set(),
    "closed": set(),
}

APPROVAL_THRESHOLD = 10_000.0

PAYMENT_METHODS = [
    "bank_transfer",
    "upi",
    "cheque",
    "cash",
    "credit_card",
    "other",
]

PAYMENT_METHOD_LABELS = {
    "bank_transfer": "Bank Transfer (NEFT/RTGS/IMPS)",
    "upi": "UPI",
    "cheque": "Cheque",
    "cash": "Cash",
    "credit_card": "Credit Card (Corporate)",
    "other": "Other",
}

DEFAULT_PAYMENT_TERMS = "Net 30"
