from sqlalchemy.orm import Session

from models import ActivityLog


def log_activity(
    db: Session,
    action: str,
    *,
    user_id: int | None = None,
    email: str | None = None,
    details: str | None = None,
    ip_address: str | None = None,
) -> None:
    db.add(
        ActivityLog(
            user_id=user_id,
            email=email,
            action=action,
            details=details,
            ip_address=ip_address,
        )
    )
    db.commit()
