from __future__ import annotations

import config

DOCUMENT_CATEGORIES: dict[str, str] = {
    "contracts": "Contracts",
    "invoices": "Invoices",
    "hr": "HR Files",
    "client_documents": "Client Documents",
    "compliance": "Compliance Records",
    "sops": "SOPs",
    "kyc": "KYC Documents",
    "receipts": "Receipts",
    "products": "Product Images",
    "documents": "Other Business Documents",
}

RECORD_MODULE_KEYS: dict[str, str] = {
    "leads": "Lead",
    "deals": "Deal",
    "contacts": "Contact",
    "invoices": "Invoice",
    "quotations": "Quotation",
    "sales_orders": "Sales Order",
    "expenses": "Expense",
    "vendor_bills": "Vendor Bill",
    "projects": "Project",
    "products": "Product",
}

PANEL_CATEGORY_DEFAULTS: dict[str, str] = {
    "leads": "client_documents",
    "deals": "contracts",
    "contacts": "client_documents",
    "invoices": "invoices",
    "quotations": "client_documents",
    "sales_orders": "invoices",
    "expenses": "receipts",
    "vendor_bills": "receipts",
    "projects": "client_documents",
    "products": "products",
}

CATEGORY_KEYS = frozenset(DOCUMENT_CATEGORIES.keys())
RECORD_MODULE_KEY_SET = frozenset(RECORD_MODULE_KEYS.keys())


def category_label(key: str | None) -> str | None:
    if not key:
        return None
    return DOCUMENT_CATEGORIES.get(key, key.replace("_", " ").title())


def record_module_label(key: str | None) -> str | None:
    if not key:
        return None
    return RECORD_MODULE_KEYS.get(key, key.replace("_", " ").title())


def is_record_module(key: str | None) -> bool:
    return key in RECORD_MODULE_KEY_SET


def validate_category(category: str) -> None:
    if category not in CATEGORY_KEYS:
        allowed = ", ".join(DOCUMENT_CATEGORIES.keys())
        raise ValueError(f"Category must be one of: {allowed}")


def validate_record_module(module: str) -> None:
    if module not in RECORD_MODULE_KEY_SET:
        allowed = ", ".join(RECORD_MODULE_KEYS.keys())
        raise ValueError(f"Record module must be one of: {allowed}")


def allowed_extensions_list() -> list[str]:
    return sorted(config.ALLOWED_EXTENSIONS)


def max_file_size_mb() -> int:
    return config.MAX_FILE_SIZE // (1024 * 1024)
