from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from activity import log_activity
from auth_utils import get_client_ip, get_current_user, get_db, require_permission
from files_config import (
    CATEGORY_KEYS,
    DOCUMENT_CATEGORIES,
    PANEL_CATEGORY_DEFAULTS,
    RECORD_MODULE_KEYS,
    category_label,
    is_record_module,
    max_file_size_mb,
    record_module_label,
    validate_category,
    validate_record_module,
    allowed_extensions_list,
)
from models import UploadedFile, User
from permissions import role_has_permission
from schemas import FileListResponse, FileMetaResponse, FileOption, FileStatsResponse, UploadedFileResponse
from services.file_service import delete_physical_file, validate_and_save_file

router = APIRouter(prefix="/files", tags=["files"])


def serialize_file(file: UploadedFile) -> dict:
    return {
        "id": file.id,
        "company_id": file.company_id,
        "original_filename": file.original_filename,
        "stored_filename": file.stored_filename,
        "file_type": file.file_type,
        "file_size": file.file_size,
        "uploaded_by": {
            "id": file.uploaded_by.id,
            "name": file.uploaded_by.name,
            "email": file.uploaded_by.email,
            "role": file.uploaded_by.role,
        },
        "category": file.category,
        "category_label": category_label(file.category),
        "related_module": file.related_module,
        "related_module_label": record_module_label(file.related_module) if is_record_module(file.related_module) else None,
        "related_record_id": file.related_record_id,
        "created_at": file.created_at,
        "file_url": f"/files/{file.id}/download",
    }


def _base_query(db: Session, current_user: User):
    has_view_all = role_has_permission(db, current_user.role, "files.view")
    has_view_own = role_has_permission(db, current_user.role, "files.view_own")

    if not has_view_all and not has_view_own:
        raise HTTPException(status_code=403, detail="Permission denied")

    query = db.query(UploadedFile).options(joinedload(UploadedFile.uploaded_by))

    if current_user.company_id is not None:
        query = query.filter(UploadedFile.company_id == current_user.company_id)

    if not has_view_all and has_view_own:
        query = query.filter(UploadedFile.uploaded_by_id == current_user.id)

    return query


@router.get("/meta", response_model=FileMetaResponse)
def file_meta(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    has_view_all = role_has_permission(db, current_user.role, "files.view")
    has_view_own = role_has_permission(db, current_user.role, "files.view_own")
    if not has_view_all and not has_view_own:
        raise HTTPException(status_code=403, detail="Permission denied")
    return FileMetaResponse(
        categories=[FileOption(value=k, label=v) for k, v in DOCUMENT_CATEGORIES.items()],
        record_modules=[FileOption(value=k, label=v) for k, v in RECORD_MODULE_KEYS.items()],
        allowed_extensions=allowed_extensions_list(),
        max_file_size_mb=max_file_size_mb(),
    )


@router.get("/stats/summary", response_model=FileStatsResponse)
def file_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = _base_query(db, current_user)
    total_count = query.count()
    total_bytes = query.with_entities(func.coalesce(func.sum(UploadedFile.file_size), 0)).scalar() or 0

    rows = (
        query.with_entities(UploadedFile.category, func.count(UploadedFile.id))
        .group_by(UploadedFile.category)
        .all()
    )
    by_category = [
        {
            "category": cat or "uncategorized",
            "label": category_label(cat) or "Uncategorized",
            "count": count,
        }
        for cat, count in rows
    ]

    return FileStatsResponse(total_count=total_count, total_bytes=int(total_bytes), by_category=by_category)


@router.post("/upload", response_model=list[UploadedFileResponse])
async def upload_files(
    request: Request,
    files: list[UploadFile] = File(...),
    category: str | None = Form(None),
    related_module: str | None = Form(None),
    related_record_id: int | None = Form(None),
    current_user: User = Depends(require_permission("files.upload")),
    db: Session = Depends(get_db),
):
    resolved_category = category
    resolved_module = related_module

    if related_module and related_record_id is not None:
        try:
            validate_record_module(related_module)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        if not resolved_category:
            resolved_category = PANEL_CATEGORY_DEFAULTS.get(related_module, "documents")
    elif related_module and related_record_id is None and related_module in CATEGORY_KEYS:
        if not resolved_category:
            resolved_category = related_module
        resolved_module = None
    elif category:
        try:
            validate_category(category)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        resolved_category = category

    if not resolved_category:
        raise HTTPException(status_code=400, detail="Category is required")

    try:
        validate_category(resolved_category)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    saved_records = []

    for file in files:
        stored_filename, file_path, file_type, file_size = await validate_and_save_file(file)

        uploaded_file = UploadedFile(
            company_id=current_user.company_id,
            original_filename=file.filename,
            stored_filename=stored_filename,
            file_path=file_path,
            file_type=file_type,
            file_size=file_size,
            uploaded_by_id=current_user.id,
            category=resolved_category,
            related_module=resolved_module,
            related_record_id=related_record_id,
        )
        db.add(uploaded_file)
        db.flush()
        saved_records.append(uploaded_file)

    db.commit()

    for rec in saved_records:
        db.refresh(rec)
        log_activity(
            db,
            action="file_uploaded",
            user_id=current_user.id,
            email=current_user.email,
            details=f"Uploaded {rec.original_filename} ({resolved_category})",
            ip_address=get_client_ip(request),
        )

    return [serialize_file(rec) for rec in saved_records]


@router.get("", response_model=FileListResponse)
def list_files(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    category: str | None = None,
    related_module: str | None = None,
    related_record_id: int | None = None,
    search: str | None = None,
    uploaded_by_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = _base_query(db, current_user)

    if category:
        if category not in CATEGORY_KEYS:
            raise HTTPException(status_code=400, detail="Invalid category")
        query = query.filter(UploadedFile.category == category)

    if related_module:
        query = query.filter(UploadedFile.related_module == related_module)
    if related_record_id is not None:
        query = query.filter(UploadedFile.related_record_id == related_record_id)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(UploadedFile.original_filename.ilike(term))

    if uploaded_by_id is not None:
        query = query.filter(UploadedFile.uploaded_by_id == uploaded_by_id)

    total = query.count()
    files = (
        query.order_by(UploadedFile.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return FileListResponse(
        items=[serialize_file(f) for f in files],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/{file_id}/download")
def download_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    if current_user.company_id is not None and file.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Permission denied")

    has_download_all = role_has_permission(db, current_user.role, "files.download")
    has_download_own = role_has_permission(db, current_user.role, "files.download_own")

    if not has_download_all:
        if has_download_own and file.uploaded_by_id == current_user.id:
            pass
        else:
            raise HTTPException(status_code=403, detail="Permission denied")

    return FileResponse(
        path=file.file_path,
        filename=file.original_filename,
        media_type=file.file_type,
    )


@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    request: Request,
    current_user: User = Depends(require_permission("files.delete")),
    db: Session = Depends(get_db),
):
    file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    if current_user.company_id is not None and file.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Permission denied")

    filename = file.original_filename
    delete_physical_file(file.file_path)

    db.delete(file)
    db.commit()

    log_activity(
        db,
        action="file_deleted",
        user_id=current_user.id,
        email=current_user.email,
        details=f"Deleted file {filename}",
        ip_address=get_client_ip(request),
    )

    return {"message": "File deleted successfully"}
