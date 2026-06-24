"""Seed demo Field Service (Phase 1 MVP)."""

from __future__ import annotations

import argparse
from datetime import timedelta

from database import SessionLocal
from models import Company, Contact, FieldServiceOrder
from routers.field_service_router import _get_settings


def _utcnow():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc)


def seed_demo_field_service(reset: bool = False) -> None:
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("No company found. Run seed_company.py first.")
            return

        settings = _get_settings(db, company)
        settings.is_enabled = True
        settings.default_sla_hours = 48
        settings.auto_deduct_parts = True
        settings.notify_roles_json = ["Admin", "Manager"]

        contact = db.query(Contact).filter(Contact.company_id == company.id).first()
        if not contact:
            print("No contact found. Run seed data first.")
            return

        exists = (
            db.query(FieldServiceOrder.id)
            .filter(FieldServiceOrder.company_id == company.id, FieldServiceOrder.order_number == "FSO-DEMO-001")
            .first()
        )
        if not exists:
            now = _utcnow()
            parts = [contact.address_line1, contact.city, contact.state, contact.pincode]
            site = ", ".join(p for p in parts if p) or "Customer site — update address"
            order = FieldServiceOrder(
                company_id=company.id,
                order_number="FSO-DEMO-001",
                contact_id=contact.id,
                type="installation",
                priority="normal",
                status="draft",
                title="Demo printer installation",
                description="Phase 1 field service demo job",
                site_address=site,
                site_contact_name=contact.name,
                site_contact_phone=contact.phone,
                sla_due_at=now + timedelta(hours=48),
            )
            db.add(order)

        db.commit()
        print("Field Service demo ready")
        print("  CRM: /field-service")
        print(f"  Demo FSO for contact: {contact.name}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed Field Service demo data")
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()
    seed_demo_field_service(reset=args.reset)
