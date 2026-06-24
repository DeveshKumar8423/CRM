"""Rental Management module constants (Phase 1)."""

DEFAULT_CONTRACT_PREFIX = "RNT"
DEFAULT_RATE_BASIS = "daily"
DEFAULT_DEPOSIT_PERCENT = 20
DEFAULT_LATE_FEE_PER_DAY = 500
DEFAULT_GRACE_HOURS = 24
DEFAULT_AUTO_INVOICE_MODE = "draft"
DEFAULT_NOTIFY_ROLES = ["Admin", "Manager", "Employee"]

RATE_BASIS_OPTIONS = ("daily", "weekly", "monthly")
ASSET_CATEGORIES = ("generator", "furniture", "it", "construction", "av", "other")
ASSET_STATUSES = ("active", "maintenance", "retired")
CONTRACT_STATUSES = (
    "draft",
    "confirmed",
    "delivered",
    "on_rent",
    "return_scheduled",
    "returned",
    "closed",
    "cancelled",
)
RESERVED_STATUSES = ("confirmed", "delivered", "on_rent", "return_scheduled", "returned")
RETURN_CONDITIONS = ("good", "fair", "damaged")
DEPOSIT_TYPES = ("received", "refund", "deduction")
DEPOSIT_PAYMENT_METHODS = ("cash", "upi", "bank", "cheque", "other")
INVOICE_TYPES = ("rental", "damage", "late_fee")
