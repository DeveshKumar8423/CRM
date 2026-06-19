from __future__ import annotations

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://username:password@localhost:5432/crm_db"
)

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "your-secret-key"
)

JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

STAFF_ROLES = {"Admin", "Manager", "Employee"}
ALL_ROLES = STAFF_ROLES | {"User"}

UPLOAD_DIR = os.getenv(
    "UPLOAD_DIR",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
)

MAX_FILE_SIZE = int(
    os.getenv("MAX_FILE_SIZE", str(10 * 1024 * 1024))
)

ALLOWED_EXTENSIONS = {
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "csv",
    "txt",
    "png",
    "jpg",
    "jpeg",
    "gif",
}