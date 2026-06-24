# Product Requirements Document (PRD)
## Manufacturing / MRP (Level 5 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Operations / Production Planning / Shop Floor  
**Document Version:** v1.0  
**Date:** 2026-06-24  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Manufacturing / MRP extends BlackPapers CRM with a **production planning and execution layer** so Indian SMEs that make, assemble, or process goods can define **Bills of Materials (BOMs)**, raise **work orders**, consume **raw materials**, run **quality checks**, and receive **finished goods** into inventory—without a separate ERP or spreadsheet factory.

The module must sync with existing **Products / Services**, **Inventory**, **Stock In / Stock Out**, **Warehouse Management**, **Purchase Orders**, and **Sales Orders** so production is a first-class operational record, not an offline planning file.

Core promise from product scope:

> **Plan production, raw material use, work orders, BOMs, quality checks, and finished goods.**

---

## 2. Problem Statement

Today, CRM tracks products, stock, purchases, and sales—but there is no **manufacturing workflow** for businesses that transform raw materials into sellable finished goods. Production planning, material issues, shop-floor progress, and QC happen in Excel, Tally add-ons, or dedicated MRP software disconnected from CRM inventory.

Common issues this module should solve:

- No structured **Bill of Materials** linking finished products to components
- **Work orders** are tracked on paper or WhatsApp, not in CRM
- **Raw material consumption** is not deducted from inventory when production starts or completes
- **Finished goods** are added to stock manually without traceability to a work order
- Planners cannot see **material availability** before scheduling production
- **Purchase** and **production** plans are not connected (what to buy vs what to make)
- **Quality checks** have no pass/fail record tied to batches or work orders
- Sales and operations cannot answer “can we fulfill this order with current stock + WIP?”
- Cost of materials used per batch is unknown without manual calculation
- Scrap, rework, and yield loss are invisible in reports

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Define **multi-level BOMs** for finished goods with component quantities, scrap %, and units.
2. Create and manage **work orders** with planned qty, dates, status, and assignee.
3. **Plan production** from sales demand, manual forecast, or reorder rules (Phase 1: manual + SO link).
4. **Reserve or issue raw materials** from inventory when work order is released or completed.
5. **Receive finished goods** into inventory via stock-in linked to work order completion.
6. Run **quality checks** with checklist, pass/fail, notes, and optional block on stock receipt.
7. Provide **MRP dashboard**: open work orders, material shortages, WIP, completed today.
8. Show **material requirements** explosion from BOM for a planned production qty.
9. Enforce **role-based permissions** for BOM edit, work order release, material issue, QC sign-off.
10. Preserve **audit trail** on BOM changes, work order status, material issues, QC results.
11. Link work orders to **Sales Orders** (make-to-order) and **Projects** (custom jobs) optionally.
12. Support **India GST context** on finished goods and components (HSN, existing product master).
13. Integrate with **warehouse locations** for issue-from and receive-to (Phase 2 default location Phase 1).

### 3.2 Non-Goals (This Phase)

1. Full **APS / finite capacity scheduling** with machine calendars and optimization.
2. **Shop-floor IoT**, PLC, or SCADA integrations.
3. **CAD / PLM** integration and engineering change management (ECO/ECN).
4. **Subcontracting / job-work** full vendor portal (basic job-work PO link Phase 2).
5. **Batch/lot genealogy** across multi-step chemical processes (basic lot field Phase 2).
6. **Cost accounting** with standard cost, variance, and GL posting automation.
7. **Maintenance (CMMS)** and machine downtime tracking.
8. **Formula / recipe scaling** for process manufacturing (discrete assembly first).
9. **Multi-plant** finite planning across factories (single-tenant, single primary site Phase 1).
10. Replacing **Project Management** task tracking—work orders are production-specific.

---

## 4. Target Users and Roles

### 4.1 Primary Users (CRM Staff)

| User | Manufacturing need |
|------|-------------------|
| **Production planner** | Create work orders, check material availability, schedule dates |
| **Shop floor supervisor** | Release orders, record progress, report output |
| **Store / warehouse** | Issue raw materials, receive finished goods |
| **QC inspector** | Run quality checks, approve or reject output |
| **Admin / Owner** | Enable module, BOM setup, numbering, defaults |
| **Procurement** | View material shortages, raise POs from MRP suggestions |

### 4.2 Secondary Users (CRM Staff)

| User | Manufacturing need |
|------|-------------------|
| **Sales / Operations** | See production status for customer orders |
| **Finance** | Review material consumption and finished goods value |
| **Manager** | WIP KPIs, overdue work orders, scrap rates |
| **Leadership** | Production output vs plan |

### 4.3 External (Phase 2)

| User | Manufacturing need |
|------|-------------------|
| **Job-work vendor** | Receive subcontract PO, deliver semi-finished (portal Phase 3) |

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **BOM master** | Header + component lines per finished product |
| **Work orders** | Plan, release, in progress, complete, cancel |
| **Material requirements** | BOM explosion for planned qty |
| **Material issue** | Stock out of components against work order |
| **Finished goods receipt** | Stock in of produced qty |
| **Quality inspection** | Checklist per work order or product |
| **MRP dashboard** | KPIs, shortages, open WO list |
| **CRM admin** | BOMs, work orders, QC queue, settings |
| **Permissions** | `manufacturing.*` permission group |
| **Activity log** | BOM, WO lifecycle, issue, receipt, QC |

### 5.2 Out of Scope (Phase 1)

- Auto MRP run with lead-time offset and PO suggestions engine
- Multi-level BOM explosion UI tree (flat list Phase 1; tree Phase 2)
- Co-product / by-product BOM lines
- Serial number tracking per unit produced
- Barcode scan on shop floor
- Mobile shop-floor app (responsive web Phase 1)
- Integration with external MES systems

---

## 6. Core Product Concept

Manufacturing adds a **production layer** on top of inventory. Planners define **BOMs**, create **work orders** to make a quantity of a finished product, **issue** components from stock, complete **quality checks**, and **receive** finished goods back into inventory.

Three primary surfaces:

1. **MRP Dashboard** — planning overview (`/manufacturing`).
2. **Work Order execution** — detail with materials, operations timeline, QC (`/manufacturing/work-orders/:id`).
3. **BOM Manager** — define recipes (`/manufacturing/boms`).

### 6.1 Relationship to Existing CRM Modules

| Module | Role relative to Manufacturing |
|--------|------------------------------|
| **Products / Services** | Finished goods, raw materials, WIP flags; `is_manufactured`, `is_raw_material` |
| **Inventory Management** | On-hand qty for availability checks |
| **Stock In / Stock Out** | Material issue (out) and FG receipt (in) |
| **Warehouse Management** | Issue from / receive to location Phase 2 |
| **Purchase Orders** | Procure short materials; link to WO demand Phase 2 |
| **Sales Orders** | Make-to-order link: SO line → work order |
| **Projects** | Custom manufacturing job link optional |
| **POS / eCommerce** | Demand sources; FG stock feeds sellable qty |
| **Sales Reports** | Production output widget Phase 2 |
| **Activity Logs** | WO and BOM audit |
| **Users (CRM)** | Planner, supervisor, QC roles |

### 6.2 Proposed Data Model (Phase 1)

**`manufacturing_settings`** (per company, 1:1)

| Field | Purpose |
|-------|---------|
| `company_id` | Tenant scope |
| `is_enabled` | Module on/off |
| `work_order_prefix` | e.g. WO |
| `auto_reserve_materials_on_release` | Boolean |
| `require_qc_before_receipt` | Boolean |
| `default_scrap_pct` | Decimal |
| `allow_negative_issue` | Boolean default false |
| `default_issue_location_id` | Phase 2 |
| `default_receipt_location_id` | Phase 2 |

**`bom_headers`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `product_id` | FK finished good |
| `name` | Display name |
| `version` | e.g. 1.0 |
| `status` | draft, active, archived |
| `output_qty` | Base batch size (e.g. 1, 100) |
| `output_uom` | Unit |
| `notes` | |
| `created_by_id`, `updated_at` | |

**`bom_lines`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `bom_id` | FK |
| `component_product_id` | FK raw material / sub-assembly |
| `quantity` | Per `output_qty` of parent |
| `scrap_pct` | Optional wastage |
| `sort_order` | |
| `notes` | |

**`work_orders`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `work_order_number` | WO-2026-0042 |
| `product_id` | FK finished good |
| `bom_id` | FK nullable (snapshot if BOM changes) |
| `sales_order_id` | FK nullable |
| `sales_order_line_id` | FK nullable |
| `project_id` | FK nullable |
| `status` | draft, planned, released, in_progress, qc_pending, completed, cancelled |
| `planned_qty` | Decimal |
| `completed_qty` | Decimal default 0 |
| `scrap_qty` | Decimal default 0 |
| `planned_start`, `planned_end` | Date |
| `actual_start`, `actual_end` | DateTime nullable |
| `assigned_to_id` | FK users nullable |
| `priority` | low, normal, high |
| `notes` | |
| `created_by_id` | |
| `created_at`, `updated_at` | |

**`work_order_material_plans`** (exploded requirements snapshot)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `work_order_id` | FK |
| `component_product_id` | FK |
| `required_qty` | |
| `issued_qty` | default 0 |
| `unit` | |

**`work_order_material_issues`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `work_order_id` | FK |
| `component_product_id` | FK |
| `quantity` | |
| `stock_movement_id` | FK nullable |
| `issued_by_id` | FK users |
| `issued_at` | |

**`work_order_receipts`** (finished goods)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `work_order_id` | FK |
| `quantity` | Good qty received |
| `stock_movement_id` | FK nullable |
| `received_by_id` | FK users |
| `received_at` | |

**`quality_inspections`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `work_order_id` | FK |
| `inspection_number` | QC-2026-0001 |
| `status` | pending, passed, failed, waived |
| `checklist_json` | Items + pass/fail |
| `notes` | |
| `inspected_by_id` | FK users |
| `inspected_at` | |

**Product extension** (migration on `products`):

| Field | Purpose |
|-------|---------|
| `is_manufactured` | Finished good made in-house |
| `is_raw_material` | Component / RM |
| `default_bom_id` | FK nullable |

---

## 7. BOM Management

### 7.1 BOM Pages (CRM)

| Route | Purpose |
|-------|---------|
| `/manufacturing/boms` | BOM list |
| `/manufacturing/boms/new` | Create BOM |
| `/manufacturing/boms/:id` | BOM detail / edit lines |
| `/manufacturing/boms/:id/explode` | Preview material qty for batch size |

### 7.2 BOM Rules

- One **active** BOM per finished product (configurable: allow multiple versions).
- Component must be inventory-tracked or service (non-stock allowed for labor line Phase 2).
- Circular BOM reference blocked (A contains B contains A).
- `output_qty` defines batch: e.g. BOM for 100 units, component line 5 kg → 0.05 kg per unit when scaled.
- Archiving BOM does not delete historical work orders.

### 7.3 BOM Features (Phase 1)

- Add/remove component lines with qty and scrap %
- Duplicate BOM as new version
- Link BOM to product `default_bom_id`
- Material cost estimate (component price × qty) read-only Phase 1

---

## 8. Work Orders

### 8.1 Work Order Lifecycle

```
draft → planned → released → in_progress → qc_pending → completed
                              ↘ cancelled (before complete)
```

| Status | Meaning |
|--------|---------|
| `draft` | Created, not scheduled |
| `planned` | Scheduled with dates; materials not issued |
| `released` | Approved for shop floor; may reserve/issue materials |
| `in_progress` | Production started |
| `qc_pending` | Output ready; awaiting inspection |
| `completed` | FG received; WO closed |
| `cancelled` | Cancelled; reverse open issues if any |

### 8.2 Work Order Pages

| Route | Purpose |
|-------|---------|
| `/manufacturing/work-orders` | List with filters |
| `/manufacturing/work-orders/new` | Create from product/BOM/SO |
| `/manufacturing/work-orders/:id` | Detail: materials, issue, receipt, QC |

### 8.3 Creation Sources (Phase 1)

- **Manual** — planner selects finished product + qty
- **From Sales Order** — make-to-order for SO line (product `is_manufactured`)
- **Copy** — duplicate previous work order

### 8.4 Material Planning

On release (or create):

1. Load active BOM for product.
2. Scale: `required_qty = (planned_qty / bom.output_qty) × line.quantity × (1 + scrap_pct)`.
3. Persist `work_order_material_plans`.
4. Show **shortage** if `on_hand < required` per component.

---

## 9. Raw Material Issue and Finished Goods Receipt

### 9.1 Material Issue Flow

```
Work order released
  → User issues materials (full or partial per line)
  → Stock Out movement per component
  → Update issued_qty on material plan
  → Activity log: wo_material_issued
```

- Issue can be **backflushed** on completion (issue all planned at once) Phase 1 option in settings.
- Partial issues allowed; cannot issue more than required unless manager override.

### 9.2 Finished Goods Receipt Flow

```
Production complete
  → QC passed (if required)
  → Receive good qty (+ optional scrap_qty record)
  → Stock In movement for finished product
  → Update work_order.completed_qty
  → Status → completed
  → Activity log: wo_completed
```

### 9.3 Stock Movement Linkage

| Event | Movement | Reference |
|-------|----------|-----------|
| Material issue | Stock out | `work_order:{number}` |
| FG receipt | Stock in (production) | `work_order:{number}` |
| Scrap write-off | Stock out damage/adjustment | `work_order:{number}` |

---

## 10. Quality Checks

### 10.1 QC Workflow (Phase 1)

- On mark **qc_pending**, create `quality_inspection` with default checklist from product template or generic.
- Inspector records pass/fail per checklist item + overall result.
- **Passed** → allow FG receipt.
- **Failed** → block receipt; rework or scrap workflow (notes + manager waiver Phase 2).
- **Waived** — manager only, with reason.

### 10.2 Default Checklist Template (settings)

```json
[
  {"key": "visual", "label": "Visual inspection", "required": true},
  {"key": "dimensions", "label": "Dimensions within spec", "required": true},
  {"key": "packaging", "label": "Packaging OK", "required": false}
]
```

### 10.3 QC Queue (CRM)

| Route | Purpose |
|-------|---------|
| `/manufacturing/quality` | Pending inspections list |

---

## 11. Production Planning (MRP Lite)

### 11.1 Phase 1 — Planning Views

- **Dashboard KPIs**: open work orders, due this week, material shortages, completed qty today.
- **Shortage report**: components where sum(open WO required) > on_hand.
- **Work order calendar** list view by `planned_start` (not Gantt Phase 1).

### 11.2 Phase 2 — MRP Suggestions

- Net requirements from open SO + forecast − on_hand − open WO supply.
- Suggested work orders and purchase requisitions.
- Lead time offset per product.

### 11.3 Phase 3 — Capacity Planning

- Work center load, bottleneck view, finite scheduling.

---

## 12. Information Architecture and Navigation

### 12.1 CRM Sidebar (Staff)

| Route | Purpose |
|-------|---------|
| `/manufacturing` | MRP dashboard |
| `/manufacturing/work-orders` | Work order list |
| `/manufacturing/work-orders/:id` | Work order detail |
| `/manufacturing/boms` | BOM list |
| `/manufacturing/boms/:id` | BOM editor |
| `/manufacturing/quality` | QC queue |
| `/manufacturing/settings` | Module settings |

Sidebar label: **Manufacturing** (requires `manufacturing.view`).  
Grouped under **Operations**.

### 12.2 Entry Points

- App launcher: **Manufacturing** tile
- Product detail: “BOM” tab when `is_manufactured`
- Sales order detail: “Create work order” for manufactured lines
- Inventory: link to work orders affecting stock

---

## 13. Detailed Functional Requirements

### 13.1 MRP Dashboard

- KPI cards: open WOs, overdue, shortages count, FG produced (7d)
- Tables: recent work orders, critical shortages
- Quick actions: New work order, New BOM, View QC queue

### 13.2 Work Order List

- Filters: status, product, assignee, date range, linked SO
- Columns: WO #, product, planned qty, completed qty, status, due date
- Export CSV Phase 2

### 13.3 Work Order Detail

- Header: product, qty, dates, assignee, linked SO/project
- Tabs: Materials (plan + issue), Output (receipt), Quality, Activity
- Actions: Plan, Release, Start, Complete QC, Receive FG, Cancel

### 13.4 BOM Manager

- List BOMs with product, version, status, line count
- Editor: component grid with product search
- Activate / archive BOM

### 13.5 Settings

- Enable module, prefixes, auto-reserve, QC required flag
- Default checklist template JSON

### 13.6 Permissions

| Permission | Capability |
|------------|------------|
| `manufacturing.view` | View dashboard, WOs, BOMs, QC |
| `manufacturing.manage_bom` | Create/edit BOMs |
| `manufacturing.create_wo` | Create work orders |
| `manufacturing.release_wo` | Release and schedule |
| `manufacturing.issue_materials` | Issue raw materials |
| `manufacturing.receive_fg` | Receive finished goods |
| `manufacturing.quality` | Perform QC inspections |
| `manufacturing.cancel_wo` | Cancel work orders |
| `manufacturing.manage_settings` | Module configuration |

**Default matrix:**

| Role | view | manage_bom | create_wo | release_wo | issue_materials | receive_fg | quality | cancel_wo | manage_settings |
|------|------|------------|-----------|------------|-----------------|------------|---------|-----------|-----------------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manager | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Sales | ✓ | — | ✓ | — | — | — | — | — | — |
| Accountant | ✓ | — | — | — | — | — | — | — | — |
| Employee | ✓ | — | — | — | ✓ | ✓ | ✓ | — | — |

---

## 14. UI / UX Requirements

### 14.1 Work Order Detail

- Clear status badge and timeline of status changes
- Material table: required vs issued vs shortage (red highlight)
- One-click “Issue all planned” when released
- Confirm dialogs on cancel and failed QC

### 14.2 BOM Editor

- Product search autocomplete for components
- Inline qty validation
- Show estimated cost per batch (informational)

### 14.3 Shop Floor (Phase 1 web)

- Large action buttons on mobile-width for Start / Issue / Receive
- Minimal fields for qty entry on floor tablet

---

## 15. Validation and Business Rules

1. Module must be `is_enabled` for manufacturing routes.
2. Work order `planned_qty` > 0.
3. Cannot release WO without active BOM (unless manual material lines Phase 2).
4. Cannot issue more than `required_qty` per component without override.
5. Cannot receive FG qty + scrap > remaining planned − already completed.
6. QC required before receipt when `require_qc_before_receipt` is true.
7. Cancel only before `completed` unless manager override.
8. BOM activation requires at least one component line.
9. Finished product must have `is_manufactured = true`.
10. All queries scoped by `company_id`.
11. Circular BOM validation on save.
12. Stock issue blocked when insufficient qty (unless `allow_negative_issue`).

---

## 16. Integration Points

### 16.1 API Endpoints (Proposed)

**BOMs**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/manufacturing/boms` | List BOMs |
| POST | `/manufacturing/boms` | Create BOM |
| GET | `/manufacturing/boms/{id}` | BOM detail |
| PUT | `/manufacturing/boms/{id}` | Update BOM |
| POST | `/manufacturing/boms/{id}/activate` | Set active |
| GET | `/manufacturing/boms/{id}/explode` | Material explosion |

**Work orders**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/manufacturing/dashboard` | KPIs |
| GET | `/manufacturing/work-orders` | List |
| POST | `/manufacturing/work-orders` | Create |
| GET | `/manufacturing/work-orders/{id}` | Detail |
| PUT | `/manufacturing/work-orders/{id}/status` | Status transition |
| POST | `/manufacturing/work-orders/{id}/issue` | Issue materials |
| POST | `/manufacturing/work-orders/{id}/receive` | Receive FG |
| POST | `/manufacturing/work-orders/from-sales-order/{so_id}` | MTO create |

**Quality**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/manufacturing/quality` | QC queue |
| PUT | `/manufacturing/quality/{id}` | Submit inspection |

**Settings**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/PUT | `/manufacturing/settings` | Settings |

### 16.2 Implementation Alignment

**Builds on (existing)**

- `products` — extend with manufacturing flags
- `stock_movements` — issue and receipt
- `sales_orders` — demand link
- `permissions_data.py`, `activity.py`

**New (greenfield)**

- Tables in §6.2
- `manufacturing_router.py`, `manufacturing_config.py`, `manufacturing_schemas.py`
- Frontend: `ManufacturingDashboard.jsx`, `WorkOrders.jsx`, `WorkOrderDetail.jsx`, `BomList.jsx`, `BomEditor.jsx`, `QualityQueue.jsx`

---

## 17. Reporting and Insights

### Phase 1

- Dashboard KPIs
- Work order list filters and totals
- Shortage list (components below required)

### Phase 2

- Production output by product (period)
- Material consumption vs BOM standard
- QC pass rate
- Scrap rate by product
- WO cycle time (release → complete)

### Phase 3

- MRP exception report
- Cost variance (standard vs actual)

---

## 18. Release Phasing

### Phase 1 (MVP)

- Manufacturing settings
- BOM CRUD + activate
- Work orders: create, release, issue materials, receive FG
- Stock movement linkage
- Basic QC pass/fail
- Dashboard + lists
- SO → work order (manual link)
- Activity logs

### Phase 2

- MRP shortage → PO suggestion
- Multi-level BOM tree UI
- Warehouse location issue/receive
- Job-work subcontract PO link
- Lot/batch number on receipt
- Work order Gantt calendar
- Product default QC templates

### Phase 3

- Full MRP run with forecasts
- Capacity / work centers
- Co-products and by-products
- Shop-floor barcode scan
- Cost rollup and variance reports

---

## 19. UAT Acceptance Checklist

1. Admin can enable manufacturing in settings.
2. User can create BOM for finished product with 2+ components and activate it.
3. User can create work order for 100 units; material plan shows scaled quantities.
4. Shortage indicator appears when component stock is insufficient.
5. User can release work order and issue materials; stock decreases.
6. Stock Out movement references work order number.
7. User can complete QC with pass result.
8. User can receive finished goods; finished product stock increases.
9. Work order status becomes `completed` with correct `completed_qty`.
10. User can create work order linked to sales order line.
11. Cancelled work order cannot receive FG.
12. User without `manufacturing.issue_materials` cannot issue stock.
13. Cross-company work order access is blocked.
14. Activity log records release, issue, receipt, and QC.

---

## 20. Open Product Questions

1. **Single vs multiple active BOMs** per product (versioning strategy)?
2. **Backflush** all materials on FG receipt by default, or explicit issue step?
3. **Sub-assemblies**: treat as BOM component only, or auto-spawn child work orders (Phase 2)?
4. **Labor / overhead** as BOM line type (service product) in Phase 1?
5. **QC failure**: auto-create rework WO or manual process?
6. **Unit of measure** conversions (kg ↔ g) on BOM lines?
7. Link **Project** tasks to work order steps?
8. **WIP product** sku intermediate or skip WIP (FG direct receipt only Phase 1)?
9. **Batch size** rounding when SO qty does not match BOM output multiple?
10. Plan limits: max open work orders on free tier?

---

## Appendix A: Example Production Journey

1. Planner creates BOM for “Herbal Soap 100g” — coconut oil, lye, fragrance per 500 bars.
2. Sales order for 1,000 bars triggers work order `WO-2026-0015` (2× batch).
3. Material plan shows 2× component need; coconut oil shows shortage 5 kg.
4. Procurement receives PO; stock updated.
5. Supervisor **releases** WO and **issues** materials from store.
6. Shop floor marks **in progress**; on completion, QC inspects — **passed**.
7. Store **receives** 1,000 bars into inventory; soap `on_hand` increases.
8. Sales order can now be fulfilled from stock.

---

## Appendix B: Work Order Status Timeline

```
draft → planned → released → in_progress → qc_pending → completed
                    ↘ cancelled
```

---

## Appendix C: Starter Permissions Seed

```python
MANUFACTURING_PERMISSIONS = [
    ("manufacturing.view", "View manufacturing dashboard and work orders"),
    ("manufacturing.manage_bom", "Create and edit bills of materials"),
    ("manufacturing.create_wo", "Create work orders"),
    ("manufacturing.release_wo", "Release work orders for production"),
    ("manufacturing.issue_materials", "Issue raw materials to work orders"),
    ("manufacturing.receive_fg", "Receive finished goods from production"),
    ("manufacturing.quality", "Perform quality inspections"),
    ("manufacturing.cancel_wo", "Cancel work orders"),
    ("manufacturing.manage_settings", "Configure manufacturing settings"),
]
```

---

## Appendix D: Alignment with Product Roadmap

| Roadmap item | Manufacturing contribution |
|--------------|---------------------------|
| Products / Services | FG, RM, BOM structure |
| Inventory | Material issue and FG receipt |
| Purchase Orders | Buy components for shortages |
| Sales Orders | Make-to-order demand |
| Warehouse | Location-level issue/receive Phase 2 |
| POS / eCommerce | Sell finished goods produced |
| Projects | Custom manufacturing jobs |

---

## Appendix E: Relationship to Inventory PRD

| Inventory Management | Manufacturing / MRP |
|---------------------|---------------------|
| Generic stock movements | Production-driven issue/receipt |
| Manual adjustments | BOM-exploded requirements |
| Low stock alerts | Shortage vs open work orders |
| No BOM concept | BOM + work order core |
| MRP listed as non-goal | MRP is this module’s purpose |

---

*End of PRD — Manufacturing / MRP v1.0*
