"""Resolve redirect destination URLs from QR records."""

from urllib.parse import urlparse

from app.config.settings import settings
from app.models.qr import QR

WEBSITE_TYPE_KEY = "url"


def landing_page_url(slug: str) -> str:
    """Our own scan page, for QR types that have no destination to redirect to."""
    base = settings.frontend_url.split(",")[0].strip().rstrip("/")
    return f"{base}/s/{slug}"


def _is_valid_http_url(value: str | None) -> bool:
    if not value or not value.strip():
        return False
    parsed = urlparse(value.strip())
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def resolve_destination_url(qr: QR) -> str | None:
    """Return the redirect URL for a QR, or None if unavailable."""
    if qr.type_key == WEBSITE_TYPE_KEY and qr.website is not None:
        if _is_valid_http_url(qr.website.url):
            return qr.website.url.strip()

    url_fields: list[str | None] = [
        getattr(getattr(qr, rel), "url", None)
        for rel in (
            "pdf",
            "video",
            "audio",
            "social_media",
            "google_review",
            "app",
        )
        if getattr(qr, rel, None) is not None
    ]
    url_fields.append(qr.url)

    for candidate in url_fields:
        if _is_valid_http_url(candidate):
            return candidate.strip()

    return None
