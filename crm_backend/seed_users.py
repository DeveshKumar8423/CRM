"""Seed test users for local development. Safe to re-run: skips if users exist."""

from passlib.context import CryptContext

from database import SessionLocal
from models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

TEST_USERS = [
    {
        "name": "Admin User",
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
]


def seed():
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Users already exist — skipping seed.")
            return

        for u in TEST_USERS:
            db.add(
                User(
                    name=u["name"],
                    email=u["email"],
                    password=pwd_context.hash(u["password"]),
                    role=u["role"],
                )
            )
        db.commit()
        print("Seeded test users:")
        for u in TEST_USERS:
            print(f"  {u['role']}: {u['email']} / {u['password']}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
