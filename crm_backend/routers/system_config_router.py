from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from activity import log_activity
from auth_utils import get_client_ip, get_db, require_admin
from models import SystemConfiguration, User
from schemas import SystemConfigResponse, SystemConfigUpdate

router = APIRouter(prefix="/admin", tags=["admin"])

# Default values — used when seeding the first row and for "Reset to Defaults"
DEFAULTS = {
    "company_name": "BlackPapers",
    "default_currency": "INR",
    "date_format": "DD/MM/YYYY",
    "timezone": "Asia/Kolkata",
    "support_email": "support@blackpapers.in",
    "maintenance_mode": False,
}


def _get_or_create(db: Session) -> SystemConfiguration:
    """Return the singleton config row, creating it with defaults if missing."""
    config = db.query(SystemConfiguration).first()
    if config is None:
        config = SystemConfiguration(**DEFAULTS)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


@router.get("/system-config", response_model=SystemConfigResponse)
def get_system_config(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Return the current global CRM configuration."""
    return _get_or_create(db)


@router.put("/system-config", response_model=SystemConfigResponse)
def update_system_config(
    data: SystemConfigUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update the global CRM configuration (admin only)."""
    config = _get_or_create(db)

    config.company_name = data.company_name
    config.default_currency = data.default_currency.upper()
    config.date_format = data.date_format
    config.timezone = data.timezone
    config.support_email = str(data.support_email).lower()
    config.maintenance_mode = data.maintenance_mode

    db.commit()
    db.refresh(config)

    log_activity(
        db,
        "system_config_updated",
        user_id=admin.id,
        email=admin.email,
        details="Updated global system configuration",
        ip_address=get_client_ip(request),
    )

    return config


@router.post("/system-config/reset", response_model=SystemConfigResponse)
def reset_system_config(
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Reset the global CRM configuration to factory defaults."""
    config = _get_or_create(db)

    for field, value in DEFAULTS.items():
        setattr(config, field, value)

    db.commit()
    db.refresh(config)

    log_activity(
        db,
        "system_config_reset",
        user_id=admin.id,
        email=admin.email,
        details="Reset system configuration to defaults",
        ip_address=get_client_ip(request),
    )

    return config
