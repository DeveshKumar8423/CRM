from __future__ import annotations

REPORT_PERIODS = [
    "all_time",
    "month",
    "last_month",
    "quarter",
    "financial_year",
    "last_financial_year",
    "custom",
]

PERIOD_LABELS = {
    "all_time": "All time",
    "month": "This month",
    "last_month": "Last month",
    "quarter": "This quarter (FY)",
    "financial_year": "This financial year",
    "last_financial_year": "Last financial year",
    "custom": "Custom range",
}

LEDGER_BILL_STATUSES = {
    "approved",
    "partially_paid",
    "paid",
    "overdue",
    "closed",
}

OUTSTANDING_STATUSES = {
    "approved",
    "partially_paid",
    "overdue",
}

ENTRY_TYPE_BILL = "bill"
ENTRY_TYPE_PAYMENT = "payment"

ENTRY_TYPE_LABELS = {
    ENTRY_TYPE_BILL: "Bill",
    ENTRY_TYPE_PAYMENT: "Payment",
}
