"""Track signed-in devices so Manage Devices reflects real sessions.

Revision ID: 006_user_sessions
Revises: 005_add_user_phone
Create Date: 2026-08-11 04:40:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "006_user_sessions"
down_revision = "005_add_user_phone"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_sessions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("refresh_jti", sa.String(length=255), nullable=False),
        sa.Column("device_type", sa.String(length=20), nullable=False),
        sa.Column("device_name", sa.String(length=100), nullable=False),
        sa.Column("browser", sa.String(length=60), nullable=True),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["account_id"], ["accounts.id"], ondelete="CASCADE",
            name=op.f("fk_user_sessions_account_id_accounts"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE",
            name=op.f("fk_user_sessions_user_id_users"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_user_sessions")),
        sa.UniqueConstraint("refresh_jti", name=op.f("uq_user_sessions_refresh_jti")),
    )
    op.create_index(
        op.f("ix_user_sessions_user_id"), "user_sessions", ["user_id"]
    )
    op.create_index(
        op.f("ix_user_sessions_refresh_jti"), "user_sessions", ["refresh_jti"]
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_user_sessions_refresh_jti"), table_name="user_sessions")
    op.drop_index(op.f("ix_user_sessions_user_id"), table_name="user_sessions")
    op.drop_table("user_sessions")
