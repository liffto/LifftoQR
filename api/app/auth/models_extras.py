"""Extra authentication models."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from sqlalchemy import Column, Integer, String, DateTime, Date, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base, PKMixin, TenantMixin


class Notification(PKMixin, TenantMixin, Base):
    """An in-app notification.

    Scan alerts are bucketed per QR per day: the first scan of a code gets its
    own notification, and later scans that day bump a counter on one row rather
    than adding an entry each time, so a popular code cannot flood the list.
    """

    __tablename__ = "notifications"

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    kind = Column(String(30), nullable=False)  # scan_first | scan_daily | info
    qr_id = Column(
        Integer, ForeignKey("qrs.id", ondelete="CASCADE"), nullable=True, index=True
    )
    # Snapshot so a renamed or deleted QR does not rewrite history.
    qr_name = Column(String(255), nullable=True)
    scan_count = Column(Integer, nullable=False, default=1)
    day = Column(Date, nullable=True, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class UserSession(PKMixin, TenantMixin, Base):
    """One signed-in device.

    Keyed on the refresh token's jti, which is stable for the life of a login
    (the refresh endpoint re-issues only the access token), so it identifies a
    device across the whole session. Revoking pushes that jti onto
    TokenBlocklist, which the refresh endpoint already honours.
    """

    __tablename__ = "user_sessions"

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    refresh_jti = Column(String(255), nullable=False, unique=True, index=True)
    device_type = Column(String(20), nullable=False, default="desktop")
    device_name = Column(String(100), nullable=False, default="Unknown device")
    browser = Column(String(60), nullable=True)
    ip_address = Column(String(64), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    last_seen_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)


class TokenBlocklist(PKMixin, TenantMixin, Base):
    """Revoked JWT tokens (jti blocklist)."""

    __tablename__ = "token_blocklists"

    jti = Column(String(255), nullable=False, unique=True)
    reason = Column(String(100))
    expires_at = Column(DateTime(timezone=True), nullable=False)


class EmailVerification(PKMixin, TenantMixin, Base):
    """Email verification tokens."""

    __tablename__ = "email_verifications"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(500), nullable=False, unique=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, nullable=False, default=False)

    @staticmethod
    def new_token() -> str:
        """Generate a random token (in production, use secrets.token_urlsafe)."""
        import secrets
        return secrets.token_urlsafe(32)

    @staticmethod
    def default_expiry(minutes: int = 24 * 60) -> datetime:
        """Default expiry time (24 hours)."""
        return datetime.now(timezone.utc) + timedelta(minutes=minutes)
