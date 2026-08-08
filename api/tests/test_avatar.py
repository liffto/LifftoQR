from __future__ import annotations

import pytest
from fastapi import HTTPException

from app.auth.avatar import save_user_avatar_data_url

# Tiny 1x1 PNG
VALID_PNG_DATA_URL = (
    "data:image/png;base64,"
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
)


def test_save_user_avatar_data_url_accepts_compressed_png() -> None:
    url = save_user_avatar_data_url(VALID_PNG_DATA_URL)
    assert url == VALID_PNG_DATA_URL


def test_save_user_avatar_data_url_rejects_invalid_payload() -> None:
    with pytest.raises(HTTPException) as exc:
        save_user_avatar_data_url("not-an-image")
    assert exc.value.status_code == 400
