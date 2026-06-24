"""Workflow Builder tables (Phase 1)."""

from typing import Union

from alembic import op
import sqlalchemy as sa

revision: str = "v1w2x3y4z5a6"
down_revision: Union[str, None] = "u0v1w2x3y4z5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "workflow_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("max_active_workflows", sa.Integer(), nullable=False, server_default="50"),
        sa.Column("default_run_as_role", sa.String(length=40), nullable=False, server_default="Admin"),
        sa.Column("rate_limit_per_hour", sa.Integer(), nullable=False, server_default="500"),
        sa.Column("notify_on_failure", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id"),
    )

    op.create_table(
        "workflows",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("workflow_code", sa.String(length=40), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("module", sa.String(length=20), nullable=False),
        sa.Column("trigger_type", sa.String(length=60), nullable=False),
        sa.Column("trigger_config_json", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("conditions_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("actions_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("stop_on_match", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("run_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_run_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "workflow_code", name="uq_workflows_company_code"),
    )
    op.create_index("ix_workflows_company_id", "workflows", ["company_id"])
    op.create_index("ix_workflows_trigger_type", "workflows", ["trigger_type"])
    op.create_index("ix_workflows_is_active", "workflows", ["is_active"])

    op.create_table(
        "workflow_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("workflow_id", sa.Integer(), nullable=False),
        sa.Column("run_number", sa.String(length=40), nullable=False),
        sa.Column("trigger_type", sa.String(length=60), nullable=False),
        sa.Column("record_type", sa.String(length=40), nullable=False),
        sa.Column("record_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="skipped"),
        sa.Column("conditions_result_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("actions_result_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("is_dry_run", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("triggered_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["workflow_id"], ["workflows.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "run_number", name="uq_workflow_runs_company_number"),
    )
    op.create_index("ix_workflow_runs_company_id", "workflow_runs", ["company_id"])
    op.create_index("ix_workflow_runs_workflow_id", "workflow_runs", ["workflow_id"])
    op.create_index("ix_workflow_runs_status", "workflow_runs", ["status"])


def downgrade() -> None:
    op.drop_index("ix_workflow_runs_status", table_name="workflow_runs")
    op.drop_index("ix_workflow_runs_workflow_id", table_name="workflow_runs")
    op.drop_index("ix_workflow_runs_company_id", table_name="workflow_runs")
    op.drop_table("workflow_runs")
    op.drop_index("ix_workflows_is_active", table_name="workflows")
    op.drop_index("ix_workflows_trigger_type", table_name="workflows")
    op.drop_index("ix_workflows_company_id", table_name="workflows")
    op.drop_table("workflows")
    op.drop_table("workflow_settings")
