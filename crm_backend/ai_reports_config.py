"""AI Reports module constants (Phase 1)."""

DEFAULT_RUN_PREFIX = "AIR"
DEFAULT_PERIOD = "30d"
DEFAULT_DOMAINS = ["sales", "finance", "inventory", "hr", "operations"]
DEFAULT_NOTIFY_ROLES = ["Admin", "Manager"]
DEFAULT_GENERATION_MODE = "template"

INSIGHT_DOMAINS = ("sales", "finance", "inventory", "hr", "operations", "executive")
PERIOD_PRESETS = ("7d", "30d", "mtd", "last_month")
RUN_STATUSES = ("pending", "completed", "failed")
SEVERITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3}

DOMAIN_PERMISSIONS: dict[str, list[str]] = {
    "sales": ["reports.view", "deals.view"],
    "finance": ["reports.view_financial", "pl_reports.view", "invoices.view"],
    "inventory": ["inventory.view"],
    "hr": ["employees.view", "attendance.view", "payroll.view"],
    "operations": [
        "manufacturing.view",
        "quality.view",
        "maintenance.view",
        "field_service.view",
        "rental.view",
        "ecommerce.view",
    ],
}

DOMAIN_LINKS: dict[str, str] = {
    "sales": "/sales-reports",
    "finance": "/pl-reports",
    "inventory": "/inventory",
    "hr": "/employees",
    "operations": "/dashboard",
}
