from __future__ import annotations

ORDER_STATUSES = [
    "draft",
    "awaiting_confirmation",
    "confirmed",
    "in_preparation",
    "partially_delivered",
    "delivered",
    "in_billing",
    "in_execution",
    "on_hold",
    "completed",
    "cancelled",
    "closed",
]

FINAL_STATUSES = {"completed", "cancelled", "closed"}

EDITABLE_STATUSES = {"draft", "awaiting_confirmation"}

ORDER_STATUS_LABELS = {
    "draft": "Draft",
    "awaiting_confirmation": "Awaiting Customer Confirmation",
    "confirmed": "Confirmed",
    "in_preparation": "In Preparation",
    "partially_delivered": "Partially Delivered",
    "delivered": "Delivered",
    "in_billing": "In Billing",
    "in_execution": "In Execution",
    "on_hold": "On Hold",
    "completed": "Completed",
    "cancelled": "Cancelled",
    "closed": "Closed",
}

ORDER_TYPES = ["delivery", "service_execution", "billing_only", "mixed"]

SOURCE_TYPES = ["quotation", "manual", "deal"]

CONVERTIBLE_QUOTE_STATUSES = {"accepted", "approved"}

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"awaiting_confirmation", "confirmed", "cancelled"},
    "awaiting_confirmation": {"confirmed", "draft", "cancelled"},
    "confirmed": {"in_preparation", "in_execution", "on_hold", "cancelled"},
    "in_preparation": {"in_execution", "partially_delivered", "delivered", "on_hold", "cancelled"},
    "in_execution": {"partially_delivered", "delivered", "in_billing", "on_hold", "cancelled"},
    "partially_delivered": {"delivered", "in_billing", "in_execution", "on_hold", "cancelled"},
    "delivered": {"in_billing", "completed", "on_hold", "cancelled"},
    "in_billing": {"completed", "on_hold", "cancelled"},
    "on_hold": {
        "confirmed",
        "in_preparation",
        "in_execution",
        "partially_delivered",
        "delivered",
        "in_billing",
        "cancelled",
    },
    "completed": {"closed"},
    "cancelled": {"closed"},
    "closed": set(),
}

DEFAULT_ORDER_PREFIX = "SO-"
