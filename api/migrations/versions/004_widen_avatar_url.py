"""Widen users.avatar_url to store compressed image data URLs.

Revision ID: 004_widen_avatar_url
Revises: 003_widen_logo_columns
Create Date: 2026-08-08 17:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "004_widen_avatar_url"
down_revision = "003_widen_logo_columns"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "avatar_url",
        existing_type=sa.String(length=500),
        type_=sa.Text(),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "avatar_url",
        existing_type=sa.Text(),
        type_=sa.String(length=500),
        existing_nullable=True,
    )
