from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest
from fastapi import UploadFile

from app.auth.avatar import save_user_avatar


@pytest.mark.asyncio
async def test_save_user_avatar_uses_blob_on_vercel() -> None:
  file = UploadFile(filename="avatar.jpg", file=AsyncMock())
  file.content_type = "image/jpeg"
  file.read = AsyncMock(return_value=b"fake-image")

  with (
    patch("app.auth.avatar.use_blob_storage", return_value=True),
    patch(
      "app.auth.avatar.upload_public_blob",
      new=AsyncMock(return_value="https://example.public.blob.vercel-storage.com/avatars/1.jpg"),
    ) as upload_blob,
    patch("app.auth.avatar.delete_blob_url", new=AsyncMock()) as delete_blob,
  ):
    url = await save_user_avatar(1, file, previous_url="https://old.example/1.png")

  upload_blob.assert_awaited_once()
  delete_blob.assert_awaited_once_with("https://old.example/1.png")
  assert url.endswith("/avatars/1.jpg")
