"""Clear bulky product document checklists from quote/order/invoice line descriptions."""

from __future__ import annotations

from database import SessionLocal
from models import InvoiceLineItem, QuotationLineItem, SalesOrderLineItem

BULKY_MARKERS = ("1)", "2)", "Form 10", "PAN of NGO", "Suggestions / Additions")


def _should_trim(description: str | None) -> bool:
    if not description:
        return False
    text = description.strip()
    if len(text) <= 100:
        return False
    if any(marker in text for marker in BULKY_MARKERS):
        return True
    return len(text) > 120


def seed() -> None:
    db = SessionLocal()
    try:
        changed = 0
        for model in (QuotationLineItem, SalesOrderLineItem, InvoiceLineItem):
            for row in db.query(model).all():
                if _should_trim(row.description):
                    row.description = None
                    changed += 1
        db.commit()
        print(f"Trimmed {changed} bulky line description(s).")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
