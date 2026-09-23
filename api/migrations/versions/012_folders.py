"""Make folders real rows instead of a string on each code.

qrs.folder was a free-text label, which meant a folder only existed while some
code still named it: you could not make an empty one, renaming meant rewriting
every code that mentioned it, and two codes could disagree about capitalisation
and land in two folders that looked identical.

This adds a folders table owned by a user and points qrs at it. The foreign key
is ON DELETE SET NULL so deleting a folder unfiles its codes rather than
deleting them.

Backfill: every distinct folder name already in use becomes a folder for its
owner, and its codes are pointed at it. "Untitled" is deliberately excluded —
it is the placeholder the create flow sends when nobody chose a folder, so
promoting it would hand every account a folder it never made, containing
everything.

qrs.folder is left in place on purpose. Dropping it in the same release would
500 every create coming from the build that is still running; it goes in a
later migration once nothing writes it.

Revision ID: 012_folders
Revises: 011_coupon_logo
"""

from alembic import op
import sqlalchemy as sa


revision = "012_folders"
down_revision = "011_coupon_logo"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "folders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE", name="fk_folders_user_id_users"
        ),
        sa.UniqueConstraint("user_id", "name", name="uq_folders_user_id_name"),
    )
    op.create_index("ix_folders_user_id", "folders", ["user_id"])

    op.add_column("qrs", sa.Column("folder_id", sa.Integer(), nullable=True))
    op.create_index("ix_qrs_folder_id", "qrs", ["folder_id"])
    op.create_foreign_key(
        "fk_qrs_folder_id_folders",
        "qrs",
        "folders",
        ["folder_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # One folder per (owner, name) actually in use, then point the codes at it.
    op.execute(
        """
        INSERT INTO folders (user_id, name)
        SELECT DISTINCT q.created_by, TRIM(q.folder)
        FROM qrs q
        WHERE q.created_by IS NOT NULL
          AND q.folder IS NOT NULL
          AND TRIM(q.folder) <> ''
          AND TRIM(q.folder) <> 'Untitled'
        ON CONFLICT (user_id, name) DO NOTHING
        """
    )
    op.execute(
        """
        UPDATE qrs q
        SET folder_id = f.id
        FROM folders f
        WHERE f.user_id = q.created_by
          AND f.name = TRIM(q.folder)
        """
    )


def downgrade() -> None:
    op.drop_constraint("fk_qrs_folder_id_folders", "qrs", type_="foreignkey")
    op.drop_index("ix_qrs_folder_id", table_name="qrs")
    op.drop_column("qrs", "folder_id")
    op.drop_index("ix_folders_user_id", table_name="folders")
    op.drop_table("folders")
