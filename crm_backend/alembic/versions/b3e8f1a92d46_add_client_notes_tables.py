"""add client notes tables

Revision ID: b3e8f1a92d46
Revises: f8c6d4e15a27
Create Date: 2026-06-13 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b3e8f1a92d46"
down_revision: Union[str, Sequence[str], None] = "f8c6d4e15a27"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "client_notes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("contact_id", sa.Integer(), nullable=True),
        sa.Column("lead_id", sa.Integer(), nullable=True),
        sa.Column("deal_id", sa.Integer(), nullable=True),
        sa.Column("quotation_id", sa.Integer(), nullable=True),
        sa.Column("sales_order_id", sa.Integer(), nullable=True),
        sa.Column("invoice_id", sa.Integer(), nullable=True),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("assigned_to_id", sa.Integer(), nullable=True),
        sa.Column("last_edited_by_id", sa.Integer(), nullable=True),
        sa.Column("note_type", sa.String(length=30), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("visibility_scope", sa.String(length=20), nullable=False),
        sa.Column("tags", sa.String(length=500), nullable=True),
        sa.Column("structured_data", sa.Text(), nullable=True),
        sa.Column("is_pinned", sa.Boolean(), nullable=False),
        sa.Column("pin_order", sa.Integer(), nullable=False),
        sa.Column("is_sensitive", sa.Boolean(), nullable=False),
        sa.Column("is_resolved", sa.Boolean(), nullable=False),
        sa.Column("follow_up_required", sa.Boolean(), nullable=False),
        sa.Column("follow_up_due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("follow_up_priority", sa.String(length=20), nullable=False),
        sa.Column("follow_up_completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False),
        sa.Column("revision_count", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["assigned_to_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"]),
        sa.ForeignKeyConstraint(["deal_id"], ["deals.id"]),
        sa.ForeignKeyConstraint(["invoice_id"], ["invoices.id"]),
        sa.ForeignKeyConstraint(["last_edited_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"]),
        sa.ForeignKeyConstraint(["quotation_id"], ["quotations.id"]),
        sa.ForeignKeyConstraint(["sales_order_id"], ["sales_orders.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_client_notes_contact_id", "client_notes", ["contact_id"])
    op.create_index("ix_client_notes_note_type", "client_notes", ["note_type"])
    op.create_index("ix_client_notes_follow_up", "client_notes", ["follow_up_required", "follow_up_due_date"])

    op.create_table(
        "client_note_revisions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("client_note_id", sa.Integer(), nullable=False),
        sa.Column("editor_id", sa.Integer(), nullable=False),
        sa.Column("note_type", sa.String(length=30), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["client_note_id"], ["client_notes.id"]),
        sa.ForeignKeyConstraint(["editor_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("client_note_revisions")
    op.drop_index("ix_client_notes_follow_up", table_name="client_notes")
    op.drop_index("ix_client_notes_note_type", table_name="client_notes")
    op.drop_index("ix_client_notes_contact_id", table_name="client_notes")
    op.drop_table("client_notes")
