from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from auth_utils import get_db, get_current_user, require_permission
from models import UploadedFile, User
from permissions import role_has_permission
from schemas import UploadedFileResponse
from services.file_service import validate_and_save_file, delete_physical_file

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
        "related_module": file.related_module,
        "related_record_id": file.related_record_id,
        "created_at": file.created_at,
        "file_url": f"/files/{file.id}/download",
    }


@router.post("/upload", response_model=list[UploadedFileResponse])
async def upload_files(
    files: list[UploadFile] = File(...),
    related_module: str | None = Form(None),
    related_record_id: int | None = Form(None),
    current_user: User = Depends(require_permission("files.upload")),
    db: Session = Depends(get_db),
):
    saved_records = []
    
    for file in files:
        # Validate and save file on disk
        stored_filename, file_path, file_type, file_size = await validate_and_save_file(file)
        
        # Save record in database
        uploaded_file = UploadedFile(
            company_id=current_user.company_id,
            original_filename=file.filename,
            stored_filename=stored_filename,
            file_path=file_path,
            file_type=file_type,
            file_size=file_size,
            uploaded_by_id=current_user.id,
            related_module=related_module,
            related_record_id=related_record_id,
        )
        db.add(uploaded_file)
        db.flush() # Populate the ID
        
        saved_records.append(uploaded_file)
        
    db.commit()
    
    # Reload relation details to ensure uploaded_by is populated
    for rec in saved_records:
        db.refresh(rec)
        
    return [serialize_file(rec) for rec in saved_records]


@router.get("", response_model=list[UploadedFileResponse])
def list_files(
    related_module: str | None = None,
    related_record_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    has_view_all = role_has_permission(db, current_user.role, "files.view")
    has_view_own = role_has_permission(db, current_user.role, "files.view_own")
    
    if not has_view_all and not has_view_own:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    query = db.query(UploadedFile)
    
    # Restrict multi-tenant records
    if current_user.company_id is not None:
        query = query.filter(UploadedFile.company_id == current_user.company_id)
        
    # Enforce own uploads check for Employee
    if not has_view_all and has_view_own:
        query = query.filter(UploadedFile.uploaded_by_id == current_user.id)
        
    # Apply optional module filters
    if related_module:
        query = query.filter(UploadedFile.related_module == related_module)
    if related_record_id is not None:
        query = query.filter(UploadedFile.related_record_id == related_record_id)
        
    files = query.order_by(UploadedFile.created_at.desc()).all()
    return [serialize_file(f) for f in files]


@router.get("/{file_id}/download")
def download_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
        
    # Restrict multi-tenant records
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
    current_user: User = Depends(require_permission("files.delete")),
    db: Session = Depends(get_db),
):
    file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
        
    # Restrict multi-tenant records
    if current_user.company_id is not None and file.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    # Delete from disk first
    delete_physical_file(file.file_path)
    
    # Delete database record
    db.delete(file)
    db.commit()
    
    return {"message": "File deleted successfully"}
