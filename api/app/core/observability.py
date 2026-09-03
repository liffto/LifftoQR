"""Report server errors somewhere other than a log nobody reads.

Until now a 500 in production surfaced only when someone happened to notice and
say so. Vercel keeps function logs, but they are per-invocation and unsearchable
in practice, so an error that did not annoy anybody enough to report never
existed.

Off unless SENTRY_DSN is set, so local runs, CI and tests send nothing and need
no account. Setting the variable in the backend's Vercel environment is the
whole of turning it on.
"""

from __future__ import annotations

import logging

from app.config.settings import settings

log = logging.getLogger(__name__)


def _scrub(event, _hint):
    """Drop the things that should never leave the server.

    send_default_pii is already off, which covers headers and cookies, but the
    two secrets this app handles are worth removing by name rather than by
    trusting a default: a connection string carries the database password, and
    an Authorization header carries a live token.
    """
    request = event.get("request") or {}
    headers = request.get("headers")
    if isinstance(headers, dict):
        for key in list(headers):
            if key.lower() in {"authorization", "cookie", "x-api-key"}:
                headers[key] = "[redacted]"
    for section in ("extra", "contexts"):
        blob = event.get(section)
        if isinstance(blob, dict):
            blob.pop("DATABASE_URL", None)
            blob.pop("database_url", None)
    return event


def init_error_tracking() -> None:
    dsn = (settings.sentry_dsn or "").strip()
    if not dsn:
        log.info("SENTRY_DSN not set — error tracking is off")
        return

    try:
        import sentry_sdk
    except ImportError:
        # A missing optional dependency must not stop the API booting.
        log.warning("sentry-sdk is not installed — error tracking is off")
        return

    sentry_sdk.init(
        dsn=dsn,
        environment=settings.environment,
        traces_sample_rate=settings.sentry_traces_sample_rate,
        # Never attach user identifiers, request bodies, cookies or headers.
        send_default_pii=False,
        before_send=_scrub,
    )
    log.info("error tracking on (environment=%s)", settings.environment)
