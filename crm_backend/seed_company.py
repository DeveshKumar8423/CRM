from __future__ import annotations

"""Seed BlackPapers company and link all staff users."""

from database import SessionLocal
from models import Company, SystemConfiguration, User
from config import STAFF_ROLES

# MCA master data — BLACKPAPERS SARTHIES PRIVATE LIMITED (as on RoC-Delhi)
BLACKPAPERS_COMPANY = {
    "legal_name": "BLACKPAPERS SARTHIES PRIVATE LIMITED",
    "display_name": "BlackPapers",
    "email": "connect@blackpapers.in",
    "phone": "+91 8423224663 / 8299824396",
    "website": "https://www.blackpapers.in/",
    "description": (
        "Private company limited by shares (non-govt), incorporated 19-Oct-2023. "
        "CIN: U70200DL2023PTC421680 · RoC-Delhi · Registration No. 421680 · "
        "Authorised & paid-up capital ₹1,00,000. "
        "Hybrid legal-tech marketplace for startups and MSME compliance, taxation, legal, and accounting."
    ),
    "address_line1": "Office-404, C-25 Bartwals, Guru Nanak Pura, Laxmi Nagar",
    "address_line2": None,
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110092",
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
            for key, value in BLACKPAPERS_COMPANY.items():
                setattr(company, key, value)
            db.commit()
            print(f"Updated company: {company.legal_name}")

        config = db.query(SystemConfiguration).first()
        if config:
            config.company_name = BLACKPAPERS_COMPANY["display_name"]
            config.support_email = BLACKPAPERS_COMPANY["email"]
            db.commit()
            print("Synced system configuration company name and support email.")

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
