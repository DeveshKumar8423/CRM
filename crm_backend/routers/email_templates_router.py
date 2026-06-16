from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from activity import log_activity
from auth_utils import get_client_ip, get_db, require_admin
from models import User
from schemas import EmailTemplateCreate, EmailTemplateResponse, EmailTemplateUpdate
from services.email_template_service import (
    create_template,
    delete_template,
    get_template,
    list_templates,
    toggle_template,
    update_template,
)

router = APIRouter(prefix="/admin/email-templates", tags=["admin"])


@router.get("", response_model=list[EmailTemplateResponse])
def api_list_templates(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Return all email templates ordered by name."""
    return list_templates(db)


@router.get("/{template_id}", response_model=EmailTemplateResponse)
def api_get_template(
    template_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Return a single email template by ID."""
    return get_template(db, template_id)


@router.post("", response_model=EmailTemplateResponse, status_code=201)
def api_create_template(
    data: EmailTemplateCreate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new email template."""
    tpl = create_template(db, data)
    log_activity(
        db,
        "email_template_created",
        user_id=admin.id,
        email=admin.email,
        details=f"Created email template '{tpl.name}'",
        ip_address=get_client_ip(request),
    )
    return tpl


@router.put("/{template_id}", response_model=EmailTemplateResponse)
def api_update_template(
    template_id: int,
    data: EmailTemplateUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update an existing email template."""
    tpl = update_template(db, template_id, data)
    log_activity(
        db,
        "email_template_updated",
        user_id=admin.id,
        email=admin.email,
        details=f"Updated email template '{tpl.name}'",
        ip_address=get_client_ip(request),
    )
    return tpl


@router.patch("/{template_id}/toggle", response_model=EmailTemplateResponse)
def api_toggle_template(
    template_id: int,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Toggle the is_active flag on an email template."""
    tpl = toggle_template(db, template_id)
    log_activity(
        db,
        "email_template_toggled",
        user_id=admin.id,
        email=admin.email,
        details=f"Set template '{tpl.name}' is_active={tpl.is_active}",
        ip_address=get_client_ip(request),
    )
    return tpl


@router.delete("/{template_id}", status_code=204)
def api_delete_template(
    template_id: int,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Permanently delete an email template."""
    tpl = get_template(db, template_id)          # capture name before delete
    name = tpl.name
    delete_template(db, template_id)
    log_activity(
        db,
        "email_template_deleted",
        user_id=admin.id,
        email=admin.email,
        details=f"Deleted email template '{name}'",
        ip_address=get_client_ip(request),
    )
