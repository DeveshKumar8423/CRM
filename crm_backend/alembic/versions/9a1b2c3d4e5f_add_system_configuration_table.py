from __future__ import annotations

"""add system_configurations table

Revision ID: 9a1b2c3d4e5f
Revises: 58616cc45735
Create Date: 2026-06-16 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9a1b2c3d4e5f'
down_revision: Union[str, Sequence[str], None] = '58616cc45735'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'system_configurations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_name', sa.String(length=200), nullable=False,
                  server_default='BlackPapers'),
        sa.Column('default_currency', sa.String(length=3), nullable=False,
                  server_default='INR'),
        sa.Column('date_format', sa.String(length=20), nullable=False,
                  server_default='DD/MM/YYYY'),
        sa.Column('timezone', sa.String(length=80), nullable=False,
                  server_default='Asia/Kolkata'),
        sa.Column('support_email', sa.String(length=255), nullable=False,
                  server_default='support@blackpapers.in'),
        sa.Column('maintenance_mode', sa.Boolean(), nullable=False,
                  server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('system_configurations')
