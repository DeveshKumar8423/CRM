from __future__ import annotations

"""
Seed sample contacts for development.
Replace with seed_master_contacts.py when client sheet is available.
"""

from database import SessionLocal
from models import Company, Contact, User
from config import STAFF_ROLES

DUMMY_CONTACTS = [
    {
        "name": "Rahul Mehta",
        "organization_name": "Mehta Traders Pvt Ltd",
        "email": "rahul.mehta@example.com",
        "phone": "+91 98765 43210",
        "contact_type": "Customer",
        "designation": "Proprietor",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "gstin": None,
        "pan": None,
    },
    {
        "name": "Priya Sharma",
        "organization_name": "Sharma Consulting",
        "email": "priya@sharmaconsulting.example.com",
        "phone": "+91 99887 76655",
        "contact_type": "Partner",
        "designation": "Director",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560001",
    },
    {
        "name": "Vikram Supplies",
        "organization_name": "Vikram Office Solutions",
        "email": "accounts@vikramsupplies.example.com",
        "phone": "+91 91234 56789",
        "contact_type": "Vendor",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110001",
    },
]


def seed():
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("SKIP: configure company first (python seed_company.py)")
            return

        if db.query(Contact).filter(Contact.company_id == company.id).count() > 0:
            print("Contacts already exist — skipping dummy seed.")
            return

        assignee = (
            db.query(User)
            .filter(User.company_id == company.id, User.role.in_(STAFF_ROLES))
            .first()
        )

        for row in DUMMY_CONTACTS:
            db.add(
                Contact(
                    company_id=company.id,
                    created_by_id=assignee.id if assignee else None,
                    assigned_to_id=assignee.id if assignee else None,
                    status="active",
                    country="India",
                    **row,
                )
            )
            print(f"CREATE {row['name']} ({row['contact_type']})")

        db.commit()
        print(f"Seeded {len(DUMMY_CONTACTS)} dummy contacts.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
