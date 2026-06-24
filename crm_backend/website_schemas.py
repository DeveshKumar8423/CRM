from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class WebsiteOption(BaseModel):
    value: str
    label: str


class WebsiteMetaResponse(BaseModel):
    page_types: list[WebsiteOption]
    page_statuses: list[WebsiteOption]
    section_types: list[WebsiteOption]
    templates: list[dict[str, Any]]
    form_field_types: list[str]
    lead_map_fields: list[str]


class WebsiteSettingsResponse(BaseModel):
    company_slug: str
    home_page_id: int | None = None
    default_lead_assignee_id: int | None = None
    public_base_path: str


class WebsiteSettingsUpdateRequest(BaseModel):
    company_slug: str | None = Field(default=None, max_length=80)
    home_page_id: int | None = None
    default_lead_assignee_id: int | None = None


class WebsiteDashboardResponse(BaseModel):
    published_pages: int
    draft_pages: int
    blog_posts: int
    form_submissions_7d: int
    company_slug: str
    public_url: str
    recent_submissions: list["WebsiteSubmissionSummary"]


class WebsiteSubmissionSummary(BaseModel):
    id: int
    form_name: str
    lead_id: int | None
    created_at: datetime
    preview: str


class WebsitePageListItem(BaseModel):
    id: int
    title: str
    slug: str
    page_type: str
    status: str
    is_home: bool
    published_at: datetime | None
    updated_at: datetime
    view_count_7d: int = 0
    public_url: str | None = None


class WebsitePageListResponse(BaseModel):
    items: list[WebsitePageListItem]
    total: int


class WebsitePageCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str | None = Field(default=None, max_length=80)
    page_type: str = "general"
    template_key: str | None = None
    seo_title: str | None = Field(default=None, max_length=200)
    seo_description: str | None = Field(default=None, max_length=500)
    sections_json: list[dict[str, Any]] | None = None
    product_id: int | None = None


class WebsitePageUpdateRequest(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    slug: str | None = Field(default=None, max_length=80)
    page_type: str | None = None
    seo_title: str | None = Field(default=None, max_length=200)
    seo_description: str | None = Field(default=None, max_length=500)
    sections_json: list[dict[str, Any]] | None = None
    product_id: int | None = None
    is_home: bool | None = None


class WebsitePageResponse(BaseModel):
    id: int
    title: str
    slug: str
    page_type: str
    status: str
    seo_title: str | None
    seo_description: str | None
    sections_json: list[dict[str, Any]]
    product_id: int | None
    is_home: bool
    preview_token: str | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    public_url: str | None = None
    view_count_7d: int = 0


class WebsiteFormListItem(BaseModel):
    id: int
    name: str
    slug: str
    is_active: bool
    submission_count: int = 0
    updated_at: datetime


class WebsiteFormListResponse(BaseModel):
    items: list[WebsiteFormListItem]
    total: int


class WebsiteFormCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    slug: str | None = Field(default=None, max_length=80)
    fields_json: list[dict[str, Any]] | None = None
    success_message: str | None = Field(default=None, max_length=500)
    redirect_url: str | None = Field(default=None, max_length=255)
    is_active: bool = True


class WebsiteFormUpdateRequest(BaseModel):
    name: str | None = Field(default=None, max_length=120)
    slug: str | None = Field(default=None, max_length=80)
    fields_json: list[dict[str, Any]] | None = None
    success_message: str | None = Field(default=None, max_length=500)
    redirect_url: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None


class WebsiteFormResponse(BaseModel):
    id: int
    name: str
    slug: str
    fields_json: list[dict[str, Any]]
    success_message: str
    redirect_url: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class WebsiteBlogListItem(BaseModel):
    id: int
    title: str
    slug: str
    status: str
    author_name: str | None
    published_at: datetime | None
    updated_at: datetime
    view_count_7d: int = 0


class WebsiteBlogListResponse(BaseModel):
    items: list[WebsiteBlogListItem]
    total: int


class WebsiteBlogCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str | None = Field(default=None, max_length=80)
    excerpt: str | None = Field(default=None, max_length=500)
    body_html: str = ""
    cover_image_url: str | None = Field(default=None, max_length=500)
    seo_title: str | None = Field(default=None, max_length=200)
    seo_description: str | None = Field(default=None, max_length=500)
    tags: list[str] | None = None


class WebsiteBlogUpdateRequest(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    slug: str | None = Field(default=None, max_length=80)
    excerpt: str | None = Field(default=None, max_length=500)
    body_html: str | None = None
    cover_image_url: str | None = Field(default=None, max_length=500)
    seo_title: str | None = Field(default=None, max_length=200)
    seo_description: str | None = Field(default=None, max_length=500)
    tags: list[str] | None = None


class WebsiteBlogResponse(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: str | None
    body_html: str
    cover_image_url: str | None
    author_id: int | None
    author_name: str | None
    status: str
    seo_title: str | None
    seo_description: str | None
    tags: list[str]
    preview_token: str | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    view_count_7d: int = 0


class PublicCompanyBranding(BaseModel):
    display_name: str
    legal_name: str
    email: str | None
    phone: str | None
    website: str | None
    address_line1: str | None
    address_line2: str | None
    city: str | None
    state: str | None
    pincode: str | None
    country: str
    gstin: str | None
    logo_filename: str | None = None


class PublicPageResponse(BaseModel):
    page: WebsitePageResponse
    company: PublicCompanyBranding
    forms: list[WebsiteFormResponse] = []
    products: list[dict[str, Any]] = []


class PublicBlogIndexResponse(BaseModel):
    company: PublicCompanyBranding
    posts: list[WebsiteBlogListItem]


class PublicBlogPostResponse(BaseModel):
    post: WebsiteBlogResponse
    company: PublicCompanyBranding


class PublicFormSubmitRequest(BaseModel):
    fields: dict[str, Any]
    website_trap: str | None = None
    utm_source: str | None = None
    utm_medium: str | None = None
    utm_campaign: str | None = None


class PublicFormSubmitResponse(BaseModel):
    success: bool
    message: str
    lead_id: int | None = None
    redirect_url: str | None = None
