"""Import services from Final Master_Service_List.xlsx (BlackPapers sheet)."""

from decimal import Decimal
from pathlib import Path

import openpyxl

from database import SessionLocal
from models import Company, Product

SHEET_PATH = Path(__file__).resolve().parent.parent / "Final Master_Service_List.xlsx"
SHEET_NAME = "BlackPapers"

COL_ENTITY = 1
COL_CATEGORY = 2
COL_SUB_CATEGORY = 3
COL_SERVICE_CODE = 4
COL_NAME = 10
COL_GOVT = 11
COL_OUR_FEES = 12
COL_GST = 13
COL_TOTAL = 14
COL_MARKET = 21
COL_OFFER = 22
COL_LAST = 23
COL_FILING = 24
COL_COMPLETION = 25
COL_DOCS = 27


def _money(value) -> Decimal | None:
    if value is None or value == "":
        return None
    try:
        return Decimal(str(round(float(value), 2)))
    except (TypeError, ValueError):
        return None


def _text(value, max_len: int | None = None) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    if max_len:
        return text[:max_len]
    return text


def seed(replace: bool = False):
    if not SHEET_PATH.exists():
        raise FileNotFoundError(f"Service list not found: {SHEET_PATH}")

    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("SKIP: configure company first (python seed_company.py)")
            return

        if replace:
            deleted = (
                db.query(Product)
                .filter(Product.company_id == company.id)
                .delete(synchronize_session=False)
            )
            db.commit()
            print(f"Removed {deleted} existing product(s)")

        existing_codes = {
            p.service_code
            for p in db.query(Product.service_code)
            .filter(
                Product.company_id == company.id,
                Product.service_code.isnot(None),
            )
            .all()
        }

        wb = openpyxl.load_workbook(SHEET_PATH, read_only=True, data_only=True)
        ws = wb[SHEET_NAME]
        created = 0
        updated = 0
        skipped = 0

        for row in ws.iter_rows(min_row=2, values_only=True):
            name = _text(row[COL_NAME], 255)
            if not name:
                continue

            service_code = _text(row[COL_SERVICE_CODE], 40)
            payload = {
                "name": name,
                "service_code": service_code,
                "entity_type": _text(row[COL_ENTITY], 80),
                "category": _text(row[COL_CATEGORY], 120),
                "sub_category": _text(row[COL_SUB_CATEGORY], 120),
                "govt_charges": _money(row[COL_GOVT]),
                "our_fees": _money(row[COL_OUR_FEES]),
                "gst_amount": _money(row[COL_GST]),
                "total_price": _money(row[COL_TOTAL]),
                "market_price": _money(row[COL_MARKET]),
                "offer_price": _money(row[COL_OFFER]),
                "last_price": _money(row[COL_LAST]),
                "filing_timeline": _text(row[COL_FILING], 80),
                "completion_timeline": _text(row[COL_COMPLETION], 80),
                "description": _text(row[COL_DOCS], 8000),
                "status": "active",
                "unit": "Service",
                "gst_rate": Decimal("18"),
            }

            existing = None
            if service_code:
                existing = (
                    db.query(Product)
                    .filter(
                        Product.company_id == company.id,
                        Product.service_code == service_code,
                    )
                    .first()
                )

            if existing:
                for key, value in payload.items():
                    setattr(existing, key, value)
                updated += 1
            elif service_code and service_code in existing_codes:
                skipped += 1
                continue
            else:
                db.add(Product(company_id=company.id, **payload))
                if service_code:
                    existing_codes.add(service_code)
                created += 1

        db.commit()
        wb.close()
        print(f"Done: {created} created, {updated} updated, {skipped} skipped")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
