"""add warehouse location and stock tables

Revision ID: f9c3d5e41a60
Revises: e8b2c4f30d59
Create Date: 2026-06-19 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f9c3d5e41a60"
down_revision: Union[str, Sequence[str], None] = "e8b2c4f30d59"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "warehouse_locations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=True),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("location_code", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("location_type", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("is_default_receiving", sa.Boolean(), nullable=False),
        sa.Column("is_default_dispatch", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["parent_id"], ["warehouse_locations.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "location_code", name="uq_warehouse_location_code"),
    )
    op.create_index(op.f("ix_warehouse_locations_location_code"), "warehouse_locations", ["location_code"], unique=False)
    op.create_index(op.f("ix_warehouse_locations_location_type"), "warehouse_locations", ["location_type"], unique=False)
    op.create_index(op.f("ix_warehouse_locations_status"), "warehouse_locations", ["status"], unique=False)

    op.create_table(
        "location_stocks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("location_id", sa.Integer(), nullable=False),
        sa.Column("on_hand_quantity", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("unit_valuation", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("reorder_level", sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column("last_movement_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["location_id"], ["warehouse_locations.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("product_id", "location_id", name="uq_location_stock_product"),
    )

    op.create_table(
        "location_stock_movements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("location_id", sa.Integer(), nullable=False),
        sa.Column("recorded_by_id", sa.Integer(), nullable=False),
        sa.Column("linked_stock_movement_id", sa.Integer(), nullable=True),
        sa.Column("movement_type", sa.String(length=20), nullable=False),
        sa.Column("direction", sa.String(length=3), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("unit_value", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("total_value", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("quantity_before", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("quantity_after", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("movement_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("transfer_reference", sa.String(length=50), nullable=True),
        sa.Column("reference_number", sa.String(length=100), nullable=True),
        sa.Column("reason", sa.String(length=100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("negative_override", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["linked_stock_movement_id"], ["stock_movements.id"]),
        sa.ForeignKeyConstraint(["location_id"], ["warehouse_locations.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["recorded_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_location_stock_movements_movement_type"), "location_stock_movements", ["movement_type"], unique=False)
    op.create_index(op.f("ix_location_stock_movements_transfer_reference"), "location_stock_movements", ["transfer_reference"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_location_stock_movements_transfer_reference"), table_name="location_stock_movements")
    op.drop_index(op.f("ix_location_stock_movements_movement_type"), table_name="location_stock_movements")
    op.drop_table("location_stock_movements")
    op.drop_table("location_stocks")
    op.drop_index(op.f("ix_warehouse_locations_status"), table_name="warehouse_locations")
    op.drop_index(op.f("ix_warehouse_locations_location_type"), table_name="warehouse_locations")
    op.drop_index(op.f("ix_warehouse_locations_location_code"), table_name="warehouse_locations")
    op.drop_table("warehouse_locations")
