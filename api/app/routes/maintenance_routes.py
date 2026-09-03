"""Housekeeping, triggered by a scheduler rather than by a person remembering.

Mounted under /api/v1 deliberately: the scan route owns "/{slug}" at the root,
so anything single-segment there would be read as a QR code.

Locked behind CRON_SECRET. With no secret configured the endpoint returns 503
rather than running — an unauthenticated "delete rows" URL that works because
nobody set a variable is a worse outcome than housekeeping not happening.
"""

from __future__ import annotations

import hmac

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.db.session import get_db
from app.services.retention_service import purge_expired

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


def _authorise(authorization: str | None) -> None:
    secret = (settings.cron_secret or "").strip()
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="CRON_SECRET is not configured; scheduled maintenance is off.",
        )
    supplied = (authorization or "").removeprefix("Bearer ").strip()
    # Constant-time: this is a bare secret in a header, so a timing oracle on it
    # is worth closing even though the blast radius is only housekeeping.
    if not supplied or not hmac.compare_digest(supplied, secret):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorised"
        )


@router.get("/purge")
def purge(
    dry_run: bool = False,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    """Delete expired notifications, sessions, blocklist and verification rows.

    GET because Vercel Cron issues GET. Idempotent, so a retried invocation is
    harmless. Pass ?dry_run=true to see the counts without deleting anything.
    """
    _authorise(authorization)
    removed = purge_expired(db, dry_run=dry_run)
    return {
        "dry_run": dry_run,
        "removed": removed,
        "total": sum(removed.values()),
    }
