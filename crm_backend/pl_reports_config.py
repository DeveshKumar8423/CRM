from __future__ import annotations

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

REVENUE_INVOICE_STATUSES = {
    "issued",
    "sent",
    "viewed",
    "partially_paid",
    "paid",
    "overdue",
    "written_off",
    "closed",
    "refunded",
}

GROSS_SALES_INVOICE_TYPES = {"standard", "advance", "interim", "final", "debit_note"}
CREDIT_INVOICE_TYPES = {"credit_note"}
EXCLUDED_INVOICE_TYPES = {"pro_forma"}

PURCHASE_BILL_STATUSES = {
    "approved",
    "partially_paid",
    "paid",
    "overdue",
    "closed",
}

EXPENSE_STATUSES = {"approved", "paid"}

INVOICE_DRAFT_STATUSES = {"draft", "awaiting_review", "approved", "cancelled"}
BILL_DRAFT_STATUSES = {"draft", "submitted", "under_review", "rejected", "cancelled"}
EXPENSE_DRAFT_STATUSES = {"draft", "submitted", "under_review", "rejected", "cancelled"}

INVOICE_TYPE_LABELS = {
    "standard": "Standard",
    "advance": "Advance",
    "interim": "Interim",
    "final": "Final",
    "debit_note": "Debit Note",
    "credit_note": "Credit Note",
    "pro_forma": "Pro Forma",
}
