# Product Requirements Document (PRD)
## Quality Control (Level 6 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Operations / Quality Assurance / Compliance  
**Document Version:** v1.0  
**Date:** 2026-06-24  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Quality Control extends BlackPapers CRM with a **structured quality assurance layer** so Indian SMEs can define **inspection points** across purchase, production, and dispatch; run **pass/fail checks** with checklists and measurements; receive **quality alerts** when thresholds are breached; and track **corrective actions** (CAPA) to closure—without a separate QMS spreadsheet or disconnected audit files.

The module builds on Manufacturing / MRP’s Phase 1 work-order inspections and generalizes quality workflows for **incoming goods**, **in-process production**, **finished goods**, and **customer returns**. It must integrate with **Products**, **Inventory**, **Purchase Orders**, **Manufacturing / Work Orders**, **Sales Orders**, **Notifications**, and **Activity Logs**.

Core promise from product scope:

> **Add inspection points, quality alerts, pass/fail checks, and corrective action tracking.**

---

## 2. Problem Statement

Today, CRM may record stock movements and production completion, but there is no **central quality system** for when to inspect, what to check, who failed, and what was done about it. QC happens on paper checklists, WhatsApp photos, or isolated manufacturing screens without alerts, trends, or corrective-action follow-up.

Common issues this module should solve:

- No defined **inspection points** (when GRN arrives, mid-production, before dispatch)
- **Pass/fail** results are not standardized per product or process stage
- Managers learn about failures late—no **quality alerts** or escalation
- Failed batches are rejected verbally with no **audit record**
- **Corrective actions** (rework, vendor claim, process change) are not tracked to closure
- Incoming material quality is not linked to **Purchase Orders**
- Production QC is siloed inside Manufacturing with no cross-module view
- Customer **returns** due to defects have no root-cause or CAPA link
- Leadership cannot answer “what is our fail rate this month?” or “which supplier has repeat issues?”
- Repeat failures on the same product or inspection point go unnoticed
- Inspectors use ad-hoc checklists instead of **product-specific templates**

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Define **inspection points** by type (incoming, in-process, final, return) and trigger (manual, on PO receipt, on WO stage, on SO dispatch).
2. Attach **checklist templates** to products and inspection points with required pass/fail items.
3. Run **inspections** with per-item pass/fail, notes, optional measured values, and overall result.
4. Block or warn downstream actions when inspection **fails** (e.g. FG receipt, PO close) when configured.
5. Generate **quality alerts** for failed inspections, overdue pending inspections, and repeat-failure thresholds.
6. Create and track **corrective actions** linked to failed inspections with owner, due date, and status.
7. Provide a **QC dashboard**: pending queue, fail rate, open CAPAs, alerts.
8. Integrate with **Manufacturing** work orders (extend existing `quality_inspections` or unify under Quality module).
9. Support **incoming inspection** on purchase receipt (Phase 1 basic link to PO).
10. Enforce **role-based permissions** for template edit, inspect, approve waiver, manage CAPA.
11. Preserve **audit trail** on templates, inspections, alerts, and corrective actions.
12. Send **in-app notifications** (and email Phase 2) on critical quality events.

### 3.2 Non-Goals (This Phase)

1. Full **ISO 9001 / GMP** document control and certification workflow automation.
2. **SPC / control charts**, Cpk, and statistical process control engines.
3. **Lab LIMS** integration and external test equipment data capture.
4. **Barcode / vision system** automated defect detection.
5. **Supplier scorecard** portal for vendors (internal view Phase 2).
6. **Customer complaint** full CRM ticketing replacement (link only Phase 1).
7. **Batch genealogy** traceability across multi-step chemical processes (Manufacturing Phase 2+).
8. **Mobile native** inspector app (responsive web Phase 1).
9. **Digital signature** with legal e-sign providers.
10. Replacing Manufacturing’s BOM or work-order execution—QC wraps around those flows.

---

## 4. Target Users and Roles

### 4.1 Primary Users (CRM Staff)

| User | Quality Control need |
|------|-------------------|
| **QC inspector** | Run inspections, record pass/fail, attach notes |
| **QC supervisor** | Review failures, assign CAPAs, waive blocked actions |
| **Store / GRN clerk** | Trigger incoming inspection on material receipt |
| **Production supervisor** | See WO-linked inspections and failures |
| **Procurement** | View incoming quality failures by vendor / PO |
| **Admin / Owner** | Enable module, templates, alert rules, defaults |

### 4.2 Secondary Users (CRM Staff)

| User | Quality Control need |
|------|-------------------|
| **Sales / Operations** | See dispatch-hold status for customer orders |
| **Finance** | Review scrap and return impact tied to QC |
| **Manager** | Fail rates, open CAPAs, supplier quality KPIs |
| **Leadership** | Quality trends and repeat-issue summary |

### 4.3 External (Phase 2+)

| User | Quality Control need |
|------|-------------------|
| **Vendor** | View NCR / corrective requests (portal Phase 3) |
| **Customer** | Return quality claim status (portal Phase 3) |

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **Inspection points** | Master of when/where inspections apply |
| **Checklist templates** | Reusable item lists per product or point |
| **Inspections** | Execute checks, overall pass/fail/waived |
| **Quality alerts** | System-generated notices on rules |
| **Corrective actions** | CAPA record linked to inspection |
| **QC dashboard** | Queue, KPIs, alerts, CAPA list |
| **Manufacturing link** | WO final inspection (unify with existing) |
| **PO incoming link** | Inspection on purchase receipt (Phase 1) |
| **Permissions** | `quality.*` permission group |
| **Activity log** | Template, inspection, alert, CAPA events |

### 5.2 Out of Scope (Phase 1)

- SPC charts and control limits
- Multi-step approval chains for every inspection
- Photo/video attachment storage (Phase 2)
- Auto CAPA creation rules engine (manual create Phase 1)
- Integration with external QMS or ERP quality modules
- Customer-facing quality certificates PDF (Phase 2)

---

## 6. Core Product Concept

Quality Control adds an **inspection and CAPA layer** across operations. Admins define **inspection points** and **templates**; operators trigger or receive inspections at GRN, production, or dispatch; inspectors record **pass/fail**; failures generate **alerts** and optional **corrective actions** tracked to closure.

Three primary surfaces:

1. **QC Dashboard** — overview (`/quality`).
2. **Inspection execution** — detail with checklist and result (`/quality/inspections/:id`).
3. **Template & point manager** — setup (`/quality/templates`, `/quality/inspection-points`).

### 6.1 Relationship to Existing CRM Modules

| Module | Role relative to Quality Control |
|--------|----------------------------------|
| **Manufacturing / MRP** | Final WO inspection; block FG receipt on fail |
| **Purchase Orders** | Incoming inspection on receipt; vendor quality |
| **Inventory / Stock In** | GRN may require passed incoming inspection |
| **Sales Orders** | Pre-dispatch inspection optional (Phase 2) |
| **Products / Services** | Template assignment per product |
| **POS / eCommerce returns** | Return inspection point (Phase 2) |
| **Notifications** | Quality alerts delivery |
| **Activity Logs** | Inspection and CAPA audit |
| **Users (CRM)** | Inspector, supervisor roles |

### 6.2 Proposed Data Model (Phase 1)

**`quality_settings`** (per company, 1:1)

| Field | Purpose |
|-------|---------|
| `company_id` | Tenant scope |
| `is_enabled` | Module on/off |
| `inspection_number_prefix` | e.g. QC |
| `capa_number_prefix` | e.g. CAPA |
| `default_incoming_required` | Boolean — PO receipt needs inspection |
| `block_on_fail_default` | Boolean — block downstream on fail |
| `alert_repeat_fail_threshold` | Integer — e.g. 3 fails in 30 days |
| `alert_overdue_hours` | Integer — pending inspection SLA |
| `notify_roles_json` | Roles to alert on critical fail |

**`inspection_points`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `code` | e.g. `INCOMING_GRN`, `WO_FINAL`, `PRE_DISPATCH` |
| `name` | Display name |
| `point_type` | incoming, in_process, final, return, other |
| `trigger` | manual, on_po_receipt, on_wo_qc_pending, on_so_confirm |
| `is_active` | Boolean |
| `block_on_fail` | Boolean override |
| `default_template_id` | FK nullable |
| `sort_order` | |

**`quality_checklist_templates`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `name` | e.g. "Soap — Final visual" |
| `product_id` | FK nullable (product-specific) |
| `inspection_point_id` | FK nullable |
| `items_json` | Checklist definition (see §7.3) |
| `status` | draft, active, archived |
| `version` | e.g. 1.0 |
| `created_by_id` | |

**`quality_inspections`** (extends / unifies Manufacturing table)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `inspection_number` | QC-2026-0042 |
| `inspection_point_id` | FK |
| `template_id` | FK snapshot |
| `status` | pending, passed, failed, waived |
| `checklist_json` | Items + pass/fail + values |
| `overall_notes` | |
| `reference_type` | work_order, purchase_order, sales_order, manual, return |
| `reference_id` | FK nullable |
| `product_id` | FK nullable |
| `batch_ref` | String nullable (Phase 2 lot) |
| `inspected_by_id` | FK users |
| `inspected_at` | DateTime |
| `waived_by_id` | FK nullable |
| `waiver_reason` | Text nullable |

**`quality_alerts`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `alert_type` | inspection_failed, inspection_overdue, repeat_failure, capa_overdue |
| `severity` | low, medium, high, critical |
| `title` | Short headline |
| `message` | Detail |
| `inspection_id` | FK nullable |
| `capa_id` | FK nullable |
| `product_id` | FK nullable |
| `status` | open, acknowledged, resolved |
| `acknowledged_by_id` | FK nullable |
| `created_at` | |

**`corrective_actions`** (CAPA)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `capa_number` | CAPA-2026-0012 |
| `inspection_id` | FK |
| `title` | |
| `description` | Problem statement |
| `action_type` | rework, scrap, vendor_return, process_change, training, other |
| `status` | open, in_progress, verified, closed |
| `assigned_to_id` | FK users |
| `due_date` | Date |
| `root_cause` | Text nullable |
| `corrective_steps` | Text |
| `verification_notes` | Text nullable |
| `closed_by_id` | FK nullable |
| `closed_at` | DateTime nullable |
| `created_by_id` | |

**Product extension** (optional migration):

| Field | Purpose |
|-------|---------|
| `default_incoming_template_id` | FK nullable |
| `default_final_template_id` | FK nullable |
| `requires_incoming_qc` | Boolean default false |
| `requires_final_qc` | Boolean default false |

---

## 7. Inspection Points & Templates

### 7.1 Standard Inspection Points (Seed)

| Code | Type | Trigger | Typical use |
|------|------|---------|-------------|
| `INCOMING_GRN` | incoming | on_po_receipt | Raw material at store receipt |
| `WO_IN_PROCESS` | in_process | manual | Mid-production spot check |
| `WO_FINAL` | final | on_wo_qc_pending | Finished goods before stock-in |
| `PRE_DISPATCH` | final | on_so_confirm | Before customer shipment (Phase 2) |
| `CUSTOMER_RETURN` | return | manual | Return goods assessment (Phase 2) |

### 7.2 Inspection Point Pages (CRM)

| Route | Purpose |
|-------|---------|
| `/quality/inspection-points` | List and edit points |
| `/quality/inspection-points/new` | Create point |
| `/quality/templates` | Checklist template list |
| `/quality/templates/new` | Create template |
| `/quality/templates/:id` | Edit template items |

### 7.3 Checklist Template Item Schema

```json
[
  {
    "key": "visual",
    "label": "Visual inspection — no defects",
    "required": true,
    "input_type": "pass_fail",
    "spec": null
  },
  {
    "key": "weight",
    "label": "Weight (g)",
    "required": true,
    "input_type": "number",
    "spec": { "min": 98, "max": 102, "unit": "g" }
  },
  {
    "key": "packaging",
    "label": "Packaging seal intact",
    "required": false,
    "input_type": "pass_fail",
    "spec": null
  }
]
```

**Pass/fail rules (Phase 1):**

- `pass_fail` items: inspector marks pass or fail.
- `number` items: auto-fail if outside `spec.min` / `spec.max` when provided.
- Overall inspection **failed** if any required item fails.
- Overall **passed** when all required items pass.

### 7.4 Template Rules

- One **active** template per product + inspection point (configurable: allow versions).
- Template changes do not alter completed inspections (snapshot in `checklist_json`).
- Archiving template does not delete historical inspections.

---

## 8. Inspection Execution

### 8.1 Inspection Lifecycle

```
pending → passed
        → failed → (optional CAPA) → waived (manager)
        → cancelled (before submit)
```

| Status | Meaning |
|--------|---------|
| `pending` | Created, awaiting inspector |
| `passed` | All required checks passed |
| `failed` | One or more required checks failed |
| `waived` | Manager override with reason |
| `cancelled` | Voided before completion |

### 8.2 Inspection Pages

| Route | Purpose |
|-------|---------|
| `/quality` | Dashboard + pending queue |
| `/quality/inspections` | All inspections with filters |
| `/quality/inspections/:id` | Execute or view inspection |
| `/quality/inspections/new` | Manual inspection |

### 8.3 Creation Sources (Phase 1)

| Source | How inspection is created |
|--------|---------------------------|
| **Manufacturing WO** | WO → `qc_pending` creates `WO_FINAL` inspection |
| **Purchase receipt** | User records PO receipt → optional `INCOMING_GRN` inspection |
| **Manual** | Inspector selects product, point, template |
| **Repeat** | Copy previous inspection as new (Phase 2) |

### 8.4 Downstream Blocks

| Point | Block when failed (if `block_on_fail`) |
|-------|----------------------------------------|
| `WO_FINAL` | Finished goods receipt on work order |
| `INCOMING_GRN` | PO line fully received / stock acceptance (Phase 1 warn; Phase 2 hard block) |
| `PRE_DISPATCH` | Sales order dispatch (Phase 2) |

---

## 9. Quality Alerts

### 9.1 Alert Types (Phase 1)

| Type | Trigger |
|------|---------|
| `inspection_failed` | Any inspection submitted as failed |
| `inspection_overdue` | Pending inspection older than `alert_overdue_hours` |
| `repeat_failure` | Same product + point fails ≥ threshold in rolling window |
| `capa_overdue` | Corrective action past due date and not closed |

### 9.2 Alert Delivery

- **Dashboard** — open alerts panel on `/quality`.
- **Notifications** — in-app notification to users with `quality.view` + configured roles.
- **Email** — Phase 2 via existing email template system.

### 9.3 Alert Actions

- **Acknowledge** — user marks seen (`acknowledged_by_id`).
- **Resolve** — link to closed CAPA or manual resolution note (Phase 2).

---

## 10. Corrective Actions (CAPA)

### 10.1 CAPA Workflow (Phase 1)

```
open → in_progress → verified → closed
```

1. Inspector or supervisor creates CAPA from **failed** inspection.
2. Assign owner and due date; describe problem and corrective steps.
3. Owner updates status and root cause notes.
4. Supervisor **verifies** fix and **closes** CAPA.
5. Activity log: `capa_created`, `capa_closed`.

### 10.2 CAPA Pages

| Route | Purpose |
|-------|---------|
| `/quality/corrective-actions` | CAPA list |
| `/quality/corrective-actions/:id` | CAPA detail |
| `/quality/corrective-actions/new` | Create from inspection |

### 10.3 CAPA Fields (UI)

- Link to failed inspection and product
- Action type: rework, scrap, vendor return, process change, training, other
- Root cause (5-why text field Phase 1; structured Phase 2)
- Corrective steps and verification notes

---

## 11. QC Dashboard & Reporting

### 11.1 Phase 1 — Dashboard KPIs

- Pending inspections count
- Failed inspections (7d / 30d)
- Pass rate % (30d)
- Open alerts count
- Open CAPAs count
- Overdue CAPAs count

### 11.2 Phase 1 — Lists

- Pending inspection queue (by point, product, age)
- Recent failures with link to inspection + CAPA
- Open alerts
- Open corrective actions

### 11.3 Phase 2 — Reports

- Fail rate by product
- Fail rate by inspection point
- Fail rate by vendor (incoming)
- Inspector throughput
- CAPA cycle time (open → closed)
- Repeat failure heatmap

---

## 12. Information Architecture and Navigation

### 12.1 CRM Sidebar (Staff)

| Route | Purpose |
|-------|---------|
| `/quality` | QC dashboard |
| `/quality/inspections` | Inspection list |
| `/quality/inspections/:id` | Inspection detail |
| `/quality/corrective-actions` | CAPA list |
| `/quality/templates` | Checklist templates |
| `/quality/inspection-points` | Inspection points |
| `/quality/settings` | Module settings |

Sidebar label: **Quality Control** (requires `quality.view`).  
Grouped under **Operations**.

### 12.2 Entry Points

- App launcher: **Quality Control** tile
- Manufacturing work order detail: “QC inspection” tab (links to unified inspection)
- Purchase order detail: “Incoming QC” after receipt
- Product detail: “QC templates” when `requires_*_qc` flags set
- Notifications: tap alert → inspection or CAPA detail

### 12.3 Relationship to Manufacturing QC Routes

| Current (Manufacturing Phase 1) | Target (Quality Control) |
|--------------------------------|--------------------------|
| `/manufacturing/quality` | Redirect or embed → `/quality/inspections?point=WO_FINAL` |
| `manufacturing.quality` permission | Maps to `quality.inspect` + `quality.view` |
| `quality_inspections` table | Extended with `inspection_point_id`, `reference_type` |

Backward compatibility: Manufacturing module continues to trigger WO final inspections; Quality module owns the data model and UI.

---

## 13. Detailed Functional Requirements

### 13.1 QC Dashboard

- KPI cards: pending, failed (7d), pass rate, open alerts, open CAPAs
- Tables: pending queue, critical alerts, overdue CAPAs
- Quick actions: New inspection, View templates, Open CAPA list

### 13.2 Inspection List

- Filters: status, point, product, reference type, date range, inspector
- Columns: QC #, point, product, reference, status, inspector, date
- Export CSV Phase 2

### 13.3 Inspection Detail

- Header: product, point, linked WO/PO/SO
- Checklist grid: item, spec, result, pass/fail indicator
- Actions: Submit pass/fail, Waive (manager), Create CAPA (on fail)
- Timeline: created, inspected, waived

### 13.4 Template Manager

- List templates with product, point, version, status
- Editor: drag-sort items, input type, required flag, spec for numbers
- Activate / archive template

### 13.5 CAPA Manager

- List with status, assignee, due date, linked inspection
- Detail: edit root cause, steps, verification
- Close with verification notes

### 13.6 Settings

- Enable module, prefixes, default block-on-fail
- Alert thresholds (repeat fail count, overdue hours)
- Notify roles on critical fail

### 13.7 Permissions

| Permission | Capability |
|------------|------------|
| `quality.view` | View dashboard, inspections, alerts, CAPAs |
| `quality.inspect` | Execute and submit inspections |
| `quality.manage_templates` | Create/edit templates and inspection points |
| `quality.waive` | Waive failed inspection (manager) |
| `quality.manage_capa` | Create, assign, close corrective actions |
| `quality.manage_alerts` | Acknowledge and resolve alerts |
| `quality.manage_settings` | Module configuration |

**Default matrix:**

| Role | view | inspect | manage_templates | waive | manage_capa | manage_alerts | manage_settings |
|------|------|---------|------------------|-------|-------------|---------------|-----------------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manager | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Sales | ✓ | — | — | — | — | — | — |
| Accountant | ✓ | — | — | — | — | — | — |
| Employee | ✓ | ✓ | — | — | — | — | — |

---

## 14. UI / UX Requirements

### 14.1 Inspection Execution

- Large pass/fail toggles for shop-floor tablet use
- Red highlight on failed required items
- Confirm dialog on overall fail and on waive
- Show linked reference (WO #, PO #) prominently

### 14.2 Alert Panel

- Severity color coding (critical = red)
- One-click navigate to inspection or CAPA
- Acknowledge without leaving dashboard

### 14.3 CAPA Detail

- Clear link back to failed inspection checklist snapshot
- Due date overdue styling
- Status badge and assignee avatar/name

---

## 15. Validation and Business Rules

1. Module must be `is_enabled` for quality routes.
2. Cannot submit inspection without all **required** items answered.
3. **Waived** requires `quality.waive` and non-empty `waiver_reason`.
4. **CAPA** can only be created from `failed` or `waived` inspections.
5. Cannot close CAPA without `verification_notes` when status → `closed`.
6. `block_on_fail` prevents FG receipt (Manufacturing) when latest `WO_FINAL` inspection is `failed`.
7. Template activation requires at least one checklist item.
8. Inspection point `code` unique per company.
9. All queries scoped by `company_id`.
10. Cancelled inspections excluded from pass-rate KPIs.
11. Repeat-failure alert deduped: max one open alert per product+point per window.

---

## 16. Integration Points

### 16.1 API Endpoints (Proposed)

**Settings & master data**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/PUT | `/quality/settings` | Settings |
| GET/POST | `/quality/inspection-points` | Inspection points |
| PUT | `/quality/inspection-points/{id}` | Update point |
| GET/POST | `/quality/templates` | Templates |
| GET/PUT | `/quality/templates/{id}` | Template detail |
| POST | `/quality/templates/{id}/activate` | Set active |

**Inspections**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/quality/dashboard` | KPIs |
| GET/POST | `/quality/inspections` | List / create |
| GET | `/quality/inspections/{id}` | Detail |
| PUT | `/quality/inspections/{id}/submit` | Submit result |
| PUT | `/quality/inspections/{id}/waive` | Manager waiver |

**Alerts & CAPA**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/quality/alerts` | Open alerts |
| PUT | `/quality/alerts/{id}/acknowledge` | Acknowledge |
| GET/POST | `/quality/corrective-actions` | CAPA list / create |
| GET/PUT | `/quality/corrective-actions/{id}` | CAPA detail / update |

### 16.2 Implementation Alignment

**Builds on (existing)**

- `quality_inspections` (Manufacturing) — migrate/extend columns
- `products` — template flags
- `purchase_orders` — incoming trigger
- `work_orders` — final inspection trigger
- `permissions_data.py`, `activity.py`, `notifications`

**New (greenfield)**

- `quality_settings`, `inspection_points`, `quality_checklist_templates`, `quality_alerts`, `corrective_actions`
- `quality_router.py`, `quality_config.py`, `quality_schemas.py`
- Frontend: `QualityDashboard.jsx`, `QualityInspections.jsx`, `QualityInspectionDetail.jsx`, `QualityTemplates.jsx`, `CorrectiveActions.jsx`, `QualitySettings.jsx`

---

## 17. Reporting and Insights

### Phase 1

- Dashboard KPIs
- Inspection list filters and pass/fail counts
- Open alerts and CAPA lists

### Phase 2

- Fail rate by product and inspection point
- Vendor incoming quality scorecard
- CAPA cycle time report
- Inspector productivity

### Phase 3

- Trend charts and SPC-lite control limits
- Export for external audit packs

---

## 18. Release Phasing

### Phase 1 (MVP)

- Quality settings and inspection points (seed defaults)
- Checklist templates CRUD + activate
- Unified inspections (WO final + manual + incoming PO link)
- Pass/fail submit and manager waive
- Quality alerts: failed, overdue, repeat failure
- Corrective actions: create, assign, close
- Dashboard + queues
- Manufacturing integration (WO → inspection, block FG on fail)
- Permissions and activity logs

### Phase 2

- Pre-dispatch SO inspection
- Customer return inspection
- Photo attachment per checklist item
- Email alerts
- PO hard-block on incoming fail
- Product-level `requires_*_qc` enforcement
- CSV export

### Phase 3

- Vendor quality portal
- SPC charts
- Auto-CAPA rules
- Digital inspection certificates PDF

---

## 19. UAT Acceptance Checklist

1. Admin can enable Quality Control in settings.
2. Admin can create inspection point and active checklist template with 2+ items.
3. Manufacturing WO moved to `qc_pending` creates `WO_FINAL` inspection in Quality queue.
4. Inspector can submit pass result with all required items marked.
5. Inspector can submit fail result; alert appears on dashboard.
6. Manager can waive failed inspection with reason.
7. User can create CAPA from failed inspection and close with verification notes.
8. Failed `WO_FINAL` inspection blocks FG receipt when `block_on_fail` is true.
9. Repeat failure on same product triggers repeat-failure alert after threshold.
10. Pending inspection older than SLA triggers overdue alert.
11. User without `quality.inspect` cannot submit inspection.
12. Cross-company inspection access is blocked.
13. Activity log records submit, waive, CAPA create, and CAPA close.

---

## 20. Open Product Questions

1. **Unify** `quality_inspections` table in place vs new table + migration from Manufacturing?
2. **Incoming QC**: warn only vs hard-block PO receipt in Phase 1?
3. Should **failed incoming** auto-create vendor debit note / return PO (Phase 2)?
4. **Number specs**: store measured values in `checklist_json` only or separate readings table?
5. **Inspector assignment**: round-robin queue vs manual claim?
6. Link **Project tasks** to CAPA corrective steps?
7. **Customer complaints** module merge vs link-only?
8. Pass-rate KPI: count **waived** as pass or exclude?
9. Multi-language checklist labels for shop floor?
10. Plan limits: max open inspections on free tier?

---

## Appendix A: Example Quality Journey

1. Store receives coconut oil against PO-2026-0088 → system creates `INCOMING_GRN` inspection.
2. Inspector runs checklist — **passed** → stock accepted.
3. Manufacturing completes WO-2026-0015 batch → `WO_FINAL` inspection created.
4. Inspector finds packaging fail → submits **failed** → alert to supervisor.
5. Supervisor creates **CAPA-2026-0003** (rework — re-label batch), assigns shop floor lead.
6. Rework completed; new inspection **passed** → FG receipt allowed.
7. Dashboard shows 95% pass rate for the week; one closed CAPA.

---

## Appendix B: Inspection Status Timeline

```
pending → passed
        → failed → CAPA (optional) → new inspection
        → waived (manager)
        → cancelled
```

---

## Appendix C: Starter Permissions Seed

```python
QUALITY_PERMISSIONS = [
    ("quality.view", "View quality dashboard, inspections, and alerts"),
    ("quality.inspect", "Execute and submit quality inspections"),
    ("quality.manage_templates", "Manage inspection points and checklist templates"),
    ("quality.waive", "Waive failed inspections"),
    ("quality.manage_capa", "Manage corrective actions"),
    ("quality.manage_alerts", "Acknowledge and resolve quality alerts"),
    ("quality.manage_settings", "Configure quality control settings"),
]
```

---

## Appendix D: Alignment with Product Roadmap

| Roadmap item | Quality Control contribution |
|--------------|------------------------------|
| Manufacturing / MRP | Final WO inspection; FG receipt gate |
| Purchase Orders | Incoming material inspection |
| Inventory | GRN quality gate |
| Sales Orders | Pre-dispatch check (Phase 2) |
| Notifications | Quality alerts |
| Products | Per-product checklist templates |

---

## Appendix E: Relationship to Manufacturing PRD

| Manufacturing / MRP (Phase 1) | Quality Control module |
|------------------------------|------------------------|
| Basic WO checklist + QC queue | Full inspection point model |
| `quality_inspections` on WO only | Inspections across PO, WO, manual |
| Pass/fail on WO completion | Pass/fail + numeric specs + alerts |
| No CAPA | Corrective action tracking |
| No repeat-failure alerts | Alert engine + dashboard |
| `/manufacturing/quality` | Unified `/quality` hub |

Quality Control **extends** Manufacturing QC; it does not remove production planning or BOM features from Manufacturing.

---

*End of PRD — Quality Control v1.0*
