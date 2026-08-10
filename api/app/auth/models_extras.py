"""Extra authentication models."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base, PKMixin, TenantMixin


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
