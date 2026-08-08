"""Vercel Blob storage helpers for serverless deployments."""

from __future__ import annotations

import logging
import os

import httpx
from fastapi import HTTPException, status

from app.config.settings import settings

logger = logging.getLogger(__name__)

BLOB_API_URL = "https://vercel.com/api/blob"
BLOB_API_VERSION = "12"


def use_blob_storage() -> bool:
    if settings.blob_read_write_token:
        return True
    return os.getenv("VERCEL") == "1"


def _blob_store_id(token: str) -> str:
    if settings.blob_store_id:
        return settings.blob_store_id.removeprefix("store_")

    parts = token.split("_", 3)
    if len(parts) < 4 or not parts[3]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Invalid BLOB_READ_WRITE_TOKEN format.",
        )
    return parts[3].removeprefix("store_")


def _blob_auth_headers(token: str) -> dict[str, str]:
    return {
        "authorization": f"Bearer {token}",
        "x-api-version": BLOB_API_VERSION,
        "x-vercel-blob-store-id": _blob_store_id(token),
    }


async def upload_public_blob(
    pathname: str,
    content: bytes,
    content_type: str,
) -> str:
    token = settings.blob_read_write_token
    if not token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Avatar storage is not configured. Create a Vercel Blob store "
                "for the API project and set BLOB_READ_WRITE_TOKEN."
            ),
        )

    headers = {
        **_blob_auth_headers(token),
        "x-vercel-blob-access": "public",
        "x-content-type": content_type,
        "x-add-random-suffix": "0",
        "x-allow-overwrite": "1",
        "x-content-length": str(len(content)),
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.put(
            f"{BLOB_API_URL}/",
            content=content,
            headers=headers,
            params={"pathname": pathname},
        )

    if response.status_code >= 400:
        logger.error(
            "Vercel Blob upload failed (%s): %s",
            response.status_code,
            response.text[:500],
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload profile photo.",
        )

    data = response.json()
    url = data.get("url")
    if not url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload profile photo.",
        )
    return url


async def delete_blob_url(url: str) -> None:
    token = settings.blob_read_write_token
    if not token or "blob.vercel-storage.com" not in url:
        return

    headers = {
        **_blob_auth_headers(token),
        "content-type": "application/json",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            f"{BLOB_API_URL}/delete",
            headers=headers,
            json={"urls": [url]},
        )

    if response.status_code >= 400:
        logger.warning(
            "Vercel Blob delete failed (%s): %s",
            response.status_code,
            response.text[:300],
        )
