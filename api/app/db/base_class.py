"""SQLAlchemy Base and common mixins."""

from __future__ import annotations

from typing import Any
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column
from sqlalchemy import MetaData, DateTime, func, ForeignKey

from app.core.constants import ON_DELETE_CASCADE

NAMING_CONVENTION = {
    "ix": "ix_%(table_name)s_%(column_0_name)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    metadata = MetaData(naming_convention=NAMING_CONVENTION)


class PKMixin:
    """Integer autoincrement primary key."""

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)


class TimestampMixin:
    """Created/updated timestamps."""

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class TenantMixin:
    """Per-tenant scoping via account_id FK."""

    @declared_attr
    def account_id(cls) -> Mapped[int]:  # type: ignore[override]
        return mapped_column(
            ForeignKey("accounts.id", ondelete=ON_DELETE_CASCADE), nullable=False
        )
