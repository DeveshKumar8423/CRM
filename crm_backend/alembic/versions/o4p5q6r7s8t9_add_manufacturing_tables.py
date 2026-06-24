"""Manufacturing / MRP tables."""

from typing import Union

from alembic import op
import sqlalchemy as sa

revision: str = "o4p5q6r7s8t9"
down_revision: Union[str, None] = "n3o4p5q6r7s8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("products", sa.Column("is_manufactured", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("products", sa.Column("is_raw_material", sa.Boolean(), nullable=False, server_default=sa.false()))

    op.create_table(
        "manufacturing_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("work_order_prefix", sa.String(length=10), nullable=False, server_default="WO"),
        sa.Column("auto_reserve_materials_on_release", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("require_qc_before_receipt", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("default_scrap_pct", sa.Numeric(5, 2), nullable=False, server_default="0"),
        sa.Column("allow_negative_issue", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("default_checklist_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id"),
    )

    op.create_table(
        "bom_headers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("version", sa.String(length=20), nullable=False, server_default="1.0"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="draft"),
        sa.Column("output_qty", sa.Numeric(12, 2), nullable=False, server_default="1"),
        sa.Column("output_uom", sa.String(length=30), nullable=False, server_default="Unit"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "product_id", "version", name="uq_bom_headers_product_version"),
    )

    op.create_table(
        "bom_lines",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("bom_id", sa.Integer(), nullable=False),
        sa.Column("component_product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Numeric(12, 4), nullable=False),
        sa.Column("scrap_pct", sa.Numeric(5, 2), nullable=False, server_default="0"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["bom_id"], ["bom_headers.id"]),
        sa.ForeignKeyConstraint(["component_product_id"], ["products.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.add_column("products", sa.Column("default_bom_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_products_default_bom_id", "products", "bom_headers", ["default_bom_id"], ["id"])

    op.create_table(
        "work_orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("work_order_number", sa.String(length=40), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("bom_id", sa.Integer(), nullable=True),
        sa.Column("sales_order_id", sa.Integer(), nullable=True),
        sa.Column("sales_order_line_id", sa.Integer(), nullable=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="draft"),
        sa.Column("planned_qty", sa.Numeric(12, 2), nullable=False),
        sa.Column("completed_qty", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("scrap_qty", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("planned_start", sa.Date(), nullable=True),
        sa.Column("planned_end", sa.Date(), nullable=True),
        sa.Column("actual_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("actual_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("assigned_to_id", sa.Integer(), nullable=True),
        sa.Column("priority", sa.String(length=10), nullable=False, server_default="normal"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["bom_id"], ["bom_headers.id"]),
        sa.ForeignKeyConstraint(["sales_order_id"], ["sales_orders.id"]),
        sa.ForeignKeyConstraint(["sales_order_line_id"], ["sales_order_line_items.id"]),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
        sa.ForeignKeyConstraint(["assigned_to_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "work_order_number", name="uq_work_orders_company_number"),
    )

    op.create_table(
        "work_order_material_plans",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("work_order_id", sa.Integer(), nullable=False),
        sa.Column("component_product_id", sa.Integer(), nullable=False),
        sa.Column("required_qty", sa.Numeric(12, 4), nullable=False),
        sa.Column("issued_qty", sa.Numeric(12, 4), nullable=False, server_default="0"),
        sa.Column("unit", sa.String(length=30), nullable=False, server_default="Unit"),
        sa.ForeignKeyConstraint(["work_order_id"], ["work_orders.id"]),
        sa.ForeignKeyConstraint(["component_product_id"], ["products.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "work_order_material_issues",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("work_order_id", sa.Integer(), nullable=False),
        sa.Column("component_product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Numeric(12, 4), nullable=False),
        sa.Column("stock_movement_id", sa.Integer(), nullable=True),
        sa.Column("issued_by_id", sa.Integer(), nullable=False),
        sa.Column("issued_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["work_order_id"], ["work_orders.id"]),
        sa.ForeignKeyConstraint(["component_product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["stock_movement_id"], ["stock_movements.id"]),
        sa.ForeignKeyConstraint(["issued_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "work_order_receipts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("work_order_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Numeric(12, 2), nullable=False),
        sa.Column("stock_movement_id", sa.Integer(), nullable=True),
        sa.Column("received_by_id", sa.Integer(), nullable=False),
        sa.Column("received_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["work_order_id"], ["work_orders.id"]),
        sa.ForeignKeyConstraint(["stock_movement_id"], ["stock_movements.id"]),
        sa.ForeignKeyConstraint(["received_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "quality_inspections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("work_order_id", sa.Integer(), nullable=False),
        sa.Column("inspection_number", sa.String(length=40), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("checklist_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("inspected_by_id", sa.Integer(), nullable=True),
        sa.Column("inspected_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["work_order_id"], ["work_orders.id"]),
        sa.ForeignKeyConstraint(["inspected_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "inspection_number", name="uq_quality_inspections_company_number"),
    )


def downgrade() -> None:
    op.drop_table("quality_inspections")
    op.drop_table("work_order_receipts")
    op.drop_table("work_order_material_issues")
    op.drop_table("work_order_material_plans")
    op.drop_table("work_orders")
    op.drop_constraint("fk_products_default_bom_id", "products", type_="foreignkey")
    op.drop_column("products", "default_bom_id")
    op.drop_table("bom_lines")
    op.drop_table("bom_headers")
    op.drop_table("manufacturing_settings")
    op.drop_column("products", "is_raw_material")
    op.drop_column("products", "is_manufactured")
