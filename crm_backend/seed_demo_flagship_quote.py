"""Upsert the real PixelPolish Startup India quotation demo (no level2 reset required)."""

from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from database import SessionLocal
from models import Company, Quotation, QuotationLineItem, User
from quotation_config import (
    DEFAULT_DELIVERABLES,
    DEFAULT_DOCUMENTS_CHECKLIST,
    DEFAULT_LEGAL_FOOTER,
    DEFAULT_PAYMENT_TERMS,
    DEFAULT_SCOPE_NOTES,
    DEFAULT_TIMELINE_NOTES,
    DEFAULT_VALIDITY_CLAUSE,
)

QUOTE_NUMBER = "Quote-14/03/2026-001_U01"
DEMO_MARKER = "[demo-flagship-quote]"


def seed() -> None:
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("Run seed_company.py first.")
            return

        sales = db.query(User).filter(User.email == "sales@crm.com").first()
        admin = db.query(User).filter(User.email == "admin@crm.com").first()
        creator = admin or sales
        if not creator:
            print("No admin/sales user found.")
            return

        quote = db.query(Quotation).filter(
            Quotation.company_id == company.id,
            Quotation.quote_number == QUOTE_NUMBER,
        ).first()

        if not quote:
            quote = db.query(Quotation).filter(
                Quotation.company_id == company.id,
                Quotation.internal_notes.like(f"%{DEMO_MARKER}%"),
            ).first()

        now = datetime.now(timezone.utc)
        quote_date = datetime(2026, 3, 14, 12, 0, 0, tzinfo=timezone.utc)
        subtotal = Decimal("11016.95")
        tax = Decimal("1983.05")
        grand = Decimal("13000.00")

        if not quote:
            quote = Quotation(company_id=company.id, quote_number=QUOTE_NUMBER)
            db.add(quote)

        quote.title = (
            "Formal Quotation for Mr. Abhishek for Startup India and Seed Funding "
            "for PixelPolish Productions Private Limited."
        )
        quote.status = "sent"
        quote.currency = "INR"
        quote.quote_date = quote_date
        quote.valid_until = quote_date + timedelta(days=30)
        quote.client_name = "Mr. Abhishek"
        quote.client_org = "PixelPolish Productions Private Limited"
        quote.client_email = "abhishek@pixelpolish.demo"
        quote.attention_to = "Mr. Abhishek"
        quote.assigned_to_id = sales.id if sales else creator.id
        quote.created_by_id = creator.id
        quote.subtotal = subtotal
        quote.total_tax = tax
        quote.grand_total = grand
        quote.scope_notes = DEFAULT_SCOPE_NOTES
        quote.deliverables = DEFAULT_DELIVERABLES
        quote.timeline_notes = DEFAULT_TIMELINE_NOTES
        quote.payment_terms = DEFAULT_PAYMENT_TERMS
        quote.validity_clause = DEFAULT_VALIDITY_CLAUSE
        quote.cancellation_clause = DEFAULT_DOCUMENTS_CHECKLIST
        quote.legal_footer = DEFAULT_LEGAL_FOOTER
        quote.internal_notes = f"{DEMO_MARKER} Flagship demo from formal quotation."
        quote.share_token = quote.share_token or secrets.token_urlsafe(24)
        quote.sent_at = quote.sent_at or (now - timedelta(days=1))
        quote.approved_at = quote.approved_at or quote.sent_at

        db.flush()
        db.query(QuotationLineItem).filter(QuotationLineItem.quotation_id == quote.id).delete()
        db.add(
            QuotationLineItem(
                quotation_id=quote.id,
                sort_order=0,
                item_name="Startup India & Government Seed Funding consultancy",
                description=(
                    "Startup India Application, Organisational DSC, Seed Funding Application, "
                    "Pitch Deck Creation, Detailed Financial Projections, Business Plan, "
                    "Financial Information, and Sales Projection."
                ),
                quantity=Decimal("1"),
                unit="Service",
                unit_price=subtotal,
                tax_rate=Decimal("18"),
                line_subtotal=subtotal,
                line_total=grand,
            )
        )
        db.commit()
        print(f"Flagship quotation ready: {QUOTE_NUMBER} (id={quote.id})")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
