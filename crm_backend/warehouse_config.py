from __future__ import annotations

LOCATION_TYPES = [
    "branch",
    "warehouse",
    "store",
    "project_site",
    "zone",
    "rack",
    "bin",
    "staging_area",
    "quarantine",
]

LOCATION_TYPE_LABELS = {
    "branch": "Branch",
    "warehouse": "Warehouse",
    "store": "Store",
    "project_site": "Project Site",
    "zone": "Zone",
    "rack": "Rack",
    "bin": "Bin",
    "staging_area": "Staging Area",
    "quarantine": "Quarantine",
}

LOCATION_STATUSES = ["active", "inactive", "maintenance", "closed"]

LOCATION_STATUS_LABELS = {
    "active": "Active",
    "inactive": "Inactive",
    "maintenance": "Maintenance",
    "closed": "Closed",
}

LOCATION_MOVEMENT_TYPES = ["receipt", "issue", "damage", "adjustment", "transfer_in", "transfer_out"]

LOCATION_MOVEMENT_LABELS = {
    "receipt": "Receipt",
    "issue": "Issue",
    "damage": "Damage",
    "adjustment": "Adjustment",
    "transfer_in": "Transfer In",
    "transfer_out": "Transfer Out",
}

DIRECTION_IN = "in"
DIRECTION_OUT = "out"

LOCATION_MOVEMENT_DIRECTIONS: dict[str, str] = {
    "receipt": DIRECTION_IN,
    "issue": DIRECTION_OUT,
    "damage": DIRECTION_OUT,
    "transfer_in": DIRECTION_IN,
    "transfer_out": DIRECTION_OUT,
}

INVENTORY_SYNC_TYPES = {"receipt": "purchase", "issue": "sale", "damage": "damage", "adjustment": "adjustment"}

DEFAULT_TRANSFER_PREFIX = "TRF-"
