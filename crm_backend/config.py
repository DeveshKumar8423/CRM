from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
 "postgresql://bharat:Bharat2004@localhost:5432/crm_db"
)

JWT_SECRET = os.getenv("JWT_SECRET", "crm-dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

STAFF_ROLES = {"Admin", "Manager", "Employee"}
ALL_ROLES = STAFF_ROLES | {"User"}
