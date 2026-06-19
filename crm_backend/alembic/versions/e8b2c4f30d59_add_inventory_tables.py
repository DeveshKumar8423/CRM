"""add inventory fields and stock movements

Revision ID: e8b2c4f30d59
Revises: d7a1b3f29c48
Create Date: 2026-06-19 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e8b2c4f30d59"
down_revision: Union[str, Sequence[str], None] = "d7a1b3f29c48"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("products", sa.Column("inventory_tracked", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("products", sa.Column("on_hand_quantity", sa.Numeric(precision=12, scale=2), nullable=False, server_default="0"))
    op.add_column("products", sa.Column("unit_valuation", sa.Numeric(precision=14, scale=2), nullable=False, server_default="0"))
    op.add_column("products", sa.Column("reorder_level", sa.Numeric(precision=12, scale=2), nullable=True))
    op.add_column("products", sa.Column("opening_recorded", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("products", sa.Column("last_movement_at", sa.DateTime(timezone=True), nullable=True))

    op.create_table(
        "stock_movements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("recorded_by_id", sa.Integer(), nullable=False),
        sa.Column("movement_type", sa.String(length=20), nullable=False),
        sa.Column("direction", sa.String(length=3), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("unit_value", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("total_value", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("quantity_before", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("quantity_after", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("movement_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("reference_type", sa.String(length=30), nullable=True),
        sa.Column("reference_id", sa.Integer(), nullable=True),
        sa.Column("reference_number", sa.String(length=100), nullable=True),
        sa.Column("source_module", sa.String(length=30), nullable=False),
        sa.Column("reason", sa.String(length=100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("negative_override", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["recorded_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_stock_movements_movement_type"), "stock_movements", ["movement_type"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_stock_movements_movement_type"), table_name="stock_movements")
    op.drop_table("stock_movements")
    op.drop_column("products", "last_movement_at")
    op.drop_column("products", "opening_recorded")
    op.drop_column("products", "reorder_level")
    op.drop_column("products", "unit_valuation")
    op.drop_column("products", "on_hand_quantity")
    op.drop_column("products", "inventory_tracked")
