from __future__ import annotations

"""Seed default email templates.

Run from crm_backend/:
    python seed_email_templates.py

Safe to run multiple times — skips templates that already exist.
"""

from database import SessionLocal
from models import EmailTemplate

TEMPLATES = [
    {
        "name": "WELCOME_EMAIL",
        "subject": "Welcome to BlackPapers",
        "body": (
            "Hello {{name}},\n\n"
            "Welcome to BlackPapers CRM. We're glad to have you on board.\n\n"
            "If you have any questions, feel free to reach out to us at {{support_email}}.\n\n"
            "Regards,\n"
            "BlackPapers Team"
        ),
        "description": (
            "Sent to new users upon account creation. "
            "Placeholders: {{name}}, {{support_email}}"
        ),
        "is_active": True,
    },
    {
        "name": "PASSWORD_RESET",
        "subject": "Password Reset Request",
        "body": (
            "Hello {{name}},\n\n"
            "We received a request to reset the password for your BlackPapers account.\n\n"
            "Click the link below to reset your password:\n"
            "{{reset_link}}\n\n"
            "This link will expire in 1 hour. If you did not request a password reset, "
            "please ignore this email.\n\n"
            "Regards,\n"
            "BlackPapers Team"
        ),
        "description": (
            "Sent when a user requests a password reset. "
            "Placeholders: {{name}}, {{reset_link}}"
        ),
        "is_active": True,
    },
    {
        "name": "CONTACT_CREATED",
        "subject": "New Contact Added — {{contact_name}}",
        "body": (
            "Hello,\n\n"
            "A new contact has been added to BlackPapers CRM.\n\n"
            "Name: {{contact_name}}\n"
            "Email: {{email}}\n"
            "Company: {{company_name}}\n\n"
            "You can view this contact in your CRM dashboard.\n\n"
            "Regards,\n"
            "BlackPapers Team"
        ),
        "description": (
            "Sent when a new contact is created. "
            "Placeholders: {{contact_name}}, {{email}}, {{company_name}}"
        ),
        "is_active": True,
    },
]


def seed() -> None:
    db = SessionLocal()
    try:
        created = 0
        skipped = 0
        for data in TEMPLATES:
            exists = (
                db.query(EmailTemplate)
                .filter(EmailTemplate.name == data["name"])
                .first()
            )
            if exists:
                print(f"  SKIP  {data['name']} (already exists)")
                skipped += 1
                continue
            tpl = EmailTemplate(**data)
            db.add(tpl)
            print(f"  CREATE {data['name']}")
            created += 1
        db.commit()
        print(f"\nDone. Created: {created}, Skipped: {skipped}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
