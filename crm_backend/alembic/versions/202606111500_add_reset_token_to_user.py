"""add reset token to user

Revision ID: 202606111500
Revises: a137febc890b
Create Date: 2026-06-11
"""

from alembic import op
import sqlalchemy as sa

revision = "202606111500"
down_revision = "a137febc890b"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column("reset_token", sa.String(), nullable=True)
    )

    op.add_column(
        "users",
        sa.Column("reset_token_expiry", sa.DateTime(timezone=True), nullable=True)
    )


def downgrade():
    op.drop_column("users", "reset_token_expiry")
    op.drop_column("users", "reset_token")