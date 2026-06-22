"""add category column to uploaded_files

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-06-22

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

CATEGORY_KEYS = (
    "contracts",
    "invoices",
    "hr",
    "client_documents",
    "compliance",
    "sops",
    "kyc",
    "receipts",
    "products",
    "documents",
)

PANEL_DEFAULTS = {
    "leads": "client_documents",
    "deals": "contracts",
    "contacts": "client_documents",
    "invoices": "invoices",
    "quotations": "client_documents",
    "sales_orders": "invoices",
    "expenses": "receipts",
    "vendor_bills": "receipts",
    "projects": "client_documents",
}

RECORD_MODULES = tuple(PANEL_DEFAULTS.keys())


def upgrade() -> None:
    op.add_column("uploaded_files", sa.Column("category", sa.String(length=50), nullable=True))
    op.create_index("ix_uploaded_files_category", "uploaded_files", ["category"])

    conn = op.get_bind()
    category_list = ", ".join(f"'{c}'" for c in CATEGORY_KEYS)
    conn.execute(
        sa.text(
            f"""
            UPDATE uploaded_files
            SET category = related_module
            WHERE related_record_id IS NULL
              AND related_module IN ({category_list})
            """
        )
    )
    for module, default_cat in PANEL_DEFAULTS.items():
        conn.execute(
            sa.text(
                """
                UPDATE uploaded_files
                SET category = :category
                WHERE related_record_id IS NOT NULL
                  AND related_module = :module
                  AND category IS NULL
                """
            ),
            {"category": default_cat, "module": module},
        )


def downgrade() -> None:
    op.drop_index("ix_uploaded_files_category", table_name="uploaded_files")
    op.drop_column("uploaded_files", "category")
