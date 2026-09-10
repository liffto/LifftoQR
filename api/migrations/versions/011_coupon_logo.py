"""Give a coupon an optional brand logo.

The coupon page had only the ticket glyph to stand in for a brand. The logo is
a compressed image data URL — so a Text column, like the other stored images —
and optional: an old coupon has none and the page keeps the glyph.

Revision ID: 011_coupon_logo
Revises: 010_link_icon
"""

from alembic import op
import sqlalchemy as sa


revision = "011_coupon_logo"
down_revision = "010_link_icon"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("coupons", sa.Column("logo", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("coupons", "logo")
