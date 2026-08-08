"""Avatar upload helpers."""

from __future__ import annotations

from pathlib import Path

from fastapi import HTTPException, UploadFile, status

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_BYTES = 2 * 1024 * 1024
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads" / "avatars"


def ensure_upload_dir() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


async def save_user_avatar(user_id: int, file: UploadFile) -> str:
    if not file.content_type or file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, WebP, and GIF images are allowed.",
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )
    if len(content) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be smaller than 2 MB.",
        )

    ext = ALLOWED_CONTENT_TYPES[file.content_type]
    ensure_upload_dir()

    for existing in UPLOAD_DIR.glob(f"{user_id}.*"):
        existing.unlink(missing_ok=True)

    filename = f"{user_id}{ext}"
    (UPLOAD_DIR / filename).write_bytes(content)

    return f"/api/v1/uploads/avatars/{filename}"
