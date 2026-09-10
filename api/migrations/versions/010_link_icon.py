"""Give each link-tree link an optional icon.

A link tree was a list of labelled URLs with no way to say which is Instagram
and which is the website. The icon is a short key into a fixed set the frontend
knows how to draw (src/lib/linkIcons), plus a globe fallback for anything
custom — so it is a small string, not an image.

Revision ID: 010_link_icon
Revises: 009_scan_events
"""

from alembic import op
import sqlalchemy as sa


revision = "010_link_icon"
down_revision = "009_scan_events"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "link_tree_links",
        sa.Column("icon", sa.String(length=40), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("link_tree_links", "icon")
