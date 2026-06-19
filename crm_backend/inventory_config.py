from __future__ import annotations

MOVEMENT_TYPES = ["opening", "purchase", "sale", "damage", "adjustment"]

MOVEMENT_TYPE_LABELS = {
    "opening": "Opening",
    "purchase": "Purchase",
    "sale": "Sale",
    "damage": "Damage",
    "adjustment": "Adjustment",
}

DIRECTION_IN = "in"
DIRECTION_OUT = "out"

MOVEMENT_DIRECTIONS: dict[str, str] = {
    "opening": DIRECTION_IN,
    "purchase": DIRECTION_IN,
    "sale": DIRECTION_OUT,
    "damage": DIRECTION_OUT,
}

INVENTORY_STATUSES = [
    "not_tracked",
    "awaiting_opening",
    "active",
    "low_stock",
    "out_of_stock",
    "inactive",
]

INVENTORY_STATUS_LABELS = {
    "not_tracked": "Not Tracked",
    "awaiting_opening": "Awaiting Opening",
    "active": "Active",
    "low_stock": "Low Stock",
    "out_of_stock": "Out of Stock",
    "inactive": "Inactive",
}

DAMAGE_REASONS = [
    "breakage",
    "spoilage",
    "transit_loss",
    "quality_rejection",
    "obsolete_write_off",
]

DAMAGE_REASON_LABELS = {
    "breakage": "Breakage",
    "spoilage": "Spoilage",
    "transit_loss": "Transit Loss",
    "quality_rejection": "Quality Rejection",
    "obsolete_write_off": "Obsolete Write-off",
}

ADJUSTMENT_REASONS = [
    "stock_count_correction",
    "system_migration",
    "found_stock",
    "data_cleanup",
    "other",
]

ADJUSTMENT_REASON_LABELS = {
    "stock_count_correction": "Stock Count Correction",
    "system_migration": "System Migration",
    "found_stock": "Found Stock",
    "data_cleanup": "Data Cleanup",
    "other": "Other",
}

OUT_MOVEMENT_TYPES = {"sale", "damage"}
