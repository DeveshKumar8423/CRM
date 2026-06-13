from __future__ import annotations

QUOTATION_STATUSES = [
    "draft",
    "pending_approval",
    "approved",
    "sent",
    "viewed",
    "negotiation",
    "accepted",
    "rejected",
    "expired",
    "cancelled",
]

FINAL_STATUSES = {"accepted", "rejected", "expired", "cancelled"}

EDITABLE_STATUSES = {"draft", "pending_approval", "approved"}

QUOTATION_STATUS_LABELS = {
    "draft": "Draft",
    "pending_approval": "Awaiting Approval",
    "approved": "Approved",
    "sent": "Sent",
    "viewed": "Viewed",
    "negotiation": "In Negotiation",
    "accepted": "Accepted",
    "rejected": "Rejected",
    "expired": "Expired",
    "cancelled": "Cancelled",
}

# Configurable approval thresholds
DISCOUNT_APPROVAL_THRESHOLD_PERCENT = 15.0
VALUE_APPROVAL_THRESHOLD = 500_000.0

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"pending_approval", "approved", "cancelled"},
    "pending_approval": {"approved", "draft", "cancelled"},
    "approved": {"sent", "draft", "cancelled"},
    "sent": {"viewed", "negotiation", "accepted", "rejected", "expired", "cancelled"},
    "viewed": {"negotiation", "accepted", "rejected", "expired", "cancelled"},
    "negotiation": {"accepted", "rejected", "expired", "cancelled"},
    "accepted": set(),
    "rejected": set(),
    "expired": set(),
    "cancelled": set(),
}

DEFAULT_PAYMENT_TERMS = (
    "50% advance upon acceptance. Balance due before delivery of final documents."
)
DEFAULT_VALIDITY_CLAUSE = (
    "This quotation is valid until the date specified above. "
    "Prices and terms may change after expiry."
)
DEFAULT_LEGAL_FOOTER = (
    "This is a computer-generated quotation and does not require a physical signature "
    "unless otherwise agreed in writing."
)
