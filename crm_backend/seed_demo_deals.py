"""
Seed demo sales pipeline deals for Module 2 showcase.
Safe to re-run: skips if demo deals already exist (marked in notes).
Use: python seed_demo_deals.py --reset  to replace demo deals.
"""

import sys
from datetime import datetime, timedelta, timezone

from database import SessionLocal
from models import Company, Contact, Deal, Lead, User

DEMO_MARKER = "[demo-pipeline]"

DEMO_DEALS = [
    {
        "title": "SAMAPRABHA WELFARE — Annual compliance pack",
        "stage": "new",
        "expected_value": 45000,
        "lead_id": 19,
        "assigned_email": "bgc.blackpapers01@gmail.com",
        "notes": f"{DEMO_MARKER} Fresh opportunity from hot lead.",
        "days_until_close": 30,
    },
    {
        "title": "PRATIVA DEBNATH FOUNDATION — GST filing",
        "stage": "contacted",
        "expected_value": 12000,
        "lead_id": 42,
        "assigned_email": "bgc.blackpapers02@gmail.com",
        "notes": f"{DEMO_MARKER} Initial call done; awaiting documents.",
        "days_until_close": 21,
    },
    {
        "title": "MASTAANE SHYAM Foundation — Company incorporation",
        "stage": "meeting",
        "expected_value": 85000,
        "lead_id": 52,
        "assigned_email": "manager@crm.com",
        "notes": f"{DEMO_MARKER} Discovery meeting scheduled with founders.",
        "days_until_close": 14,
    },
    {
        "title": "Akhilesh Kumar — Startup compliance bundle",
        "stage": "proposal",
        "expected_value": 65000,
        "lead_id": 5351,
        "assigned_email": "exe.blackpapers01@gmail.com",
        "notes": f"{DEMO_MARKER} Quotation shared; follow-up this week.",
        "days_until_close": 7,
    },
    {
        "title": "Aadi Shakti Camphor — Trademark + GST",
        "stage": "won",
        "expected_value": 28000,
        "contact_id": 7,
        "assigned_email": "exe.blackpapers02@gmail.com",
        "notes": f"{DEMO_MARKER} Closed after proposal acceptance.",
        "closed_days_ago": 5,
    },
    {
        "title": "A1 Ashapuri Tours — ROC annual filing",
        "stage": "won",
        "expected_value": 15000,
        "contact_id": 4,
        "assigned_email": "hr@blackpapers.in",
        "notes": f"{DEMO_MARKER} Repeat client; fast closure.",
        "closed_days_ago": 12,
    },
    {
        "title": "AADHAR SEVABHAVI SANSTHA — Audit support",
        "stage": "lost",
        "expected_value": 22000,
        "contact_id": 5,
        "assigned_email": "bgc.blackpapers03@gmail.com",
        "notes": f"{DEMO_MARKER} Lost to a local CA firm.",
        "lost_reason": "Chose competitor on price",
        "closed_days_ago": 3,
    },
    {
        "title": "Mithilesh — General advisory services",
        "stage": "contacted",
        "expected_value": 18000,
        "lead_id": 1,
        "assigned_email": "employee@crm.com",
        "notes": f"{DEMO_MARKER} Warm lead; requirements being scoped.",
        "days_until_close": 18,
    },
]


def _get_user_by_email(db, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def seed(*, reset: bool = False):
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("Company not found — run seed_company.py first.")
            return

        existing = (
            db.query(Deal)
            .filter(Deal.company_id == company.id, Deal.notes.like(f"%{DEMO_MARKER}%"))
            .count()
        )
        if existing and not reset:
            print(f"Demo pipeline deals already exist ({existing}) — skipping.")
            print("Run: python seed_demo_deals.py --reset  to replace them.")
            return

        if reset and existing:
            removed = (
                db.query(Deal)
                .filter(Deal.company_id == company.id, Deal.notes.like(f"%{DEMO_MARKER}%"))
                .delete(synchronize_session=False)
            )
            db.commit()
            print(f"Removed {removed} existing demo deal(s).")

        creator = _get_user_by_email(db, "hr@blackpapers.in") or db.query(User).filter(
            User.role == "Admin"
        ).first()
        if not creator:
            print("No admin user found.")
            return

        non_demo = (
            db.query(Deal)
            .filter(Deal.company_id == company.id)
            .filter(~Deal.notes.like(f"%{DEMO_MARKER}%"))
            .all()
        )
        for deal in non_demo:
            db.delete(deal)
        if non_demo:
            db.flush()
            print(f"Removed {len(non_demo)} non-demo deal(s) for a clean pipeline demo.")

        now = datetime.now(timezone.utc)
        created = 0

        for item in DEMO_DEALS:
            assignee = _get_user_by_email(db, item["assigned_email"])
            if not assignee:
                print(f"SKIP: user not found — {item['assigned_email']}")
                continue

            lead_id = item.get("lead_id")
            contact_id = item.get("contact_id")

            if lead_id:
                lead = (
                    db.query(Lead)
                    .filter(Lead.id == lead_id, Lead.company_id == company.id)
                    .first()
                )
                if not lead:
                    print(f"SKIP: lead #{lead_id} not found — {item['title']}")
                    continue
                lead_id = lead.id

            if contact_id:
                contact = (
                    db.query(Contact)
                    .filter(Contact.id == contact_id, Contact.company_id == company.id)
                    .first()
                )
                if not contact:
                    print(f"SKIP: contact #{contact_id} not found — {item['title']}")
                    continue
                contact_id = contact.id

            expected_close = None
            if item.get("days_until_close"):
                expected_close = now + timedelta(days=item["days_until_close"])

            closed_at = None
            if item.get("closed_days_ago") is not None:
                closed_at = now - timedelta(days=item["closed_days_ago"])

            deal = Deal(
                company_id=company.id,
                created_by_id=creator.id,
                assigned_to_id=assignee.id,
                lead_id=lead_id,
                contact_id=contact_id,
                title=item["title"],
                stage=item["stage"],
                expected_value=item["expected_value"],
                currency=company.currency or "INR",
                expected_close_date=expected_close,
                notes=item["notes"],
                lost_reason=item.get("lost_reason"),
                closed_at=closed_at,
            )
            db.add(deal)
            created += 1

        db.commit()
        print(f"Seeded {created} demo pipeline deals.")
        print("Stages: 1 new, 2 contacted, 1 meeting, 1 proposal, 2 won, 1 lost")
        print("Assignees: Palak, Anita, Manager, Gunjan, Mohini, Isha, Deepakshi, Employee")
        print("Open Pipeline board: http://localhost:3000/pipeline")
    finally:
        db.close()


if __name__ == "__main__":
    seed(reset="--reset" in sys.argv)
