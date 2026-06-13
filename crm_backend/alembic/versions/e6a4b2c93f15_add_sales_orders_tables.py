"""add sales orders tables

Revision ID: e6a4b2c93f15
Revises: d5f3a1b82e04
Create Date: 2026-06-13 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e6a4b2c93f15"
down_revision: Union[str, Sequence[str], None] = "d5f3a1b82e04"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "sales_orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("quotation_id", sa.Integer(), nullable=True),
        sa.Column("deal_id", sa.Integer(), nullable=True),
        sa.Column("lead_id", sa.Integer(), nullable=True),
        sa.Column("contact_id", sa.Integer(), nullable=True),
        sa.Column("assigned_to_id", sa.Integer(), nullable=True),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("confirmed_by_id", sa.Integer(), nullable=True),
        sa.Column("closed_by_id", sa.Integer(), nullable=True),
        sa.Column("parent_order_id", sa.Integer(), nullable=True),
        sa.Column("root_order_id", sa.Integer(), nullable=True),
        sa.Column("order_number", sa.String(length=40), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("order_type", sa.String(length=30), nullable=False),
        sa.Column("source_type", sa.String(length=20), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("order_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("confirmation_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("internal_target_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("client_name", sa.String(length=120), nullable=True),
        sa.Column("client_email", sa.String(length=255), nullable=True),
        sa.Column("client_phone", sa.String(length=30), nullable=True),
        sa.Column("client_org", sa.String(length=200), nullable=True),
        sa.Column("attention_to", sa.String(length=120), nullable=True),
        sa.Column("billing_address", sa.Text(), nullable=True),
        sa.Column("delivery_address", sa.Text(), nullable=True),
        sa.Column("subtotal", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("line_discount_total", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("header_discount_amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("header_discount_percent", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("total_tax", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("grand_total", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("billing_notes", sa.Text(), nullable=True),
        sa.Column("payment_milestone_notes", sa.Text(), nullable=True),
        sa.Column("delivery_instructions", sa.Text(), nullable=True),
        sa.Column("internal_notes", sa.Text(), nullable=True),
        sa.Column("hold_reason", sa.Text(), nullable=True),
        sa.Column("cancellation_reason", sa.Text(), nullable=True),
        sa.Column("completion_notes", sa.Text(), nullable=True),
        sa.Column("fulfillment_progress", sa.Integer(), nullable=False),
        sa.Column("billing_status", sa.String(length=30), nullable=False),
        sa.Column("preparation_status", sa.String(length=30), nullable=False),
        sa.Column("share_token", sa.String(length=64), nullable=True),
        sa.Column("sent_for_confirmation_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("hold_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("hold_resume_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_status_change_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["assigned_to_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["closed_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["confirmed_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["deal_id"], ["deals.id"]),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"]),
        sa.ForeignKeyConstraint(["parent_order_id"], ["sales_orders.id"]),
        sa.ForeignKeyConstraint(["quotation_id"], ["quotations.id"]),
        sa.ForeignKeyConstraint(["root_order_id"], ["sales_orders.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sales_orders_order_number"), "sales_orders", ["order_number"], unique=False)
    op.create_index(op.f("ix_sales_orders_status"), "sales_orders", ["status"], unique=False)
    op.create_index(op.f("ix_sales_orders_share_token"), "sales_orders", ["share_token"], unique=True)

    op.create_table(
        "sales_order_line_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sales_order_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=True),
        sa.Column("quotation_line_item_id", sa.Integer(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("section", sa.String(length=100), nullable=True),
        sa.Column("item_name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("quantity", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("unit", sa.String(length=30), nullable=False),
        sa.Column("unit_price", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("discount_percent", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("discount_amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("tax_rate", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("line_subtotal", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("line_total", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("fulfilled_quantity", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("fulfillment_status", sa.String(length=20), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["quotation_line_item_id"], ["quotation_line_items.id"]),
        sa.ForeignKeyConstraint(["sales_order_id"], ["sales_orders.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "sales_order_milestones",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sales_order_id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["sales_order_id"], ["sales_orders.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("sales_order_milestones")
    op.drop_table("sales_order_line_items")
    op.drop_index(op.f("ix_sales_orders_share_token"), table_name="sales_orders")
    op.drop_index(op.f("ix_sales_orders_status"), table_name="sales_orders")
    op.drop_index(op.f("ix_sales_orders_order_number"), table_name="sales_orders")
    op.drop_table("sales_orders")
