from __future__ import annotations

"""
Email Template Service
======================
Business logic for email template CRUD.

Future use:
    from services.email_template_service import get_template_by_name
    tpl = get_template_by_name(db, "WELCOME_EMAIL")
    # then render tpl.subject / tpl.body with your own placeholder engine
"""

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models import EmailTemplate
from schemas import EmailTemplateCreate, EmailTemplateUpdate


# ---------------------------------------------------------------------------
# Reads
# ---------------------------------------------------------------------------

def list_templates(db: Session) -> list[EmailTemplate]:
    """Return all templates ordered by name."""
    return (
        db.query(EmailTemplate)
        .order_by(EmailTemplate.name)
        .all()
    )


def get_template(db: Session, template_id: int) -> EmailTemplate:
    """Return a single template by primary key, or raise 404."""
    tpl = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    if not tpl:
        raise HTTPException(status_code=404, detail="Email template not found")
    return tpl


def get_template_by_name(db: Session, name: str) -> EmailTemplate | None:
    """
    Look up a template by its unique name (case-sensitive).

    Intended for future notification systems:
        tpl = get_template_by_name(db, "WELCOME_EMAIL")
    Returns None if no matching template exists.
    """
    return (
        db.query(EmailTemplate)
        .filter(EmailTemplate.name == name)
        .first()
    )


# ---------------------------------------------------------------------------
# Writes
# ---------------------------------------------------------------------------

def create_template(db: Session, data: EmailTemplateCreate) -> EmailTemplate:
    """Create a new template. Raises 400 if the name is already taken."""
    _assert_name_unique(db, data.name)
    tpl = EmailTemplate(
        name=data.name.strip(),
        subject=data.subject.strip(),
        body=data.body,
        description=data.description,
        is_active=data.is_active,
    )
    db.add(tpl)
    db.commit()
    db.refresh(tpl)
    return tpl


def update_template(
    db: Session, template_id: int, data: EmailTemplateUpdate
) -> EmailTemplate:
    """Update an existing template. Raises 404 / 400 as appropriate."""
    tpl = get_template(db, template_id)
    _assert_name_unique(db, data.name, exclude_id=template_id)
    tpl.name = data.name.strip()
    tpl.subject = data.subject.strip()
    tpl.body = data.body
    tpl.description = data.description
    tpl.is_active = data.is_active
    db.commit()
    db.refresh(tpl)
    return tpl


def toggle_template(db: Session, template_id: int) -> EmailTemplate:
    """Flip is_active on a template and return the updated row."""
    tpl = get_template(db, template_id)
    tpl.is_active = not tpl.is_active
    db.commit()
    db.refresh(tpl)
    return tpl


def delete_template(db: Session, template_id: int) -> None:
    """Permanently delete a template. Raises 404 if not found."""
    tpl = get_template(db, template_id)
    db.delete(tpl)
    db.commit()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _assert_name_unique(
    db: Session, name: str, exclude_id: int | None = None
) -> None:
    query = db.query(EmailTemplate).filter(EmailTemplate.name == name.strip())
    if exclude_id is not None:
        query = query.filter(EmailTemplate.id != exclude_id)
    if query.first():
        raise HTTPException(
            status_code=400,
            detail=f"A template named '{name}' already exists.",
        )
