"""add purchase orders tables

Revision ID: d7a1b3f29c48
Revises: c4f9a2e18b37
Create Date: 2026-06-19 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d7a1b3f29c48"
down_revision: Union[str, Sequence[str], None] = "c4f9a2e18b37"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "purchase_orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=False),
        sa.Column("reviewed_by_id", sa.Integer(), nullable=True),
        sa.Column("approved_by_id", sa.Integer(), nullable=True),
        sa.Column("sent_by_id", sa.Integer(), nullable=True),
        sa.Column("closed_by_id", sa.Integer(), nullable=True),
        sa.Column("deal_id", sa.Integer(), nullable=True),
        sa.Column("contact_id", sa.Integer(), nullable=True),
        sa.Column("po_number", sa.String(length=40), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("vendor_name", sa.String(length=200), nullable=False),
        sa.Column("vendor_contact", sa.String(length=120), nullable=True),
        sa.Column("vendor_email", sa.String(length=255), nullable=True),
        sa.Column("vendor_phone", sa.String(length=30), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("payment_terms", sa.String(length=40), nullable=True),
        sa.Column("po_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expected_delivery_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivery_location", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("internal_reference", sa.String(length=100), nullable=True),
        sa.Column("vendor_quote_reference", sa.String(length=100), nullable=True),
        sa.Column("cost_center", sa.String(length=100), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("reviewer_comments", sa.Text(), nullable=True),
        sa.Column("subtotal", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("total_tax", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("grand_total", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("received_value", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("billed_value", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["approved_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["closed_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["deal_id"], ["deals.id"]),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["sent_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_purchase_orders_po_number"), "purchase_orders", ["po_number"], unique=False)
    op.create_index(op.f("ix_purchase_orders_status"), "purchase_orders", ["status"], unique=False)

    op.create_table(
        "purchase_order_line_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("purchase_order_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=False),
        sa.Column("sku", sa.String(length=80), nullable=True),
        sa.Column("unit", sa.String(length=30), nullable=False),
        sa.Column("ordered_quantity", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("received_quantity", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("billed_quantity", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("unit_price", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("tax_rate", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("line_subtotal", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("line_total", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("billed_amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["purchase_order_id"], ["purchase_orders.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "purchase_order_receipts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("purchase_order_id", sa.Integer(), nullable=False),
        sa.Column("line_item_id", sa.Integer(), nullable=False),
        sa.Column("recorded_by_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("receipt_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("grn_reference", sa.String(length=100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["line_item_id"], ["purchase_order_line_items.id"]),
        sa.ForeignKeyConstraint(["purchase_order_id"], ["purchase_orders.id"]),
        sa.ForeignKeyConstraint(["recorded_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "purchase_order_billings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("purchase_order_id", sa.Integer(), nullable=False),
        sa.Column("line_item_id", sa.Integer(), nullable=False),
        sa.Column("recorded_by_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("bill_reference", sa.String(length=100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["line_item_id"], ["purchase_order_line_items.id"]),
        sa.ForeignKeyConstraint(["purchase_order_id"], ["purchase_orders.id"]),
        sa.ForeignKeyConstraint(["recorded_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "purchase_order_attachments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("purchase_order_id", sa.Integer(), nullable=False),
        sa.Column("uploaded_by_id", sa.Integer(), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("stored_filename", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=100), nullable=True),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["purchase_order_id"], ["purchase_orders.id"]),
        sa.ForeignKeyConstraint(["uploaded_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("purchase_order_attachments")
    op.drop_table("purchase_order_billings")
    op.drop_table("purchase_order_receipts")
    op.drop_table("purchase_order_line_items")
    op.drop_index(op.f("ix_purchase_orders_status"), table_name="purchase_orders")
    op.drop_index(op.f("ix_purchase_orders_po_number"), table_name="purchase_orders")
    op.drop_table("purchase_orders")
