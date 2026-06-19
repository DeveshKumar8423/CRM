from __future__ import annotations

import os
import uuid
from fastapi import HTTPException, UploadFile

import config

MIME_TYPE_MAPPING = {
    "pdf": ["application/pdf"],
    "doc": ["application/msword"],
    "docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    "xls": ["application/vnd.ms-excel"],
    "xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    "csv": ["text/csv", "application/vnd.ms-excel", "text/plain", "application/octet-stream"],
    "txt": ["text/plain"],
    "png": ["image/png"],
    "jpg": ["image/jpeg", "image/pjpeg"],
    "jpeg": ["image/jpeg", "image/pjpeg"],
    "gif": ["image/gif"]
}


def ensure_upload_dir():
    if not os.path.exists(config.UPLOAD_DIR):
        os.makedirs(config.UPLOAD_DIR, exist_ok=True)


async def validate_and_save_file(file: UploadFile) -> tuple[str, str, str, int]:
    """
    Validates a file for size, extension, MIME type, and executable signatures.
    Saves the file to UPLOAD_DIR with a unique name.
    
    Returns:
        tuple[stored_filename, file_path, file_type, file_size]
    """
    ensure_upload_dir()

    filename = file.filename or "unnamed"
    if "." not in filename:
        raise HTTPException(
            status_code=400,
            detail=f"File '{filename}' must have an extension."
        )

    ext = filename.rsplit(".", 1)[1].lower()
    if ext not in config.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File extension '.{ext}' is not allowed."
        )

    # Validate MIME type
    content_type = file.content_type
    if not content_type:
        raise HTTPException(
            status_code=400,
            detail=f"Could not determine MIME type for file '{filename}'."
        )
    
    content_type = content_type.lower()
    allowed_mimes = MIME_TYPE_MAPPING.get(ext, [])
    if content_type not in allowed_mimes:
        raise HTTPException(
            status_code=400,
            detail=f"MIME type '{content_type}' is invalid for extension '.{ext}'."
        )

    # Read up to MAX_FILE_SIZE + 1 to detect over-size files before reading everything
    content = await file.read(config.MAX_FILE_SIZE + 1)
    file_size = len(content)

    if file_size > config.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File '{filename}' exceeds the maximum allowed size of {config.MAX_FILE_SIZE // (1024*1024)}MB."
        )

    # Check for executable signature (Magic Numbers)
    # MZ = PE/Windows Executable
    if content.startswith(b"MZ"):
        raise HTTPException(
            status_code=400,
            detail=f"File '{filename}' is an executable and cannot be uploaded."
        )
    # #! = Shebang (Scripts)
    if content.startswith(b"#!"):
        raise HTTPException(
            status_code=400,
            detail=f"File '{filename}' is a script and cannot be uploaded."
        )
    # ELF executable
    if content.startswith(b"\x7fELF"):
        raise HTTPException(
            status_code=400,
            detail=f"File '{filename}' is a binary and cannot be uploaded."
        )
    # Java class
    if content.startswith(b"\xca\xfe\xba\xbe"):
        raise HTTPException(
            status_code=400,
            detail=f"File '{filename}' is a compiled Java class and cannot be uploaded."
        )

    # Reset file position if we need to write/read again (though we already have the bytes in memory)
    await file.seek(0)

    # Generate unique stored filename
    unique_id = uuid.uuid4().hex
    stored_filename = f"{unique_id}.{ext}"
    file_path = os.path.join(config.UPLOAD_DIR, stored_filename)

    # Save to disk
    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to write file to disk: {str(e)}"
        )

    return stored_filename, file_path, content_type, file_size


def delete_physical_file(file_path: str):
    """
    Deletes the file from disk if it exists.
    """
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            # We log or ignore physical delete failure on db delete to prevent transaction rollbacks
            pass
