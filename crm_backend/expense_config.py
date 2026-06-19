from __future__ import annotations

EXPENSE_STATUSES = [
    "draft",
    "submitted",
    "under_review",
    "approved",
    "rejected",
    "paid",
    "cancelled",
]

EXPENSE_STATUS_LABELS = {
    "draft": "Draft",
    "submitted": "Submitted",
    "under_review": "Under Review",
    "approved": "Approved",
    "rejected": "Rejected",
    "paid": "Paid",
    "cancelled": "Cancelled",
}

EDITABLE_STATUSES = {"draft", "rejected"}

FINAL_STATUSES = {"paid", "cancelled"}

PAYMENT_MODES = [
    "cash",
    "company_card",
    "personal_reimbursement",
    "bank_transfer",
    "upi",
    "petty_cash",
    "other",
]

PAYMENT_MODE_LABELS = {
    "cash": "Cash",
    "company_card": "Company Card",
    "personal_reimbursement": "Personal Reimbursement",
    "bank_transfer": "Bank Transfer",
    "upi": "UPI",
    "petty_cash": "Petty Cash",
    "other": "Other",
}

EXPENSE_CATEGORIES = [
    "travel",
    "meals_entertainment",
    "office_supplies",
    "software_subscriptions",
    "marketing",
    "client_gifts",
    "logistics_courier",
    "repairs_maintenance",
    "professional_services",
    "miscellaneous",
]

EXPENSE_CATEGORY_LABELS = {
    "travel": "Travel",
    "meals_entertainment": "Meals & Entertainment",
    "office_supplies": "Office Supplies",
    "software_subscriptions": "Software & Subscriptions",
    "marketing": "Marketing",
    "client_gifts": "Client Gifts",
    "logistics_courier": "Logistics & Courier",
    "repairs_maintenance": "Repairs & Maintenance",
    "professional_services": "Professional Services",
    "miscellaneous": "Miscellaneous",
}

APPROVAL_THRESHOLD = 10_000.0
PROOF_REQUIRED_THRESHOLD = 500.0

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"submitted", "cancelled"},
    "submitted": {"under_review", "approved", "rejected", "cancelled"},
    "under_review": {"approved", "rejected", "cancelled"},
    "approved": {"paid", "cancelled"},
    "rejected": {"draft", "cancelled"},
    "paid": set(),
    "cancelled": set(),
}
