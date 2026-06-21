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

LEDGER_INVOICE_STATUSES = {
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

OUTSTANDING_STATUSES = {
    "issued",
    "sent",
    "viewed",
    "partially_paid",
    "overdue",
}

DEBIT_INVOICE_TYPES = {"standard", "advance", "interim", "final", "debit_note"}
CREDIT_INVOICE_TYPES = {"credit_note"}
EXCLUDED_INVOICE_TYPES = {"pro_forma"}

ENTRY_TYPE_INVOICE = "invoice"
ENTRY_TYPE_DEBIT_NOTE = "debit_note"
ENTRY_TYPE_CREDIT_NOTE = "credit_note"
ENTRY_TYPE_PAYMENT = "payment"
ENTRY_TYPE_WRITE_OFF = "write_off"

ENTRY_TYPE_LABELS = {
    ENTRY_TYPE_INVOICE: "Invoice",
    ENTRY_TYPE_DEBIT_NOTE: "Debit Note",
    ENTRY_TYPE_CREDIT_NOTE: "Credit Note",
    ENTRY_TYPE_PAYMENT: "Payment",
    ENTRY_TYPE_WRITE_OFF: "Write-off",
}
