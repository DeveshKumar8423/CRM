from __future__ import annotations

import re

REPORT_PERIODS = [
    "month",
    "last_month",
    "quarter",
    "financial_year",
    "last_financial_year",
    "custom",
]

PERIOD_LABELS = {
    "month": "This month",
    "last_month": "Last month",
    "quarter": "This quarter (FY)",
    "financial_year": "This financial year",
    "last_financial_year": "Last financial year",
    "custom": "Custom range",
}

OUTWARD_STATUSES = {
    "issued",
    "sent",
    "viewed",
    "partially_paid",
    "paid",
    "overdue",
}

INWARD_STATUSES = {
    "approved",
    "partially_paid",
    "paid",
    "overdue",
}

OUTWARD_DRAFT_STATUSES = {"draft", "awaiting_review", "approved"}
INWARD_DRAFT_STATUSES = {"draft", "submitted", "under_review"}

GSTIN_PATTERN = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")

STANDARD_RATES = [0.0, 5.0, 12.0, 18.0, 28.0]
