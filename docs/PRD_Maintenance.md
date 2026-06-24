# Product Requirements Document (PRD)
## Maintenance / CMMS (Level 7 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Operations / Asset Management / Plant Maintenance  
**Document Version:** v1.0  
**Date:** 2026-06-24  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Maintenance extends BlackPapers CRM with a **lightweight CMMS layer** so Indian SMEs can register **equipment and assets**, schedule **preventive servicing**, log **breakdowns**, consume **spare parts** from inventory, and retain a full **repair history**—without a separate maintenance spreadsheet or disconnected AMC files.

The module must integrate with existing **Products / Inventory**, **Purchase Orders**, **Expenses**, **Manufacturing / Work Orders**, **Warehouse Management**, **Contacts / Vendors**, **Notifications**, and **Activity Logs** so machine uptime and repair cost are visible alongside production and quality operations.

Core promise from product scope:

> **Schedule and track equipment servicing, breakdowns, spare parts, and repair history.**

---

## 2. Problem Statement

Today, CRM tracks products, stock, production, and quality—but there is no **asset maintenance system** for machines, vehicles, and shop-floor equipment. Servicing schedules live in calendars or vendor AMC folders; breakdowns are reported on WhatsApp; spare-part usage is not tied to inventory; repair history is lost when technicians leave.

Common issues this module should solve:

- No **equipment register** with serial numbers, location, and service intervals
- **Preventive maintenance** (PM) due dates are missed without reminders
- **Breakdowns** are logged verbally with no downtime or root-cause record
- **Spare parts** used in repairs are not deducted from inventory
- **Repair history** per machine is scattered across bills, expenses, and notes
- AMC / vendor service visits are not linked to assets or purchase orders
- Production planners cannot see when a **critical machine is down**
- Maintenance spend is buried in expenses without asset-level rollup
- No queue for **open breakdown tickets** or overdue PM tasks
- Leadership cannot answer “which machine costs us most to maintain?” or “what was our downtime this month?”

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Maintain an **equipment / asset register** with type, location, status, and criticality.
2. Define **PM schedules** (calendar-based or meter-based Phase 2) per asset with due reminders.
3. Create and track **maintenance work orders** (preventive, breakdown, inspection).
4. Log **breakdowns** with reported time, downtime duration, symptom, and resolution.
5. Record **spare parts consumed** per work order with inventory stock-out linkage.
6. Capture **repair history** timeline per asset (PM, breakdown, vendor service).
7. Link work orders to **vendors / AMC contacts** and optional **purchase orders / expenses**.
8. Provide a **maintenance dashboard**: overdue PM, open breakdowns, downtime KPIs.
9. Send **alerts** for overdue PM and critical breakdowns (in-app Phase 1).
10. Enforce **role-based permissions** for asset edit, WO create/complete, parts issue.
11. Preserve **audit trail** on assets, schedules, work orders, and parts usage.
12. Optional link to **Manufacturing work orders** when machine downtime blocks production (Phase 2).

### 3.2 Non-Goals (This Phase)

1. Full **enterprise CMMS** with IoT sensor ingestion and predictive maintenance ML.
2. **PLC / SCADA** real-time machine telemetry integration.
3. **Finite capacity scheduling** with maintenance windows in APS.
4. **Calibration certificate** management for lab instruments (Quality module adjacent).
5. **Fleet GPS** and vehicle fuel log tracking.
6. **Multi-site asset transfer** workflow with depreciation (Finance Phase 3).
7. **Barcode / RFID** asset tagging hardware integration (manual asset code Phase 1).
8. **Mobile native** technician app (responsive web Phase 1).
9. Replacing **Expense Management**—maintenance links to expenses, does not duplicate full AP.
10. **Building/facility** maintenance (HVAC, plumbing) at full CAFM depth (basic assets OK Phase 1).

---

## 4. Target Users and Roles

### 4.1 Primary Users (CRM Staff)

| User | Maintenance need |
|------|-----------------|
| **Maintenance technician** | Receive WO, log work done, issue spare parts |
| **Maintenance supervisor** | Assign WOs, close jobs, review downtime |
| **Plant / production manager** | See machine status, open breakdowns, PM calendar |
| **Store / inventory** | Issue spare parts against maintenance WO |
| **Procurement** | Raise PO for spare parts and AMC services |
| **Admin / Owner** | Enable module, asset categories, PM defaults |

### 4.2 Secondary Users (CRM Staff)

| User | Maintenance need |
|------|-----------------|
| **Manufacturing planner** | Know if equipment is down before scheduling production |
| **Finance / Accountant** | Review maintenance cost by asset and period |
| **Quality supervisor** | Link equipment condition to QC failures (Phase 2) |
| **Leadership** | Downtime and maintenance spend KPIs |

### 4.3 External (Phase 2+)

| User | Maintenance need |
|------|-----------------|
| **AMC vendor** | Receive service request, update job status (portal Phase 3) |
| **OEM service engineer** | View asset history on visit (portal Phase 3) |

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **Asset register** | Equipment master with location, status, PM interval |
| **PM schedules** | Recurring service plans per asset |
| **Maintenance work orders** | Preventive, breakdown, inspection types |
| **Breakdown logging** | Report fault, track downtime, resolve |
| **Spare parts usage** | Issue parts from inventory to WO |
| **Repair history** | Timeline per asset |
| **Dashboard** | Overdue PM, open WOs, downtime summary |
| **Alerts** | Overdue PM, critical breakdown |
| **Permissions** | `maintenance.*` permission group |
| **Activity log** | Asset, WO, parts issue events |

### 5.2 Out of Scope (Phase 1)

- IoT meter readings and auto PM triggers
- Predictive maintenance algorithms
- Full vendor portal for AMC
- Photo/video attachments on WO (Phase 2)
- Depreciation and asset capitalization in GL
- Multi-plant asset hierarchy trees

---

## 6. Core Product Concept

Maintenance adds an **asset and work-order layer** for physical equipment. Admins register **assets** and **PM schedules**; technicians receive **maintenance work orders** for scheduled service or breakdowns; spare **parts are issued** from inventory; jobs are **closed** with notes and downtime recorded.

Three primary surfaces:

1. **Maintenance Dashboard** — overdue PM, open breakdowns, KPIs (`/maintenance`).
2. **Work order execution** — detail, parts, close (`/maintenance/work-orders/:id`).
3. **Asset register** — equipment list and repair history (`/maintenance/assets`).

### 6.1 Relationship to Existing CRM Modules

| Module | Role relative to Maintenance |
|--------|------------------------------|
| **Products / Inventory** | Spare parts as inventory-tracked products |
| **Stock Out** | Parts consumption on WO completion |
| **Purchase Orders** | Procure spare parts and AMC services |
| **Expenses** | Record repair bills (`repairs_maintenance` category) |
| **Contacts** | AMC vendor / service provider link |
| **Manufacturing / MRP** | Equipment used on production line; downtime impact Phase 2 |
| **Quality Control** | Equipment condition notes on QC fail Phase 2 |
| **Warehouse Management** | Asset location in warehouse/plant zone |
| **Notifications** | PM due and breakdown alerts |
| **Activity Logs** | WO and asset audit |

### 6.2 Proposed Data Model (Phase 1)

**`maintenance_settings`** (per company, 1:1)

| Field | Purpose |
|-------|---------|
| `company_id` | Tenant scope |
| `is_enabled` | Module on/off |
| `work_order_prefix` | e.g. MWO |
| `asset_code_prefix` | e.g. AST |
| `default_pm_interval_days` | e.g. 90 |
| `critical_downtime_alert_hours` | Alert threshold |
| `auto_deduct_spare_parts` | Boolean — stock out on parts issue |
| `allow_negative_spare_parts` | Boolean default false |
| `notify_roles_json` | Roles for critical breakdown |

**`maintenance_asset_categories`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `name` | e.g. Production machine, Vehicle, Utility |
| `sort_order` | |

**`maintenance_assets`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `asset_code` | AST-2026-0012 |
| `name` | e.g. Soap mixing tank #2 |
| `category_id` | FK nullable |
| `status` | operational, under_maintenance, breakdown, retired |
| `criticality` | low, medium, high, critical |
| `location_notes` | Shop floor / warehouse zone |
| `warehouse_location_id` | FK nullable Phase 2 |
| `manufacturer` | |
| `model` | |
| `serial_number` | |
| `purchase_date` | Date nullable |
| `warranty_end` | Date nullable |
| `vendor_contact_id` | FK contacts nullable — AMC vendor |
| `pm_interval_days` | Override default |
| `last_service_date` | Date nullable |
| `next_pm_due_date` | Date nullable |
| `notes` | |
| `created_by_id` | |
| `created_at`, `updated_at` | |

**`maintenance_pm_schedules`** (optional explicit schedule rows Phase 1: can derive from asset interval)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `asset_id` | FK |
| `title` | e.g. Quarterly lubrication |
| `interval_days` | |
| `last_completed_at` | DateTime nullable |
| `next_due_date` | Date |
| `is_active` | Boolean |
| `checklist_json` | Optional PM tasks |
| `assigned_to_id` | FK users nullable |

**`maintenance_work_orders`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `work_order_number` | MWO-2026-0042 |
| `asset_id` | FK |
| `type` | preventive, breakdown, inspection, other |
| `priority` | low, normal, high, urgent |
| `status` | draft, open, in_progress, waiting_parts, completed, cancelled |
| `title` | |
| `description` | Symptom / work requested |
| `reported_at` | DateTime |
| `started_at` | DateTime nullable |
| `completed_at` | DateTime nullable |
| `downtime_minutes` | Integer nullable |
| `root_cause` | Text nullable |
| `resolution_notes` | Text nullable |
| `assigned_to_id` | FK users nullable |
| `vendor_contact_id` | FK nullable |
| `expense_id` | FK nullable Phase 2 |
| `purchase_order_id` | FK nullable Phase 2 |
| `manufacturing_work_order_id` | FK nullable Phase 2 |
| `created_by_id` | |
| `created_at`, `updated_at` | |

**`maintenance_wo_parts`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `work_order_id` | FK |
| `product_id` | FK spare part |
| `quantity` | |
| `stock_movement_id` | FK nullable |
| `issued_by_id` | FK users |
| `issued_at` | DateTime |

**`maintenance_wo_logs`** (activity timeline on WO — optional Phase 1 use Activity Logs)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `work_order_id` | FK |
| `user_id` | FK |
| `action` | status_change, note, parts_issued |
| `details` | Text / JSON |
| `created_at` | |

**Product extension** (optional):

| Field | Purpose |
|-------|---------|
| `is_spare_part` | Boolean — maintenance consumable |
| `default_asset_category_id` | FK nullable |

---

## 7. Asset Register

### 7.1 Asset Pages (CRM)

| Route | Purpose |
|-------|---------|
| `/maintenance/assets` | Asset list with status filters |
| `/maintenance/assets/new` | Register asset |
| `/maintenance/assets/:id` | Detail, PM info, repair history |
| `/maintenance/assets/:id/edit` | Edit asset |

### 7.2 Asset Statuses

| Status | Meaning |
|--------|---------|
| `operational` | Available for use |
| `under_maintenance` | PM or repair in progress |
| `breakdown` | Down — breakdown WO open |
| `retired` | Decommissioned |

### 7.3 Asset Rules (Phase 1)

- `asset_code` unique per company; auto-generated if blank.
- Retired assets cannot receive new open WOs.
- Changing `pm_interval_days` recalculates `next_pm_due_date` from `last_service_date` or today.
- Criticality `critical` triggers immediate notification on breakdown WO create.

---

## 8. Preventive Maintenance

### 8.1 PM Workflow (Phase 1)

1. Asset has `pm_interval_days` and `next_pm_due_date`.
2. Dashboard shows **due this week** and **overdue**.
3. User creates **preventive** MWO from asset or bulk “generate due PM”.
4. On MWO **completed**, update `last_service_date`, recalculate `next_pm_due_date`, set asset `operational`.

### 8.2 PM Schedule Pages

| Route | Purpose |
|-------|---------|
| `/maintenance/pm-schedule` | Calendar / list of due and overdue PM |
| `/maintenance/pm-schedule/generate` | Create WOs for due assets (Phase 1 manual select) |

### 8.3 PM Checklist (optional JSON on schedule or WO)

```json
[
  {"key": "lubricate", "label": "Lubricate bearings", "required": true},
  {"key": "belt_tension", "label": "Check belt tension", "required": true},
  {"key": "clean", "label": "Clean filters", "required": false}
]
```

---

## 9. Breakdowns and Maintenance Work Orders

### 9.1 MWO Lifecycle

```
draft → open → in_progress → waiting_parts → completed
                          ↘ cancelled
```

| Status | Meaning |
|--------|---------|
| `draft` | Created, not yet assigned |
| `open` | Logged, awaiting start |
| `in_progress` | Technician working |
| `waiting_parts` | Blocked on spare parts |
| `completed` | Closed with resolution |
| `cancelled` | Voided |

### 9.2 MWO Types

| Type | Trigger |
|------|---------|
| `preventive` | Scheduled PM |
| `breakdown` | Unplanned fault — sets asset `breakdown` |
| `inspection` | Safety / regulatory check |
| `other` | Ad-hoc |

### 9.3 MWO Pages

| Route | Purpose |
|-------|---------|
| `/maintenance/work-orders` | List with filters |
| `/maintenance/work-orders/new` | Create (select asset + type) |
| `/maintenance/work-orders/:id` | Detail: parts, downtime, close |

### 9.4 Breakdown Flow

```
Operator reports fault
  → Create breakdown MWO (asset → breakdown status)
  → Assign technician
  → Issue spare parts (optional)
  → Complete with root cause + downtime
  → Asset → operational
  → Activity log: mwo_breakdown_closed
```

### 9.5 Downtime Calculation (Phase 1)

- `downtime_minutes` = manual entry on complete, OR `completed_at - reported_at` if auto-calc enabled in settings.
- Dashboard aggregates downtime by asset and period.

---

## 10. Spare Parts

### 10.1 Parts Issue Flow

```
MWO in_progress or waiting_parts
  → User adds spare part lines (product + qty)
  → Stock Out movement (internal_consumption / maintenance reason)
  → Update maintenance_wo_parts
  → Activity log: mwo_parts_issued
```

- Only products with `is_spare_part = true` or inventory-tracked products selectable.
- Issue blocked when insufficient stock unless `allow_negative_spare_parts`.
- Parts can be issued before or on WO completion.

### 10.2 Procurement Link (Phase 1 light)

- Dashboard **parts shortage** hint when open MWO references parts with `on_hand < required` (Phase 2 PO suggestion).
- Manual link to **Purchase Order** for spare parts (Phase 2 FK).

---

## 11. Repair History

### 11.1 Per-Asset Timeline

Asset detail tab **History** shows:

- Completed MWOs (type, date, downtime, resolution summary)
- Parts consumed per WO
- PM completion dates
- Linked expenses (Phase 2)

### 11.2 History Rules

- Completed WOs are immutable except supervisor addendum note (Phase 2).
- Cancelled WOs excluded from downtime KPIs.
- Retired assets retain full history read-only.

---

## 12. Maintenance Dashboard & Alerts

### 12.1 Phase 1 KPIs

- Assets operational / breakdown / under maintenance counts
- Open maintenance WOs
- Overdue PM count
- Total downtime hours (7d / 30d)
- PM compliance % (completed on time vs due)

### 12.2 Phase 1 Lists

- Overdue PM assets
- Open breakdown WOs (priority sort)
- Recent completed jobs

### 12.3 Alert Types (Phase 1)

| Type | Trigger |
|------|---------|
| `pm_overdue` | `next_pm_due_date` < today and no open preventive MWO |
| `breakdown_critical` | Breakdown MWO on `critical` asset |
| `mwo_overdue` | Open MWO past internal due date (Phase 2) |

Delivery: dashboard + in-app notification to `notify_roles_json`.

---

## 13. Information Architecture and Navigation

### 13.1 CRM Sidebar (Staff)

| Route | Purpose |
|-------|---------|
| `/maintenance` | Dashboard |
| `/maintenance/work-orders` | MWO list |
| `/maintenance/work-orders/:id` | MWO detail |
| `/maintenance/assets` | Asset register |
| `/maintenance/assets/:id` | Asset detail + history |
| `/maintenance/pm-schedule` | PM calendar / due list |
| `/maintenance/settings` | Module settings |

Sidebar label: **Maintenance** (requires `maintenance.view`).  
Grouped under **Operations**.

### 13.2 Entry Points

- App launcher: **Maintenance** tile
- Manufacturing dashboard: “Equipment down” indicator Phase 2
- Inventory product: flag as spare part
- Expense form: link to asset / MWO Phase 2
- Notifications: tap alert → MWO or asset detail

---

## 14. Detailed Functional Requirements

### 14.1 Maintenance Dashboard

- KPI cards: operational assets, open WOs, overdue PM, downtime (7d)
- Tables: overdue PM, open breakdowns, recent completions
- Quick actions: Report breakdown, New PM WO, Register asset

### 14.2 Asset List

- Filters: status, category, criticality, PM overdue
- Columns: Code, name, status, location, next PM, last service
- Export CSV Phase 2

### 14.3 Asset Detail

- Header: status badge, criticality, location, vendor
- Tabs: Details, PM schedule, Work orders, Repair history, Parts used
- Actions: Report breakdown, Schedule PM, Retire asset

### 14.4 MWO List

- Filters: type, status, asset, assignee, date range
- Columns: MWO #, asset, type, priority, status, reported, downtime

### 14.5 MWO Detail

- Header: asset link, type, priority, status timeline
- Sections: Description, assignment, parts issued, downtime, resolution
- Actions: Start, Waiting parts, Issue parts, Complete, Cancel

### 14.6 Settings

- Enable module, prefixes, default PM interval
- Auto stock deduct, negative stock flag
- Critical breakdown notify roles
- Asset categories CRUD

### 14.7 Permissions

| Permission | Capability |
|------------|------------|
| `maintenance.view` | View dashboard, assets, MWOs, history |
| `maintenance.manage_assets` | Create/edit/retire assets and categories |
| `maintenance.create_wo` | Create maintenance work orders |
| `maintenance.execute_wo` | Start, update, complete MWOs |
| `maintenance.issue_parts` | Issue spare parts to MWO |
| `maintenance.cancel_wo` | Cancel MWOs |
| `maintenance.manage_settings` | Module configuration |

**Default matrix:**

| Role | view | manage_assets | create_wo | execute_wo | issue_parts | cancel_wo | manage_settings |
|------|------|---------------|-----------|------------|-------------|-----------|-----------------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manager | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Sales | ✓ | — | — | — | — | — | — |
| Accountant | ✓ | — | — | — | — | — | — |
| Employee | ✓ | — | ✓ | ✓ | ✓ | — | — |

---

## 15. UI / UX Requirements

### 15.1 Breakdown Report (quick action)

- Mobile-friendly: select asset, describe fault, priority, submit
- Confirm sets asset to `breakdown` and creates open MWO

### 15.2 MWO Detail

- Prominent downtime field on complete
- Parts table: part name, qty issued, stock remaining
- Status timeline with timestamps

### 15.3 Asset Detail History

- Chronological list with type icons (PM vs breakdown)
- Expand row for resolution and parts

---

## 16. Validation and Business Rules

1. Module must be `is_enabled` for maintenance routes.
2. Cannot complete MWO without `resolution_notes` when type is `breakdown`.
3. `downtime_minutes` ≥ 0; optional auto-calc from timestamps.
4. Cannot issue more spare parts than `on_hand` unless override setting.
5. Retired asset cannot have new non-cancelled MWO.
6. Completing **preventive** MWO updates asset `last_service_date` and `next_pm_due_date`.
7. Completing **breakdown** MWO sets asset to `operational` if no other open breakdown MWO.
8. `asset_code` unique per company.
9. All queries scoped by `company_id`.
10. Cancelled MWO reverses no stock automatically (supervisor stock return Phase 2).

---

## 17. Integration Points

### 17.1 API Endpoints (Proposed)

**Settings & assets**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/PUT | `/maintenance/settings` | Settings |
| GET/POST | `/maintenance/assets` | List / create assets |
| GET/PUT | `/maintenance/assets/{id}` | Asset detail / update |
| GET | `/maintenance/assets/{id}/history` | Repair history |
| GET/POST | `/maintenance/categories` | Asset categories |

**Work orders**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/maintenance/dashboard` | KPIs |
| GET/POST | `/maintenance/work-orders` | List / create |
| GET | `/maintenance/work-orders/{id}` | Detail |
| PUT | `/maintenance/work-orders/{id}/status` | Status transition |
| POST | `/maintenance/work-orders/{id}/parts` | Issue spare parts |
| POST | `/maintenance/work-orders/{id}/complete` | Complete with resolution |

**PM**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/maintenance/pm-schedule` | Due / overdue PM list |
| POST | `/maintenance/pm-schedule/generate` | Create preventive WOs for due assets |

### 17.2 Implementation Alignment

**Builds on (existing)**

- `products` — spare part flag
- `stock_movements` — parts consumption
- `contacts` — AMC vendors
- `purchase_orders`, `expenses` — Phase 2 links
- `permissions_data.py`, `activity.py`, `notifications`

**New (greenfield)**

- Tables in §6.2
- `maintenance_router.py`, `maintenance_config.py`, `maintenance_schemas.py`
- Frontend: `MaintenanceDashboard.jsx`, `MaintenanceAssets.jsx`, `MaintenanceAssetDetail.jsx`, `MaintenanceWorkOrders.jsx`, `MaintenanceWorkOrderDetail.jsx`, `MaintenancePmSchedule.jsx`, `MaintenanceSettings.jsx`

---

## 18. Reporting and Insights

### Phase 1

- Dashboard KPIs
- Asset list filters and PM overdue
- Downtime total by period (sum of MWO `downtime_minutes`)

### Phase 2

- Downtime by asset and category
- MTBF / MTTR estimates (mean time between failures / to repair)
- Spare parts consumption by asset
- Maintenance cost rollup (parts + linked expenses)
- PM compliance trend

### Phase 3

- Predictive maintenance hints from repeat breakdown patterns
- Export for audit and insurance claims

---

## 19. Release Phasing

### Phase 1 (MVP)

- Maintenance settings and asset categories
- Asset register CRUD + retire
- MWO: create, assign, status flow, complete with downtime
- Breakdown quick report
- Preventive MWO + PM due date tracking
- Spare parts issue with stock movement
- Repair history per asset
- Dashboard + PM schedule list
- Alerts: PM overdue, critical breakdown
- Permissions and activity logs

### Phase 2

- PM bulk generate WOs
- Link MWO to expense and purchase order
- Manufacturing WO link when machine down
- PM checklist on WO
- Photo attachment on MWO
- Parts shortage → PO suggestion
- CSV export

### Phase 3

- Meter-based PM (run hours)
- Vendor / AMC portal
- IoT reading import
- Asset depreciation fields

---

## 20. UAT Acceptance Checklist

1. Admin can enable Maintenance in settings.
2. User can register asset with category, PM interval, and criticality.
3. User can create **breakdown** MWO; asset status becomes `breakdown`.
4. Technician can start MWO and issue spare parts; inventory decreases.
5. User can complete MWO with resolution and downtime; asset returns `operational`.
6. Completing **preventive** MWO updates `next_pm_due_date`.
7. Overdue PM appears on dashboard and triggers alert.
8. Asset detail shows repair history with completed WOs and parts.
9. User without `maintenance.issue_parts` cannot issue stock.
10. Retired asset cannot receive new MWO.
11. Cross-company asset access is blocked.
12. Activity log records MWO create, parts issue, and complete.

---

## 21. Open Product Questions

1. **Single MWO** per asset open at a time, or allow parallel inspection + breakdown?
2. Auto-set asset `breakdown` on any breakdown MWO, or only `urgent` priority?
3. Link **employees** table to technician assignment vs CRM `users` only?
4. **PM checklist** required before complete, or optional Phase 1?
5. Stock movement reason: new `maintenance_consumption` vs `internal_consumption`?
6. Track **machine hours** manually on asset for meter PM Phase 2?
7. Integrate with **Project Management** for facility projects?
8. **Vehicle** assets: odometer field in Phase 1 or Phase 2?
9. Downtime: charge lost production cost (Manufacturing) in reports Phase 3?
10. Plan limits: max assets on free tier?

---

## Appendix A: Example Maintenance Journey

1. Admin registers **Mixing Tank #2** — critical, PM every 90 days.
2. Dashboard shows PM due in 3 days; planner creates **preventive MWO-2026-0018**.
3. Technician completes PM, issues grease (spare part) from store, closes job — `next_pm_due_date` advances 90 days.
4. Week later, operator reports **motor vibration** — breakdown MWO-2026-0024 created; tank status `breakdown`.
5. Technician replaces bearing (2× from inventory), logs 240 min downtime, root cause “bearing wear”.
6. Tank returns `operational`; repair history shows PM + breakdown with parts used.
7. Manager reviews dashboard: 4h downtime this month on mixing assets.

---

## Appendix B: MWO Status Timeline

```
draft → open → in_progress → waiting_parts → completed
                    ↘ cancelled
```

---

## Appendix C: Starter Permissions Seed

```python
MAINTENANCE_PERMISSIONS = [
    ("maintenance.view", "View maintenance dashboard, assets, and work orders"),
    ("maintenance.manage_assets", "Create and edit equipment assets"),
    ("maintenance.create_wo", "Create maintenance work orders"),
    ("maintenance.execute_wo", "Execute and complete maintenance work orders"),
    ("maintenance.issue_parts", "Issue spare parts to maintenance work orders"),
    ("maintenance.cancel_wo", "Cancel maintenance work orders"),
    ("maintenance.manage_settings", "Configure maintenance module settings"),
]
```

---

## Appendix D: Alignment with Product Roadmap

| Roadmap item | Maintenance contribution |
|--------------|-------------------------|
| Manufacturing / MRP | Machine downtime visibility Phase 2 |
| Inventory | Spare parts stock and issue |
| Purchase Orders | Procure parts and AMC |
| Expenses | Repair bills (`repairs_maintenance`) |
| Quality Control | Equipment condition context Phase 2 |
| Warehouse | Asset location |
| Notifications | PM and breakdown alerts |

---

## Appendix E: Relationship to Manufacturing PRD

| Manufacturing / MRP | Maintenance module |
|--------------------|-------------------|
| Lists CMMS as non-goal | CMMS is this module’s purpose |
| Work orders for production | Separate MWO for assets |
| Machine downtime invisible | Downtime tracked per asset |
| No asset register | Full equipment register |
| No spare parts on WO | Parts issue linked to inventory |

Manufacturing **complements** Maintenance: production work orders make goods; maintenance work orders keep machines running.

---

*End of PRD — Maintenance / CMMS v1.0*
