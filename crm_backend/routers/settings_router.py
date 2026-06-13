from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth_utils import get_db, require_permission
from models import Company, SystemSetting, User
from schemas import SystemSettingResponse

router = APIRouter(prefix="/admin", tags=["settings"])


@router.get("/settings", response_model=SystemSettingResponse)
def get_system_settings(
    _: User = Depends(require_permission("settings.view")),
    db: Session = Depends(get_db),
):
    company = db.query(Company).first()
    if not company:
        raise HTTPException(status_code=400, detail="Company not configured")
    settings = db.query(SystemSetting).filter(SystemSetting.company_id == company.id).first()
    if not settings:
        settings = SystemSetting(company_id=company.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings
