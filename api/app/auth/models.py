"""Authentication models."""

from __future__ import annotations

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base, PKMixin, TimestampMixin, TenantMixin


class User(PKMixin, TenantMixin, TimestampMixin, Base):
    """Platform user (recruiter/hiring manager/admin)."""

    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("account_id", "email", name="uq_user_account_email"),)

    email = Column(String(320), nullable=False, index=True)
    first_name = Column(String(200))
    last_name = Column(String(200))
    password_hash = Column(String(255))
    is_active = Column(Boolean, nullable=False, default=True)
    last_login_at = Column(DateTime(timezone=True))
    is_superuser = Column(Boolean, nullable=False, default=False)
    is_staff = Column(Boolean, nullable=False, default=False)
    google_id = Column(String(255), nullable=True, index=True)
    auth_provider = Column(String(50), nullable=False, default="local")
    avatar_url = Column(Text, nullable=True)
    email_verified = Column(Boolean, nullable=False, default=False)

    account = relationship("Account", back_populates="users")
    roles = relationship(
        "UserRole",
        back_populates="user",
        cascade="all, delete-orphan",
    )
