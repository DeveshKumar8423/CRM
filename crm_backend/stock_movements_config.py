"""Stock In / Stock Out reason codes and movement mapping."""

from __future__ import annotations

DIRECTION_IN = "in"
DIRECTION_OUT = "out"

STOCK_IN_REASONS = [
    "purchase_receipt",
    "customer_return",
    "transfer_in",
    "found_stock",
    "stock_count_correction_in",
    "other",
]

STOCK_OUT_REASONS = [
    "sale_dispatch",
    "internal_consumption",
    "damage",
    "transfer_out",
    "write_off",
    "stock_count_correction_out",
    "other",
]

STOCK_IN_REASON_LABELS = {
    "purchase_receipt": "Purchase receipt",
    "customer_return": "Customer return",
    "transfer_in": "Transfer in",
    "found_stock": "Found stock",
    "stock_count_correction_in": "Stock count correction (increase)",
    "other": "Other",
}

STOCK_OUT_REASON_LABELS = {
    "sale_dispatch": "Sale / dispatch",
    "internal_consumption": "Internal consumption",
    "damage": "Damage",
    "transfer_out": "Transfer out",
    "write_off": "Write-off",
    "stock_count_correction_out": "Stock count correction (decrease)",
    "other": "Other",
}

# reason -> (movement_type, adjustment_direction or None)
STOCK_IN_MOVEMENT_MAP: dict[str, tuple[str, str | None]] = {
    "purchase_receipt": ("purchase", None),
    "customer_return": ("adjustment", DIRECTION_IN),
    "transfer_in": ("adjustment", DIRECTION_IN),
    "found_stock": ("adjustment", DIRECTION_IN),
    "stock_count_correction_in": ("adjustment", DIRECTION_IN),
    "other": ("adjustment", DIRECTION_IN),
}

STOCK_OUT_MOVEMENT_MAP: dict[str, tuple[str, str | None]] = {
    "sale_dispatch": ("sale", None),
    "internal_consumption": ("sale", None),
    "damage": ("damage", None),
    "transfer_out": ("adjustment", DIRECTION_OUT),
    "write_off": ("adjustment", DIRECTION_OUT),
    "stock_count_correction_out": ("adjustment", DIRECTION_OUT),
    "other": ("adjustment", DIRECTION_OUT),
}

REFERENCE_REQUIRED_REASONS = {
    "purchase_receipt",
    "sale_dispatch",
    "transfer_in",
    "transfer_out",
}

NOTES_REQUIRED_REASONS = {"other"}

DAMAGE_REASON_DEFAULT = "breakage"
