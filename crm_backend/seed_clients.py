"""
Import clients from clients.json into contacts (Customer type).
Status: ~70% active / ~30% inactive (deterministic by sort order).
"""

import json
import re
from pathlib import Path

from database import SessionLocal
from models import Company, Contact, User
from config import STAFF_ROLES

CLIENTS_PATH = Path(__file__).resolve().parent.parent / "clients.json"
PAN_PATTERN = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")


def _clean_phone(value) -> str | None:
    if not value:
        return None
    text = str(value).replace(".0", "").strip()
    return text[:30] if text else None


def _clean_email(value) -> str | None:
    text = (value or "").strip().lower()
    return text if text and "@" in text else None


def _clean_pan(value) -> str | None:
    text = (value or "").strip().upper()
    if not text:
        return None
    return text if PAN_PATTERN.match(text) else text[:10]


def _contact_name(row: dict) -> str:
    person = (row.get("authorisedPerson") or "").strip()
    if person:
        return person[:120]
    entity = (row.get("entityName") or "").strip()
    return entity[:120] if entity else "Unknown Client"


def seed(replace: bool = True):
    if not CLIENTS_PATH.exists():
        raise FileNotFoundError(f"clients.json not found: {CLIENTS_PATH}")

    with open(CLIENTS_PATH, encoding="utf-8") as f:
        clients = json.load(f)

    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("SKIP: configure company first (python seed_company.py)")
            return

        if replace:
            deleted = (
                db.query(Contact)
                .filter(Contact.company_id == company.id)
                .delete(synchronize_session=False)
            )
            db.commit()
            print(f"Removed {deleted} existing contact(s)")

        assignee = (
            db.query(User)
            .filter(User.company_id == company.id, User.role.in_(STAFF_ROLES))
            .first()
        )

        clients_sorted = sorted(
            clients,
            key=lambda r: (r.get("entityName") or "").lower(),
        )
        active_cutoff = int(len(clients_sorted) * 0.7)
        seen_emails: set[str] = set()
        created = 0

        for index, row in enumerate(clients_sorted):
            name = _contact_name(row)
            email = _clean_email(row.get("contactEmail"))
            if email:
                if email in seen_emails:
                    email = None
                else:
                    seen_emails.add(email)

            status = "active" if index < active_cutoff else "inactive"
            business = (row.get("businessType") or row.get("industry") or "").strip()

            db.add(
                Contact(
                    company_id=company.id,
                    created_by_id=assignee.id if assignee else None,
                    assigned_to_id=assignee.id if assignee else None,
                    name=name,
                    organization_name=(row.get("entityName") or "").strip()[:200] or None,
                    email=email,
                    phone=_clean_phone(row.get("contactPhone")),
                    contact_type="Customer",
                    status=status,
                    designation=business[:120] if business else None,
                    address_line1=(row.get("officeAddress") or "").strip()[:255] or None,
                    city=(row.get("city") or "").strip()[:100] or None,
                    state=(row.get("state") or "").strip()[:100] or None,
                    country="India",
                    pan=_clean_pan(row.get("pan")),
                )
            )
            created += 1

        db.commit()
        active = min(active_cutoff, created)
        inactive = created - active
        print(
            f"Imported {created} clients — "
            f"{active} active ({round(active/created*100,1)}%), "
            f"{inactive} inactive ({round(inactive/created*100,1)}%)"
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed()
