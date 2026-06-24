from __future__ import annotations

import re
import secrets
import unicodedata

PAGE_TYPES = ["landing", "service", "general"]
PAGE_STATUSES = ["draft", "published", "archived"]
BLOG_STATUSES = ["draft", "published", "archived"]

PAGE_TYPE_LABELS = {
    "landing": "Landing page",
    "service": "Service page",
    "general": "General page",
}

STATUS_LABELS = {
    "draft": "Draft",
    "published": "Published",
    "archived": "Archived",
}

SECTION_TYPES = [
    "hero",
    "rich_text",
    "image",
    "services_grid",
    "testimonials",
    "faq",
    "cta_banner",
    "form_embed",
    "contact_info",
    "spacer",
]

SECTION_LABELS = {
    "hero": "Hero",
    "rich_text": "Text block",
    "image": "Image",
    "services_grid": "Services grid",
    "testimonials": "Testimonials",
    "faq": "FAQ",
    "cta_banner": "Call to action",
    "form_embed": "Form",
    "contact_info": "Contact info",
    "spacer": "Spacer",
}

FORM_FIELD_TYPES = ["text", "email", "phone", "textarea", "select", "hidden"]
LEAD_MAP_FIELDS = ["name", "email", "phone", "organization_name", "requirement", "notes"]

WEBSITE_LEAD_SOURCE = "Website"
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
MAX_SLUG_LENGTH = 80
FORM_RATE_LIMIT_PER_HOUR = 5

PAGE_TEMPLATES = {
    "campaign_landing": {
        "label": "Campaign landing",
        "page_type": "landing",
        "sections": [
            {
                "type": "hero",
                "props": {
                    "headline": "Your headline here",
                    "subheadline": "Describe your offer in one line",
                    "cta_label": "Get started",
                    "cta_link": "",
                },
            },
            {
                "type": "rich_text",
                "props": {
                    "title": "Why choose us",
                    "body": "<p>Add benefits and key points for your campaign.</p>",
                },
            },
            {"type": "form_embed", "props": {"form_id": None}},
            {
                "type": "faq",
                "props": {
                    "title": "Frequently asked questions",
                    "items": [{"question": "How long does it take?", "answer": "Typical turnaround is 5–7 working days."}],
                },
            },
        ],
    },
    "service_detail": {
        "label": "Service detail",
        "page_type": "service",
        "sections": [
            {
                "type": "hero",
                "props": {
                    "headline": "Service name",
                    "subheadline": "Short service description",
                    "cta_label": "Enquire now",
                    "cta_link": "",
                },
            },
            {
                "type": "rich_text",
                "props": {
                    "title": "Overview",
                    "body": "<p>Describe the service process, timeline, and documents required.</p>",
                },
            },
            {"type": "services_grid", "props": {"title": "Related services", "source": "products", "limit": 3}},
            {
                "type": "cta_banner",
                "props": {"headline": "Ready to get started?", "button_label": "Contact us", "link": ""},
            },
        ],
    },
    "about_contact": {
        "label": "About / contact",
        "page_type": "general",
        "sections": [
            {
                "type": "rich_text",
                "props": {
                    "title": "About us",
                    "body": "<p>Tell visitors about your business and expertise.</p>",
                },
            },
            {"type": "contact_info", "props": {}},
            {"type": "form_embed", "props": {"form_id": None}},
        ],
    },
}

DEFAULT_CONTACT_FORM_FIELDS = [
    {"key": "name", "type": "text", "label": "Full name", "required": True, "map_to": "name"},
    {"key": "email", "type": "email", "label": "Email", "required": True, "map_to": "email"},
    {"key": "phone", "type": "phone", "label": "Mobile number", "required": True, "map_to": "phone"},
    {
        "key": "requirement",
        "type": "textarea",
        "label": "How can we help?",
        "required": False,
        "map_to": "requirement",
    },
    {"key": "website_trap", "type": "hidden", "label": "", "required": False, "map_to": None},
]


def normalize_slug(value: str) -> str:
    text = unicodedata.normalize("NFKD", (value or "").strip().lower())
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:MAX_SLUG_LENGTH]


def validate_slug(slug: str) -> None:
    if not slug or not SLUG_PATTERN.match(slug):
        raise ValueError("Slug must use lowercase letters, numbers, and hyphens only")


def new_preview_token() -> str:
    return secrets.token_urlsafe(24)


def sanitize_html(html: str | None) -> str:
    if not html:
        return ""
    cleaned = re.sub(r"<script[\s\S]*?</script>", "", html, flags=re.IGNORECASE)
    cleaned = re.sub(r"on\w+\s*=\s*[\"'][^\"']*[\"']", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()
