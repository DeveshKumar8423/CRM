"""Seed demo Website Builder content (Phase 1 MVP)."""

from __future__ import annotations

import argparse
from datetime import datetime, timezone

from database import SessionLocal
from models import Company, User, WebsiteBlogPost, WebsiteForm, WebsitePage, WebsiteSettings
from website_config import DEFAULT_CONTACT_FORM_FIELDS, PAGE_TEMPLATES, normalize_slug, new_preview_token


def _utcnow():
    return datetime.now(timezone.utc)


def seed_demo_website(reset: bool = False) -> None:
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("No company found. Run seed_company.py first.")
            return

        if reset:
            db.query(WebsitePage).filter(WebsitePage.company_id == company.id).delete()
            db.query(WebsiteForm).filter(WebsiteForm.company_id == company.id).delete()
            db.query(WebsiteBlogPost).filter(WebsiteBlogPost.company_id == company.id).delete()
            db.query(WebsiteSettings).filter(WebsiteSettings.company_id == company.id).delete()
            db.commit()

        site = db.query(WebsiteSettings).filter(WebsiteSettings.company_id == company.id).first()
        slug = normalize_slug(company.display_name or "blackpapers")
        if not site:
            site = WebsiteSettings(company_id=company.id, company_slug=slug)
            db.add(site)
            db.flush()

        admin = db.query(User).filter(User.company_id == company.id, User.role == "Admin").first()

        form = (
            db.query(WebsiteForm)
            .filter(WebsiteForm.company_id == company.id, WebsiteForm.slug == "contact")
            .first()
        )
        if not form:
            form = WebsiteForm(
                company_id=company.id,
                name="Contact enquiry",
                slug="contact",
                fields_json=DEFAULT_CONTACT_FORM_FIELDS,
                success_message="Thank you! Our team will contact you shortly.",
                is_active=True,
            )
            db.add(form)
            db.flush()

        template = PAGE_TEMPLATES["campaign_landing"]
        sections = []
        for section in template["sections"]:
            props = dict(section.get("props") or {})
            if section["type"] == "form_embed":
                props["form_id"] = form.id
            if section["type"] == "hero":
                props["headline"] = f"{company.display_name} — Business services made simple"
                props["subheadline"] = "GST, compliance, registrations and more for Indian SMEs"
            sections.append({**section, "id": new_preview_token()[:12], "props": props})

        page = (
            db.query(WebsitePage)
            .filter(WebsitePage.company_id == company.id, WebsitePage.slug == "home")
            .first()
        )
        if not page:
            page = WebsitePage(
                company_id=company.id,
                title="Home",
                slug="home",
                page_type="landing",
                status="published",
                seo_title=f"{company.display_name} | Business services",
                seo_description="Professional compliance and business services for Indian companies.",
                sections_json=sections,
                is_home=True,
                preview_token=new_preview_token(),
                published_at=_utcnow(),
                created_by_id=admin.id if admin else None,
                updated_by_id=admin.id if admin else None,
            )
            db.add(page)
            db.flush()
            site.home_page_id = page.id

        post = (
            db.query(WebsiteBlogPost)
            .filter(WebsiteBlogPost.company_id == company.id, WebsiteBlogPost.slug == "welcome")
            .first()
        )
        if not post:
            db.add(
                WebsiteBlogPost(
                    company_id=company.id,
                    title="Welcome to our new website",
                    slug="welcome",
                    excerpt="We built this site to help you learn about our services and get in touch faster.",
                    body_html="<p>Explore our services and submit an enquiry form — leads go straight into our CRM.</p>",
                    author_id=admin.id if admin else None,
                    status="published",
                    tags=["announcement"],
                    preview_token=new_preview_token(),
                    published_at=_utcnow(),
                )
            )

        db.commit()
        print(f"Website demo ready at public slug: {site.company_slug}")
        print(f"  Home page: /s/{site.company_slug}")
        print(f"  Blog: /s/{site.company_slug}/blog")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()
    seed_demo_website(reset=args.reset)
