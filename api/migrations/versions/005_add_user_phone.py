"""Add users.phone for the account profile form.

Revision ID: 005_add_user_phone
Revises: 004_widen_avatar_url
Create Date: 2026-08-11 03:55:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "005_add_user_phone"
down_revision = "004_widen_avatar_url"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Stored in E.164 (+919840012345), so 20 chars covers the 15-digit maximum
    # plus the leading plus. Nullable: existing users have no number, and
    # Google sign-in never supplies one.
    op.add_column("users", sa.Column("phone", sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "phone")
