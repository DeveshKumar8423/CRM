"""
Import leads from Lead_file.csv (repo root).
Maps CSV Status -> CRM lead status; default source Omnichannel.
"""

import csv
from datetime import datetime
from pathlib import Path

from database import SessionLocal
from lead_config import DEFAULT_LEAD_SOURCE, map_csv_status, normalize_phone
from models import Company, Lead

LEADS_PATH = Path(__file__).resolve().parent.parent / "Lead_file.csv"
BATCH_SIZE = 500


def _clean_text(value, max_len: int | None = None) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text or text in {"_", "-"}:
        return None
    if max_len:
        return text[:max_len]
    return text


def _parse_date(value) -> datetime | None:
    text = _clean_text(value)
    if not text:
        return None
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue
    return None


def seed(replace: bool = True):
    if not LEADS_PATH.exists():
        raise FileNotFoundError(f"Lead file not found: {LEADS_PATH}")

    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("SKIP: run seed_company.py first")
            return

        if replace:
            deleted = (
                db.query(Lead)
                .filter(Lead.company_id == company.id)
                .delete(synchronize_session=False)
            )
            db.commit()
            print(f"Removed {deleted} existing lead(s)")

        created = 0
        skipped = 0
        batch: list[Lead] = []

        with LEADS_PATH.open(encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                name = _clean_text(row.get("Name"), 120)
                phone = normalize_phone(row.get("Phone"))
                if not name and not phone:
                    skipped += 1
                    continue
                if not name:
                    name = _clean_text(row.get("NGO or Business name"), 120) or "Unknown"

                csv_status = _clean_text(row.get("Status"), 80)
                org = _clean_text(row.get("NGO or Business name"), 200)
                city = _clean_text(row.get("City"), 100)
                requirement = _clean_text(row.get("Requirement"), 200)
                exact = _clean_text(row.get("Exact Requirement"), 5000)

                batch.append(
                    Lead(
                        company_id=company.id,
                        name=name,
                        phone=phone,
                        organization_name=org,
                        city=city,
                        requirement=requirement,
                        exact_requirement=exact,
                        source=DEFAULT_LEAD_SOURCE,
                        status=map_csv_status(csv_status),
                        csv_status=csv_status,
                        registered_at=_parse_date(row.get("Date of registration")),
                    )
                )

                if len(batch) >= BATCH_SIZE:
                    db.add_all(batch)
                    db.commit()
                    created += len(batch)
                    print(f"  ... {created} imported")
                    batch.clear()

        if batch:
            db.add_all(batch)
            db.commit()
            created += len(batch)

        total = db.query(Lead).filter(Lead.company_id == company.id).count()
        print(f"Done: {created} imported, {skipped} skipped, {total} total in database")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
