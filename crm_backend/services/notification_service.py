from __future__ import annotations

from sqlalchemy.orm import Session

from models import Company, Notification, User


def notify_user(
    db: Session,
    *,
    company_id: int,
    user_id: int,
    category: str,
    title: str,
    message: str,
    link_path: str | None = None,
) -> Notification:
    note = Notification(
        company_id=company_id,
        user_id=user_id,
        category=category,
        title=title,
        message=message,
        link_path=link_path,
        is_read=False,
    )
    db.add(note)
    db.flush()
    return note


def notify_role(
    db: Session,
    *,
    company_id: int,
    role: str,
    category: str,
    title: str,
    message: str,
    link_path: str | None = None,
) -> list[Notification]:
    users = (
        db.query(User)
        .filter(User.company_id == company_id, User.role == role, User.status == "active")
        .all()
    )
    created: list[Notification] = []
    for user in users:
        created.append(
            notify_user(
                db,
                company_id=company_id,
                user_id=user.id,
                category=category,
                title=title,
                message=message,
                link_path=link_path,
            )
        )
    return created


def get_company_id(db: Session) -> int | None:
    company = db.query(Company).first()
    return company.id if company else None
