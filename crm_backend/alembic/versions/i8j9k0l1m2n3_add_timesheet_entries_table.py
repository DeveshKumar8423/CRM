"""add timesheet_entries table

Revision ID: i8j9k0l1m2n3
Revises: d4e5f6a7b8c9
Create Date: 2026-06-04

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "i8j9k0l1m2n3"
down_revision: Union[str, None] = "d4e5f6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "timesheet_entries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("entry_number", sa.String(length=40), nullable=True),
        sa.Column("employee_id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("task_id", sa.Integer(), nullable=True),
        sa.Column("contact_id", sa.Integer(), nullable=True),
        sa.Column("work_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("hours", sa.Numeric(5, 2), nullable=False),
        sa.Column("is_billable", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="draft"),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_by_id", sa.Integer(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewer_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"]),
        sa.ForeignKeyConstraint(["employee_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["task_id"], ["project_tasks.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "entry_number", name="uq_timesheet_entries_company_number"),
    )
    op.create_index("ix_timesheet_entries_company_id", "timesheet_entries", ["company_id"])
    op.create_index("ix_timesheet_entries_employee_id", "timesheet_entries", ["employee_id"])
    op.create_index("ix_timesheet_entries_project_id", "timesheet_entries", ["project_id"])
    op.create_index("ix_timesheet_entries_task_id", "timesheet_entries", ["task_id"])
    op.create_index("ix_timesheet_entries_contact_id", "timesheet_entries", ["contact_id"])
    op.create_index("ix_timesheet_entries_work_date", "timesheet_entries", ["work_date"])
    op.create_index("ix_timesheet_entries_status", "timesheet_entries", ["status"])


def downgrade() -> None:
    op.drop_index("ix_timesheet_entries_status", table_name="timesheet_entries")
    op.drop_index("ix_timesheet_entries_work_date", table_name="timesheet_entries")
    op.drop_index("ix_timesheet_entries_contact_id", table_name="timesheet_entries")
    op.drop_index("ix_timesheet_entries_task_id", table_name="timesheet_entries")
    op.drop_index("ix_timesheet_entries_project_id", table_name="timesheet_entries")
    op.drop_index("ix_timesheet_entries_employee_id", table_name="timesheet_entries")
    op.drop_index("ix_timesheet_entries_company_id", table_name="timesheet_entries")
    op.drop_table("timesheet_entries")
