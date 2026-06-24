"""Field Service tables (Phase 1)."""

from typing import Union

from alembic import op
import sqlalchemy as sa

revision: str = "r7s8t9u0v1w2"
down_revision: Union[str, None] = "q6r7s8t9u0v1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "field_service_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("order_prefix", sa.String(length=10), nullable=False, server_default="FSO"),
        sa.Column("default_sla_hours", sa.Integer(), nullable=False, server_default="48"),
        sa.Column("auto_deduct_parts", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("allow_negative_parts", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("notify_roles_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("service_types_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id"),
    )

    op.create_table(
        "field_service_orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("order_number", sa.String(length=40), nullable=False),
        sa.Column("contact_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(length=20), nullable=False, server_default="repair"),
        sa.Column("priority", sa.String(length=20), nullable=False, server_default="normal"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="draft"),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("site_address", sa.Text(), nullable=True),
        sa.Column("site_contact_name", sa.String(length=120), nullable=True),
        sa.Column("site_contact_phone", sa.String(length=30), nullable=True),
        sa.Column("site_notes", sa.Text(), nullable=True),
        sa.Column("scheduled_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("scheduled_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("dispatched_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("arrived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("root_cause", sa.Text(), nullable=True),
        sa.Column("assigned_to_id", sa.Integer(), nullable=True),
        sa.Column("sla_due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["assigned_to_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "order_number", name="uq_field_service_orders_company_number"),
    )
    op.create_index("ix_field_service_orders_company_id", "field_service_orders", ["company_id"])
    op.create_index("ix_field_service_orders_order_number", "field_service_orders", ["order_number"])
    op.create_index("ix_field_service_orders_contact_id", "field_service_orders", ["contact_id"])
    op.create_index("ix_field_service_orders_type", "field_service_orders", ["type"])
    op.create_index("ix_field_service_orders_status", "field_service_orders", ["status"])

    op.create_table(
        "field_service_order_parts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("field_service_order_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Numeric(14, 4), nullable=False),
        sa.Column("stock_movement_id", sa.Integer(), nullable=True),
        sa.Column("issued_by_id", sa.Integer(), nullable=False),
        sa.Column("issued_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["field_service_order_id"], ["field_service_orders.id"]),
        sa.ForeignKeyConstraint(["issued_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["stock_movement_id"], ["stock_movements.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_field_service_order_parts_order_id", "field_service_order_parts", ["field_service_order_id"])


def downgrade() -> None:
    op.drop_index("ix_field_service_order_parts_order_id", table_name="field_service_order_parts")
    op.drop_table("field_service_order_parts")
    op.drop_index("ix_field_service_orders_status", table_name="field_service_orders")
    op.drop_index("ix_field_service_orders_type", table_name="field_service_orders")
    op.drop_index("ix_field_service_orders_contact_id", table_name="field_service_orders")
    op.drop_index("ix_field_service_orders_order_number", table_name="field_service_orders")
    op.drop_index("ix_field_service_orders_company_id", table_name="field_service_orders")
    op.drop_table("field_service_orders")
    op.drop_table("field_service_settings")
