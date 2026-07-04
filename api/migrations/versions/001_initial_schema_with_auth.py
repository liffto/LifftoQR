"""initial schema with auth

Revision ID: 001_initial
Revises: 
Create Date: 2026-06-28 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create accounts table
    op.create_table(
        'accounts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), server_default=sa.text('now()'), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_accounts')),
        sa.UniqueConstraint('slug', name=op.f('uq_account_slug')),
    )
    op.create_index(op.f('ix_accounts_slug'), 'accounts', ['slug'], unique=False)

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), server_default=sa.text('now()'), nullable=False),
        sa.Column('email', sa.String(320), nullable=False),
        sa.Column('first_name', sa.String(200), nullable=True),
        sa.Column('last_name', sa.String(200), nullable=True),
        sa.Column('password_hash', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_superuser', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('is_staff', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], name=op.f('fk_users_account_id_accounts'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_users')),
        sa.UniqueConstraint('account_id', 'email', name=op.f('uq_user_account_email')),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)

    # Create roles table
    op.create_table(
        'roles',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), server_default=sa.text('now()'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], name=op.f('fk_roles_account_id_accounts'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_roles')),
        sa.UniqueConstraint('account_id', 'name', name=op.f('uq_role_account_name')),
    )

    # Create user_roles table
    op.create_table(
        'user_roles',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), server_default=sa.text('now()'), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], name=op.f('fk_user_roles_role_id_roles'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_user_roles_user_id_users'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], name=op.f('fk_user_roles_account_id_accounts'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_user_roles')),
        sa.UniqueConstraint('account_id', 'user_id', 'role_id', name=op.f('uq_user_role_account')),
    )

    # Create token_blocklists table
    op.create_table(
        'token_blocklists',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=False),
        sa.Column('jti', sa.String(255), nullable=False),
        sa.Column('reason', sa.String(100), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], name=op.f('fk_token_blocklists_account_id_accounts'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_token_blocklists')),
        sa.UniqueConstraint('jti', name=op.f('uq_token_blocklists_jti')),
    )

    # Create email_verifications table
    op.create_table(
        'email_verifications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(500), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_used', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], name=op.f('fk_email_verifications_account_id_accounts'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_email_verifications_user_id_users'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_email_verifications')),
        sa.UniqueConstraint('token', name=op.f('uq_email_verifications_token')),
    )


def downgrade() -> None:
    # Drop tables in reverse order of creation
    op.drop_table('email_verifications')
    op.drop_table('token_blocklists')
    op.drop_table('user_roles')
    op.drop_table('roles')
    op.drop_table('users')
    op.drop_table('accounts')
