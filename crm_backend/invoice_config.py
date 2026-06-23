from __future__ import annotations

INVOICE_STATUSES = [
    "draft",
    "awaiting_review",
    "approved",
    "issued",
    "sent",
    "viewed",
    "partially_paid",
    "paid",
    "overdue",
    "cancelled",
    "refunded",
    "written_off",
    "closed",
]

FINAL_STATUSES = {"paid", "cancelled", "refunded", "written_off", "closed"}

EDITABLE_STATUSES = {"draft", "awaiting_review"}

INVOICE_STATUS_LABELS = {
    "draft": "Draft",
    "awaiting_review": "Awaiting Review",
    "approved": "Approved",
    "issued": "Issued",
    "sent": "Sent",
    "viewed": "Viewed",
    "partially_paid": "Partially Paid",
    "paid": "Paid",
    "overdue": "Overdue",
    "cancelled": "Cancelled",
    "refunded": "Refunded",
    "written_off": "Written Off",
    "closed": "Closed",
}

INVOICE_TYPES = ["standard", "advance", "interim", "final", "credit_note", "debit_note", "pro_forma"]

SOURCE_TYPES = ["sales_order", "quotation", "manual"]

CONVERTIBLE_ORDER_STATUSES = {
    "confirmed",
    "in_preparation",
    "in_execution",
    "partially_delivered",
    "delivered",
    "in_billing",
    "completed",
}

CONVERTIBLE_QUOTE_STATUSES = {"accepted", "approved"}

REVIEW_THRESHOLD = 500_000.0

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"awaiting_review", "approved", "issued", "cancelled"},
    "awaiting_review": {"approved", "draft", "cancelled"},
    "approved": {"issued", "cancelled"},
    "issued": {"sent", "partially_paid", "paid", "overdue", "cancelled"},
    "sent": {"viewed", "partially_paid", "paid", "overdue", "cancelled"},
    "viewed": {"partially_paid", "paid", "overdue", "cancelled"},
    "partially_paid": {"paid", "overdue", "refunded", "written_off", "cancelled"},
    "paid": {"refunded", "closed"},
    "overdue": {"partially_paid", "paid", "written_off", "cancelled"},
    "cancelled": {"closed"},
    "refunded": {"closed"},
    "written_off": {"closed"},
    "closed": set(),
}

INVOICE_DOCUMENT_TITLE = "Service Invoice"
COMPANY_INVOICE_DISPLAY_NAME = "BlackPapers Sarthies (P) Ltd."
COMPANY_TAGLINE = "We are Handcrafting NGO!!"
COMPANY_CIN = "U70200DL2023PTC421680"
COMPANY_INVOICE_PHONE = "+91 8423224663 / 8299824396"
DEFAULT_ORG_TYPE = "NGO"
DEFAULT_CLIENT_NATURE = "B2C"
DEFAULT_SIGNATORY = "Vishvendra Mani Tripathi"
DEFAULT_BILLING_NOTES = "Thank you for your business with us!"
INVOICE_TERMS_LABEL = "Terms and Conditions for Invoice"

DEFAULT_PAYMENT_TERMS = "Due on receipt"
DEFAULT_BANK_INSTRUCTIONS = (
    "Bank Name: Kotak Bank\n"
    "A/c No.: 1910202300\n"
    "IFSC: KKBK0004599\n"
    "UPI ID: blackpapers@kotak\n"
    "Account Type: Current Account"
)
