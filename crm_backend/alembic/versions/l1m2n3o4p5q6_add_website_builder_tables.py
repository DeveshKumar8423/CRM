"""Website Builder tables."""

from typing import Union

from alembic import op
import sqlalchemy as sa

revision: str = "l1m2n3o4p5q6"
down_revision: Union[str, None] = "k0l1m2n3o4p5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "website_pages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("page_type", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("seo_title", sa.String(length=200), nullable=True),
        sa.Column("seo_description", sa.String(length=500), nullable=True),
        sa.Column("sections_json", sa.JSON(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=True),
        sa.Column("is_home", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("preview_token", sa.String(length=64), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "slug", name="uq_website_pages_company_slug"),
    )
    op.create_index("ix_website_pages_company_id", "website_pages", ["company_id"])
    op.create_index("ix_website_pages_slug", "website_pages", ["slug"])
    op.create_index("ix_website_pages_status", "website_pages", ["status"])
    op.create_index("ix_website_pages_preview_token", "website_pages", ["preview_token"])

    op.create_table(
        "website_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("company_slug", sa.String(length=80), nullable=False),
        sa.Column("home_page_id", sa.Integer(), nullable=True),
        sa.Column("default_lead_assignee_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["default_lead_assignee_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["home_page_id"], ["website_pages.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id"),
        sa.UniqueConstraint("company_slug"),
    )
    op.create_index("ix_website_settings_company_id", "website_settings", ["company_id"])
    op.create_index("ix_website_settings_company_slug", "website_settings", ["company_slug"])

    op.create_table(
        "website_forms",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("fields_json", sa.JSON(), nullable=False),
        sa.Column("success_message", sa.String(length=500), nullable=False),
        sa.Column("redirect_url", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "slug", name="uq_website_forms_company_slug"),
    )
    op.create_index("ix_website_forms_company_id", "website_forms", ["company_id"])
    op.create_index("ix_website_forms_slug", "website_forms", ["slug"])

    op.create_table(
        "website_blog_posts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("excerpt", sa.String(length=500), nullable=True),
        sa.Column("body_html", sa.Text(), nullable=False),
        sa.Column("cover_image_url", sa.String(length=500), nullable=True),
        sa.Column("author_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("seo_title", sa.String(length=200), nullable=True),
        sa.Column("seo_description", sa.String(length=500), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=False),
        sa.Column("preview_token", sa.String(length=64), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "slug", name="uq_website_blog_posts_company_slug"),
    )
    op.create_index("ix_website_blog_posts_company_id", "website_blog_posts", ["company_id"])
    op.create_index("ix_website_blog_posts_slug", "website_blog_posts", ["slug"])
    op.create_index("ix_website_blog_posts_status", "website_blog_posts", ["status"])

    op.create_table(
        "website_form_submissions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("form_id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("payload_json", sa.JSON(), nullable=False),
        sa.Column("lead_id", sa.Integer(), nullable=True),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("user_agent", sa.String(length=500), nullable=True),
        sa.Column("utm_source", sa.String(length=100), nullable=True),
        sa.Column("utm_medium", sa.String(length=100), nullable=True),
        sa.Column("utm_campaign", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["form_id"], ["website_forms.id"]),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_website_form_submissions_form_id", "website_form_submissions", ["form_id"])
    op.create_index("ix_website_form_submissions_company_id", "website_form_submissions", ["company_id"])
    op.create_index("ix_website_form_submissions_lead_id", "website_form_submissions", ["lead_id"])

    op.create_table(
        "website_page_views",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("page_id", sa.Integer(), nullable=True),
        sa.Column("post_id", sa.Integer(), nullable=True),
        sa.Column("path", sa.String(length=255), nullable=False),
        sa.Column("session_id", sa.String(length=64), nullable=True),
        sa.Column("viewed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["page_id"], ["website_pages.id"]),
        sa.ForeignKeyConstraint(["post_id"], ["website_blog_posts.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_website_page_views_company_id", "website_page_views", ["company_id"])
    op.create_index("ix_website_page_views_page_id", "website_page_views", ["page_id"])
    op.create_index("ix_website_page_views_post_id", "website_page_views", ["post_id"])
    op.create_index("ix_website_page_views_viewed_at", "website_page_views", ["viewed_at"])


def downgrade() -> None:
    op.drop_table("website_page_views")
    op.drop_table("website_form_submissions")
    op.drop_table("website_blog_posts")
    op.drop_table("website_forms")
    op.drop_table("website_settings")
    op.drop_table("website_pages")
