# Product Requirements Document (PRD)
## Field Service (Level 8 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Operations / Customer Service / On-Site Delivery  
**Document Version:** v1.0  
**Date:** 2026-06-24  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Field Service extends BlackPapers CRM with a **dispatch and site-visit layer** so Indian SMEs can **assign technicians or field teams** to customer locations for **installations, inspections, repairs, and AMC visits**—without WhatsApp coordination, paper job sheets, or disconnected calendar apps.

The module must integrate with existing **Contacts**, **Sales Orders**, **Quotations**, **Maintenance / CMMS**, **Products / Inventory**, **Expenses**, **Invoices**, **Employees**, **Projects**, **Notifications**, and **Activity Logs** so customer-facing service work is visible alongside sales, delivery, and internal plant maintenance.

Core promise from product scope:

> **Assign technicians or field teams for site visits, installations, inspections, and repairs.**

---

## 2. Problem Statement

Today, CRM tracks commercial documents, inventory, and internal plant maintenance—but there is no **field operations system** for outbound customer service. Site visits are scheduled in personal calendars; technicians receive addresses on phone calls; visit outcomes are reported verbally; parts used on-site are not tied to inventory; customers have no structured service history.

Common issues this module should solve:

- No **service request queue** for customer complaints, installations, or AMC calls
- **Technician dispatch** is manual with no assignment visibility or workload balance
- **Site visit details** (address, contact person, access notes) are scattered across deals and chat
- **Installations** after sales are not linked to sales orders or quotations
- **Inspections** at customer premises (warranty, AMC, safety) lack a checklist and sign-off record
- **On-site repairs** are not distinguished from internal plant maintenance (Maintenance module)
- **Parts consumed** on customer visits are not deducted from inventory or van stock
- **Travel and service expenses** are buried without job-level rollup
- **SLA / promised visit date** is missed without reminders
- Leadership cannot answer “how many open field jobs?”, “which technician is overloaded?”, or “what was our first-visit fix rate this month?”

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Create and track **field service orders** (FSO) for installation, inspection, repair, AMC visit, and other site work.
2. **Assign technicians or field teams** with scheduled date/time window and priority.
3. Capture **customer site context**: contact, address, geo notes, access instructions, equipment at site.
4. Support **dispatch board / schedule** view: today’s visits, unassigned queue, overdue jobs.
5. Log **visit lifecycle**: dispatch → en route → on site → completed / rescheduled / cancelled.
6. Record **work performed**, resolution notes, and optional customer sign-off (Phase 2).
7. Issue **spare parts / materials** used on the job with inventory stock-out linkage.
8. Link FSO to **contacts**, optional **sales orders**, **quotations**, **projects**, and **maintenance assets** at customer site.
9. Provide a **field service dashboard**: open jobs, today’s schedule, SLA breaches, completions.
10. Send **alerts** for unassigned urgent jobs and overdue scheduled visits (in-app Phase 1).
11. Enforce **role-based permissions** for create, dispatch, execute, parts issue, cancel.
12. Preserve **audit trail** on service orders, assignments, and parts usage.
13. Optional link to **invoices / expenses** for billable service (Phase 2).

### 3.2 Non-Goals (This Phase)

1. Full **enterprise FSM** (Salesforce Field Service, ServiceMax depth).
2. **Real-time GPS fleet tracking** and route optimization engine.
3. **Native mobile offline** technician app (responsive web Phase 1).
4. **Customer self-service portal** for booking visits (Phase 3).
5. **Automated route planning** with traffic and multi-stop optimization.
6. **IoT remote diagnostics** from equipment at customer site.
7. Replacing **Maintenance / CMMS** for in-plant asset servicing—Field Service is **customer-site outbound**.
8. Replacing **Project Management** for long multi-month implementations—link only, not duplicate PM tasks.
9. **Van / truck inventory** as separate warehouse (Phase 2; Phase 1 uses central stock issue).
10. **Video call** or AR-assisted remote support.

---

## 4. Target Users and Roles

### 4.1 Primary Users (CRM Staff)

| User | Field Service need |
|------|-------------------|
| **Service coordinator / dispatcher** | Create FSO, assign technicians, reschedule visits |
| **Field technician** | View assigned jobs, update status, log work, issue parts |
| **Field team lead** | Oversee team queue, close jobs, review visit notes |
| **Sales / account manager** | Raise installation or warranty visit from customer context |
| **AMC / service manager** | Schedule recurring AMC visits, track SLA |
| **Admin / Owner** | Enable module, service types, SLA defaults, numbering |

### 4.2 Secondary Users (CRM Staff)

| User | Field Service need |
|------|-------------------|
| **Store / inventory** | Issue parts against open FSO |
| **Finance / Accountant** | Review service cost and billable jobs (Phase 2) |
| **Project manager** | Link large installation FSO to project milestones |
| **Leadership** | Open jobs, completion rate, technician utilization KPIs |

### 4.3 External (Phase 2+)

| User | Field Service need |
|------|-----------------|
| **Customer contact** | Receive visit confirmation, sign service report (portal Phase 3) |
| **Subcontractor technician** | Limited job view and status update (portal Phase 3) |

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **Service order (FSO)** | Customer-site job with type, priority, schedule |
| **Technician assignment** | User or team assignment with date window |
| **Site / customer context** | Address, contact person, notes from CRM contact |
| **Visit types** | Installation, inspection, repair, AMC, other |
| **Dispatch queue** | Unassigned and scheduled job lists |
| **Status workflow** | Draft → scheduled → in progress → completed |
| **Parts on job** | Spare parts issue linked to inventory |
| **Service history** | Per contact / site timeline |
| **Dashboard** | Open jobs, today’s visits, overdue SLA |
| **Alerts** | Unassigned urgent, overdue visit |
| **Permissions** | `field_service.*` permission group |
| **Activity log** | FSO create, assign, complete, parts issue |

### 5.2 Out of Scope (Phase 1)

- GPS live tracking map
- Customer portal booking
- Van stock / mobile warehouse
- Photo attachments on FSO (Phase 2)
- Digital signature capture (Phase 2)
- Automated AMC recurrence engine (manual FSO Phase 1; bulk schedule Phase 2)
- Invoice generation from FSO (Phase 2)

---

## 6. Core Product Concept

Field Service adds a **customer-site service order layer**. Coordinators create **field service orders** from a customer contact or sales handoff; **technicians** are assigned with a scheduled window; work is **executed on site** with resolution notes; **parts** are consumed from inventory; jobs are **closed** with visit outcome recorded.

**Maintenance (Level 7)** keeps **your plant equipment** running. **Field Service (Level 8)** sends **your team to the customer**.

Three primary surfaces:

1. **Field Service Dashboard** — open queue, today’s visits, KPIs (`/field-service`).
2. **Dispatch & schedule** — assign and reschedule (`/field-service/schedule`).
3. **Service order execution** — detail, parts, complete (`/field-service/orders/:id`).

### 6.1 Relationship to Existing CRM Modules

| Module | Role relative to Field Service |
|--------|------------------------------|
| **Contacts** | Customer, site contact person, service address |
| **Sales Orders / Quotations** | Installation or warranty job origin |
| **Maintenance / CMMS** | Customer equipment register at site (Phase 2); distinct from plant MWO |
| **Products / Inventory** | Parts and materials consumed on visit |
| **Stock Out** | Parts consumption on FSO completion or issue |
| **Expenses** | Travel, lodging, subcontractor bills (`repairs_maintenance` or new category Phase 2) |
| **Invoices** | Billable service charges (Phase 2) |
| **Projects** | Large installation programs linked to FSO |
| **Employees / Users** | Technician assignment |
| **Notifications** | Dispatch and SLA alerts |
| **Activity Logs** | FSO audit trail |

### 6.2 Proposed Data Model (Phase 1)

**`field_service_settings`** (per company, 1:1)

| Field | Purpose |
|-------|---------|
| `company_id` | Tenant scope |
| `is_enabled` | Module on/off |
| `order_prefix` | e.g. FSO |
| `default_sla_hours` | e.g. 48 — promised response window |
| `auto_deduct_parts` | Boolean — stock out on parts issue |
| `allow_negative_parts` | Boolean default false |
| `notify_roles_json` | Roles for urgent unassigned alert |
| `service_types_json` | Optional custom type labels |

**`field_service_orders`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `order_number` | FSO-2026-0042 |
| `contact_id` | FK — customer |
| `type` | installation, inspection, repair, amc_visit, other |
| `priority` | low, normal, high, urgent |
| `status` | draft, scheduled, dispatched, in_progress, waiting_parts, completed, cancelled, rescheduled |
| `title` | Short job title |
| `description` | Problem / scope |
| `site_address` | Text — visit address (may copy from contact) |
| `site_contact_name` | On-site contact person |
| `site_contact_phone` | On-site phone |
| `site_notes` | Access, parking, safety |
| `scheduled_start` | DateTime nullable |
| `scheduled_end` | DateTime nullable |
| `dispatched_at` | DateTime nullable |
| `arrived_at` | DateTime nullable |
| `completed_at` | DateTime nullable |
| `resolution_notes` | Text nullable |
| `root_cause` | Text nullable — repair type |
| `assigned_to_id` | FK users nullable — lead technician |
| `assigned_team_json` | Optional user id list Phase 2 |
| `sales_order_id` | FK nullable Phase 2 |
| `quotation_id` | FK nullable Phase 2 |
| `project_id` | FK nullable Phase 2 |
| `maintenance_asset_id` | FK nullable — equipment at customer site Phase 2 |
| `expense_id` | FK nullable Phase 2 |
| `invoice_id` | FK nullable Phase 3 |
| `sla_due_at` | DateTime nullable |
| `created_by_id` | |
| `created_at`, `updated_at` | |

**`field_service_order_parts`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `field_service_order_id` | FK |
| `product_id` | FK |
| `quantity` | |
| `stock_movement_id` | FK nullable |
| `issued_by_id` | FK users |
| `issued_at` | DateTime |

**`field_service_order_logs`** (optional Phase 1 — prefer Activity Logs)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `field_service_order_id` | FK |
| `user_id` | FK |
| `action` | status_change, note, parts_issued, reschedule |
| `details` | Text / JSON |
| `created_at` | |

---

## 7. Service Orders (FSO)

### 7.1 Pages (CRM)

| Route | Purpose |
|-------|---------|
| `/field-service` | Dashboard |
| `/field-service/orders` | FSO list with filters |
| `/field-service/orders/new` | Create FSO |
| `/field-service/orders/:id` | Detail, parts, complete |
| `/field-service/schedule` | Dispatch board / calendar list |
| `/field-service/settings` | Module settings |

### 7.2 FSO Types

| Type | Meaning |
|------|---------|
| `installation` | New product/equipment setup at customer site |
| `inspection` | Warranty, safety, or compliance check |
| `repair` | Fault fix at customer premises |
| `amc_visit` | Scheduled annual maintenance contract visit |
| `other` | Ad-hoc site work |

### 7.3 FSO Statuses

| Status | Meaning |
|--------|---------|
| `draft` | Created, not yet scheduled |
| `scheduled` | Date/time and technician assigned |
| `dispatched` | Technician notified, not yet on site |
| `in_progress` | Technician on site, work underway |
| `waiting_parts` | Blocked pending parts |
| `completed` | Visit closed with resolution |
| `rescheduled` | Visit moved — returns to scheduled on new date |
| `cancelled` | Voided |

### 7.4 FSO Lifecycle (Phase 1)

```
draft → scheduled → dispatched → in_progress → waiting_parts → completed
              ↘ rescheduled → scheduled
              ↘ cancelled
```

### 7.5 FSO Rules (Phase 1)

- `order_number` unique per company; auto-generated if blank.
- Cannot complete FSO without `resolution_notes`.
- `scheduled_end` must be ≥ `scheduled_start` when both set.
- Cancelled FSO excluded from completion KPIs.
- All queries scoped by `company_id`.
- Urgent priority unassigned FSO past `sla_due_at` triggers notification.

---

## 8. Dispatch and Scheduling

### 8.1 Dispatch Workflow (Phase 1)

1. Coordinator creates FSO from contact or quick action.
2. Assigns **technician** and **scheduled window**.
3. Status → `scheduled`; optional → `dispatched` when ready.
4. Technician marks **in progress** on arrival.
5. Complete with resolution; optional parts issued before or during visit.

### 8.2 Schedule Pages

| Route | Purpose |
|-------|---------|
| `/field-service/schedule` | List/calendar: today, week, by technician |
| `/field-service/schedule?unassigned=1` | Unassigned queue |

### 8.3 SLA (Phase 1)

- On create, `sla_due_at` = `created_at` + `default_sla_hours` from settings (overridable).
- Dashboard shows **SLA at risk** and **breached** counts.
- High/urgent jobs highlighted in dispatch queue.

---

## 9. Site Visits and Execution

### 9.1 Visit Flow

```
Customer request / sales handoff
  → Create FSO (contact + site address)
  → Assign technician + schedule
  → Dispatch
  → On site (in_progress)
  → Issue parts (optional)
  → Complete with resolution
  → Activity log: fso_completed
```

### 9.2 Installation Flow

- Often linked to **sales order** or **quotation** (Phase 2 FK).
- Title/description pre-filled from product line items (Phase 2).
- Completion may trigger project task done (Phase 2).

### 9.3 Inspection Flow

- Checklist JSON on FSO optional Phase 2; free-text findings Phase 1.
- Pass/fail flag on complete Phase 2; link to Quality module for formal QC Phase 3.

### 9.4 Repair Flow

- Symptom in description; `root_cause` on complete.
- May reference **maintenance asset** at customer site if registered (Phase 2).

---

## 10. Parts and Materials

### 10.1 Parts Issue Flow

```
FSO in_progress or waiting_parts
  → User adds part lines (product + qty)
  → Stock Out movement (sale / internal_consumption reason)
  → Update field_service_order_parts
  → Activity log: fso_parts_issued
```

- Products with `is_spare_part = true` or inventory-tracked selectable (reuse Maintenance flag).
- Issue blocked when insufficient stock unless `allow_negative_parts`.
- Parts can be issued before or on FSO completion.

### 10.2 Van Stock (Phase 2)

- Optional technician **kit warehouse** for pre-stocked van inventory.
- Phase 1: issue from central warehouse only.

---

## 11. Service History

### 11.1 Per-Contact Timeline

Contact detail tab **Field Service** (Phase 2 entry point) or FSO list filtered by contact shows:

- Completed FSOs (type, date, resolution summary)
- Parts consumed per job
- Linked sales order / project (Phase 2)

### 11.2 History Rules

- Completed FSOs immutable except supervisor addendum (Phase 2).
- Cancelled FSOs excluded from SLA compliance KPIs.
- Full history read-only for archived contacts.

---

## 12. Field Service Dashboard & Alerts

### 12.1 Phase 1 KPIs

- Open FSO count by status
- Unassigned jobs
- Today’s scheduled visits
- Overdue SLA count
- Completions (7d / 30d)
- Average time to complete (created → completed) Phase 2

### 12.2 Phase 1 Lists

- Unassigned queue (priority sort)
- Today’s visits by technician
- SLA breached jobs
- Recent completions

### 12.3 Alert Types (Phase 1)

| Type | Trigger |
|------|---------|
| `fso_unassigned_urgent` | Priority urgent/high, no assignee, past 4h |
| `fso_sla_breach` | `sla_due_at` < now and status not completed/cancelled |
| `fso_overdue_visit` | `scheduled_end` < now and status in scheduled/dispatched |

Delivery: dashboard + in-app notification to `notify_roles_json`.

---

## 13. Information Architecture and Navigation

### 13.1 CRM Sidebar (Staff)

| Route | Purpose |
|-------|---------|
| `/field-service` | Dashboard |
| `/field-service/orders` | FSO list |
| `/field-service/orders/:id` | FSO detail |
| `/field-service/schedule` | Dispatch schedule |
| `/field-service/settings` | Module settings |

Sidebar label: **Field Service** (requires `field_service.view`).  
Grouped under **Operations**.

### 13.2 Entry Points

- App launcher: **Field Service** tile
- Contact detail: “Create service visit” quick action (Phase 2)
- Sales order: “Schedule installation” (Phase 2)
- Maintenance asset at customer site: “Dispatch repair” (Phase 2)
- Notifications: tap alert → FSO detail

---

## 14. Detailed Functional Requirements

### 14.1 Field Service Dashboard

- KPI cards: open FSO, unassigned, today’s visits, SLA breached, completions (7d)
- Tables: unassigned queue, today’s schedule, recent completions
- Quick actions: New FSO, Open schedule

### 14.2 FSO List

- Filters: type, status, assignee, priority, date range, contact
- Columns: FSO #, customer, type, priority, status, scheduled, assignee

### 14.3 FSO Detail

- Header: customer link, type, priority, status timeline
- Sections: Site address, description, assignment, schedule, parts, resolution
- Actions: Schedule, Dispatch, Start visit, Waiting parts, Issue parts, Complete, Reschedule, Cancel

### 14.4 Dispatch Schedule

- Views: today, this week, unassigned only
- Group by technician (Phase 1 list; calendar grid Phase 2)
- Drag reschedule Phase 3

### 14.5 Settings

- Enable module, order prefix, default SLA hours
- Auto stock deduct, negative stock flag
- Notify roles for urgent unassigned
- Service type labels (optional JSON)

### 14.6 Permissions

| Permission | Capability |
|------------|------------|
| `field_service.view` | View dashboard, FSO list, schedule, history |
| `field_service.create` | Create field service orders |
| `field_service.dispatch` | Assign technicians, schedule, reschedule |
| `field_service.execute` | Update status, complete FSO on site |
| `field_service.issue_parts` | Issue parts to FSO |
| `field_service.cancel` | Cancel FSOs |
| `field_service.manage_settings` | Module configuration |

**Default matrix:**

| Role | view | create | dispatch | execute | issue_parts | cancel | manage_settings |
|------|------|--------|----------|---------|-------------|--------|-----------------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manager | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Sales | ✓ | ✓ | — | — | — | — | — |
| Accountant | ✓ | — | — | — | — | — | — |
| Employee | ✓ | — | — | ✓ | ✓ | — | — |

---

## 15. UI / UX Requirements

### 15.1 Quick Create (mobile-friendly)

- Select customer contact, type, priority, site address, describe issue, submit
- Optional assign self if technician

### 15.2 FSO Detail (technician view)

- Prominent site address and phone with tap-to-call
- Large status action buttons: Start → Complete
- Parts table with on-hand hint

### 15.3 Dispatch Schedule

- Technician column or filter chips
- Color: SLA breached, urgent, unassigned

---

## 16. Validation and Business Rules

1. Module must be `is_enabled` for field service routes.
2. Cannot complete FSO without `resolution_notes`.
3. Cannot assign FSO without `scheduled_start` when moving to `scheduled` (Phase 1).
4. Cannot issue more parts than `on_hand` unless override setting.
5. `site_address` required when status moves past `draft`.
6. Completing FSO sets `completed_at` and locks core fields.
7. `order_number` unique per company.
8. All queries scoped by `company_id`.
9. Reschedule clears `dispatched_at` / `arrived_at` if re-opened Phase 2.
10. Cancelled FSO does not reverse stock automatically (supervisor return Phase 2).

---

## 17. Integration Points

### 17.1 API Endpoints (Proposed)

**Settings & orders**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/PUT | `/field-service/settings` | Settings |
| GET | `/field-service/dashboard` | KPIs |
| GET/POST | `/field-service/orders` | List / create |
| GET/PUT | `/field-service/orders/{id}` | Detail / update |
| PUT | `/field-service/orders/{id}/status` | Status transition |
| PUT | `/field-service/orders/{id}/assign` | Assign + schedule |
| POST | `/field-service/orders/{id}/parts` | Issue parts |
| POST | `/field-service/orders/{id}/complete` | Complete with resolution |

**Schedule**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/field-service/schedule` | By date range, technician, unassigned |

### 17.2 Implementation Alignment

**Builds on (existing)**

- `contacts` — customer and site context
- `products`, `stock_movements` — parts consumption (`is_spare_part`)
- `users` / `employees` — technician assignment
- `sales_orders`, `quotations`, `projects` — Phase 2 links
- `maintenance_assets` — customer-site equipment Phase 2
- `permissions_data.py`, `activity.py`, `notifications`

**New (greenfield)**

- Tables in §6.2
- `field_service_router.py`, `field_service_config.py`, `field_service_schemas.py`
- Frontend: `FieldServiceDashboard.jsx`, `FieldServiceOrders.jsx`, `FieldServiceOrderDetail.jsx`, `FieldServiceOrderForm.jsx`, `FieldServiceSchedule.jsx`, `FieldServiceSettings.jsx`

---

## 18. Reporting and Insights

### Phase 1

- Dashboard KPIs
- FSO list filters and SLA overdue
- Completions count by period

### Phase 2

- First-visit fix rate
- Technician utilization (jobs per tech per week)
- Parts consumption by job type
- SLA compliance trend
- Installation backlog from sales orders

### Phase 3

- Customer service cost rollup (parts + expenses + labor proxy)
- Export for AMC renewal and audit

---

## 19. Release Phasing

### Phase 1 (MVP)

- Field service settings
- FSO create, assign, schedule, status flow, complete
- Dispatch schedule list (today / week / unassigned)
- Parts issue with stock movement
- Per-contact FSO history via list filter
- Dashboard + SLA alerts
- Permissions and activity logs

### Phase 2

- Link FSO to sales order, quotation, project
- Customer-site maintenance asset link
- Photo attachment on FSO
- Inspection checklist on FSO
- Expense link
- Contact detail tab entry point
- Calendar week grid view

### Phase 3

- Customer portal (book visit, sign report)
- Van / kit warehouse stock
- Route map (read-only GPS Phase 3)
- Invoice generation from completed FSO
- AMC auto-recurrence rules

---

## 20. UAT Acceptance Checklist

1. Admin can enable Field Service in settings.
2. User can create FSO with contact, site address, type, and priority.
3. Dispatcher can assign technician and scheduled window; status becomes `scheduled`.
4. Technician can start visit and issue spare parts; inventory decreases.
5. User can complete FSO with resolution notes.
6. Unassigned urgent FSO appears on dashboard and triggers alert.
7. Schedule view shows today’s visits for selected technician.
8. User without `field_service.issue_parts` cannot issue stock.
9. Cross-company FSO access is blocked.
10. Activity log records FSO create, assign, parts issue, and complete.

---

## 21. Open Product Questions

1. **One FSO per visit** or allow multi-day jobs with child visits?
2. Assign **single technician** only Phase 1, or team assignment from day one?
3. **Rescheduled** as status vs revert to `scheduled` with new dates?
4. Link **Employees** skills/certifications to dispatch matching Phase 2?
5. **Billable vs warranty** flag on FSO for invoice rules Phase 2?
6. Integrate with **Task Management** for coordinator follow-ups?
7. **Geolocation** capture on arrive (browser) Phase 2 privacy OK?
8. Distinct stock reason `field_service_consumption` vs reuse `internal_consumption`?
9. Sales creates FSO automatically on SO confirm for installation lines?
10. Plan limits: max open FSO on free tier?

---

## Appendix A: Example Field Service Journey

1. Sales closes order for **industrial printer install**; coordinator creates **FSO-2026-0018** (installation) for **Acme Traders**, site address in Pune.
2. Dispatcher assigns **Rahul** for tomorrow 10:00–14:00; status `scheduled`.
3. Morning: status `dispatched`; Rahul opens FSO on phone, taps **Start visit** → `in_progress`.
4. Rahul installs printer, issues **USB cable** (spare part) from stock, completes with resolution “Installed and tested OK”.
5. Contact’s service history shows installation FSO; dashboard shows +1 completion this week.
6. Manager reviews: 2 SLA breaches this month, Rahul completed 12 visits.

---

## Appendix B: FSO Status Timeline

```
draft → scheduled → dispatched → in_progress → waiting_parts → completed
              ↘ rescheduled → scheduled
              ↘ cancelled
```

---

## Appendix C: Starter Permissions Seed

```python
FIELD_SERVICE_PERMISSIONS = [
    ("field_service.view", "View field service dashboard, orders, and schedule"),
    ("field_service.create", "Create field service orders"),
    ("field_service.dispatch", "Assign and schedule field service orders"),
    ("field_service.execute", "Execute and complete field service visits"),
    ("field_service.issue_parts", "Issue parts to field service orders"),
    ("field_service.cancel", "Cancel field service orders"),
    ("field_service.manage_settings", "Configure field service module settings"),
]
```

---

## Appendix D: Alignment with Product Roadmap

| Roadmap item | Field Service contribution |
|--------------|---------------------------|
| Maintenance / CMMS | Outbound customer site vs in-plant assets |
| Sales Orders | Installation dispatch from orders Phase 2 |
| Contacts | Customer site visits and service history |
| Inventory | On-site parts consumption |
| Projects | Large installation linkage Phase 2 |
| Expenses | Travel and service bills Phase 2 |
| Invoices | Billable service Phase 3 |

---

## Appendix E: Relationship to Maintenance PRD

| Maintenance / CMMS (Level 7) | Field Service (Level 8) |
|-------------------------------|-------------------------|
| **Your** equipment at plant/warehouse | **Customer** equipment at their site |
| MWO prefix, asset register internal | FSO prefix, contact/site centric |
| Breakdown of owned machines | Repair visit at customer premises |
| PM on internal assets | AMC visit at customer site |
| Downtime KPIs | SLA and visit completion KPIs |
| AMC vendor as contact link | AMC visit as FSO type |

**Complementary:** Maintenance keeps the factory running; Field Service delivers install/repair/inspection **at the customer**. A customer-site asset may appear in both modules in Phase 2 (`maintenance_asset_id` on FSO with `location_type = customer`).

---

*End of PRD — Field Service v1.0*
