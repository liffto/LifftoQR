"""Record each scan individually so unique scans can be counted later.

Until now a scan only bumped a single integer on the QR, so "how many people
scanned this?" was unanswerable — 40 scans could be forty visitors or one
person refreshing. The total keeps counting every scan exactly as before; this
table is what a separate unique figure will be derived from.

Revision ID: 009_scan_events
Revises: 008_user_templates
"""

from alembic import op
import sqlalchemy as sa


revision = "009_scan_events"
down_revision = "008_user_templates"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "scan_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("qr_id", sa.Integer(), nullable=False),
        # A keyed hash of IP + User-Agent — never the address itself.
        sa.Column("visitor_hash", sa.String(length=64), nullable=True),
        sa.Column("device_type", sa.String(length=20), nullable=True),
        sa.Column("browser", sa.String(length=60), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["qr_id"],
            ["qrs.id"],
            name="fk_scan_events_qr_id_qrs",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_scan_events"),
    )
    op.create_index("ix_scan_events_qr_id", "scan_events", ["qr_id"], unique=False)
    op.create_index(
        "ix_scan_events_visitor_hash", "scan_events", ["visitor_hash"], unique=False
    )
    # Unique-visitor counts and "scans in the last N days" are the only two
    # questions this table gets asked, so both are indexed for it.
    op.create_index(
        "ix_scan_events_qr_id_visitor_hash",
        "scan_events",
        ["qr_id", "visitor_hash"],
        unique=False,
    )
    op.create_index(
        "ix_scan_events_qr_id_created_at",
        "scan_events",
        ["qr_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_scan_events_qr_id_created_at", table_name="scan_events")
    op.drop_index("ix_scan_events_qr_id_visitor_hash", table_name="scan_events")
    op.drop_index("ix_scan_events_visitor_hash", table_name="scan_events")
    op.drop_index("ix_scan_events_qr_id", table_name="scan_events")
    op.drop_table("scan_events")
