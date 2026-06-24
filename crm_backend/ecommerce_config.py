from __future__ import annotations

import re
import unicodedata

ORDER_STATUSES = [
    "pending_payment",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
]
PAYMENT_STATUSES = ["unpaid", "paid", "refunded", "partial_refund"]
PAYMENT_METHODS = ["cod", "bank_transfer", "online"]
SHIPPING_METHODS = ["standard", "express", "pickup"]
RETURN_STATUSES = ["requested", "approved", "rejected", "received", "refunded", "closed"]

ORDER_STATUS_LABELS = {
    "pending_payment": "Pending payment",
    "paid": "Paid",
    "processing": "Processing",
    "shipped": "Shipped",
    "delivered": "Delivered",
    "cancelled": "Cancelled",
    "returned": "Returned",
}
PAYMENT_STATUS_LABELS = {
    "unpaid": "Unpaid",
    "paid": "Paid",
    "refunded": "Refunded",
    "partial_refund": "Partial refund",
}
RETURN_STATUS_LABELS = {
    "requested": "Requested",
    "approved": "Approved",
    "rejected": "Rejected",
    "received": "Received",
    "refunded": "Refunded",
    "closed": "Closed",
}

DEFAULT_RETURN_WINDOW_DAYS = 7
DEFAULT_FLAT_SHIPPING = 99
DEFAULT_FREE_SHIPPING_ABOVE = 2000
MAX_CART_QTY = 99
CART_EXPIRY_DAYS = 7
STORE_CONTACT_SOURCE = "Online Store"

SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def normalize_slug(value: str) -> str:
    text = unicodedata.normalize("NFKD", (value or "").strip().lower())
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:80]


def product_unit_price(product) -> float:
    price = product.offer_price or product.total_price or 0
    return float(price or 0)


def product_online_slug(product) -> str:
    if getattr(product, "online_slug", None):
        return product.online_slug
    return normalize_slug(product.name) or f"product-{product.id}"
