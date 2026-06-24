"""Maintenance / CMMS tables (Phase 1)."""

from typing import Union

from alembic import op
import sqlalchemy as sa

revision: str = "q6r7s8t9u0v1"
down_revision: Union[str, None] = "p5q6r7s8t9u0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column("is_spare_part", sa.Boolean(), nullable=False, server_default=sa.false()),
    )

    op.create_table(
        "maintenance_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("work_order_prefix", sa.String(length=10), nullable=False, server_default="MWO"),
        sa.Column("asset_code_prefix", sa.String(length=10), nullable=False, server_default="AST"),
        sa.Column("default_pm_interval_days", sa.Integer(), nullable=False, server_default="90"),
        sa.Column("critical_downtime_alert_hours", sa.Integer(), nullable=False, server_default="4"),
        sa.Column("auto_deduct_spare_parts", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("allow_negative_spare_parts", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("notify_roles_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id"),
    )

    op.create_table(
        "maintenance_asset_categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_maintenance_asset_categories_company_id", "maintenance_asset_categories", ["company_id"])

    op.create_table(
        "maintenance_assets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("asset_code", sa.String(length=40), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="operational"),
        sa.Column("criticality", sa.String(length=20), nullable=False, server_default="medium"),
        sa.Column("location_notes", sa.String(length=255), nullable=True),
        sa.Column("manufacturer", sa.String(length=120), nullable=True),
        sa.Column("model", sa.String(length=120), nullable=True),
        sa.Column("serial_number", sa.String(length=80), nullable=True),
        sa.Column("purchase_date", sa.Date(), nullable=True),
        sa.Column("warranty_end", sa.Date(), nullable=True),
        sa.Column("vendor_contact_id", sa.Integer(), nullable=True),
        sa.Column("pm_interval_days", sa.Integer(), nullable=True),
        sa.Column("last_service_date", sa.Date(), nullable=True),
        sa.Column("next_pm_due_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["category_id"], ["maintenance_asset_categories.id"]),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["vendor_contact_id"], ["contacts.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "asset_code", name="uq_maintenance_assets_company_code"),
    )
    op.create_index("ix_maintenance_assets_company_id", "maintenance_assets", ["company_id"])
    op.create_index("ix_maintenance_assets_asset_code", "maintenance_assets", ["asset_code"])
    op.create_index("ix_maintenance_assets_status", "maintenance_assets", ["status"])

    op.create_table(
        "maintenance_work_orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("work_order_number", sa.String(length=40), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(length=20), nullable=False, server_default="breakdown"),
        sa.Column("priority", sa.String(length=20), nullable=False, server_default="normal"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="open"),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("reported_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("downtime_minutes", sa.Integer(), nullable=True),
        sa.Column("root_cause", sa.Text(), nullable=True),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("assigned_to_id", sa.Integer(), nullable=True),
        sa.Column("vendor_contact_id", sa.Integer(), nullable=True),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["asset_id"], ["maintenance_assets.id"]),
        sa.ForeignKeyConstraint(["assigned_to_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["vendor_contact_id"], ["contacts.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "work_order_number", name="uq_maintenance_wo_company_number"),
    )
    op.create_index("ix_maintenance_work_orders_company_id", "maintenance_work_orders", ["company_id"])
    op.create_index("ix_maintenance_work_orders_work_order_number", "maintenance_work_orders", ["work_order_number"])
    op.create_index("ix_maintenance_work_orders_asset_id", "maintenance_work_orders", ["asset_id"])
    op.create_index("ix_maintenance_work_orders_type", "maintenance_work_orders", ["type"])
    op.create_index("ix_maintenance_work_orders_status", "maintenance_work_orders", ["status"])

    op.create_table(
        "maintenance_wo_parts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("work_order_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Numeric(14, 4), nullable=False),
        sa.Column("stock_movement_id", sa.Integer(), nullable=True),
        sa.Column("issued_by_id", sa.Integer(), nullable=False),
        sa.Column("issued_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["issued_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["stock_movement_id"], ["stock_movements.id"]),
        sa.ForeignKeyConstraint(["work_order_id"], ["maintenance_work_orders.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_maintenance_wo_parts_work_order_id", "maintenance_wo_parts", ["work_order_id"])


def downgrade() -> None:
    op.drop_index("ix_maintenance_wo_parts_work_order_id", table_name="maintenance_wo_parts")
    op.drop_table("maintenance_wo_parts")
    op.drop_index("ix_maintenance_work_orders_status", table_name="maintenance_work_orders")
    op.drop_index("ix_maintenance_work_orders_type", table_name="maintenance_work_orders")
    op.drop_index("ix_maintenance_work_orders_asset_id", table_name="maintenance_work_orders")
    op.drop_index("ix_maintenance_work_orders_work_order_number", table_name="maintenance_work_orders")
    op.drop_index("ix_maintenance_work_orders_company_id", table_name="maintenance_work_orders")
    op.drop_table("maintenance_work_orders")
    op.drop_index("ix_maintenance_assets_status", table_name="maintenance_assets")
    op.drop_index("ix_maintenance_assets_asset_code", table_name="maintenance_assets")
    op.drop_index("ix_maintenance_assets_company_id", table_name="maintenance_assets")
    op.drop_table("maintenance_assets")
    op.drop_index("ix_maintenance_asset_categories_company_id", table_name="maintenance_asset_categories")
    op.drop_table("maintenance_asset_categories")
    op.drop_table("maintenance_settings")
    op.drop_column("products", "is_spare_part")
