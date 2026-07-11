"""Widen logo/photo columns to store custom image data URLs.

Revision ID: 003_widen_logo_columns
Revises: f8ee250a905f
Create Date: 2026-07-11 15:05:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "003_widen_logo_columns"
down_revision = "f8ee250a905f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "templates",
        "logo",
        existing_type=sa.String(length=500),
        type_=sa.Text(),
        existing_nullable=True,
    )
    op.alter_column(
        "vcards",
        "photo",
        existing_type=sa.String(length=500),
        type_=sa.Text(),
        existing_nullable=True,
    )
    op.alter_column(
        "vcards",
        "logo",
        existing_type=sa.String(length=500),
        type_=sa.Text(),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "vcards",
        "logo",
        existing_type=sa.Text(),
        type_=sa.String(length=500),
        existing_nullable=True,
    )
    op.alter_column(
        "vcards",
        "photo",
        existing_type=sa.Text(),
        type_=sa.String(length=500),
        existing_nullable=True,
    )
    op.alter_column(
        "templates",
        "logo",
        existing_type=sa.Text(),
        type_=sa.String(length=500),
        existing_nullable=True,
    )
