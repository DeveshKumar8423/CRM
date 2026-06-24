"""Quality Control tables and extend quality_inspections."""

from typing import Union

from alembic import op
import sqlalchemy as sa

revision: str = "p5q6r7s8t9u0"
down_revision: Union[str, None] = "o4p5q6r7s8t9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "quality_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("inspection_number_prefix", sa.String(length=10), nullable=False, server_default="QC"),
        sa.Column("capa_number_prefix", sa.String(length=10), nullable=False, server_default="CAPA"),
        sa.Column("default_incoming_required", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("block_on_fail_default", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("alert_repeat_fail_threshold", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("alert_overdue_hours", sa.Integer(), nullable=False, server_default="24"),
        sa.Column("notify_roles_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id"),
    )

    op.create_table(
        "inspection_points",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=40), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("point_type", sa.String(length=20), nullable=False),
        sa.Column("trigger", sa.String(length=30), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("block_on_fail", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("default_template_id", sa.Integer(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "code", name="uq_inspection_points_company_code"),
    )

    op.create_table(
        "quality_checklist_templates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=True),
        sa.Column("inspection_point_id", sa.Integer(), nullable=True),
        sa.Column("items_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="draft"),
        sa.Column("version", sa.String(length=20), nullable=False, server_default="1.0"),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["inspection_point_id"], ["inspection_points.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_foreign_key(
        "fk_inspection_points_default_template_id",
        "inspection_points",
        "quality_checklist_templates",
        ["default_template_id"],
        ["id"],
    )

    op.alter_column("quality_inspections", "work_order_id", existing_type=sa.Integer(), nullable=True)
    op.add_column("quality_inspections", sa.Column("inspection_point_id", sa.Integer(), nullable=True))
    op.add_column("quality_inspections", sa.Column("template_id", sa.Integer(), nullable=True))
    op.add_column("quality_inspections", sa.Column("reference_type", sa.String(length=30), nullable=True))
    op.add_column("quality_inspections", sa.Column("reference_id", sa.Integer(), nullable=True))
    op.add_column("quality_inspections", sa.Column("product_id", sa.Integer(), nullable=True))
    op.add_column("quality_inspections", sa.Column("batch_ref", sa.String(length=80), nullable=True))
    op.add_column("quality_inspections", sa.Column("waived_by_id", sa.Integer(), nullable=True))
    op.add_column("quality_inspections", sa.Column("waiver_reason", sa.Text(), nullable=True))
    op.add_column(
        "quality_inspections",
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
    )
    op.create_foreign_key(
        "fk_quality_inspections_inspection_point_id",
        "quality_inspections",
        "inspection_points",
        ["inspection_point_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_quality_inspections_template_id",
        "quality_inspections",
        "quality_checklist_templates",
        ["template_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_quality_inspections_product_id",
        "quality_inspections",
        "products",
        ["product_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_quality_inspections_waived_by_id",
        "quality_inspections",
        "users",
        ["waived_by_id"],
        ["id"],
    )

    op.execute(
        """
        UPDATE quality_inspections
        SET reference_type = 'work_order', reference_id = work_order_id
        WHERE work_order_id IS NOT NULL
        """
    )

    op.create_table(
        "corrective_actions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("capa_number", sa.String(length=40), nullable=False),
        sa.Column("inspection_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("action_type", sa.String(length=30), nullable=False, server_default="rework"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="open"),
        sa.Column("assigned_to_id", sa.Integer(), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("root_cause", sa.Text(), nullable=True),
        sa.Column("corrective_steps", sa.Text(), nullable=False, server_default=""),
        sa.Column("verification_notes", sa.Text(), nullable=True),
        sa.Column("closed_by_id", sa.Integer(), nullable=True),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["inspection_id"], ["quality_inspections.id"]),
        sa.ForeignKeyConstraint(["assigned_to_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["closed_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "capa_number", name="uq_corrective_actions_company_number"),
    )

    op.create_table(
        "quality_alerts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("alert_type", sa.String(length=30), nullable=False),
        sa.Column("severity", sa.String(length=10), nullable=False, server_default="medium"),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("inspection_id", sa.Integer(), nullable=True),
        sa.Column("capa_id", sa.Integer(), nullable=True),
        sa.Column("product_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="open"),
        sa.Column("acknowledged_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["inspection_id"], ["quality_inspections.id"]),
        sa.ForeignKeyConstraint(["capa_id"], ["corrective_actions.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["acknowledged_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.add_column("products", sa.Column("default_incoming_template_id", sa.Integer(), nullable=True))
    op.add_column("products", sa.Column("default_final_template_id", sa.Integer(), nullable=True))
    op.add_column("products", sa.Column("requires_incoming_qc", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("products", sa.Column("requires_final_qc", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_foreign_key(
        "fk_products_default_incoming_template_id",
        "products",
        "quality_checklist_templates",
        ["default_incoming_template_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_products_default_final_template_id",
        "products",
        "quality_checklist_templates",
        ["default_final_template_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_products_default_final_template_id", "products", type_="foreignkey")
    op.drop_constraint("fk_products_default_incoming_template_id", "products", type_="foreignkey")
    op.drop_column("products", "requires_final_qc")
    op.drop_column("products", "requires_incoming_qc")
    op.drop_column("products", "default_final_template_id")
    op.drop_column("products", "default_incoming_template_id")
    op.drop_table("quality_alerts")
    op.drop_table("corrective_actions")
    op.drop_constraint("fk_quality_inspections_waived_by_id", "quality_inspections", type_="foreignkey")
    op.drop_constraint("fk_quality_inspections_product_id", "quality_inspections", type_="foreignkey")
    op.drop_constraint("fk_quality_inspections_template_id", "quality_inspections", type_="foreignkey")
    op.drop_constraint("fk_quality_inspections_inspection_point_id", "quality_inspections", type_="foreignkey")
    op.drop_column("quality_inspections", "created_at")
    op.drop_column("quality_inspections", "waiver_reason")
    op.drop_column("quality_inspections", "waived_by_id")
    op.drop_column("quality_inspections", "batch_ref")
    op.drop_column("quality_inspections", "product_id")
    op.drop_column("quality_inspections", "reference_id")
    op.drop_column("quality_inspections", "reference_type")
    op.drop_column("quality_inspections", "template_id")
    op.drop_column("quality_inspections", "inspection_point_id")
    op.alter_column("quality_inspections", "work_order_id", existing_type=sa.Integer(), nullable=False)
    op.drop_constraint("fk_inspection_points_default_template_id", "inspection_points", type_="foreignkey")
    op.drop_table("quality_checklist_templates")
    op.drop_table("inspection_points")
    op.drop_table("quality_settings")
