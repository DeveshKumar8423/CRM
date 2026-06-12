from __future__ import annotations

from database import SessionLocal
from models import User

db = SessionLocal()

users = db.query(User).all()

for user in users:
    print(user.id, user.email, user.role)

db.close()