"""Upsert the real Surendra-Charu Foundation service invoice demo (no level2 reset required)."""

from __future__ import annotations

import secrets
from datetime import datetime, timezone
from decimal import Decimal

from database import SessionLocal
from invoice_config import (
    DEFAULT_BANK_INSTRUCTIONS,
    DEFAULT_BILLING_NOTES,
    DEFAULT_PAYMENT_TERMS,
)
from models import Company, Invoice, InvoiceLineItem, InvoicePayment, User

INVOICE_NUMBER = "Inv-13/04/2026-001"
DEMO_MARKER = "[demo-flagship-invoice]"


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

        inv = db.query(Invoice).filter(
            Invoice.company_id == company.id,
            Invoice.invoice_number == INVOICE_NUMBER,
        ).first()

        if not inv:
            inv = db.query(Invoice).filter(
                Invoice.company_id == company.id,
                Invoice.internal_notes.like(f"%{DEMO_MARKER}%"),
            ).first()

        issue_date = datetime(2026, 4, 13, 12, 0, 0, tzinfo=timezone.utc)
        subtotal = Decimal("14900.00")
        amount_paid = Decimal("10900.00")
        outstanding = Decimal("4000.00")
        now = datetime.now(timezone.utc)

        if not inv:
            inv = Invoice(company_id=company.id, invoice_number=INVOICE_NUMBER)
            db.add(inv)

        inv.title = "Annual Compliance — Section 8 (MCA + Income Tax)"
        inv.status = "partially_paid"
        inv.invoice_type = "standard"
        inv.source_type = "manual"
        inv.currency = "INR"
        inv.issue_date = issue_date
        inv.due_date = issue_date
        inv.client_name = "Anamika Singha"
        inv.client_org = "Surendra-Charu Foundation"
        inv.client_email = "anamika@surendra-charu.demo"
        inv.billing_address = "Delhi"
        inv.assigned_to_id = sales.id if sales else creator.id
        inv.created_by_id = creator.id
        inv.issued_by_id = creator.id
        inv.subtotal = subtotal
        inv.line_discount_total = Decimal("0")
        inv.total_tax = Decimal("0")
        inv.grand_total = subtotal
        inv.amount_paid = amount_paid
        inv.outstanding_amount = outstanding
        inv.payment_terms = DEFAULT_PAYMENT_TERMS
        inv.bank_instructions = DEFAULT_BANK_INSTRUCTIONS
        inv.billing_notes = DEFAULT_BILLING_NOTES
        inv.internal_notes = f"{DEMO_MARKER} Flagship demo from formal service invoice."
        inv.share_token = inv.share_token or secrets.token_urlsafe(24)
        inv.issued_at = inv.issued_at or issue_date
        inv.sent_at = inv.sent_at or issue_date
        inv.last_payment_at = inv.last_payment_at or issue_date

        db.flush()
        db.query(InvoiceLineItem).filter(InvoiceLineItem.invoice_id == inv.id).delete()
        db.add(
            InvoiceLineItem(
                invoice_id=inv.id,
                sort_order=0,
                item_name="Annual Compliance- Section 8 (MCA + Income Tax)",
                quantity=Decimal("1"),
                unit="Service",
                unit_price=Decimal("11000.00"),
                tax_rate=Decimal("0"),
                line_subtotal=Decimal("11000.00"),
                line_total=Decimal("11000.00"),
            )
        )
        db.add(
            InvoiceLineItem(
                invoice_id=inv.id,
                sort_order=1,
                item_name="ADT-1 Late Fees Paid on Actuals",
                description="Paid on actuals",
                quantity=Decimal("1"),
                unit="—",
                unit_price=Decimal("3900.00"),
                tax_rate=Decimal("0"),
                line_subtotal=Decimal("3900.00"),
                line_total=Decimal("3900.00"),
            )
        )

        existing_payment = (
            db.query(InvoicePayment)
            .filter(InvoicePayment.invoice_id == inv.id, InvoicePayment.reference == "TOKEN-DEPOSIT")
            .first()
        )
        if not existing_payment:
            db.add(
                InvoicePayment(
                    invoice_id=inv.id,
                    amount=amount_paid,
                    payment_date=issue_date,
                    payment_method="bank_transfer",
                    reference="TOKEN-DEPOSIT",
                    note="Token deposited",
                    recorded_by_id=creator.id,
                )
            )

        db.commit()
        print(f"Flagship invoice ready: {INVOICE_NUMBER} (id={inv.id})")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
