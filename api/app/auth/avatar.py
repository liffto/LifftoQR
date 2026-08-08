"""Avatar upload helpers."""

from __future__ import annotations

from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.auth.blob_storage import delete_blob_url, upload_public_blob, use_blob_storage

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


async def _validate_avatar_file(file: UploadFile) -> tuple[str, bytes]:
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

    return ALLOWED_CONTENT_TYPES[file.content_type], content


async def _save_user_avatar_local(user_id: int, ext: str, content: bytes) -> str:
    ensure_upload_dir()

    for existing in UPLOAD_DIR.glob(f"{user_id}.*"):
        existing.unlink(missing_ok=True)

    filename = f"{user_id}{ext}"
    (UPLOAD_DIR / filename).write_bytes(content)
    return f"/api/v1/uploads/avatars/{filename}"


async def _save_user_avatar_blob(
    user_id: int,
    ext: str,
    content: bytes,
    content_type: str,
    previous_url: str | None,
) -> str:
    pathname = f"avatars/{user_id}{ext}"
    avatar_url = await upload_public_blob(pathname, content, content_type)

    if previous_url and previous_url != avatar_url:
        await delete_blob_url(previous_url)

    return avatar_url


async def save_user_avatar(
    user_id: int,
    file: UploadFile,
    previous_url: str | None = None,
) -> str:
    ext, content = await _validate_avatar_file(file)

    if use_blob_storage():
        return await _save_user_avatar_blob(
            user_id,
            ext,
            content,
            file.content_type or "application/octet-stream",
            previous_url,
        )

    return await _save_user_avatar_local(user_id, ext, content)
