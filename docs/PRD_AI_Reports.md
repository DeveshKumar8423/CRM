# Product Requirements Document (PRD)
## AI Reports (Level 11 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Analytics / Business Intelligence / Executive Insights  
**Document Version:** v1.0  
**Date:** 2026-06-24  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

AI Reports extends BlackPapers CRM with a **plain-language insights layer** so Indian SME owners and managers can understand **what changed across sales, finance, inventory, HR, and operations**—without exporting spreadsheets, opening ten dashboards, or interpreting raw KPI tables themselves.

The module aggregates permitted data from existing CRM modules, applies **deterministic metric rules** (Phase 1) and optional **LLM narrative enhancement** (Phase 2), and produces **readable insight briefs**: headlines, bullet takeaways, anomalies, and drill-down links to source reports.

The module must integrate with **Sales Reports**, **P&L Reports**, **GST / Tax Reports**, **Customer / Vendor Ledger**, **Inventory**, **Payroll**, **Attendance**, **Leave**, **Timesheets**, **Manufacturing**, **Quality**, **Maintenance**, **Field Service**, **Subscriptions**, **Rental**, **POS**, **eCommerce**, **Dashboard**, **Notifications**, and **Activity Logs**—respecting each user’s **role permissions** so insights never expose data the user cannot already view.

Core promise from product scope:

> **Generate plain-language insights from sales, finance, inventory, HR, and operations data.**

---

## 2. Problem Statement

Today, BlackPapers CRM stores rich operational data and provides **domain-specific reports** (sales pipeline, P&L, GST registers, stock ledgers)—but leadership still asks questions that no single screen answers:

- “**Why** did collections drop this month?”
- “Is inventory risk hurting our top deals?”
- “Are we understaffed on the shop floor this week?”
- “What should I worry about before Monday’s review?”

Common issues this module should solve:

- **Report sprawl** — finance, sales, and ops each have separate dashboards; no unified narrative
- **Low data literacy** — owners want sentences, not pivot tables
- **No cross-domain synthesis** — sales up but cash down is invisible until manual analysis
- **Anomaly blindness** — overdue invoices, low stock, SLA breaches, and leave gaps are scattered
- **Time cost** — managers spend hours before weekly reviews assembling talking points
- **Permission leakage risk** — any “AI over everything” feature must not bypass `reports.view_financial` or module ACLs
- **No insight history** — prior week’s briefing is lost in chat or email
- **Reactive-only culture** — teams discover problems when customers complain, not from proactive briefs

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide an **AI Reports hub** with latest insight brief and generation actions (`/ai-reports`).
2. Generate **plain-language summaries** for five domains: **Sales**, **Finance**, **Inventory**, **HR**, **Operations**.
3. Produce a **cross-domain executive brief** combining permitted domains for leadership.
4. Support **period selection**: last 7 days, last 30 days, MTD, last month, custom range (Phase 1).
5. Base insights on **aggregated CRM metrics** with traceable source KPIs (numbers shown alongside narrative).
6. Enforce **permission-scoped data** — omit domains and metrics the user cannot access.
7. Highlight **anomalies and watch items**: overdue AR, low stock, open critical WOs, SLA breaches, churn signals.
8. Link each insight bullet to **existing report or record** (invoice list, sales report, inventory, etc.).
9. Save **insight run history** with timestamp, period, domains, and generated text snapshot.
10. Send **in-app notification** when scheduled brief is ready (Phase 1 manual; cron Phase 2).
11. Provide **module settings**: enable/disable, default period, included domains, notify roles.
12. Preserve **audit trail** on insight generation and settings changes.
13. Phase 2: optional **natural-language ask** (“Summarize March collections”) with guardrails.
14. Phase 2: optional **LLM provider** configuration (OpenAI / Azure / local) with PII redaction rules.

### 3.2 Non-Goals (This Phase)

1. Replacing **Sales Reports**, **P&L**, **GST Reports**, or any source report module.
2. **Custom SQL / report builder** or drag-and-drop BI designer.
3. **Predictive forecasting** and ML revenue models — Phase 3.
4. **Autonomous agent** that changes CRM records (write actions) — read-only insights only.
5. **Customer-facing** insight portal — internal staff Phase 1–2.
6. **Real-time streaming analytics** sub-second dashboards.
7. **Full data warehouse / ETL** — query operational DB and existing report services.
8. **Multi-company consolidated AI brief** — single-tenant company scope Phase 1.
9. **Hindi/regional language** output — English Phase 1; localization Phase 3.
10. **Sending raw customer PII** to external LLM without admin opt-in — Phase 2 gated.

---

## 4. Target Users and Roles

### 4.1 Primary Users (CRM Staff)

| User | AI Reports need |
|------|-----------------|
| **Owner / founder** | Weekly executive brief across all domains |
| **General manager** | Cross-functional watch list before ops review |
| **Finance head** | Cash, AR, AP, margin narrative for month-end |
| **Sales manager** | Pipeline, conversion, and revenue plain-language summary |
| **Operations manager** | Inventory, manufacturing, field service, maintenance risks |

### 4.2 Secondary Users (CRM Staff)

| User | AI Reports need |
|------|-----------------|
| **Accountant** | Finance-only insight pack before GST filing |
| **HR manager** | Attendance, leave, payroll highlights |
| **Store / warehouse lead** | Inventory and POS movement brief |
| **Individual contributor** | My-domain insight if permitted (e.g. sales rep sees own-scope Phase 2) |

### 4.3 External (Phase 3+)

| User | AI Reports need |
|------|-----------------|
| **Board / investor** | Exported PDF executive brief (read-only share link) |

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **Insight hub** | Latest briefs and generate action |
| **Domain packs** | Sales, Finance, Inventory, HR, Operations |
| **Executive brief** | Multi-domain synthesis |
| **Plain language** | Headline + bullets + watch items |
| **Source KPIs** | Numbers adjacent to narrative |
| **Drill-down links** | To existing CRM reports |
| **Permission filter** | Domain omitted if no access |
| **Run history** | Saved insight snapshots |
| **Settings** | Enable, period default, notify roles |
| **Permissions** | `ai_reports.*` group |
| **Activity log** | Generate and settings events |

### 5.2 Out of Scope (Phase 1)

- Natural-language free-form chat over data
- External LLM integration
- PDF export with branding
- Scheduled email delivery
- Per-user “my performance” scoped insights

---

## 6. Core Product Concept

AI Reports adds an **interpretation layer** above existing CRM analytics. The system **collects permitted KPIs** from internal report services and module dashboards, **detects notable changes and thresholds**, and **renders a narrative brief** using templates (Phase 1). Each statement is **grounded in cited metrics** so users can verify claims via drill-down.

Three primary surfaces:

1. **AI Reports Hub** — latest brief, generate, history (`/ai-reports`).
2. **Insight detail** — full narrative, KPI citations, domain sections (`/ai-reports/runs/:id`).
3. **Settings** — enable module, defaults, notify roles (`/ai-reports/settings`).

### 6.1 Relationship to Existing CRM Modules

| Module | Data contributed to insights |
|--------|------------------------------|
| **Sales Reports** | Pipeline, conversion, revenue, source mix, rep performance |
| **Leads / Deals / Quotations / Orders** | Open pipeline, stale deals, quote aging |
| **Invoices / Payments** | Issued, overdue, collected, outstanding |
| **P&L Reports** | Revenue, expenses, gross/net margin |
| **GST / Tax Reports** | Output vs input tax summary |
| **Customer / Vendor Ledger** | Top balances, overdue |
| **Expenses / Vendor Bills** | Pending approvals, spend MTD |
| **Inventory / Warehouses** | Low stock, movement velocity |
| **Payroll / Attendance / Leave** | Headcount, absenteeism, leave load |
| **Timesheets** | Billable vs non-billable hours (if tracked) |
| **Manufacturing / Quality** | Open WOs, CAPA, inspection failures |
| **Maintenance / Field Service** | PM overdue, SLA breaches, open FSOs |
| **Subscriptions** | MRR, renewals due, churn MTD |
| **Rental** | Utilization, returns overdue, deposits held |
| **POS / eCommerce** | Counter vs online split, returns |
| **Dashboard** | Existing KPI cards as secondary source |
| **Notifications** | Delivery of “brief ready” alert |
| **Activity Logs** | Audit of insight generation |

### 6.2 Proposed Data Model (Phase 1)

**`ai_report_settings`** (per company, 1:1)

| Field | Purpose |
|-------|---------|
| `company_id` | Tenant scope |
| `is_enabled` | Module on/off |
| `default_period` | `7d`, `30d`, `mtd`, `last_month` |
| `default_domains_json` | `["sales","finance","inventory","hr","operations"]` |
| `include_executive_brief` | Boolean — auto-append cross-domain summary |
| `anomaly_thresholds_json` | e.g. overdue_days, low_stock_days, sla_hours |
| `notify_roles_json` | Roles notified when brief generated |
| `generation_mode` | `template` (Phase 1), `llm` (Phase 2) |
| `llm_provider` | nullable Phase 2 |
| `redact_pii` | Boolean default true Phase 2 |

**`ai_insight_runs`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `run_number` | AIR-2026-0042 |
| `period_start` | Date |
| `period_end` | Date |
| `domains_json` | Domains included |
| `status` | pending, completed, failed |
| `executive_headline` | Text — top-line summary |
| `executive_summary` | Text — cross-domain paragraph |
| `generated_by_id` | FK nullable — null if scheduled |
| `error_message` | Text nullable |
| `created_at`, `completed_at` | |

**`ai_insight_sections`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `run_id` | FK |
| `domain` | sales, finance, inventory, hr, operations, executive |
| `headline` | Text |
| `narrative` | Text — plain-language body |
| `bullets_json` | List of `{text, metric_key, metric_value, link_path}` |
| `watch_items_json` | List of `{severity, text, link_path}` |
| `metrics_json` | Raw KPI snapshot used for narrative |
| `sort_order` | |

---

## 7. Insight Domains

### 7.1 Sales (Phase 1 metrics)

| Metric | Source | Narrative use |
|--------|--------|---------------|
| New leads MTD | Leads | Volume trend |
| Open pipeline value | Deals | Exposure |
| Conversion rate | Sales Reports | Efficiency |
| Won revenue | Invoices / Sales Reports | Booked/collected context |
| Stale deals (>30d) | Deals | Watch item |
| Top lead sources | Sales Reports | Mix insight |
| Quotations pending | Quotations | Follow-up risk |

**Example narrative (template):**

> Sales added **42 leads** this period with **₹18.4L** in open pipeline. Conversion improved to **24%** from **19%** last period. **6 deals** have been idle over 30 days—follow up on Acme Traders and Orion Tech.

### 7.2 Finance (Phase 1 metrics)

| Metric | Source | Narrative use |
|--------|--------|---------------|
| Invoiced revenue | Invoices | Top line |
| Collected vs outstanding | Payments / Ledger | Cash health |
| Overdue invoices count & amount | Invoices | Watch item |
| Expenses MTD | Expenses | Spend |
| Vendor bills due | Vendor Bills | AP pressure |
| Gross / net margin | P&L Reports | Profitability |
| GST net position | GST Reports | Compliance snapshot |
| Subscription MRR | Subscriptions | Recurring context |
| Rental revenue MTD | Rental | Asset revenue |

**Example narrative:**

> Finance issued **₹12.6L** in invoices and collected **₹9.1L**. **₹3.2L** remains overdue across **8 invoices**—largest balance is Acme Traders. Net margin for the period is **14.2%**, down from **16.8%** prior period due to higher operating expenses.

### 7.3 Inventory (Phase 1 metrics)

| Metric | Source | Narrative use |
|--------|--------|---------------|
| Low-stock SKUs | Inventory | Watch item |
| Stock value | Inventory | Capital tied up |
| Movements in/out | Stock movements | Activity |
| Negative / override events | Inventory | Control risk |
| Warehouse hotspots | Warehouses | Location insight |
| POS fast movers | POS | Demand signal |

**Example narrative:**

> Inventory flags **12 SKUs** below reorder level, including **HP Toner 85A** (2 units left). Stock value is **₹29L**. Outbound movements rose **18%** vs prior period—review purchase orders for generators and cabling.

### 7.4 HR (Phase 1 metrics)

| Metric | Source | Narrative use |
|--------|--------|---------------|
| Active headcount | Employees | Scale |
| Attendance rate | Attendance | Reliability |
| Unplanned absences | Attendance | Watch item |
| Leave pending approval | Leaves | Bottleneck |
| Timesheet hours | Timesheets | Utilization |
| Payroll run status | Payroll | Month-end |
| Open recruitment roles | Recruitment | Hiring pipeline |

**Example narrative:**

> HR shows **38 active employees** with **91% attendance** this period. **5 leave requests** await approval; **3 unplanned absences** on the shop floor may affect Thursday dispatch. Payroll for June is **draft**—finalize before the 28th.

### 7.5 Operations (Phase 1 metrics)

| Metric | Source | Narrative use |
|--------|--------|---------------|
| Open manufacturing WOs | Manufacturing | Production load |
| Quality alerts open | Quality | Defect risk |
| Maintenance PM overdue | Maintenance | Downtime risk |
| Field service SLA breached | Field Service | Customer risk |
| Rental utilization / overdue returns | Rental | Asset ops |
| eCommerce returns pending | eCommerce | Fulfillment |
| Project tasks overdue | Projects / Tasks | Delivery risk |

**Example narrative:**

> Operations has **7 open work orders** and **2 SLA-breached** field jobs. **4 assets** are past PM due date. Rental utilization is **68%** with **2 overdue returns**—coordinate yard pickup before weekend.

---

## 8. Executive Brief (Cross-Domain)

### 8.1 Composition (Phase 1)

Executive brief merges **top headline from each included domain** into:

1. **One-sentence headline** — overall business pulse (rule-based: weighted by anomalies).
2. **Short paragraph** — 3–5 sentences covering sales, cash, inventory, people, ops.
3. **Top 5 watch items** — ranked by severity across domains.

### 8.2 Severity Rules (Phase 1)

| Severity | Examples |
|----------|----------|
| `critical` | SLA breached FSO, negative stock override, payroll overdue |
| `high` | Overdue AR > threshold, PM overdue > 7d, churn spike |
| `medium` | Stale deals, low stock, pending leave backlog |
| `low` | Informational trends |

---

## 9. Generation Flow

### 9.1 Manual Generate (Phase 1)

```
User opens AI Reports → Generate
  → Select period + domains (defaults from settings)
  → Create ai_insight_run status=pending
  → For each permitted domain:
      → Fetch KPIs from internal services
      → Apply template narrative + bullets + watch items
      → Save ai_insight_sections row
  → Build executive brief section
  → Mark run completed
  → Notify roles (in-app)
  → Activity log: ai_insight_generated
```

### 9.2 Scheduled Generate (Phase 2)

- Weekly Monday 8 AM IST cron for `notify_roles_json`.
- Email delivery Phase 2.

### 9.3 LLM Enhancement (Phase 2)

```
Template narrative + metrics_json
  → Redact PII if redact_pii=true
  → Prompt LLM: "Rewrite as concise executive brief; do not invent numbers"
  → Validate output against metrics_json (guardrail)
  → Store enhanced narrative; fallback to template on failure
```

---

## 10. Permission and Data Boundaries

### 10.1 Domain Access Matrix (Phase 1)

| Domain | Minimum permission gate |
|--------|-------------------------|
| Sales | `reports.view` OR `deals.view` |
| Finance | `reports.view_financial` OR `pl_reports.view` OR `invoices.view` |
| Inventory | `inventory.view` |
| HR | `employees.view` OR `attendance.view` OR `payroll.view` |
| Operations | Any of `manufacturing.view`, `quality.view`, `maintenance.view`, `field_service.view`, `rental.view`, `ecommerce.view` |

- If user lacks access to a domain, **omit section** silently (do not show “access denied” block in brief).
- Executive brief uses **only permitted domains**.

### 10.2 Row-Level Scope (Phase 2)

- Sales rep may see **own pipeline** insights only when `reports.view_own` pattern is introduced.
- Phase 1: company-wide aggregates for permitted modules only.

---

## 11. AI Reports Hub & UI

### 11.1 Routes

| Route | Purpose |
|-------|---------|
| `/ai-reports` | Hub — latest run, generate, recent history |
| `/ai-reports/runs/:id` | Full insight detail |
| `/ai-reports/settings` | Module settings |

### 11.2 Hub Layout (Phase 1)

- **Generate** card: period picker, domain checkboxes, Generate button.
- **Latest executive headline** with date range.
- **Domain tabs**: Sales | Finance | Inventory | HR | Operations.
- **Watch items** sidebar with severity badges.
- **Recent runs** list (last 20).

### 11.3 Insight Detail

- Executive summary at top.
- Per-domain sections with narrative + metric chips.
- Each bullet links to source report.
- “Metrics used” expandable JSON/table for audit.

---

## 12. Detailed Functional Requirements

### 12.1 Dashboard / Hub

- Show last completed run or empty state with CTA.
- Generate button permission-gated (`ai_reports.generate`).
- Loading state while run is `pending`.

### 12.2 Generate Dialog

- Period: 7d, 30d, MTD, last month, custom (start/end).
- Domains: checkboxes pre-filled from settings; disabled if no permission.
- Option: include executive brief (default on).

### 12.3 Run History

- List: run #, period, domains, created by, status, headline preview.
- Click → detail view.
- Failed runs show `error_message`.

### 12.4 Settings

- Enable module, default period, default domains, thresholds, notify roles.
- Phase 2: LLM provider, API key (encrypted), redact PII toggle.

### 12.5 Permissions

| Permission | Capability |
|------------|------------|
| `ai_reports.view` | View hub and insight run detail |
| `ai_reports.generate` | Trigger insight generation |
| `ai_reports.manage_settings` | Configure module settings |

**Default matrix:**

| Role | view | generate | manage_settings |
|------|------|----------|-----------------|
| Admin | ✓ | ✓ | ✓ |
| Manager | ✓ | ✓ | — |
| Sales | ✓ | — | — |
| Accountant | ✓ | ✓ | — |
| Employee | — | — | — |

---

## 13. Validation and Business Rules

1. Module must be `is_enabled` for AI Reports routes.
2. Generation must include **at least one permitted domain**.
3. `period_end` ≥ `period_start`; max range **366 days** Phase 1.
4. Narrative bullets must reference **metrics present** in `metrics_json` (no orphan claims in template mode).
5. `run_number` unique per company.
6. All queries scoped by `company_id`.
7. Failed domain fetch **does not fail entire run** — section notes partial data unless all domains fail.
8. External LLM calls disabled when `generation_mode=template` (Phase 1 default).
9. Activity log records every successful generation with run id and period.
10. Re-generation for same period allowed — creates new run (history preserved).

---

## 14. Integration Points

### 14.1 API Endpoints (Proposed)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/PUT | `/ai-reports/settings` | Settings |
| GET | `/ai-reports/dashboard` | Latest run summary + recent history |
| POST | `/ai-reports/generate` | Start insight run |
| GET | `/ai-reports/runs` | List runs |
| GET | `/ai-reports/runs/{id}` | Full run with sections |
| GET | `/ai-reports/domains` | Permitted domains for current user |

**Generate request body (example):**

```json
{
  "period_start": "2026-06-01",
  "period_end": "2026-06-24",
  "domains": ["sales", "finance", "inventory", "hr", "operations"],
  "include_executive_brief": true
}
```

### 14.2 Implementation Alignment

**Builds on (existing)**

- `sales_reports_router`, `pl_reports_router`, `tax_reports_router`
- `customer_ledger_router`, `vendor_ledger_router`, `inventory_router`
- `payroll_router`, `attendance_router`, `leaves_router`
- Module dashboard endpoints (subscriptions, rental, manufacturing, etc.)
- `permissions_data.py`, `activity.py`, `notifications`
- `services/notification_service.py`

**New (greenfield)**

- Tables in §6.2
- `ai_reports_router.py`, `ai_reports_config.py`, `ai_reports_schemas.py`
- `services/ai_insight_service.py` — KPI collectors per domain, template engine, executive composer
- `services/ai_insight_templates.py` — narrative templates per domain
- Frontend: `AiReportsHub.jsx`, `AiInsightRunDetail.jsx`, `AiReportsSettings.jsx`
- Optional Phase 2: `services/ai_llm_service.py`

---

## 15. Template Engine (Phase 1)

### 15.1 Design Principles

- **Deterministic** — same inputs produce same narrative (auditable).
- **Grounded** — every sentence maps to `metrics_json` keys.
- **Concise** — 3–6 bullets per domain; readable in under 2 minutes.
- **Indian SME context** — ₹ lakh/crore formatting; GST mentions where relevant.

### 15.2 Template Structure

```python
{
  "headline": "Sales pipeline grew {pipeline_change_pct}% to {pipeline_value}",
  "paragraphs": [
    "You added {new_leads} leads ...",
    "Conversion rate was {conversion_rate}% ..."
  ],
  "watch_rules": [
    {"condition": "overdue_invoices_count > 5", "text": "...", "severity": "high"}
  ]
}
```

### 15.3 Period Comparison

- Compare selected period to **equal-length prior period** where possible.
- Phrases: “up from”, “down from”, “unchanged vs”.

---

## 16. Reporting and Insights

### Phase 1

- Hub with latest brief and watch items
- Run history list
- Domain narratives with drill-down links

### Phase 2

- Scheduled weekly brief
- PDF export
- Natural-language ask box
- LLM-enhanced prose with guardrails

### Phase 3

- Predictive alerts (“likely stockout in 9 days”)
- Board pack multi-month trend narrative
- WhatsApp / email delivery

---

## 17. Release Phasing

### Phase 1 (MVP)

- Settings and enable flag
- Manual generate for 5 domains + executive brief
- Template-based plain-language narratives
- Permission-scoped KPI collection
- Watch items with severity
- Run history and detail view
- In-app notify on completion
- Hub UI and drill-down links
- Permissions and activity logs

### Phase 2

- Natural-language query (“What drove expense increase?”)
- LLM provider config with PII redaction
- Scheduled weekly generation (cron)
- PDF export
- Email delivery
- Configurable anomaly thresholds UI

### Phase 3

- Predictive / forecast snippets
- Per-user scoped insights (sales rep view)
- Hindi summary option
- External share link for board pack
- Fine-tuned domain models

---

## 18. UAT Acceptance Checklist

1. Admin can enable AI Reports in settings.
2. Manager can generate a 30-day brief with all domains.
3. Generated narrative includes sales, finance, inventory, HR, and operations sections when permitted.
4. User without `reports.view_financial` does not see finance metrics in brief.
5. Watch items link to correct CRM report pages.
6. Executive brief summarizes only permitted domains.
7. Failed inventory fetch produces partial run with error note, not total failure.
8. Run history stores and replays prior narrative accurately.
9. User without `ai_reports.generate` cannot trigger generation.
10. Cross-company insight access blocked.
11. Activity log records insight generation.

---

## 19. Open Product Questions

1. **Template-only Phase 1** vs light LLM from day one?
2. Show **metric values inline** in prose or sidebar chips only?
3. **Sales rep** company-wide vs own-pipeline insights — Phase 1 or 2?
4. Include **POS / eCommerce** in Sales or Operations domain?
5. **GST-specific** finance paragraph mandatory for India SMEs?
6. Maximum **run history** retention (90 days vs 1 year)?
7. Allow **Admin to edit** generated narrative before sharing Phase 2?
8. **Compare to same month last year** for seasonal businesses?
9. Branding on exported PDF — company logo from settings?
10. Rate limit: max **N generations per day** per company?

---

## Appendix A: Example Executive Brief

**Period:** 1–24 Jun 2026  
**Headline:** Revenue is steady but overdue collections and low stock on fast movers need attention this week.

**Summary:** Sales added 42 leads and closed ₹8.4L in won deals, keeping pipeline at ₹18.4L. Finance collected ₹9.1L against ₹12.6L invoiced, leaving ₹3.2L overdue. Inventory shows 12 SKUs below reorder, including toner and cabling. Attendance held at 91% with 5 pending leave approvals. Operations flagged 2 SLA-breached field jobs and 2 overdue rental returns.

**Watch items:**

1. **[High]** 8 overdue invoices — ₹3.2L outstanding → Customer Ledger  
2. **[High]** 12 low-stock SKUs → Inventory  
3. **[Medium]** 6 stale deals >30 days → Deals pipeline  
4. **[Medium]** 2 SLA-breached field orders → Field Service  
5. **[Low]** Subscription renewals due in 7 days: 4 → Subscriptions  

---

## Appendix B: Domain → Source Service Map

| Domain | Primary collectors (Phase 1) |
|--------|------------------------------|
| Sales | `sales_reports_router`, deals/leads counts |
| Finance | `pl_reports_router`, `invoices_router`, `payments_router`, ledgers |
| Inventory | `inventory_router`, `stock_movements_router` |
| HR | `employees_router`, `attendance_router`, `leaves_router`, `payroll_router` |
| Operations | Module dashboards: manufacturing, quality, maintenance, field_service, rental, ecommerce |

---

## Appendix C: Starter Permissions Seed

```python
AI_REPORTS_PERMISSIONS = [
    ("ai_reports.view", "View AI Reports hub and insight history"),
    ("ai_reports.generate", "Generate plain-language insight briefs"),
    ("ai_reports.manage_settings", "Configure AI Reports module settings"),
]
```

---

## Appendix D: Alignment with Product Roadmap

| Roadmap item | AI Reports contribution |
|--------------|-------------------------|
| Sales Reports | Sales narrative source |
| P&L / GST | Finance narrative source |
| Inventory | Stock risk narrative |
| HR modules | People narrative |
| Operations modules | Delivery & asset risk narrative |
| Dashboard | Optional KPI fallback |
| Multi-tenant SaaS | Per-tenant insight isolation Phase 3 |

---

## Appendix E: Relationship to Adjacent Modules

| Module | AI Reports vs |
|--------|---------------|
| **Sales Reports** | Charts and tables vs **interpreted** sales story |
| **P&L Reports** | Income statement vs **why margin moved** summary |
| **Dashboard** | Live KPI tiles vs **period narrative** and watch list |
| **Notifications** | Event alerts vs **digest** of cross-module health |
| **Export CSV** | Raw data vs **management-ready prose** |

AI Reports **does not replace** existing reports—it **reads** them (and underlying data) to produce **plain-language insights** leadership can act on in weekly reviews.

---

*End of PRD — AI Reports v1.0*
