"""Extra authentication models."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base, PKMixin, TenantMixin


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
