import re

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from activity import log_activity
from auth_utils import get_client_ip, get_db, require_permission
from models import Company, User
from schemas import CompanyCreateRequest, CompanyResponse, CompanyUpdateRequest

router = APIRouter(prefix="/admin", tags=["company"])

GSTIN_PATTERN = re.compile(
    r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
)
PAN_PATTERN = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")


def _validate_tax_ids(gstin: str | None, pan: str | None) -> None:
    if gstin and not GSTIN_PATTERN.match(gstin.upper()):
        raise HTTPException(status_code=400, detail="Invalid GSTIN format")
    if pan and not PAN_PATTERN.match(pan.upper()):
        raise HTTPException(status_code=400, detail="Invalid PAN format")


def _normalize_tax_ids(data: dict) -> dict:
    if data.get("gstin"):
        data["gstin"] = data["gstin"].upper()
    if data.get("pan"):
        data["pan"] = data["pan"].upper()
    return data


@router.get("/company", response_model=CompanyResponse)
def get_company(
    _: User = Depends(require_permission("company.view")),
    db: Session = Depends(get_db),
):
    company = db.query(Company).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not configured yet")
    return company


@router.post("/company", response_model=CompanyResponse)
def create_company(
    data: CompanyCreateRequest,
    request: Request,
    admin: User = Depends(require_permission("company.edit")),
    db: Session = Depends(get_db),
):
    if db.query(Company).first():
        raise HTTPException(status_code=400, detail="Company already exists")

    payload = _normalize_tax_ids(data.model_dump())
    _validate_tax_ids(payload.get("gstin"), payload.get("pan"))

    company = Company(**payload)
    db.add(company)
    db.commit()
    db.refresh(company)

    log_activity(
        db,
        "company_created",
        user_id=admin.id,
        email=admin.email,
        details=f"Created company {company.display_name}",
        ip_address=get_client_ip(request),
    )

    return company


@router.put("/company", response_model=CompanyResponse)
def update_company(
    data: CompanyUpdateRequest,
    request: Request,
    admin: User = Depends(require_permission("company.edit")),
    db: Session = Depends(get_db),
):
    company = db.query(Company).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not configured yet")

    payload = _normalize_tax_ids(data.model_dump())
    _validate_tax_ids(payload.get("gstin"), payload.get("pan"))

    for key, value in payload.items():
        setattr(company, key, value)

    db.commit()
    db.refresh(company)

    log_activity(
        db,
        "company_updated",
        user_id=admin.id,
        email=admin.email,
        details=f"Updated company {company.display_name}",
        ip_address=get_client_ip(request),
    )

    return company
