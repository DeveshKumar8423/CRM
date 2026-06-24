# Multi-Tenant Roadmap — BlackPapers CRM

**Status:** Approved direction (manager alignment)  
**From:** Single-tenant (one company per database / deployment)  
**To:** Multi-tenant SaaS (many companies, one platform, isolated data)  
**Audience:** Product, engineering, manager  
**Last updated:** 2026-06-23

---

## 1. Executive summary

Today each CRM installation serves **one business**. Staff log in via role portals; company data is loaded with `Company.first()` across ~50+ backend touchpoints. Public signup only creates a limited **User** (portal) account — not a new business workspace.

**Target:** An Indian SME can visit the website, **register their company**, become **Admin**, invite staff, and run CRM + billing + GST on a **shared hosted instance** without a separate server per client.

**Strategy:** Phased delivery — ship tenant isolation and onboarding first, then billing and scale. Do not block current BlackPapers internal/demo use during migration.

---

## 2. Current state (baseline)

| Area | Today |
|------|--------|
| Tenancy | Single company per DB |
| Company resolution | `db.query(Company).first()` in routers, seeds, reports |
| User signup | `/signup` → role `User`, attaches to existing company |
| Admin creation | Manual seed / Admin creates users in UI |
| Company creation | Admin POST `/admin/company` (only if none exists) |
| Data isolation | `company_id` on most tables — **column exists**, enforcement inconsistent |
| Frontend entry | Home → role login; no “Register your business” |
| Hosting model | Clone repo + local PostgreSQL per developer/client |

**What already helps us:** Most models have `company_id`; JWT auth; role/permission matrix; company profile UI; India GST fields.

**What blocks multi-tenant:** No tenant on signup; no tenant context middleware; `Company.first()`; seeds assume one company; document numbering/settings not namespaced per tenant policy; no subscription/billing layer.

---

## 3. Target architecture (end state)

```
                    ┌─────────────────────────────────────┐
                    │  app.blackpapers.in (one frontend)   │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │  API — tenant from JWT company_id    │
                    │  Every query scoped by company_id    │
                    └─────────────────┬───────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
   Company A (tenant)          Company B (tenant)          Company C (tenant)
   users, leads, invoices      users, leads, invoices      users, leads, invoices
```

**Tenancy model (recommended):** **Shared database, shared schema, row-level isolation** via `company_id`. Simplest for team size and PostgreSQL expertise; upgrade path to schema-per-tenant later if enterprise clients require it.

**Tenant lifecycle:**

1. Owner signs up → Company + Admin user created in one transaction  
2. Onboarding wizard → GSTIN, address, branding, first user invites  
3. Staff invited → email + role (Sales, Accountant, …)  
4. Optional trial → plan limits (users, invoices/month) enforced in Phase 4  

---

## 4. Roadmap phases

### Phase 0 — Alignment & prep (1 week)

**Goal:** Freeze scope, avoid rework.

| # | Deliverable | Owner |
|---|-------------|--------|
| 0.1 | Sign off tenancy model (shared DB + `company_id`) | Manager + lead dev |
| 0.2 | Decide subdomain vs path routing (`acme.app.com` vs single URL + login) | Product |
| 0.3 | Inventory all `Company.first()` and unscoped queries | Engineering |
| 0.4 | Define “tenant owner” rules (who can delete company, export data) | Product |
| 0.5 | Keep BlackPapers as tenant #1 on staging after migration | Engineering |

**Exit criteria:** Written decision doc; query audit spreadsheet; staging environment exists.

---

### Phase 1 — Tenant foundation (2–3 weeks)

**Goal:** Backend correctly scopes all data to the logged-in user’s `company_id`.

| # | Work item | Details |
|---|-----------|---------|
| 1.1 | **Tenant context helper** | `get_current_company(db, user)` — never `Company.first()` in request handlers |
| 1.2 | **Refactor routers** | Replace ~50 router helpers; audit list/get/create/update/delete on every module |
| 1.3 | **Cross-tenant guards** | 404 if `record.company_id != user.company_id` on every detail endpoint |
| 1.4 | **JWT payload** | Ensure `company_id` in token; reject users with `company_id is null` (except super-admin if added later) |
| 1.5 | **Unique constraints per tenant** | e.g. invoice numbers, quote numbers scoped to `(company_id, number)` |
| 1.6 | **Seeds refactor** | `seed_*` accept `--company-id` or create tenant fixture; `seed_company` becomes tenant bootstrap |
| 1.7 | **Migration** | Existing BlackPapers data → `company_id = 1` on all rows; verify FK integrity |
| 1.8 | **Automated tests** | Two-tenant fixture: Company A cannot read Company B leads/invoices |

**Exit criteria:** Full API test pass with two companies on one DB; zero `Company.first()` in `routers/`.

---

### Phase 2 — Company registration & onboarding (2 weeks)

**Goal:** New business can self-register from the product (manager’s main ask).

| # | Work item | Details |
|---|-----------|---------|
| 2.1 | **POST `/register-company`** | Body: owner name, email, password, company legal/display name, phone optional |
| 2.2 | **Atomic bootstrap** | Create `Company` + `User(role=Admin)` + default `SystemSetting` + default numbering config |
| 2.3 | **Email verification** | Optional Phase 2b — verify email before full access |
| 2.4 | **Frontend: Register your business** | Replace vague “Create portal account” with clear business signup |
| 2.5 | **Onboarding wizard** | Steps: Company profile → GSTIN → Branding → Invite first user (skippable) |
| 2.6 | **Landing page CTA** | “Start free” → business registration; “Staff login” → workspace picker |
| 2.7 | **Invite flow** | Admin invites staff by email; set role; temp password or magic link |
| 2.8 | **Deprecate orphan User signup** | Portal `User` role only via invite, not public self-signup (or separate `/client-portal`) |

**Exit criteria:** New email domain can register, complete company setup, log in as Admin, create a lead — without manual seeds.

---

### Phase 3 — Multi-tenant product polish (2–3 weeks)

**Goal:** Each tenant’s workspace feels like their own product.

| # | Work item | Details |
|---|-----------|---------|
| 3.1 | **Per-tenant branding** | Logo, colours on invoices/quotes (already partial — enforce per `company_id`) |
| 3.2 | **Per-tenant settings** | Tax defaults, FY start, quote/invoice prefixes, email templates |
| 3.3 | **Per-tenant demo mode** | Optional “Load sample data” for new tenants (not BlackPapers real data) |
| 3.4 | **Super-admin console** (internal) | BlackPapers staff: list tenants, suspend, support login — **not** customer-facing |
| 3.5 | **Data export** | Admin can export contacts/invoices CSV per tenant (trust + GDPR-style requests) |
| 3.6 | **Activity logs** | Scoped per tenant; super-admin audit separate |
| 3.7 | **Notifications** | Already per `user_id` — verify `company_id` on all notify paths |

**Exit criteria:** Two demo tenants on staging with different logos, GSTIN, and invoice numbering; no data bleed.

---

### Phase 4 — Hosted SaaS & plans (2–4 weeks)

**Goal:** One URL for everyone; optional monetization.

| # | Work item | Details |
|---|-----------|---------|
| 4.1 | **Deploy production** | Frontend (Vercel/Netlify/S3) + API (Railway/Render/AWS) + managed PostgreSQL |
| 4.2 | **Environment config** | Secrets, `FRONTEND_URL`, CORS, SSL |
| 4.3 | **Plan limits** | `companies.plan`: max users, modules (HR, inventory), invoices/month |
| 4.4 | **Billing integration** | Razorpay / Stripe India — subscriptions, trial 14 days |
| 4.5 | **Usage metering** | Track active users, invoice count per billing period |
| 4.6 | **Backups** | Daily DB backup; per-tenant restore procedure documented |

**Exit criteria:** Manager opens `https://…` from phone, registers test company, uses CRM without local install.

---

### Phase 5 — India-first differentiation (ongoing, parallel)

**Goal:** Win SMEs vs generic ERP — not feature parity with Odoo.

| # | Theme | Examples |
|---|--------|----------|
| 5.1 | GST-native | GSTR-friendly exports, HSN/SAC library per tenant |
| 5.2 | Follow-up workflows | WhatsApp-ready client notes, payment due alerts |
| 5.3 | Hindi / Hinglish | Invoice & quote templates, SMS copy |
| 5.4 | Industry packs | Agency, CA, NGO, interior designer onboarding presets |
| 5.5 | Integrations | WhatsApp Business API, Tally export, payment links |

---

## 5. Timeline overview (estimate)

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 0 — Alignment | 1 week | Week 1 |
| 1 — Tenant foundation | 2–3 weeks | Weeks 2–4 |
| 2 — Registration & onboarding | 2 weeks | Weeks 5–6 |
| 3 — Product polish | 2–3 weeks | Weeks 7–9 |
| 4 — Hosted SaaS & billing | 2–4 weeks | Weeks 10–13 |
| 5 — India features | Continuous | Parallel from Week 6 |

**MVP multi-tenant (manager can try on web):** End of **Phase 2** (~6 weeks) with staging URL.  
**Production SaaS with billing:** End of **Phase 4** (~3 months).

*Estimates assume 1–2 developers part-time on CRM; adjust with manager.*

---

## 6. What we do NOT do in v1 multi-tenant

- Schema-per-tenant or database-per-tenant (unless a client contract requires it later)
- Full Odoo module parity
- White-label reseller portal
- Real-time multi-region replication
- Client self-service custom domain per tenant (can be Phase 6)

---

## 7. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Data leak between tenants | Phase 1 tests + code review checklist on every new endpoint |
| Breaking BlackPapers internal DB | Migrate tenant #1 first; feature flag `MULTI_TENANT=true` |
| Scope creep | Phase 2 = register + onboard only; billing waits for Phase 4 |
| Manager expects instant SaaS | Set expectation: Phase 2 = beta URL; Phase 4 = paid launch |
| Large seed scripts | Rewrite seeds as tenant fixtures, not global DB assumptions |

---

## 8. Success metrics

| Metric | Target (3 months post Phase 4) |
|--------|--------------------------------|
| New tenant signup → first invoice | < 30 minutes (guided onboarding) |
| Cross-tenant data incidents | 0 |
| Tenants on staging/production | 5+ pilot SMEs |
| BlackPapers daily use on same platform | Yes (tenant #1) |
| Manager runs without local install | Yes |

---

## 9. Immediate next steps (this week)

1. **Manager:** Confirm shared-DB approach and target launch (beta vs paid).  
2. **Team:** Run Phase 0 query audit (`Company.first()` grep + unscoped SQLAlchemy queries).  
3. **Engineering:** Create `feature/multi-tenant` branch; implement `get_current_company()` + refactor 2–3 routers as pattern (e.g. leads, contacts, invoices).  
4. **Product:** Wireframe **Register your business** + 3-step onboarding (company → GST → invite).  
5. **Keep current workflow:** Local dev + single-tenant remains valid until Phase 1 migration is merged.

---

## 10. One-line pitch for stakeholders

> **We are evolving BlackPapers CRM from a single-company install into an India-first multi-tenant platform where any SME can register, get an Admin workspace, and run leads-to-GST-billing on one shared app — with strong data isolation and a phased path to hosted SaaS and subscriptions.**

---

*Related docs: [../README.md](../README.md) (setup), [PRD_*.md](./) (module PRDs). Update this roadmap at the end of each phase.*
