"""Avatar upload helpers — stores compressed images as data URLs (same as QR logos)."""

from __future__ import annotations

import base64
import binascii
import re

from fastapi import HTTPException, status

ALLOWED_DATA_URL = re.compile(
    r"^data:image/(jpeg|png|webp|gif);base64,",
    re.IGNORECASE,
)
MAX_DATA_URL_CHARS = 2_000_000
MAX_BYTES = 2 * 1024 * 1024


def save_user_avatar_data_url(picture: str) -> str:
    """Validate and return a data URL suitable for users.avatar_url."""
    if not picture or not picture.startswith("data:image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image data.",
        )

    if len(picture) > MAX_DATA_URL_CHARS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image is too large.",
        )

    if not ALLOWED_DATA_URL.match(picture):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, WebP, and GIF images are allowed.",
        )

    try:
        _header, encoded = picture.split(",", 1)
        content = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image data.",
        ) from None

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

    return picture
