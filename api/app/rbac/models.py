"""RBAC (Role-Based Access Control) models."""

from __future__ import annotations

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base, PKMixin, TimestampMixin, TenantMixin


class Role(PKMixin, TenantMixin, TimestampMixin, Base):
    """Role model for RBAC."""

    __tablename__ = "roles"
    __table_args__ = (UniqueConstraint("account_id", "name", name="uq_role_account_name"),)

    name = Column(String(100), nullable=False)
    description = Column(Text)

    user_roles = relationship(
        "UserRole",
        back_populates="role",
        cascade="all, delete-orphan",
    )


class UserRole(PKMixin, TenantMixin, TimestampMixin, Base):
    """Join table between User and Role."""

    __tablename__ = "user_roles"
    __table_args__ = (
        UniqueConstraint("account_id", "user_id", "role_id", name="uq_user_role_account"),
    )

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="roles")
    role = relationship("Role", back_populates="user_roles")
