from __future__ import annotations

from models import Company, SystemSetting
from schemas import QuotationCompanyBranding
from invoice_config import (
    COMPANY_CIN,
    COMPANY_INVOICE_DISPLAY_NAME,
    COMPANY_INVOICE_PHONE,
    COMPANY_TAGLINE,
    DEFAULT_SIGNATORY,
    INVOICE_DOCUMENT_TITLE,
)


def build_company_branding(
    company: Company,
    settings: SystemSetting | None,
    *,
    for_invoice: bool = False,
) -> QuotationCompanyBranding:
    return QuotationCompanyBranding(
        display_name=COMPANY_INVOICE_DISPLAY_NAME if for_invoice else company.display_name,
        legal_name=company.legal_name,
        email=company.email,
        phone=COMPANY_INVOICE_PHONE if for_invoice else company.phone,
        website=company.website,
        address_line1=company.address_line1,
        address_line2=company.address_line2,
        city=company.city,
        state=company.state,
        pincode=company.pincode,
        country=company.country,
        gstin=company.gstin,
        pan=company.pan,
        logo_filename=settings.logo_filename if settings else None,
        tagline=COMPANY_TAGLINE if for_invoice else None,
        cin=COMPANY_CIN if for_invoice else None,
        invoice_document_title=INVOICE_DOCUMENT_TITLE if for_invoice else None,
        signatory_name=DEFAULT_SIGNATORY if for_invoice else None,
    )
