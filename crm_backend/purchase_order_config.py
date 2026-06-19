from __future__ import annotations

PO_STATUSES = [
    "draft",
    "submitted",
    "under_review",
    "approved",
    "rejected",
    "sent_to_vendor",
    "partially_received",
    "fully_received",
    "partially_billed",
    "fully_billed",
    "closed",
    "cancelled",
]

PO_STATUS_LABELS = {
    "draft": "Draft",
    "submitted": "Submitted",
    "under_review": "Under Review",
    "approved": "Approved",
    "rejected": "Rejected",
    "sent_to_vendor": "Sent to Vendor",
    "partially_received": "Partially Received",
    "fully_received": "Fully Received",
    "partially_billed": "Partially Billed",
    "fully_billed": "Fully Billed",
    "closed": "Closed",
    "cancelled": "Cancelled",
}

EDITABLE_STATUSES = {"draft", "rejected"}

FINAL_STATUSES = {"closed", "cancelled"}

RECEIPT_STATUSES = {"sent_to_vendor", "partially_received", "fully_received", "partially_billed", "fully_billed"}

BILLING_STATUSES = {"partially_received", "fully_received", "partially_billed", "fully_billed"}

PAYMENT_TERMS = [
    "due_on_receipt",
    "net_15",
    "net_30",
    "net_45",
    "net_60",
    "advance_50_on_delivery_50",
    "custom",
]

PAYMENT_TERM_LABELS = {
    "due_on_receipt": "Due on Receipt",
    "net_15": "Net 15",
    "net_30": "Net 30",
    "net_45": "Net 45",
    "net_60": "Net 60",
    "advance_50_on_delivery_50": "50% Advance, 50% on Delivery",
    "custom": "Custom",
}

APPROVAL_THRESHOLD = 25_000.0
DEFAULT_PO_PREFIX = "PO-"

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"submitted", "cancelled"},
    "submitted": {"under_review", "approved", "rejected", "cancelled"},
    "under_review": {"approved", "rejected", "cancelled"},
    "approved": {"sent_to_vendor", "cancelled"},
    "rejected": {"draft", "cancelled"},
    "sent_to_vendor": {"partially_received", "fully_received", "cancelled"},
    "partially_received": {"fully_received", "partially_billed", "cancelled"},
    "fully_received": {"partially_billed", "fully_billed", "cancelled"},
    "partially_billed": {"fully_billed", "closed"},
    "fully_billed": {"closed"},
    "closed": set(),
    "cancelled": set(),
}
