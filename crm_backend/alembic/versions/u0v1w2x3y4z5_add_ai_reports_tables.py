"""AI Reports tables (Phase 1)."""

from typing import Union

from alembic import op
import sqlalchemy as sa

revision: str = "u0v1w2x3y4z5"
down_revision: Union[str, None] = "t9u0v1w2x3y4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ai_report_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("default_period", sa.String(length=20), nullable=False, server_default="30d"),
        sa.Column("default_domains_json", sa.JSON(), nullable=False, server_default='["sales","finance","inventory","hr","operations"]'),
        sa.Column("include_executive_brief", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("anomaly_thresholds_json", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("notify_roles_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("generation_mode", sa.String(length=20), nullable=False, server_default="template"),
        sa.Column("llm_provider", sa.String(length=40), nullable=True),
        sa.Column("redact_pii", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id"),
    )

    op.create_table(
        "ai_insight_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("run_number", sa.String(length=40), nullable=False),
        sa.Column("period_start", sa.Date(), nullable=False),
        sa.Column("period_end", sa.Date(), nullable=False),
        sa.Column("domains_json", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("executive_headline", sa.Text(), nullable=True),
        sa.Column("executive_summary", sa.Text(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("generated_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["generated_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "run_number", name="uq_ai_insight_runs_company_number"),
    )
    op.create_index("ix_ai_insight_runs_company_id", "ai_insight_runs", ["company_id"])
    op.create_index("ix_ai_insight_runs_status", "ai_insight_runs", ["status"])

    op.create_table(
        "ai_insight_sections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("run_id", sa.Integer(), nullable=False),
        sa.Column("domain", sa.String(length=20), nullable=False),
        sa.Column("headline", sa.Text(), nullable=False),
        sa.Column("narrative", sa.Text(), nullable=False),
        sa.Column("bullets_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("watch_items_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("metrics_json", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["run_id"], ["ai_insight_runs.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_insight_sections_run_id", "ai_insight_sections", ["run_id"])


def downgrade() -> None:
    op.drop_index("ix_ai_insight_sections_run_id", table_name="ai_insight_sections")
    op.drop_table("ai_insight_sections")
    op.drop_index("ix_ai_insight_runs_status", table_name="ai_insight_runs")
    op.drop_index("ix_ai_insight_runs_company_id", table_name="ai_insight_runs")
    op.drop_table("ai_insight_runs")
    op.drop_table("ai_report_settings")
