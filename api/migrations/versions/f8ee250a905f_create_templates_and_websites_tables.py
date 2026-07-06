"""create qrs, templates and websites tables

Revision ID: f8ee250a905f
Revises: 002_google_sign_in
Create Date: 2026-07-05 14:09:38.476246
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f8ee250a905f"
down_revision: Union[str, Sequence[str], None] = "002_google_sign_in"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # ------------------------------------------------------------------
    # QRS TABLE
    # ------------------------------------------------------------------
    op.create_table(
    "qrs",
    sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
    sa.Column("type_key", sa.String(100), nullable=False),
    sa.Column("type", sa.String(100), nullable=False),
    sa.Column("name", sa.String(255), nullable=False),
    sa.Column("url", sa.String(500), nullable=True),
    sa.Column("slug", sa.String(100), nullable=False, unique=True),
    sa.Column(
        "dynamic",
        sa.Boolean(),
        nullable=False,
        server_default=sa.text("false"),
    ),
    sa.Column("qr_type", sa.String(100), nullable=False),
    sa.Column("folder", sa.String(100), nullable=True),
    sa.Column(
        "status",
        sa.Boolean(),
        nullable=False,
        server_default=sa.text("true"),
    ),
    sa.Column(
        "scans",
        sa.Integer(),
        nullable=False,
        server_default="0",
    ),
    sa.Column("edited_on", sa.Date(), nullable=True),
    sa.Column("created_by", sa.Integer(), nullable=True),
    sa.Column(
        "created_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    sa.Column("updated_by", sa.Integer(), nullable=True),

    sa.Column(
        "updated_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    )

    # ------------------------------------------------------------------
    # TEMPLATES
    # ------------------------------------------------------------------

    op.create_table(
    "templates",

    sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),

    sa.Column(
        "qr_id",
        sa.Integer(),
        sa.ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    ),

    sa.Column("logo", sa.String(500), nullable=True),

    sa.Column(
        "logo_size",
        sa.Float(),
        nullable=False,
        server_default="0.4",
    ),

    sa.Column(
        "frame_text",
        sa.String(100),
        nullable=True,
    ),

    sa.Column(
        "frame",
        sa.String(100),
        nullable=False,
        server_default="none",
    ),

    sa.Column(
        "body_pattern",
        sa.String(100),
        nullable=False,
        server_default="square",
    ),

    sa.Column(
        "body_gradient",
        sa.Boolean(),
        nullable=False,
        server_default=sa.text("false"),
    ),

    sa.Column(
        "body_color_1",
        sa.String(20),
        nullable=False,
        server_default="#000000",
    ),

    sa.Column(
        "body_color_2",
        sa.String(20),
        nullable=False,
        server_default="#000000",
    ),

    sa.Column(
        "corner_style",
        sa.Integer(),
        nullable=False,
        server_default="0",
    ),

    sa.Column(
        "corner_gradient",
        sa.Boolean(),
        nullable=False,
        server_default=sa.text("false"),
    ),

    sa.Column(
        "corner_color_1",
        sa.String(20),
        nullable=False,
        server_default="#000000",
    ),

    sa.Column(
        "corner_color_2",
        sa.String(20),
        nullable=False,
        server_default="#000000",
    ),

    sa.Column(
        "background",
        sa.String(20),
        nullable=False,
        server_default="#FFFFFF",
    ),

    sa.Column("created_by", sa.Integer(), nullable=True),

    sa.Column(
        "created_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),

    sa.Column("updated_by", sa.Integer(), nullable=True),

    sa.Column(
        "updated_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    )

    # ------------------------------------------------------------------
    # WEBSITE CONTENT
    # ------------------------------------------------------------------

    op.create_table(
    "websites",
    sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
    sa.Column(
        "qr_id",
        sa.Integer(),
        sa.ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    ),
    sa.Column(
        "url",
        sa.String(500),
        nullable=False,
    ),
    sa.Column("created_by", sa.Integer(), nullable=True),
    sa.Column(
        "created_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    sa.Column("updated_by", sa.Integer(), nullable=True),
    sa.Column(
        "updated_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    )

  

    # ------------------------------------------------------------------
    # TEXT CONTENT
    # ------------------------------------------------------------------

    op.create_table(
    "texts",
    sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
    sa.Column(
        "qr_id",
        sa.Integer(),
        sa.ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    ),
    sa.Column(
        "text",
        sa.Text(),
        nullable=False,
    ),
    sa.Column("created_by", sa.Integer(), nullable=True),
    sa.Column(
        "created_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    sa.Column("updated_by", sa.Integer(), nullable=True),
    sa.Column(
        "updated_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    )


    # ------------------------------------------------------------------
    # WIFI CONTENT
    # ------------------------------------------------------------------

    op.create_table(
    "wifi",
    sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),

    sa.Column(
        "qr_id",
        sa.Integer(),
        sa.ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    ),

    sa.Column(
        "ssid",
        sa.String(255),
        nullable=False,
    ),

    sa.Column(
        "auth",
        sa.String(50),
        nullable=False,
    ),

    sa.Column(
        "hidden",
        sa.Boolean(),
        nullable=False,
        server_default=sa.text("false"),
    ),

    sa.Column(
        "password",
        sa.String(255),
        nullable=True,
    ),

    sa.Column("created_by", sa.Integer(), nullable=True),

    sa.Column(
        "created_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),

    sa.Column("updated_by", sa.Integer(), nullable=True),

    sa.Column(
        "updated_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    )

    # ------------------------------------------------------------------
    # VCARD CONTENT
    # ------------------------------------------------------------------

    op.create_table(
    "vcards",

    sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),

    sa.Column(
        "qr_id",
        sa.Integer(),
        sa.ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    ),

    sa.Column("photo", sa.String(500), nullable=True),
    sa.Column("logo", sa.String(500), nullable=True),

    sa.Column("first_name", sa.String(100), nullable=False),
    sa.Column("last_name", sa.String(100), nullable=True),

    sa.Column("org", sa.String(255), nullable=True),
    sa.Column("title", sa.String(255), nullable=True),

    sa.Column("phone", sa.String(30), nullable=True),
    sa.Column("work_phone", sa.String(30), nullable=True),

    sa.Column("email", sa.String(255), nullable=True),
    sa.Column("url", sa.String(500), nullable=True),

    sa.Column("street", sa.String(255), nullable=True),
    sa.Column("city", sa.String(100), nullable=True),
    sa.Column("state", sa.String(100), nullable=True),
    sa.Column("zip", sa.String(20), nullable=True),
    sa.Column("country", sa.String(100), nullable=True),

    sa.Column("note", sa.Text(), nullable=True),

    sa.Column("created_by", sa.Integer(), nullable=True),

    sa.Column(
        "created_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),

    sa.Column("updated_by", sa.Integer(), nullable=True),

    sa.Column(
        "updated_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    )

    # ------------------------------------------------------------------
    # EMAIL CONTENT
    # ------------------------------------------------------------------

    op.create_table(
    "emails",

    sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),

    sa.Column(
        "qr_id",
        sa.Integer(),
        sa.ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    ),

    sa.Column(
        "to_email",
        sa.String(255),
        nullable=False,
    ),

    sa.Column(
        "subject",
        sa.String(500),
        nullable=True,
    ),

    sa.Column(
        "body",
        sa.Text(),
        nullable=True,
    ),

    sa.Column("created_by", sa.Integer(), nullable=True),

    sa.Column(
        "created_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),

    sa.Column("updated_by", sa.Integer(), nullable=True),

    sa.Column(
        "updated_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    )

    # ------------------------------------------------------------------
    # SMS CONTENT
    # ------------------------------------------------------------------

    op.create_table(
    "sms",

    sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),

    sa.Column(
        "qr_id",
        sa.Integer(),
        sa.ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    ),

    sa.Column(
        "number",
        sa.String(30),
        nullable=False,
    ),

    sa.Column(
        "message",
        sa.Text(),
        nullable=True,
    ),

    sa.Column("created_by", sa.Integer(), nullable=True),

    sa.Column(
        "created_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),

    sa.Column("updated_by", sa.Integer(), nullable=True),

    sa.Column(
        "updated_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    )

    # ------------------------------------------------------------------
    # PHONE CONTENT
    # ------------------------------------------------------------------

    op.create_table(
    "phones",

    sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),

    sa.Column(
        "qr_id",
        sa.Integer(),
        sa.ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    ),

    sa.Column(
        "phone",
        sa.String(30),
        nullable=False,
    ),

    sa.Column("created_by", sa.Integer(), nullable=True),

    sa.Column(
        "created_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),

    sa.Column("updated_by", sa.Integer(), nullable=True),

    sa.Column(
        "updated_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    )

    # ------------------------------------------------------------------
    # WHATSAPP CONTENT
    # ------------------------------------------------------------------

    op.create_table(
    "whatsapp",

    sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),

    sa.Column(
        "qr_id",
        sa.Integer(),
        sa.ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    ),

    sa.Column(
        "country_code",
        sa.String(10),
        nullable=False,
    ),

    sa.Column(
        "phone",
        sa.String(30),
        nullable=False,
    ),

    sa.Column(
        "message",
        sa.Text(),
        nullable=True,
    ),

    sa.Column("created_by", sa.Integer(), nullable=True),

    sa.Column(
        "created_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),

    sa.Column("updated_by", sa.Integer(), nullable=True),

    sa.Column(
        "updated_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    )

    # ------------------------------------------------------------------
    # EVENT CONTENT
    # ------------------------------------------------------------------

    op.create_table(
    "events",

    sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),

    sa.Column(
        "qr_id",
        sa.Integer(),
        sa.ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    ),

    sa.Column(
        "title",
        sa.String(255),
        nullable=False,
    ),

    sa.Column(
        "location",
        sa.String(500),
        nullable=True,
    ),

    sa.Column(
        "start",
        sa.DateTime(),
        nullable=False,
    ),

    sa.Column(
        "end",
        sa.DateTime(),
        nullable=False,
    ),

    sa.Column(
        "all_day",
        sa.Boolean(),
        nullable=False,
        server_default=sa.text("false"),
    ),

    sa.Column(
        "description",
        sa.Text(),
        nullable=True,
    ),

    sa.Column("created_by", sa.Integer(), nullable=True),

    sa.Column(
        "created_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),

    sa.Column("updated_by", sa.Integer(), nullable=True),

    sa.Column(
        "updated_at",
        sa.DateTime(),
        nullable=False,
        server_default=sa.func.now(),
    ),
    )
    # ------------------------------------------------------------------
    # INDEXES
    # ------------------------------------------------------------------

    op.create_index("ix_qrs_slug", "qrs", ["slug"], unique=True)
    op.create_index("ix_qrs_name", "qrs", ["name"])
    op.create_index("ix_qrs_type_key", "qrs", ["type_key"])

    op.create_index("ix_templates_qr_id", "templates", ["qr_id"])

    op.create_index("ix_websites_qr_id", "websites", ["qr_id"])
    op.create_index("ix_vcards_qr_id", "vcards", ["qr_id"])
    op.create_index("ix_texts_qr_id", "texts", ["qr_id"])
    op.create_index("ix_emails_qr_id", "emails", ["qr_id"])
    op.create_index("ix_sms_qr_id", "sms", ["qr_id"])
    op.create_index("ix_phones_qr_id", "phones", ["qr_id"])
    op.create_index("ix_whatsapp_qr_id", "whatsapp", ["qr_id"])
    op.create_index("ix_events_qr_id", "events", ["qr_id"])


def downgrade() -> None:

    # Drop indexes
    op.drop_index("ix_events_qr_id", table_name="events")
    op.drop_index("ix_whatsapp_qr_id", table_name="whatsapp")
    op.drop_index("ix_phones_qr_id", table_name="phones")
    op.drop_index("ix_sms_qr_id", table_name="sms")
    op.drop_index("ix_emails_qr_id", table_name="emails")
    op.drop_index("ix_vcards_qr_id", table_name="vcards")
    op.drop_index("ix_wifi_qr_id", table_name="wifi")
    op.drop_index("ix_texts_qr_id", table_name="texts")
    op.drop_index("ix_websites_qr_id", table_name="websites")
    op.drop_index("ix_templates_qr_id", table_name="templates")

    op.drop_index("ix_qrs_type_key", table_name="qrs")
    op.drop_index("ix_qrs_name", table_name="qrs")
    op.drop_index("ix_qrs_slug", table_name="qrs")

    # Drop child tables
    op.drop_table("events")
    op.drop_table("whatsapp")
    op.drop_table("phones")
    op.drop_table("sms")
    op.drop_table("emails")
    op.drop_table("vcards")
    op.drop_table("wifi")
    op.drop_table("texts")
    op.drop_table("websites")
    op.drop_table("templates")

    # Drop parent table
    op.drop_table("qrs")