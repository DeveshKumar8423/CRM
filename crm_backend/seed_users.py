from __future__ import annotations

"""Seed test users for local development. Creates missing test accounts by email."""

from auth_utils import hash_password
from database import SessionLocal
from models import Company, User

TEST_USERS = [
    {
        "name": "Vishvendra Mani Tripathi",
        "email": "admin@crm.com",
        "password": "admin123",
        "role": "Admin",
    },
    {
        "name": "Manager User",
        "email": "manager@crm.com",
        "password": "manager123",
        "role": "Manager",
    },
    {
        "name": "Employee User",
        "email": "employee@crm.com",
        "password": "employee123",
        "role": "Employee",
    },
    {
        "name": "Palak Singh",
        "email": "sales@crm.com",
        "password": "sales123",
        "role": "Sales",
    },
    {
        "name": "Accountant User",
        "email": "accountant@crm.com",
        "password": "accountant123",
        "role": "Accountant",
    },
]


def seed():
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        company_id = company.id if company else None
        created = 0
        updated = 0
        for u in TEST_USERS:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if existing:
                changed = False
                if existing.role != u["role"]:
                    existing.role = u["role"]
                    changed = True
                if existing.name != u["name"]:
                    existing.name = u["name"]
                    changed = True
                if company_id and existing.company_id != company_id:
                    existing.company_id = company_id
                    changed = True
                if changed:
                    updated += 1
                continue
            db.add(
                User(
                    name=u["name"],
                    email=u["email"],
                    password=hash_password(u["password"]),
                    role=u["role"],
                    status="active",
                    company_id=company_id,
                )
            )
            created += 1
        db.commit()
        print("Test users (create missing by email):")
        for u in TEST_USERS:
            print(f"  {u['role']}: {u['email']} / {u['password']}")
        if created:
            print(f"Created {created} user(s).")
        if updated:
            print(f"Updated {updated} user(s).")
        if not created and not updated:
            print("All test users already present.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
