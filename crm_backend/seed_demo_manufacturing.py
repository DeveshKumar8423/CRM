"""Seed demo Manufacturing / MRP (Phase 1 MVP)."""

from __future__ import annotations

import argparse
from decimal import Decimal

from database import SessionLocal
from manufacturing_config import DEFAULT_CHECKLIST
from models import BomHeader, BomLine, Company, ManufacturingSettings, Product


def seed_demo_manufacturing(reset: bool = False) -> None:
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("No company found. Run seed_company.py first.")
            return

        settings = (
            db.query(ManufacturingSettings)
            .filter(ManufacturingSettings.company_id == company.id)
            .first()
        )
        if not settings:
            settings = ManufacturingSettings(company_id=company.id)
            db.add(settings)
            db.flush()

        settings.is_enabled = True
        settings.require_qc_before_receipt = True
        settings.default_checklist_json = DEFAULT_CHECKLIST

        fg = (
            db.query(Product)
            .filter(Product.company_id == company.id, Product.name == "Herbal Soap 100g")
            .first()
        )
        if not fg:
            fg = Product(
                company_id=company.id,
                name="Herbal Soap 100g",
                category="Finished Goods",
                unit="Piece",
                total_price=Decimal("45"),
                offer_price=Decimal("39"),
                gst_rate=Decimal("18"),
                inventory_tracked=True,
                on_hand_quantity=Decimal("0"),
                opening_recorded=True,
                is_manufactured=True,
            )
            db.add(fg)
            db.flush()

        components = [
            ("Coconut Oil", "Kg", Decimal("120"), Decimal("50")),
            ("Lye", "Kg", Decimal("80"), Decimal("20")),
            ("Fragrance Oil", "Litre", Decimal("200"), Decimal("5")),
        ]
        rm_products = []
        for name, unit, price, stock in components:
            rm = (
                db.query(Product)
                .filter(Product.company_id == company.id, Product.name == name)
                .first()
            )
            if not rm:
                rm = Product(
                    company_id=company.id,
                    name=name,
                    category="Raw Material",
                    unit=unit,
                    total_price=price,
                    offer_price=price,
                    gst_rate=Decimal("18"),
                    inventory_tracked=True,
                    on_hand_quantity=stock,
                    opening_recorded=True,
                    is_raw_material=True,
                )
                db.add(rm)
                db.flush()
            else:
                rm.is_raw_material = True
                if not rm.inventory_tracked:
                    rm.inventory_tracked = True
                    rm.on_hand_quantity = stock
                    rm.opening_recorded = True
            rm_products.append(rm)

        fg.is_manufactured = True

        bom = (
            db.query(BomHeader)
            .filter(
                BomHeader.company_id == company.id,
                BomHeader.product_id == fg.id,
                BomHeader.version == "1.0",
            )
            .first()
        )
        if not bom:
            bom = BomHeader(
                company_id=company.id,
                product_id=fg.id,
                name="Herbal Soap 100g — Standard",
                version="1.0",
                status="active",
                output_qty=Decimal("500"),
                output_uom="Piece",
                notes="Per 500 bars batch",
            )
            db.add(bom)
            db.flush()
            lines = [
                (rm_products[0].id, Decimal("25"), Decimal("2")),
                (rm_products[1].id, Decimal("8"), Decimal("1")),
                (rm_products[2].id, Decimal("2"), Decimal("0")),
            ]
            for idx, (comp_id, qty, scrap) in enumerate(lines):
                db.add(
                    BomLine(
                        bom_id=bom.id,
                        component_product_id=comp_id,
                        quantity=qty,
                        scrap_pct=scrap,
                        sort_order=idx,
                    )
                )
        else:
            bom.status = "active"

        fg.default_bom_id = bom.id
        db.commit()
        print("Manufacturing demo ready")
        print(f"  Finished good: {fg.name} (BOM {bom.name})")
        print(f"  Components: {', '.join(p.name for p in rm_products)}")
        print("  CRM: /manufacturing")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()
    seed_demo_manufacturing(reset=args.reset)
