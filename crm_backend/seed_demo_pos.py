"""Seed demo POS (Phase 1 MVP)."""

from __future__ import annotations

import argparse
from decimal import Decimal

from database import SessionLocal
from models import Company, PosRegister, PosSettings, Product


def seed_demo_pos(reset: bool = False) -> None:
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("No company found. Run seed_company.py first.")
            return

        settings = db.query(PosSettings).filter(PosSettings.company_id == company.id).first()
        if not settings:
            settings = PosSettings(company_id=company.id)
            db.add(settings)
            db.flush()

        reg = db.query(PosRegister).filter(PosRegister.company_id == company.id, PosRegister.code == "MAIN").first()
        if not reg:
            reg = PosRegister(company_id=company.id, name="Main Counter", code="MAIN")
            db.add(reg)
            db.flush()

        settings.is_enabled = True
        settings.default_register_id = reg.id
        settings.auto_create_invoice = True
        settings.inventory_deduct_on_sale = True
        settings.receipt_footer = "Thank you — visit again!"

        products = (
            db.query(Product)
            .filter(Product.company_id == company.id, Product.status == "active")
            .order_by(Product.id.asc())
            .limit(8)
            .all()
        )
        enabled = 0
        for product in products:
            price = product.offer_price or product.total_price
            if not price or float(price) <= 0:
                product.total_price = Decimal("499")
                product.offer_price = Decimal("399")
            product.sell_at_pos = True
            if not product.pos_category:
                product.pos_category = product.category or "General"
            if product.inventory_tracked and not product.opening_recorded:
                product.on_hand_quantity = Decimal("100")
                product.opening_recorded = True
            enabled += 1

        db.commit()
        print(f"POS demo ready — {enabled} products at counter")
        print("  CRM: /pos")
        print("  Open session on Main Counter, then /pos/terminal")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()
    seed_demo_pos(reset=args.reset)
