"""Seed demo Rental Management (Phase 1 MVP)."""

from __future__ import annotations

import argparse
from datetime import timedelta

from database import SessionLocal
from models import Company, Contact, RentalAsset, RentalContract, RentalContractLine
from routers.rental_router import _get_settings
from services.rental_service import compute_contract_totals, compute_line_pricing, unit_rate_for_basis


def _utcnow():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc)


def seed_demo_rental(reset: bool = False) -> None:
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("No company found. Run seed_company.py first.")
            return

        settings = _get_settings(db, company)
        settings.is_enabled = True
        settings.contract_prefix = "RNT"
        settings.default_deposit_percent = 20
        settings.require_deposit_before_delivery = True
        settings.notify_roles_json = ["Admin", "Manager"]

        contact = db.query(Contact).filter(Contact.company_id == company.id).first()
        if not contact:
            print("No contact found. Run seed data first.")
            return

        asset = (
            db.query(RentalAsset)
            .filter(RentalAsset.company_id == company.id, RentalAsset.asset_code == "GEN-5KVA")
            .first()
        )
        if not asset:
            asset = RentalAsset(
                company_id=company.id,
                asset_code="GEN-5KVA",
                name="5 KVA Diesel Generator",
                description="Event and site power — demo rentable asset",
                category="generator",
                quantity_available=3,
                rate_daily=2000,
                rate_weekly=12000,
                rate_monthly=45000,
                gst_rate=18,
                status="active",
                location_notes="Main yard",
            )
            db.add(asset)
            db.flush()

        exists = (
            db.query(RentalContract.id)
            .filter(RentalContract.company_id == company.id, RentalContract.contract_number == "RNT-DEMO-001")
            .first()
        )
        if not exists:
            now = _utcnow()
            start = now + timedelta(days=2)
            end = start + timedelta(days=3)
            rate_basis = "daily"
            rate = unit_rate_for_basis(asset, rate_basis)
            days, unit_r, sub, gst, total = compute_line_pricing(asset, 1, rate_basis, start, end)
            line = RentalContractLine(
                rental_asset_id=asset.id,
                quantity=1,
                rate_basis=rate_basis,
                unit_rate=unit_r,
                line_days=days,
                line_subtotal=sub,
                gst_rate=gst,
                line_total=total,
            )
            contract = RentalContract(
                company_id=company.id,
                contract_number="RNT-DEMO-001",
                contact_id=contact.id,
                status="draft",
                rate_basis=rate_basis,
                rental_start=start,
                rental_end=end,
                delivery_address=", ".join(p for p in [contact.address_line1, contact.city] if p) or "Customer site",
                delivery_contact_name=contact.name,
                delivery_contact_phone=contact.phone,
                notes="Phase 1 rental demo contract",
                lines=[line],
            )
            subtotal, grand_total, deposit_required = compute_contract_totals([line], settings, {asset.id: asset})
            contract.subtotal = subtotal
            contract.grand_total = grand_total
            contract.deposit_required = deposit_required
            db.add(contract)

        db.commit()
        print("Rental demo ready")
        print("  CRM: /rental")
        print(f"  Demo asset: {asset.name} (qty {asset.quantity_available})")
        print(f"  Demo contract for: {contact.name}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed Rental demo data")
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()
    seed_demo_rental(reset=args.reset)
