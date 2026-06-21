"""Add vendor bills tables."""

from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4e5f6"
down_revision = "f9c3d5e41a60"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "vendor_bills",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=False),
        sa.Column("reviewed_by_id", sa.Integer(), nullable=True),
        sa.Column("approved_by_id", sa.Integer(), nullable=True),
        sa.Column("purchase_order_id", sa.Integer(), nullable=True),
        sa.Column("deal_id", sa.Integer(), nullable=True),
        sa.Column("contact_id", sa.Integer(), nullable=True),
        sa.Column("expense_id", sa.Integer(), nullable=True),
        sa.Column("bill_number", sa.String(length=40), nullable=True),
        sa.Column("supplier_invoice_number", sa.String(length=100), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="draft"),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("bill_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("payment_terms", sa.String(length=40), nullable=True),
        sa.Column("vendor_name", sa.String(length=200), nullable=False),
        sa.Column("vendor_email", sa.String(length=255), nullable=True),
        sa.Column("vendor_phone", sa.String(length=30), nullable=True),
        sa.Column("vendor_gstin", sa.String(length=20), nullable=True),
        sa.Column("vendor_address", sa.Text(), nullable=True),
        sa.Column("subtotal", sa.Numeric(precision=14, scale=2), nullable=False, server_default="0"),
        sa.Column("total_tax", sa.Numeric(precision=14, scale=2), nullable=False, server_default="0"),
        sa.Column("round_off", sa.Numeric(precision=14, scale=2), nullable=False, server_default="0"),
        sa.Column("grand_total", sa.Numeric(precision=14, scale=2), nullable=False, server_default="0"),
        sa.Column("amount_paid", sa.Numeric(precision=14, scale=2), nullable=False, server_default="0"),
        sa.Column("outstanding_amount", sa.Numeric(precision=14, scale=2), nullable=False, server_default="0"),
        sa.Column("internal_notes", sa.Text(), nullable=True),
        sa.Column("approval_notes", sa.Text(), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("cancellation_reason", sa.Text(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_payment_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["approved_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["deal_id"], ["deals.id"]),
        sa.ForeignKeyConstraint(["expense_id"], ["expenses.id"]),
        sa.ForeignKeyConstraint(["purchase_order_id"], ["purchase_orders.id"]),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vendor_bills_bill_number", "vendor_bills", ["bill_number"])
    op.create_index("ix_vendor_bills_status", "vendor_bills", ["status"])

    op.create_table(
        "vendor_bill_line_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("vendor_bill_id", sa.Integer(), nullable=False),
        sa.Column("purchase_order_line_item_id", sa.Integer(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("description", sa.String(length=500), nullable=False),
        sa.Column("unit", sa.String(length=30), nullable=True),
        sa.Column("quantity", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("unit_price", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("tax_rate", sa.Numeric(precision=5, scale=2), nullable=False, server_default="18"),
        sa.Column("line_subtotal", sa.Numeric(precision=14, scale=2), nullable=False, server_default="0"),
        sa.Column("line_total", sa.Numeric(precision=14, scale=2), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["purchase_order_line_item_id"], ["purchase_order_line_items.id"]),
        sa.ForeignKeyConstraint(["vendor_bill_id"], ["vendor_bills.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "vendor_bill_payments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("vendor_bill_id", sa.Integer(), nullable=False),
        sa.Column("recorded_by_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("payment_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("payment_method", sa.String(length=30), nullable=False, server_default="bank_transfer"),
        sa.Column("reference", sa.String(length=100), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["recorded_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["vendor_bill_id"], ["vendor_bills.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "vendor_bill_attachments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("vendor_bill_id", sa.Integer(), nullable=False),
        sa.Column("uploaded_by_id", sa.Integer(), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("stored_filename", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=100), nullable=True),
        sa.Column("file_size", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["uploaded_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["vendor_bill_id"], ["vendor_bills.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("vendor_bill_attachments")
    op.drop_table("vendor_bill_payments")
    op.drop_table("vendor_bill_line_items")
    op.drop_index("ix_vendor_bills_status", table_name="vendor_bills")
    op.drop_index("ix_vendor_bills_bill_number", table_name="vendor_bills")
    op.drop_table("vendor_bills")
