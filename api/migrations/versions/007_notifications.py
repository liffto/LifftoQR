"""Persist notification preferences and store in-app notifications.

Revision ID: 007_notifications
Revises: 006_user_sessions
Create Date: 2026-08-11 13:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "007_notifications"
down_revision = "006_user_sessions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Defaults match what the UI showed before these were persisted, so
    # existing users keep the behaviour they already saw.
    op.add_column(
        "users",
        sa.Column(
            "notify_scans", sa.Boolean(), nullable=False, server_default=sa.true()
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "notify_weekly", sa.Boolean(), nullable=False, server_default=sa.true()
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "notify_product", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
    )

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("kind", sa.String(length=30), nullable=False),
        sa.Column("qr_id", sa.Integer(), nullable=True),
        sa.Column("qr_name", sa.String(length=255), nullable=True),
        sa.Column("scan_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("day", sa.Date(), nullable=True),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["account_id"], ["accounts.id"], ondelete="CASCADE",
            name=op.f("fk_notifications_account_id_accounts"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE",
            name=op.f("fk_notifications_user_id_users"),
        ),
        sa.ForeignKeyConstraint(
            ["qr_id"], ["qrs.id"], ondelete="CASCADE",
            name=op.f("fk_notifications_qr_id_qrs"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_notifications")),
    )
    op.create_index(op.f("ix_notifications_user_id"), "notifications", ["user_id"])
    op.create_index(op.f("ix_notifications_qr_id"), "notifications", ["qr_id"])
    op.create_index(op.f("ix_notifications_day"), "notifications", ["day"])


def downgrade() -> None:
    op.drop_index(op.f("ix_notifications_day"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_qr_id"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_user_id"), table_name="notifications")
    op.drop_table("notifications")
    op.drop_column("users", "notify_product")
    op.drop_column("users", "notify_weekly")
    op.drop_column("users", "notify_scans")
