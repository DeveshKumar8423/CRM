from __future__ import annotations

INVOICE_STATUSES = [
    "draft",
    "awaiting_review",
    "approved",
    "issued",
    "sent",
    "viewed",
    "partially_paid",
    "paid",
    "overdue",
    "cancelled",
    "refunded",
    "written_off",
    "closed",
]

FINAL_STATUSES = {"paid", "cancelled", "refunded", "written_off", "closed"}

EDITABLE_STATUSES = {"draft", "awaiting_review"}

INVOICE_STATUS_LABELS = {
    "draft": "Draft",
    "awaiting_review": "Awaiting Review",
    "approved": "Approved",
    "issued": "Issued",
    "sent": "Sent",
    "viewed": "Viewed",
    "partially_paid": "Partially Paid",
    "paid": "Paid",
    "overdue": "Overdue",
    "cancelled": "Cancelled",
    "refunded": "Refunded",
    "written_off": "Written Off",
    "closed": "Closed",
}

INVOICE_TYPES = ["standard", "advance", "interim", "final", "credit_note", "debit_note", "pro_forma"]

SOURCE_TYPES = ["sales_order", "quotation", "manual"]

CONVERTIBLE_ORDER_STATUSES = {
    "confirmed",
    "in_preparation",
    "in_execution",
    "partially_delivered",
    "delivered",
    "in_billing",
    "completed",
}

CONVERTIBLE_QUOTE_STATUSES = {"accepted", "approved"}

REVIEW_THRESHOLD = 500_000.0

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"awaiting_review", "approved", "issued", "cancelled"},
    "awaiting_review": {"approved", "draft", "cancelled"},
    "approved": {"issued", "cancelled"},
    "issued": {"sent", "partially_paid", "paid", "overdue", "cancelled"},
    "sent": {"viewed", "partially_paid", "paid", "overdue", "cancelled"},
    "viewed": {"partially_paid", "paid", "overdue", "cancelled"},
    "partially_paid": {"paid", "overdue", "refunded", "written_off", "cancelled"},
    "paid": {"refunded", "closed"},
    "overdue": {"partially_paid", "paid", "written_off", "cancelled"},
    "cancelled": {"closed"},
    "refunded": {"closed"},
    "written_off": {"closed"},
    "closed": set(),
}

DEFAULT_PAYMENT_TERMS = "Payment due within 15 days of invoice date."
DEFAULT_BANK_INSTRUCTIONS = "Please remit payment via bank transfer. Contact accounts for details."
