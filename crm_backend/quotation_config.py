from __future__ import annotations

QUOTATION_STATUSES = [
    "draft",
    "pending_approval",
    "approved",
    "sent",
    "viewed",
    "negotiation",
    "accepted",
    "rejected",
    "expired",
    "cancelled",
]

FINAL_STATUSES = {"accepted", "rejected", "expired", "cancelled"}

EDITABLE_STATUSES = {"draft", "pending_approval", "approved"}

QUOTATION_STATUS_LABELS = {
    "draft": "Draft",
    "pending_approval": "Awaiting Approval",
    "approved": "Approved",
    "sent": "Sent",
    "viewed": "Viewed",
    "negotiation": "In Negotiation",
    "accepted": "Accepted",
    "rejected": "Rejected",
    "expired": "Expired",
    "cancelled": "Cancelled",
}

DISCOUNT_APPROVAL_THRESHOLD_PERCENT = 15.0
VALUE_APPROVAL_THRESHOLD = 500_000.0

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"pending_approval", "approved", "cancelled"},
    "pending_approval": {"approved", "draft", "cancelled"},
    "approved": {"sent", "draft", "cancelled"},
    "sent": {"viewed", "negotiation", "accepted", "rejected", "expired", "cancelled"},
    "viewed": {"negotiation", "accepted", "rejected", "expired", "cancelled"},
    "negotiation": {"accepted", "rejected", "expired", "cancelled"},
    "accepted": set(),
    "rejected": set(),
    "expired": set(),
    "cancelled": set(),
}

COMPANY_QUOTE_PREPARED_BY = "BlackPapers Sarthies Private Limited"
COMPANY_QUOTE_DOCUMENT_LABEL = "Service Quotation"

DEFAULT_SCOPE_NOTES = (
    "Thank you for choosing BlackPapers.in (a unit of BlackPapers Sarthies Private Limited), "
    "India's leading Govt. Recognised Startup Consultant portal, to assist with your organisational needs. "
    "We're thrilled to be of service to you!"
)

DEFAULT_PROJECT_OVERVIEW = (
    "Now, let's talk business! Here's a Quick Project Overview of what we have to offer "
    "to register under Startup India and Government Seed Funding Scheme."
)

DEFAULT_DELIVERABLES = (
    "Startup India Application\n"
    "Organisational DSC\n"
    "Seed Funding Application\n"
    "Pitch Deck Creation\n"
    "Detailed Financial Projections\n"
    "Business plan\n"
    "Financial Information\n"
    "Sales Projection"
)

DEFAULT_TIMELINE_NOTES = (
    "This project shall take approximately 30-40 working days. If the documents are sent timely.\n"
    "All along the process you'll be updated regularly about what we are working on."
)

DEFAULT_INVESTMENT_COMMISSION = (
    "1.00% of the Total Approved Fund (after disbursement of the fund) as consultancy fees "
    "to the service provider."
)

DEFAULT_INVESTMENT_INCLUDES = (
    "Including Organisational Digital Signatures\n"
    "Including GST\n"
    "Including all other charges"
)

DEFAULT_PAYMENT_INSTALLMENTS = (
    "1st Installment = Rs. 8,000/-\n"
    "2nd Installment = Rs. 5,000/- (Immediately after submission of Seed Funding Application)\n"
    "1.5% of Commission after Disbursement of Grant in Bank Account"
)

DEFAULT_PAYMENT_TERMS = (
    f"Total investment as per quotation grand total.\n\n"
    f"{DEFAULT_INVESTMENT_COMMISSION}\n\n"
    f"{DEFAULT_PAYMENT_INSTALLMENTS}\n\n"
    "Pay via bank transfer / UPI / PayTM / Google Pay / PayPal. "
    "Upon first installment you will be assigned a dedicated in-house CA from BlackPapers."
)

DEFAULT_BANK_INSTRUCTIONS = (
    "Bank name: Kotak Mahindra Bank Limited\n"
    "A/c Holder name: BlackPapers Sarthies Private Limited\n"
    "Add of Bank: Delhi\n"
    "IFSC: KKBK0004599\n"
    "A/c Type: Current Account\n"
    "A/c number: 1910202300\n"
    "UPI: blackpapers@kotak"
)

DEFAULT_HOW_TO_GET_STARTED = (
    "Make the first installment payment to start your company incorporation process. "
    "You can pay conveniently via cards, net banking, UPI, or wallet.\n"
    "Upon payment, you'll be instantly assigned a dedicated inhouse CA from BlackPapers who will "
    "guide you through the entire process. They'll be available to assist you via email, chat, or phone."
)

DEFAULT_WHY_CHOOSE_ITEMS = (
    "Consulted 10K+ Clients\n"
    "Served 500+ Clients\n"
    "PAN India Service\n"
    "Confidential\n"
    "Disputes Escalation Systems\n"
    "In-house Professionals\n"
    "Transparent Pricing\n"
    "Google Reviews\n"
    "Community Support\n"
    "1 Lakh Monthly Reach\n"
    "Time Deliverability\n"
    "Complete Online Support\n"
    "Lowest Price Guarantee\n"
    "24*7 Online Guidance"
)

DEFAULT_VALIDITY_CLAUSE = (
    "This quotation is valid until the date specified above unless extended in writing. "
    "Prices and terms may change after expiry."
)

DEFAULT_LEGAL_FOOTER = (
    "Thanks,\n"
    "Vishvendra Mani Tripathi\n"
    "Blackpapers Sarthies Pvt. Ltd.\n"
    "Phone: +91 8299824396\n"
    "Email: connect@blackpapers.in\n"
    "Website: www.blackpapers.in\n"
    "Instagram: www.instagram.com/theblackpapers\n"
    "LinkedIn: https://www.linkedin.com/company/theblackpapers"
)

DEFAULT_DOCUMENTS_CHECKLIST = (
    "Authorization Letter\n"
    "PAN\n"
    "COI\n"
    "All Director's Aadhar & PAN & DSC, Mobile, Email\n"
    "Passport-size photograph\n"
    "Website\n"
    "Photo & video of products, (Brief write-up - Innovation in the industry, High potential for wealth creation, Potential for employment generation)\n"
    "GST registration\n"
    "Trademark/Patent registration (if any)\n"
    "Fill this google form: https://docs.google.com/document/d/1U0rLhNm9v9jIMQXO1742QNSqoNzqNpRk3TpgvxTFpcc/edit?usp=sharing\n"
    "Any other documents required from time to time"
)

DEFAULT_BANK_PAYMENT_INTRO = (
    "You can pay via bank transfer / UPI / PayTM / Google Pay / PayPal at:"
)
