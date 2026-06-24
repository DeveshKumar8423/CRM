# Product Requirements Document (PRD)
## Website Builder (Level 5 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Marketing / Growth / Public Presence  
**Document Version:** v1.0  
**Date:** 2026-06-24  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Website Builder provides a **no-code website and content layer** inside BlackPapers CRM so Indian SMEs can publish a professional online presence without hiring a separate agency or juggling WordPress, Wix, and lead spreadsheets.

Users should be able to **create landing pages**, **service pages**, **lead-capture forms**, **blog posts**, and **reusable website sections**—all branded to their company profile and connected to CRM **Leads**, **Contacts**, and **Products / Services**.

The module must feel native to the existing CRM experience. It builds on **Company Management** (logo, GSTIN, contact details, branding), integrates with **Role Permissions** and **Activity Logs**, and closes the gap noted in the product roadmap: *lead capture from website forms* without external tooling.

Core promise from product scope:

> **Let businesses create landing pages, service pages, forms, blogs, and website sections.**

---

## 2. Problem Statement

Today, BlackPapers CRM users run sales, billing, and operations inside the app—but their **public website** and **lead capture** often live elsewhere. Marketing pages are built on third-party builders; form submissions arrive by email or WhatsApp and must be manually entered as leads.

Common issues this module should solve:

- No way to publish a **company website** tied to CRM branding and services catalogue
- **Landing pages** for campaigns (GST registration, trademark, compliance packages) require external tools
- **Service pages** duplicate content already in Products / Services master
- **Lead forms** on the website do not auto-create CRM leads with source attribution
- **Blog / content** for SEO and trust-building is disconnected from the business workspace
- **Website sections** (hero, testimonials, CTA, FAQ) are rebuilt on every page instead of reused
- Multi-tenant SaaS goal (see `MULTI_TENANT_ROADMAP.md`) needs a **“Register your business”** and **public tenant site** story
- Sales reports show **Website** as a lead source, but the CRM does not own the capture path

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a **page builder** to create and publish **landing pages**, **service pages**, and **general content pages**.
2. Offer **reusable website sections** (hero, features, services grid, testimonials, FAQ, CTA, contact block) that users assemble into pages.
3. Enable **embedded and standalone forms** that create **Leads** in CRM with configurable fields and source tagging.
4. Support a simple **blog**: posts with title, slug, cover image, body, author, publish date, and SEO fields.
5. Pull **company branding** (name, logo, colours, phone, email, address, social links) from Company settings automatically.
6. Optionally surface **Products / Services** from the catalogue on service pages and pricing sections.
7. Support **draft**, **published**, and **archived** states with preview before publish.
8. Provide **public URLs** per tenant (path-based Phase 1; subdomain Phase 2).
9. Enforce **role-based permissions** for create, edit, publish, and delete.
10. Preserve **audit trail** via activity logs on publish, unpublish, and form configuration changes.
11. Make pages **mobile-responsive** by default with India-first typography and layout patterns.
12. Track basic **page views** and **form submissions** for marketing insight (Phase 1 counts; Phase 2 funnel).

### 3.2 Non-Goals (This Phase)

1. Full **WordPress / Webflow / Framer** replacement with unlimited custom HTML/CSS.
2. **E-commerce checkout**, cart, and payment gateway on public site (use Quotations / Invoices in CRM).
3. **Advanced SEO suite** (Search Console API, sitemap automation, schema for every page type) — basic meta tags only in Phase 1.
4. **A/B testing** and personalisation engines (Phase 3).
5. **Multi-language** site builder (English + Hinglish content manual only in Phase 1).
6. **Custom domain DNS wizard** with automated SSL (Phase 2; path hosting first).
7. **Email marketing** campaigns and drip automation (Phase 3; use existing email templates direction).
8. **AI copy generation** for pages (Phase 3 optional).
9. **Client portal** pages behind login (separate from public marketing site).
10. Native mobile app for editing pages (responsive web editor only).

---

## 4. Target Users and Roles

### 4.1 Primary Users

| User | Website Builder need |
|------|----------------------|
| **Admin / Owner** | Publish company site, campaign landing pages, connect forms to leads |
| **Marketing / Sales** | Create landing pages for ads, update service copy, manage blog |
| **Manager** | Review published pages, approve form-to-lead routing, monitor submissions |
| **Operations** | Maintain service descriptions aligned with Products master |

### 4.2 Secondary Users

| User | Website Builder need |
|------|----------------------|
| **Employee** | View published site; no edit unless granted |
| **Prospect / Visitor** | Browse public pages, submit contact / enquiry forms |
| **Accountant** | No direct need; benefits from leads entering CRM cleanly |
| **Leadership** | See traffic and conversion from website source in Sales Reports |

### 4.3 Public Visitors

Anonymous users consume published pages and submit forms. No CRM login required. Rate limiting and spam protection apply on public endpoints.

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **Pages** | Create landing, service, and generic pages with slug and SEO title |
| **Section library** | Reusable blocks: hero, text, image, services list, testimonials, FAQ, CTA, form embed |
| **Visual editor** | Add, reorder, edit, and remove sections on a page (list + preview Phase 1) |
| **Forms** | Build forms with standard fields; submissions → Leads |
| **Blog** | Posts list, editor, publish schedule (manual date), tags/categories basic |
| **Publishing** | Draft / published / archived; preview link for drafts |
| **Public rendering** | Server or static render of published pages at tenant public path |
| **Branding** | Inherit logo, colours, footer from company profile |
| **CRM links** | Service sections can reference Products; forms create Leads with source `Website` |
| **Permissions** | `website.*` permission group |
| **Activity log** | Page publish, form create, blog publish |

### 5.2 Out of Scope (Phase 1)

- Drag-and-drop canvas with pixel positioning (structured section stack first)
- Custom CSS / JavaScript injection per page
- Membership areas and gated content
- Comments on blog posts
- Version history and rollback (Phase 2)
- Custom domain + SSL automation (Phase 2)
- WhatsApp click-to-chat widget builder (Phase 2; link field in CTA section Phase 1)
- Integration with Meta Lead Ads / Google Ads (Phase 3)
- Sitemap.xml and robots.txt automation (Phase 2)

---

## 6. Core Product Concept

Website Builder treats a **site** as a collection of **pages** and **blog posts**, each composed of ordered **sections**. A section is a typed content block with schema-defined fields (headline, body, image URL, button label, linked form ID, etc.).

Three primary surfaces:

1. **Website Dashboard** — overview of pages, blog posts, forms, publish status, recent submissions.
2. **Page / Post Editor** — section stack editor with live preview and SEO panel.
3. **Public Site** — read-only rendered output for visitors at `/s/{company_slug}/...` or tenant subdomain (Phase 2).

Forms are first-class objects: a page embeds a form section by reference. On submit, the public API creates a **Lead** with mapped fields, default source **Website**, and optional campaign UTM parameters.

### 6.1 Relationship to Existing CRM Modules

| Module | Role relative to Website Builder |
|--------|----------------------------------|
| **Company Management** | Logo, name, address, phone, email, website URL, social links, brand colours |
| **Products / Services** | Service grid sections; service page templates pre-filled from catalogue |
| **Leads** | Destination for form submissions; source = Website |
| **Contacts** | Phase 2: optional convert duplicate enquiries; Phase 1 leads only |
| **Sales Reports** | Lead source “Website” becomes measurable when forms are live |
| **Document Management** | Images and PDFs for blog covers and section media (Phase 2 file picker) |
| **Users** | Author on blog posts; page last-edited by |
| **Activity Logs** | Publish and configuration audit |
| **Multi-tenant roadmap** | Public site per company; “Start free” landing CTA |

### 6.2 Proposed Data Model (Phase 1)

**`website_pages`**

| Field | Purpose |
|-------|---------|
| `id` | Primary key |
| `company_id` | Tenant scope |
| `title` | Page title |
| `slug` | URL segment (unique per company) |
| `page_type` | `landing`, `service`, `general` |
| `status` | `draft`, `published`, `archived` |
| `seo_title` | Meta title |
| `seo_description` | Meta description |
| `sections_json` | Ordered array of section objects |
| `product_id` | Optional FK for service pages |
| `published_at` | First / last publish timestamp |
| `created_by_id`, `updated_by_id` | FK `users` |
| `created_at`, `updated_at` | Timestamps |

**`website_forms`**

| Field | Purpose |
|-------|---------|
| `id` | Primary key |
| `company_id` | Tenant scope |
| `name` | Internal label |
| `slug` | Public form identifier |
| `fields_json` | Field definitions (type, label, required, map_to_lead_field) |
| `success_message` | Shown after submit |
| `redirect_url` | Optional thank-you page slug |
| `notification_emails` | Comma-separated or JSON array (Phase 2) |
| `is_active` | Enable / disable public submissions |
| `created_at`, `updated_at` | Timestamps |

**`website_form_submissions`**

| Field | Purpose |
|-------|---------|
| `id` | Primary key |
| `form_id` | FK `website_forms` |
| `company_id` | Tenant scope |
| `payload_json` | Submitted field values |
| `lead_id` | FK `leads` when created |
| `ip_address` | Spam / audit (hashed Phase 2) |
| `user_agent` | Optional |
| `utm_source`, `utm_medium`, `utm_campaign` | Campaign attribution |
| `created_at` | Submission time |

**`website_blog_posts`**

| Field | Purpose |
|-------|---------|
| `id` | Primary key |
| `company_id` | Tenant scope |
| `title` | Post title |
| `slug` | URL segment |
| `excerpt` | Listing summary |
| `body_html` or `body_json` | Rich content (sanitized HTML Phase 1) |
| `cover_image_url` | Hero image |
| `author_id` | FK `users` |
| `status` | `draft`, `published`, `archived` |
| `published_at` | Publish date |
| `seo_title`, `seo_description` | SEO |
| `tags` | JSON array of strings |
| `created_at`, `updated_at` | Timestamps |

**`website_page_views`** (Phase 1 lightweight analytics)

| Field | Purpose |
|-------|---------|
| `id` | Primary key |
| `company_id` | Tenant scope |
| `page_id` or `post_id` | Nullable FKs |
| `path` | Request path |
| `viewed_at` | Timestamp |
| `session_id` | Anonymous session hash |

**Phase 2 optional:** `website_section_templates` (saved reusable sections), `website_sites` (home page config, nav menu JSON, footer overrides).

---

## 7. Page Types and Section Library

### 7.1 Page Types

| Type | Purpose | Typical use |
|------|---------|-------------|
| **landing** | Campaign-focused single goal | Ad landing, offer promo, event signup |
| **service** | Describe one service offering | GST registration, trademark, compliance package |
| **general** | About, contact, policies | Company story, privacy policy, terms |

### 7.2 Default Section Types (Phase 1)

| Section key | Label | Key fields |
|-------------|-------|------------|
| `hero` | Hero | Headline, subheadline, background image, primary CTA label + link |
| `rich_text` | Text block | Title (optional), HTML/Markdown body |
| `image` | Image | Image URL, alt text, caption |
| `services_grid` | Services | Title, source: manual list OR pull from Products (limit N) |
| `testimonials` | Testimonials | Repeatable: quote, name, role, avatar URL |
| `faq` | FAQ | Repeatable: question, answer |
| `cta_banner` | Call to action | Headline, button label, link or form slug |
| `form_embed` | Form | `form_id` reference |
| `contact_info` | Contact block | Pull from company profile (override optional) |
| `spacer` | Spacer | Height preset (sm / md / lg) |

### 7.3 Blog vs Pages

- **Pages** use section JSON composition.
- **Blog posts** use a single rich body editor plus cover image and excerpt (simpler workflow for articles).
- Blog index page auto-generated at `/blog` listing published posts (Phase 1).

### 7.4 Home Page

Phase 1: designate one published page as **home** (`is_home` flag on `website_pages`) or default to first published landing page. Phase 2: dedicated site settings with nav menu builder.

---

## 8. Forms and Lead Capture

### 8.1 Default Form Fields

| Field type | Maps to Lead field |
|------------|-------------------|
| `text` | `name`, `company_name`, or custom → notes |
| `email` | `email` |
| `phone` | `phone` |
| `textarea` | `notes` or append to description |
| `select` | `service_interest` or custom |
| `hidden` | UTM / campaign ID |

### 8.2 Submission Flow

```
Visitor submits form
  → Public POST /public/{company_slug}/forms/{form_slug}/submit
  → Validate + rate limit + honeypot
  → Create website_form_submission record
  → Create Lead (source: Website, status: New)
  → Optional: notify sales email (Phase 2)
  → Return success message or redirect
```

### 8.3 Lead Defaults

- `source`: **Website** (align with `lead_config.py` and Sales Reports)
- `assigned_to_id`: configurable default owner (company setting) or round-robin Phase 2
- `tags`: optional `website-form`, form name
- Duplicate detection: same email + phone within 24h → append note on existing lead (Phase 2); Phase 1 allow duplicate with flag

### 8.4 Spam Protection (Phase 1)

- Honeypot field
- Rate limit per IP (e.g. 5 submissions / hour)
- Optional reCAPTCHA v3 (Phase 2 config)

---

## 9. Information Architecture and Navigation

### 9.1 CRM Sidebar (Authenticated)

| Route | Purpose |
|-------|---------|
| `/website` | Website dashboard |
| `/website/pages` | Page list |
| `/website/pages/new` | Create page |
| `/website/pages/:id/edit` | Page editor |
| `/website/forms` | Form list |
| `/website/forms/:id/edit` | Form builder |
| `/website/blog` | Blog post list |
| `/website/blog/new` | New post |
| `/website/blog/:id/edit` | Post editor |
| `/website/settings` | Home page, default form owner (Phase 2 nav/footer) |

Sidebar label: **Website** (requires `website.view` or `website.manage`).

### 9.2 Public Routes (Unauthenticated)

| Route | Purpose |
|-------|---------|
| `/s/{company_slug}` | Tenant home page |
| `/s/{company_slug}/{page_slug}` | Published page |
| `/s/{company_slug}/blog` | Blog index |
| `/s/{company_slug}/blog/{post_slug}` | Blog post |
| `/s/{company_slug}/forms/{form_slug}` | Standalone form page (optional) |

Phase 2: `{company_slug}.app.blackpapers.in` subdomain mapping.

### 9.3 Entry Points

- Sidebar: Website
- Company settings: “Edit public site” link
- Products detail: “Create service page” CTA (pre-fill from product)
- Leads index: banner when no website form exists (“Capture leads from your site”)
- Multi-tenant onboarding wizard: “Publish your first page” step (Phase 2)

---

## 10. Detailed Functional Requirements

### 10.1 Website Dashboard

**Required elements**

- KPI cards: published pages, draft pages, blog posts, form submissions (7 days)
- Quick actions: New landing page, New form, New blog post
- List of recent form submissions with link to created lead
- Link to preview public site

**Behaviors**

- Empty state guides user to create home landing page
- Submissions without lead creation show error badge (admin only)

### 10.2 Page List

**Required elements**

- Table: title, type, slug, status, last updated, views (7d)
- Filters: status, page type
- Actions: Edit, Preview, Publish / Unpublish, Archive, Duplicate (Phase 2)

**Behaviors**

- Slug uniqueness enforced per company
- Published pages cannot delete without archive or unpublish confirm
- Preview uses draft token for unpublished pages

### 10.3 Page Editor

**Required elements**

- Title, slug, page type, SEO title, description
- Section list with add, reorder (up/down), edit, remove
- Section picker modal grouped by category (content, conversion, social proof)
- Live preview pane (desktop / mobile toggle Phase 1)
- Save draft, Publish, Unpublish buttons
- For `service` type: optional link to Product record

**Behaviors**

- Autosave draft every 60s (Phase 2); manual save Phase 1
- Publish validates at least one section and non-empty slug
- Service page linked to product can sync title/description on demand (one-way pull)
- Invalid section JSON rejected with field-level errors

### 10.4 Form Builder

**Required elements**

- Form name, slug
- Field list: add field, type, label, placeholder, required, lead mapping
- Success message
- Embed code snippet / form slug for section embed
- Active toggle

**Behaviors**

- At least one of email or phone required for lead mapping
- Deactivating form returns 403 on public submit
- Changing slug does not break embeds on saved pages (warn if slug changed)

### 10.5 Blog

**Required elements**

- Post list: title, status, author, published date, views
- Editor: title, slug, excerpt, cover image URL, body (rich text), tags, SEO fields
- Publish / schedule (publish_at ≤ now for Phase 1 manual schedule)

**Behaviors**

- Sanitize HTML on save (strip scripts, iframes except allowlist Phase 2)
- Published posts visible on public blog index sorted by `published_at` desc
- Draft posts accessible only via preview token

### 10.6 Public Site Renderer

**Required elements**

- Responsive layout with company header (logo, name) and footer (address, links)
- Render section types per schema
- Form embed renders accessible fields + submit
- 404 for unknown slug; unpublished returns 404 unless preview token

**Behaviors**

- Cache published pages (CDN Phase 2; short server cache Phase 1)
- Inject SEO meta tags from page/post fields
- Log page view on successful render (async, non-blocking)

### 10.7 Permissions

| Permission | Capability |
|------------|------------|
| `website.view` | View dashboard, pages, forms, blog (read-only) |
| `website.manage` | Create and edit drafts |
| `website.publish` | Publish and unpublish pages and posts |
| `website.delete` | Archive / delete pages, forms, posts |
| `website.forms` | Manage forms and view submissions |

Default matrix:

| Role | view | manage | publish | delete | forms |
|------|------|--------|---------|--------|-------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manager | ✓ | ✓ | ✓ | — | ✓ |
| Sales | ✓ | ✓ | — | — | ✓ |
| Employee | ✓ | — | — | — | — |

---

## 11. UI / UX Requirements

### 11.1 Editor Experience

- Section-based editing (not raw HTML) for marketing users
- Clear distinction between **Draft** (grey badge) and **Published** (green badge)
- Preview opens in new tab with banner “Preview — not published” when draft
- Mobile preview minimum width 375px
- India-first: phone number field with +91 hint; address block supports GSTIN display from company

### 11.2 Public Site Design

- Clean, professional default theme aligned with existing CRM landing styles (`crm.css` patterns)
- Fast load: optimize images, minimal JS on public pages
- Accessible forms: labels, focus states, error messages
- WhatsApp / Call CTA buttons when company phone present (contact section)

### 11.3 Templates (Phase 1)

Provide **3 starter templates** when creating a page:

1. **Campaign landing** — hero + benefits + form + FAQ
2. **Service detail** — hero + rich text + services grid + CTA
3. **About / contact** — rich text + contact_info + form_embed

---

## 12. Data Fields (UI-Centric)

### 12.1 Page Summary Row

- `id`, `title`, `slug`, `page_type`, `status`
- `published_at`, `updated_at`
- `view_count_7d`
- `is_home`
- `public_url` (computed)

### 12.2 Section Object (JSON)

```json
{
  "id": "uuid",
  "type": "hero",
  "props": {
    "headline": "GST Registration Made Simple",
    "subheadline": "Trusted by 500+ Indian businesses",
    "image_url": "/uploads/...",
    "cta_label": "Get a quote",
    "cta_link": "/s/acme/contact"
  }
}
```

### 12.3 Form Field Definition

```json
{
  "key": "phone",
  "type": "phone",
  "label": "Mobile number",
  "required": true,
  "map_to": "phone"
}
```

---

## 13. Validation and Business Rules

1. Slug: lowercase alphanumeric + hyphens; unique per `company_id` for pages, forms, and posts.
2. Only users with `website.publish` may set status to `published`.
3. Public endpoints never expose draft content without valid preview token.
4. Form submission must map to at least email or phone for lead creation.
5. `company_slug` required for public URLs; generated from company name on onboarding (editable Phase 2).
6. Section images must use HTTPS URLs or approved upload paths.
7. Blog body sanitized; no executable content.
8. Archived pages return 404 on public site.
9. Activity log on publish, unpublish, form create/update.
10. All queries scoped by `company_id` (multi-tenant ready).

---

## 14. Notifications (Phase 2)

- Email to default sales owner on new form submission
- Weekly digest: page views and top forms
- Slack / WhatsApp webhook on high-value form submit (configurable)

Phase 1: in-app notification on dashboard only.

---

## 15. Reporting and Insights

### Phase 1

- Page view counts per page / post (7d, 30d)
- Form submission count per form
- Submissions linked to leads list filter `source=Website`

### Phase 2

- Conversion rate: views → submissions → qualified leads
- Top landing pages by submissions
- UTM campaign breakdown
- Export submissions CSV
- Integration with Sales Reports lead source widget (auto-filter Website)

---

## 16. Analytics Events

| Event | When |
|-------|------|
| `website_dashboard_viewed` | `/website` loaded |
| `website_page_created` | New page saved |
| `website_page_published` | Status → published |
| `website_form_submitted` | Public form success |
| `website_blog_published` | Post published |
| `website_public_page_viewed` | Public render (server-side) |

Payload: `company_id`, `page_id`, `form_id`, `slug`, `utm_*`.

---

## 17. Integration Points

### 17.1 CRM Modules

- **Leads:** auto-create from forms; appear in lead list with source Website
- **Products:** optional `product_id` on service pages; services_grid section
- **Company:** branding header/footer; contact block
- **Sales Reports:** Website lead source becomes actionable
- **Activity Logs:** publish and form events

### 17.2 API Endpoints (Proposed)

**Authenticated**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/website/dashboard` | KPIs and recent activity |
| GET | `/website/pages` | List pages |
| POST | `/website/pages` | Create page |
| GET | `/website/pages/{id}` | Page detail |
| PUT | `/website/pages/{id}` | Update page |
| POST | `/website/pages/{id}/publish` | Publish |
| POST | `/website/pages/{id}/unpublish` | Unpublish |
| DELETE | `/website/pages/{id}` | Archive / delete |
| GET | `/website/forms` | List forms |
| POST | `/website/forms` | Create form |
| PUT | `/website/forms/{id}` | Update form |
| GET | `/website/forms/{id}/submissions` | Submission list |
| GET | `/website/blog` | List posts |
| POST | `/website/blog` | Create post |
| PUT | `/website/blog/{id}` | Update post |
| POST | `/website/blog/{id}/publish` | Publish post |
| GET | `/website/templates` | Starter page templates |

**Public (no JWT)**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/public/{company_slug}` | Home page HTML/JSON |
| GET | `/public/{company_slug}/pages/{page_slug}` | Published page |
| GET | `/public/{company_slug}/blog` | Blog index |
| GET | `/public/{company_slug}/blog/{post_slug}` | Blog post |
| POST | `/public/{company_slug}/forms/{form_slug}/submit` | Form submission |
| GET | `/public/{company_slug}/preview/{token}` | Draft preview |

### 17.3 Implementation Alignment

**Not yet in codebase (greenfield module)**

1. New tables: `website_pages`, `website_forms`, `website_form_submissions`, `website_blog_posts`, `website_page_views`
2. `website_router.py` + `public_website_router.py`
3. `website_config.py` — section types, page types, slug rules
4. `website.*` permissions in `permissions_data.py`
5. Frontend: `WebsiteDashboard.jsx`, `WebsitePages.jsx`, `PageEditor.jsx`, `FormBuilder.jsx`, `BlogEditor.jsx`
6. Public render route in frontend (CRA) or SSR/static export decision (see open questions)
7. Lead creation service hook in `leads_router` or shared `lead_service.py`

**Existing patterns to reuse**

- Company branding from `company_branding.py`
- Lead source `Website` in `lead_config.py`
- File upload for images via `files_router.py` (Phase 2 picker)
- Numbering not required for pages; slug is user-defined

---

## 18. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Scope creep into full CMS | Phase 1 = section stack + blog + forms only |
| XSS on public pages | Sanitize HTML; CSP headers on public routes |
| Spam form submissions | Honeypot, rate limits, reCAPTCHA Phase 2 |
| SEO expectations | Set expectations: basic meta only Phase 1 |
| Multi-tenant slug collisions | Globally unique `company_slug` table |
| Performance at scale | Cache published pages; async view logging |
| Duplicate leads from forms | Phase 2 dedup rules; clear merge UX |
| Editor complexity | Templates + section library before freeform layout |

---

## 19. Release Phasing

### Phase 1 (MVP)

- Website dashboard
- Pages: create, edit, section library (10 types), draft/publish
- 3 starter templates
- Forms builder + public submit → Lead creation
- Blog: posts with rich text, publish, public index
- Public site at `/s/{company_slug}/...`
- Basic page view counts
- Permissions and activity log on publish
- Company branding on public layout

### Phase 2

- Custom domain + SSL wizard
- Subdomain per tenant
- Section templates (save/reuse)
- Site settings: nav menu, footer links, home designation UI
- Form email notifications
- reCAPTCHA, stronger spam controls
- Version history and rollback
- Image picker from Document Management
- Sales Reports deep link from website analytics
- Duplicate lead detection on submit

### Phase 3

- Drag-and-drop visual canvas
- A/B testing for landing pages
- Meta / Google Ads lead integrations
- AI-assisted copy suggestions
- Multi-language pages
- Advanced SEO (sitemap, structured data)
- E-commerce catalog pages (display only, quote CTA)

---

## 20. UAT Acceptance Checklist

1. Admin with `website.manage` can create a new landing page from a template.
2. User can add, reorder, edit, and remove sections on a page.
3. User with `website.publish` can publish a page; it is visible at the public URL.
4. Unpublished draft is not visible publicly without preview token.
5. User can create a form with name, email, phone mapped to lead fields.
6. Public visitor can submit the form; a new Lead appears with source **Website**.
7. Form submission appears on website dashboard and links to the lead.
8. User can create and publish a blog post; it appears on `/blog` index.
9. Service page can link to a Product and display services grid from catalogue.
10. Company logo and name appear on public site header.
11. Employee without `website.manage` cannot edit pages.
12. Cross-company access to pages/forms is blocked.
13. Invalid slug or duplicate slug shows validation error.
14. Spam honeypot blocks bot submission without creating a lead.
15. Activity log records page publish and unpublish events.

---

## 21. Open Product Questions

1. **Public rendering:** CRA-only public routes vs separate lightweight SSR (Next.js) app for SEO?
2. Should **service pages** auto-sync when Product price/description changes, or manual refresh only?
3. Is **one form per company** enough for MVP, or multiple forms from day one? (PRD assumes multiple.)
4. **Default assignee** for website leads: fixed user, round-robin, or unassigned?
5. Do we need **privacy policy / terms** boilerplate pages generated automatically for compliance?
6. **Blog comments:** ever required, or permanently out of scope?
7. **Custom domains** in Phase 2: who manages DNS — customer only or assisted onboarding?
8. Should published pages use **company.website** field if custom domain not set, or always `app.blackpapers.in/s/slug`?
9. Image hosting: reuse **uploaded_files** storage or separate `website_assets` bucket?
10. Plan limits for multi-tenant: max pages, max form submissions/month on free tier?

---

## Appendix A: Example User Flow — Campaign Landing Page

1. Sales manager opens **Website → New page → Campaign landing** template.
2. Edits hero headline for “Trademark Registration — ₹9999”.
3. Adds **form_embed** section linked to “Trademark enquiry” form.
4. Sets slug `trademark-offer`, SEO title, publishes.
5. Shares URL `https://app.blackpapers.in/s/blackpapers/trademark-offer` in Meta ad.
6. Visitor submits form → Lead created → appears in Leads with source Website.
7. Manager sees submission on Website dashboard and assigns lead in CRM.

---

## Appendix B: Section Stack Example (Service Page)

| Order | Section | Content summary |
|-------|---------|-----------------|
| 1 | hero | “Private Limited Company Registration” |
| 2 | rich_text | Process overview, timeline, documents required |
| 3 | services_grid | Related services from Products (3 items) |
| 4 | testimonials | 2 client quotes |
| 5 | faq | 5 common questions |
| 6 | form_embed | “Get started” enquiry form |
| 7 | contact_info | Company phone, email, Mumbai address |

---

## Appendix C: Starter Permissions Seed

```python
WEBSITE_PERMISSIONS = [
    ("website.view", "View website builder and public site settings"),
    ("website.manage", "Create and edit pages, blog drafts, and forms"),
    ("website.publish", "Publish and unpublish website content"),
    ("website.delete", "Delete or archive website content"),
    ("website.forms", "Manage forms and view submissions"),
]
```

---

## Appendix D: Alignment with Product Roadmap

| Roadmap item | Website Builder contribution |
|--------------|------------------------------|
| Lead capture integrations | Native forms → Leads |
| Multi-tenant “Start free” | Public tenant home + registration landing |
| Sales Reports lead source | Website source becomes real |
| WhatsApp / Email module | Phase 2 notifications on form submit |
| Company branding | Single source of truth for public site |

---

*End of PRD — Website Builder v1.0*
