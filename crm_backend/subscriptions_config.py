"""Subscription Management module constants (Phase 1)."""

DEFAULT_SUBSCRIPTION_PREFIX = "SUB"
DEFAULT_SLA_REMINDER_DAYS = [7, 3, 1]
DEFAULT_GRACE_PERIOD_DAYS = 7
DEFAULT_NOTIFY_ROLES = ["Admin", "Manager", "Accountant"]
DEFAULT_AUTO_INVOICE_MODE = "draft"

BILLING_INTERVALS = ("monthly", "quarterly", "yearly", "custom_days")
PLAN_STATUSES = ("active", "archived")
SUBSCRIPTION_STATUSES = ("trialing", "active", "past_due", "cancelled", "expired")
BILLABLE_STATUSES = ("trialing", "active", "past_due")
CHANGE_TYPES = ("upgrade", "downgrade", "same_tier")
