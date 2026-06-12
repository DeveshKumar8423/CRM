from __future__ import annotations

from typing import Optional
from sqlalchemy.orm import Session

from models import ActivityLog


def log_activity(
    db: Session,
    action: str,
    *,
    user_id: Optional[int] = None,
    email: Optional[str] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
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