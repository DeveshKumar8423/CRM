"""add expenses tables

Revision ID: c4f9a2e18b37
Revises: b3e8f1a92d46
Create Date: 2026-06-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c4f9a2e18b37"
down_revision: Union[str, Sequence[str], None] = "b3e8f1a92d46"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "expenses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("submitted_by_id", sa.Integer(), nullable=False),
        sa.Column("reviewed_by_id", sa.Integer(), nullable=True),
        sa.Column("approved_by_id", sa.Integer(), nullable=True),
        sa.Column("paid_by_id", sa.Integer(), nullable=True),
        sa.Column("deal_id", sa.Integer(), nullable=True),
        sa.Column("contact_id", sa.Integer(), nullable=True),
        sa.Column("expense_number", sa.String(length=40), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("vendor_name", sa.String(length=200), nullable=False),
        sa.Column("amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("tax_amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("expense_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("reimbursement_due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("payment_mode", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("receipt_reference", sa.String(length=100), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("reviewer_comments", sa.Text(), nullable=True),
        sa.Column("cost_center", sa.String(length=100), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["approved_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"]),
        sa.ForeignKeyConstraint(["deal_id"], ["deals.id"]),
        sa.ForeignKeyConstraint(["paid_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["submitted_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_expenses_expense_number", "expenses", ["expense_number"])
    op.create_index("ix_expenses_status", "expenses", ["status"])

    op.create_table(
        "expense_attachments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("expense_id", sa.Integer(), nullable=False),
        sa.Column("uploaded_by_id", sa.Integer(), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("stored_filename", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=100), nullable=True),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["expense_id"], ["expenses.id"]),
        sa.ForeignKeyConstraint(["uploaded_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("expense_attachments")
    op.drop_index("ix_expenses_status", table_name="expenses")
    op.drop_index("ix_expenses_expense_number", table_name="expenses")
    op.drop_table("expenses")
