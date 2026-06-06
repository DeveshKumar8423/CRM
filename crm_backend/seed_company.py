"""Seed BlackPapers company and link all staff users."""

from database import SessionLocal
from models import Company, User
from config import STAFF_ROLES

BLACKPAPERS_COMPANY = {
    "legal_name": "Tributaries Unicorn LLP",
    "display_name": "BlackPapers",
    "email": "connect@blackpapers.in",
    "phone": "+91 82998 24396",
    "website": "https://www.blackpapers.in/",
    "description": (
        "Hybrid Legal-Tech Marketplace for Startups & MSME to manage their "
        "Compliances, Taxation, Legal, Accounting & Financial Needs."
    ),
    "address_line1": "To be updated",
    "address_line2": None,
    "city": "To be updated",
    "state": "To be updated",
    "pincode": None,
    "country": "India",
    "gstin": None,
    "pan": None,
    "currency": "INR",
    "financial_year_start_month": 4,
    "timezone": "Asia/Kolkata",
}


def seed():
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            company = Company(**BLACKPAPERS_COMPANY)
            db.add(company)
            db.commit()
            db.refresh(company)
            print(f"Created company: {company.display_name}")
        else:
            print(f"Company already exists: {company.display_name}")

        staff = db.query(User).filter(User.role.in_(STAFF_ROLES)).all()
        linked = 0
        for user in staff:
            if user.company_id != company.id:
                user.company_id = company.id
                linked += 1
        db.commit()
        print(f"Linked {linked} staff user(s) to company id={company.id}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
