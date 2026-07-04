"""Tenant/Account models for multi-tenancy."""

from __future__ import annotations

from sqlalchemy import Column, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base, PKMixin, TimestampMixin


class Account(PKMixin, TimestampMixin, Base):
    """Account/Organization for multi-tenancy."""

    __tablename__ = "accounts"
    __table_args__ = (UniqueConstraint("slug", name="uq_account_slug"),)

    name = Column(String(200), nullable=False)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text)

    users = relationship(
        "User",
        back_populates="account",
        cascade="all, delete-orphan",
    )
