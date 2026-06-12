from __future__ import annotations

"""
Import staff from Master Employee Sheet.xlsx.
Uses unique Gmail when multiple employees share the same official email.
"""

from pathlib import Path

import openpyxl
from passlib.context import CryptContext

from database import SessionLocal
from models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SHEET_PATH = Path(__file__).resolve().parent.parent / "Master Employee Sheet.xlsx"

COL_EMP_ID = 1
COL_NAME = 2
COL_DESIGNATION = 3
COL_DEPARTMENT = 4
COL_STATUS = 5
COL_GMAIL = 6
COL_GMAIL_PASSWORD = 7
COL_OFFICIAL_MAIL = 8
COL_OFFICIAL_PASSWORD = 9


def map_role(designation: str | None, department: str | None) -> str:
    designation_lower = (designation or "").lower()
    department_lower = (department or "").lower()

    if "admin" in designation_lower or "hr" in department_lower:
        return "Admin"
    if "manager" in designation_lower:
        return "Manager"
    return "Employee"


def resolve_login_email(
    official_mail: str | None,
    gmail: str | None,
    official_counts: dict[str, int],
) -> str | None:
    official = (official_mail or "").strip().lower() or None
    gmail_addr = (gmail or "").strip().lower() or None

    if official and official_counts.get(official, 0) > 1 and gmail_addr:
        return gmail_addr
    if official:
        return official
    return gmail_addr


def resolve_password(
    official_password: str | None,
    gmail_password: str | None,
) -> str | None:
    official = (official_password or "").strip() or None
    gmail = (gmail_password or "").strip() or None
    return official or gmail


def load_rows() -> list[tuple]:
    if not SHEET_PATH.exists():
        raise FileNotFoundError(f"Employee sheet not found: {SHEET_PATH}")

    wb = openpyxl.load_workbook(SHEET_PATH, read_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(min_row=2, values_only=True))
    wb.close()
    return [r for r in rows if r[COL_NAME]]


def seed():
    rows = load_rows()

    official_counts: dict[str, int] = {}
    for row in rows:
        official = (row[COL_OFFICIAL_MAIL] or "").strip().lower()
        if official:
            official_counts[official] = official_counts.get(official, 0) + 1

    db = SessionLocal()
    created = 0
    updated = 0
    skipped = 0

    try:
        for row in rows:
            employee_id = str(row[COL_EMP_ID]).strip() if row[COL_EMP_ID] else None
            name = str(row[COL_NAME]).strip()
            designation = str(row[COL_DESIGNATION]).strip() if row[COL_DESIGNATION] else None
            department = str(row[COL_DEPARTMENT]).strip() if row[COL_DEPARTMENT] else None
            sheet_status = str(row[COL_STATUS]).strip().lower() if row[COL_STATUS] else "active"
            status = "active" if sheet_status == "active" else "inactive"

            email = resolve_login_email(
                row[COL_OFFICIAL_MAIL],
                row[COL_GMAIL],
                official_counts,
            )
            password = resolve_password(
                row[COL_OFFICIAL_PASSWORD],
                row[COL_GMAIL_PASSWORD],
            )

            if not email:
                print(f"SKIP {employee_id or name}: no login email")
                skipped += 1
                continue
            if not password:
                print(f"SKIP {email}: no password in sheet")
                skipped += 1
                continue

            role = map_role(designation, department)
            existing = (
                db.query(User)
                .filter((User.email == email) | (User.employee_id == employee_id))
                .first()
            )

            if existing:
                existing.employee_id = employee_id
                existing.name = name
                existing.email = email
                existing.role = role
                existing.status = status
                existing.designation = designation
                existing.department = department
                existing.password = pwd_context.hash(password)
                updated += 1
                print(f"UPDATE {email} ({role})")
            else:
                db.add(
                    User(
                        employee_id=employee_id,
                        name=name,
                        email=email,
                        password=pwd_context.hash(password),
                        role=role,
                        status=status,
                        designation=designation,
                        department=department,
                    )
                )
                created += 1
                print(f"CREATE {email} ({role})")

        db.commit()
        print(f"\nDone: {created} created, {updated} updated, {skipped} skipped")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
