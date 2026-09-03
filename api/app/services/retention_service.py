"""Delete the rows that stopped being useful.

Four tables only ever grew. None of them is read once its row is stale, so the
storage was pure cost and the indexes got slower for nothing:

  notifications        — the bell shows recent activity; a scan alert from
                         eight months ago is not activity.
  user_sessions        — a session past expires_at cannot be refreshed, and
                         "Manage Devices" listing dead phones is worse than
                         useless. A dev account here had accumulated sixteen
                         rows from a single afternoon of testing.
  token_blocklists     — a revoked token is checked only until it would have
                         expired anyway. After that the row proves nothing.
  email_verifications  — used or expired tokens are spent.

Everything here is time-based and idempotent: running it twice deletes nothing
the second time, so a retry after a timeout is safe.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.auth.models_extras import (
    EmailVerification,
    Notification,
    TokenBlocklist,
    UserSession,
)

log = logging.getLogger(__name__)

# Long enough that nobody loses something they were about to look at, short
# enough that the tables stay small. The bell only ever shows recent activity.
NOTIFICATION_RETENTION_DAYS = 90
# Expired rows are kept briefly rather than deleted the instant they lapse, so
# that "your session expired" can still be explained if someone asks.
EXPIRED_GRACE_DAYS = 7


def purge_expired(db: Session, *, dry_run: bool = False) -> dict[str, int]:
    """Delete stale rows. Returns how many went from each table.

    With dry_run the same counts come back but nothing is deleted, which is how
    you find out what a first run against production would do.
    """
    now = datetime.now(timezone.utc)
    notification_cutoff = now - timedelta(days=NOTIFICATION_RETENTION_DAYS)
    expiry_cutoff = now - timedelta(days=EXPIRED_GRACE_DAYS)

    targets = (
        ("notifications", Notification, Notification.created_at < notification_cutoff),
        ("user_sessions", UserSession, UserSession.expires_at < expiry_cutoff),
        ("token_blocklists", TokenBlocklist, TokenBlocklist.expires_at < expiry_cutoff),
        (
            "email_verifications",
            EmailVerification,
            EmailVerification.expires_at < expiry_cutoff,
        ),
    )

    removed: dict[str, int] = {}
    try:
        for name, model, condition in targets:
            if dry_run:
                removed[name] = (
                    db.execute(
                        select(func.count()).select_from(model).where(condition)
                    ).scalar()
                    or 0
                )
                continue
            removed[name] = db.execute(delete(model).where(condition)).rowcount or 0
        if dry_run:
            db.rollback()
        else:
            db.commit()
    except Exception:
        # Housekeeping is never worth leaving a transaction open over.
        db.rollback()
        raise

    log.info("retention %s: %s", "dry run" if dry_run else "purge", removed)
    return removed
