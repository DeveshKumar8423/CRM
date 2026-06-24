from __future__ import annotations

BILL_STATUSES = ["completed", "voided", "returned", "partially_returned"]
SESSION_STATUSES = ["open", "closed"]
CART_STATUSES = ["active", "held", "completed", "voided"]
PAYMENT_METHODS = ["cash", "upi", "card", "other"]
RETURN_STATUSES = ["completed", "voided"]

BILL_STATUS_LABELS = {
    "completed": "Completed",
    "voided": "Voided",
    "returned": "Returned",
    "partially_returned": "Partially returned",
}
PAYMENT_METHOD_LABELS = {
    "cash": "Cash",
    "upi": "UPI",
    "card": "Card",
    "other": "Other",
}

DEFAULT_BILL_PREFIX = "POS"
DEFAULT_RETURN_PREFIX = "RET-POS"
DEFAULT_RETURN_WINDOW_DAYS = 7
DEFAULT_OPENING_FLOAT = 2000
MAX_LINE_QTY = 999
POS_CONTACT_SOURCE = "POS Counter"


def product_unit_price(product) -> float:
    price = product.offer_price or product.total_price or 0
    return float(price or 0)
