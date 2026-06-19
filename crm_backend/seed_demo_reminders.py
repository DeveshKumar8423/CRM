"""
Seed demo follow-up reminders for leads and deals.
Use: python seed_demo_reminders.py --reset
"""

from __future__ import annotations

import sys
from datetime import datetime, timedelta, timezone

from database import SessionLocal
from models import Company, Deal, FollowUpReminder, Lead, User

DEMO_MARKER = "[demo-reminder]"


def seed(*, reset: bool = False):
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("Company not found.")
            return

        existing = (
            db.query(FollowUpReminder)
            .filter(
                FollowUpReminder.company_id == company.id,
                FollowUpReminder.notes.like(f"%{DEMO_MARKER}%"),
            )
            .count()
        )
        if existing and not reset:
            print(f"Demo reminders exist ({existing}) — skipping. Use --reset to replace.")
            return

        if reset and existing:
            db.query(FollowUpReminder).filter(
                FollowUpReminder.company_id == company.id,
                FollowUpReminder.notes.like(f"%{DEMO_MARKER}%"),
            ).delete(synchronize_session=False)
            db.commit()

        creator = db.query(User).filter(User.email == "hr@blackpapers.in").first()
        now = datetime.now(timezone.utc)

        specs = [
            {
                "title": "Call back — discuss compliance package",
                "type": "call",
                "priority": "high",
                "due": now - timedelta(hours=2),
                "lead_id": 19,
                "assignee": "bgc.blackpapers01@gmail.com",
            },
            {
                "title": "Send GST filing checklist on WhatsApp",
                "type": "whatsapp",
                "priority": "normal",
                "due": now + timedelta(hours=4),
                "lead_id": 42,
                "assignee": "bgc.blackpapers02@gmail.com",
            },
            {
                "title": "Founder meeting — incorporation scope",
                "type": "meeting",
                "priority": "urgent",
                "due": now + timedelta(days=1),
                "deal_id": 12,
                "assignee": "manager@crm.com",
            },
            {
                "title": "Follow up on sent quotation",
                "type": "email",
                "priority": "high",
                "due": now - timedelta(days=1),
                "deal_id": 13,
                "assignee": "exe.blackpapers01@gmail.com",
            },
            {
                "title": "Check advance payment status",
                "type": "call",
                "priority": "normal",
                "due": now + timedelta(days=2),
                "deal_id": 14,
                "assignee": "exe.blackpapers02@gmail.com",
            },
            {
                "title": "Resend quotation PDF — no response",
                "type": "email",
                "priority": "high",
                "due": now - timedelta(days=2, hours=3),
                "deal_id": 12,
                "assignee": "exe.blackpapers01@gmail.com",
            },
            {
                "title": "Confirm KYC documents received",
                "type": "whatsapp",
                "priority": "normal",
                "due": now - timedelta(days=3),
                "lead_id": 19,
                "assignee": "bgc.blackpapers02@gmail.com",
            },
            {
                "title": "Chase invoice payment — 30% advance",
                "type": "call",
                "priority": "urgent",
                "due": now - timedelta(days=5),
                "deal_id": 13,
                "assignee": "manager@crm.com",
            },
            {
                "title": "Bookkeeping review call — Q1 close",
                "type": "call",
                "priority": "high",
                "due": now - timedelta(days=7),
                "lead_id": 42,
                "assignee": "bgc.blackpapers01@gmail.com",
            },
            {
                "title": "Prior month TDS return reminder",
                "type": "email",
                "priority": "normal",
                "due": now - timedelta(days=10),
                "deal_id": 14,
                "assignee": "exe.blackpapers02@gmail.com",
            },
            {
                "title": "Share DSC application status",
                "type": "whatsapp",
                "priority": "normal",
                "due": now - timedelta(hours=8),
                "lead_id": 42,
                "assignee": "bgc.blackpapers01@gmail.com",
            },
        ]

        created = 0
        for spec in specs:
            assignee = db.query(User).filter(User.email == spec["assignee"]).first()
            if not assignee:
                continue
            db.add(
                FollowUpReminder(
                    company_id=company.id,
                    created_by_id=creator.id if creator else assignee.id,
                    assigned_to_id=assignee.id,
                    lead_id=spec.get("lead_id"),
                    deal_id=spec.get("deal_id"),
                    reminder_type=spec["type"],
                    title=spec["title"],
                    notes=f"{DEMO_MARKER} Demo reminder for follow-up queue.",
                    priority=spec["priority"],
                    due_at=spec["due"],
                    status="pending",
                )
            )
            created += 1

        db.commit()
        print(f"Seeded {created} demo follow-up reminders.")
    finally:
        db.close()


if __name__ == "__main__":
    seed(reset="--reset" in sys.argv)
