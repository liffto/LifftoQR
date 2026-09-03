"""Resolve redirect destination URLs from QR records."""

from urllib.parse import urlparse

from app.config.settings import PRODUCTION_APP_URL, settings
from app.models.qr import QR

WEBSITE_TYPE_KEY = "url"

# Types whose dynamic codes always land on our own page instead of redirecting.
#
# Each of these could be turned into a link — mailto:, sms:, tel:, wa.me — and
# redirecting to one throws the scanner straight into a mail client or a dialer
# with no idea what they are about to send or to whom. Landing first shows them
# the message, the number, the recipient, and lets them decide. It is also the
# only way the scan is worth counting: a redirect to tel: leaves nothing to
# look at and nothing to come back to.
#
# It closes a trap as well. The fallback below accepts qr.url for any type, and
# records of these types have been found carrying their own short URL in that
# column — as a dynamic code that would have redirected to itself, forever.
ALWAYS_LANDING_TYPE_KEYS = frozenset(
    {"text", "email", "sms", "phone", "whatsapp"}
)

_LOCAL_HOSTNAMES = {"localhost", "127.0.0.1", "0.0.0.0", "::1"}


def _is_local_hostname(hostname: str | None) -> bool:
    if not hostname:
        return False
    host = hostname.strip().lower()
    # Strip any port, and the brackets IPv6 literals carry in a Host header.
    if host.startswith("["):
        host = host.partition("]")[0].lstrip("[")
    elif ":" in host:
        host = host.rpartition(":")[0]
    return host in _LOCAL_HOSTNAMES


def landing_page_url(slug: str, request_host: str | None = None) -> str:
    """Our own scan page, for QR types that have no destination to redirect to.

    This link is handed to whoever scanned the code, so it has to be reachable
    from *their* device. If FRONTEND_URL is still pointing at localhost while
    the scan itself arrived over a public hostname, that's a deployment
    misconfiguration which would otherwise send every scanner to their own
    machine — fall back to the production origin rather than emit a dead link.
    """
    base = settings.frontend_url.split(",")[0].strip().rstrip("/")
    if _is_local_hostname(urlparse(base).hostname) and not _is_local_hostname(
        request_host
    ):
        base = PRODUCTION_APP_URL.rstrip("/")
    return f"{base}/s/{slug}"


def _is_valid_http_url(value: str | None) -> bool:
    if not value or not value.strip():
        return False
    parsed = urlparse(value.strip())
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def resolve_destination_url(qr: QR) -> str | None:
    """Return the redirect URL for a QR, or None if unavailable.

    None means "show our own page", which is where the types below always go.
    """
    if qr.type_key in ALWAYS_LANDING_TYPE_KEYS:
        return None

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
