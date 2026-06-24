"""Rental Management tables (Phase 1)."""

from typing import Union

from alembic import op
import sqlalchemy as sa

revision: str = "t9u0v1w2x3y4"
down_revision: Union[str, None] = "s8t9u0v1w2x3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "rental_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("contract_prefix", sa.String(length=10), nullable=False, server_default="RNT"),
        sa.Column("default_rate_basis", sa.String(length=10), nullable=False, server_default="daily"),
        sa.Column("default_deposit_percent", sa.Numeric(5, 2), nullable=False, server_default="20"),
        sa.Column("late_fee_per_day", sa.Numeric(14, 2), nullable=False, server_default="500"),
        sa.Column("grace_hours_after_due", sa.Integer(), nullable=False, server_default="24"),
        sa.Column("auto_invoice_mode", sa.String(length=10), nullable=False, server_default="draft"),
        sa.Column("require_deposit_before_delivery", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("notify_roles_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("allow_overbook", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id"),
    )

    op.create_table(
        "rental_assets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("asset_code", sa.String(length=40), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(length=30), nullable=False, server_default="other"),
        sa.Column("product_id", sa.Integer(), nullable=True),
        sa.Column("quantity_available", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("rate_daily", sa.Numeric(14, 2), nullable=True),
        sa.Column("rate_weekly", sa.Numeric(14, 2), nullable=True),
        sa.Column("rate_monthly", sa.Numeric(14, 2), nullable=True),
        sa.Column("gst_rate", sa.Numeric(5, 2), nullable=False, server_default="18"),
        sa.Column("deposit_amount", sa.Numeric(14, 2), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("location_notes", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "asset_code", name="uq_rental_assets_company_code"),
    )
    op.create_index("ix_rental_assets_company_id", "rental_assets", ["company_id"])

    op.create_table(
        "rental_contracts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("contract_number", sa.String(length=40), nullable=False),
        sa.Column("contact_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="draft"),
        sa.Column("rate_basis", sa.String(length=10), nullable=False, server_default="daily"),
        sa.Column("rental_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("rental_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("actual_return_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivery_address", sa.Text(), nullable=True),
        sa.Column("delivery_contact_name", sa.String(length=120), nullable=True),
        sa.Column("delivery_contact_phone", sa.String(length=30), nullable=True),
        sa.Column("delivery_scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivery_completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("return_scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("return_completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("subtotal", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("deposit_required", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("deposit_received", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("deposit_refunded", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("deposit_deducted", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("late_fee_total", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("damage_charge_total", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("grand_total", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("cancellation_reason", sa.Text(), nullable=True),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "contract_number", name="uq_rental_contracts_company_number"),
    )
    op.create_index("ix_rental_contracts_company_id", "rental_contracts", ["company_id"])
    op.create_index("ix_rental_contracts_contract_number", "rental_contracts", ["contract_number"])
    op.create_index("ix_rental_contracts_contact_id", "rental_contracts", ["contact_id"])
    op.create_index("ix_rental_contracts_status", "rental_contracts", ["status"])

    op.create_table(
        "rental_contract_lines",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("contract_id", sa.Integer(), nullable=False),
        sa.Column("rental_asset_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("rate_basis", sa.String(length=10), nullable=False, server_default="daily"),
        sa.Column("unit_rate", sa.Numeric(14, 2), nullable=False),
        sa.Column("line_days", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("line_subtotal", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("gst_rate", sa.Numeric(5, 2), nullable=False, server_default="18"),
        sa.Column("line_total", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("return_condition", sa.String(length=20), nullable=True),
        sa.Column("damage_notes", sa.Text(), nullable=True),
        sa.Column("damage_charge", sa.Numeric(14, 2), nullable=True),
        sa.ForeignKeyConstraint(["contract_id"], ["rental_contracts.id"]),
        sa.ForeignKeyConstraint(["rental_asset_id"], ["rental_assets.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_rental_contract_lines_contract_id", "rental_contract_lines", ["contract_id"])
    op.create_index("ix_rental_contract_lines_rental_asset_id", "rental_contract_lines", ["rental_asset_id"])

    op.create_table(
        "rental_deposits",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("contract_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(length=20), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("payment_method", sa.String(length=20), nullable=False, server_default="cash"),
        sa.Column("reference", sa.String(length=100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("recorded_by_id", sa.Integer(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["contract_id"], ["rental_contracts.id"]),
        sa.ForeignKeyConstraint(["recorded_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_rental_deposits_contract_id", "rental_deposits", ["contract_id"])

    op.create_table(
        "rental_invoices",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("contract_id", sa.Integer(), nullable=False),
        sa.Column("invoice_id", sa.Integer(), nullable=False),
        sa.Column("invoice_type", sa.String(length=20), nullable=False, server_default="rental"),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["contract_id"], ["rental_contracts.id"]),
        sa.ForeignKeyConstraint(["invoice_id"], ["invoices.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_rental_invoices_contract_id", "rental_invoices", ["contract_id"])


def downgrade() -> None:
    op.drop_index("ix_rental_invoices_contract_id", table_name="rental_invoices")
    op.drop_table("rental_invoices")
    op.drop_index("ix_rental_deposits_contract_id", table_name="rental_deposits")
    op.drop_table("rental_deposits")
    op.drop_index("ix_rental_contract_lines_rental_asset_id", table_name="rental_contract_lines")
    op.drop_index("ix_rental_contract_lines_contract_id", table_name="rental_contract_lines")
    op.drop_table("rental_contract_lines")
    op.drop_index("ix_rental_contracts_status", table_name="rental_contracts")
    op.drop_index("ix_rental_contracts_contact_id", table_name="rental_contracts")
    op.drop_index("ix_rental_contracts_contract_number", table_name="rental_contracts")
    op.drop_index("ix_rental_contracts_company_id", table_name="rental_contracts")
    op.drop_table("rental_contracts")
    op.drop_index("ix_rental_assets_company_id", table_name="rental_assets")
    op.drop_table("rental_assets")
    op.drop_table("rental_settings")
