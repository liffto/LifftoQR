"""Creating and reading in-app notifications."""

from __future__ import annotations

from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.models import User
from app.auth.models_extras import Notification
from app.models.qr import QR

# Enough to fill the page without paginating; older entries stay in the table.
LIST_LIMIT = 50


def record_scan_notification(db: Session, qr: QR) -> Notification | None:
    """Note a scan for the QR's owner, respecting their preference.

    The first scan of a code is its own entry. Later scans the same day bump a
    counter on a single row instead of appending, so a code scanned hundreds of
    times produces one notification, not hundreds.
    """
    if qr.created_by is None:
        return None

    owner = db.get(User, qr.created_by)
    if owner is None or not owner.notify_scans:
        return None

    today = date.today()

    # A code's very first scan is worth calling out on its own.
    seen_before = db.execute(
        select(Notification.id).where(
            (Notification.qr_id == qr.id)
            & (Notification.kind.in_(("scan_first", "scan_daily")))
        )
    ).first()

    if not seen_before:
        notification = Notification(
            user_id=owner.id,
            account_id=owner.account_id,
            kind="scan_first",
            qr_id=qr.id,
            qr_name=qr.name,
            scan_count=1,
            day=today,
        )
        db.add(notification)
        return notification

    todays = db.execute(
        select(Notification).where(
            (Notification.qr_id == qr.id)
            & (Notification.kind == "scan_daily")
            & (Notification.day == today)
        )
    ).scalars().first()

    if todays is not None:
        todays.scan_count += 1
        todays.qr_name = qr.name
        # Re-surface it: new activity on an already-read day is worth seeing.
        todays.read_at = None
        todays.updated_at = datetime.now(timezone.utc)
        return todays

    notification = Notification(
        user_id=owner.id,
        account_id=owner.account_id,
        kind="scan_daily",
        qr_id=qr.id,
        qr_name=qr.name,
        scan_count=1,
        day=today,
    )
    db.add(notification)
    return notification


def list_notifications(db: Session, user_id: int) -> list[Notification]:
    return list(
        db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.updated_at.desc())
            .limit(LIST_LIMIT)
        ).scalars()
    )


def unread_count(db: Session, user_id: int) -> int:
    return len(
        db.execute(
            select(Notification.id).where(
                (Notification.user_id == user_id) & (Notification.read_at.is_(None))
            )
        ).all()
    )


def mark_read(db: Session, user_id: int, notification_id: int) -> bool:
    notification = db.execute(
        select(Notification).where(
            (Notification.id == notification_id) & (Notification.user_id == user_id)
        )
    ).scalars().first()
    if notification is None:
        return False
    if notification.read_at is None:
        notification.read_at = datetime.now(timezone.utc)
    return True


def mark_all_read(db: Session, user_id: int) -> int:
    now = datetime.now(timezone.utc)
    unread = db.execute(
        select(Notification).where(
            (Notification.user_id == user_id) & (Notification.read_at.is_(None))
        )
    ).scalars().all()
    for notification in unread:
        notification.read_at = now
    return len(unread)


def describe(notification: Notification) -> tuple[str, str]:
    """Title and body, built at read time so a bumped count stays accurate."""
    name = notification.qr_name or "Your QR code"
    if notification.kind == "scan_first":
        return ("First scan!", f'"{name}" was scanned for the first time.')
    if notification.kind == "scan_daily":
        times = (
            "once" if notification.scan_count == 1 else f"{notification.scan_count} times"
        )
        return ("QR Code Scanned", f'"{name}" was scanned {times} today.')
    return ("Notification", name)
