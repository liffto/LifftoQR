"""Store saved design templates against the user instead of their browser.

Templates were kept in localStorage, so a look saved on one device did not
exist on any other and clearing site data destroyed them silently.

Revision ID: 008_user_templates
Revises: 007_notifications
"""

from alembic import op
import sqlalchemy as sa


revision = "008_user_templates"
down_revision = "007_notifications"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_templates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(length=100), nullable=False),
        sa.Column("logo", sa.Text(), nullable=True),
        sa.Column("logo_size", sa.Float(), nullable=False, server_default="0.4"),
        sa.Column("frame_text", sa.String(length=100), nullable=True),
        sa.Column("frame", sa.String(length=100), nullable=False, server_default="none"),
        sa.Column(
            "body_pattern", sa.String(length=100), nullable=False, server_default="square"
        ),
        sa.Column(
            "body_gradient", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
        sa.Column(
            "body_color_1", sa.String(length=20), nullable=False, server_default="#000000"
        ),
        sa.Column(
            "body_color_2", sa.String(length=20), nullable=False, server_default="#000000"
        ),
        sa.Column("corner_style", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "corner_gradient", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
        sa.Column(
            "corner_color_1",
            sa.String(length=20),
            nullable=False,
            server_default="#000000",
        ),
        sa.Column(
            "corner_color_2",
            sa.String(length=20),
            nullable=False,
            server_default="#000000",
        ),
        sa.Column(
            "background", sa.String(length=20), nullable=False, server_default="#FFFFFF"
        ),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_user_templates_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_user_templates"),
        # Saving under a name that already exists replaces it, which is what the
        # design studio has always done locally.
        sa.UniqueConstraint("user_id", "label", name="uq_user_templates_user_id_label"),
    )
    op.create_index(
        "ix_user_templates_user_id", "user_templates", ["user_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index("ix_user_templates_user_id", table_name="user_templates")
    op.drop_table("user_templates")
