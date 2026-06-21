# Product Requirements Document (PRD)
## Stock In / Stock Out (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Operations / Warehouse / Stock Control  
**Document Version:** v1.0  
**Date:** 2026-06-21  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Stock In / Stock Out provides a focused operational workflow for recording every **inward** and **outward** stock movement inside the CRM. Users should be able to register stock increases and decreases with product, quantity, **reason**, **user**, **date**, and **reference** in one consistent experience—without relying on spreadsheets or informal notes.

The module must bridge day-to-day warehouse operations and auditable stock history. Store and warehouse staff should record receipts and issues quickly; operations should see a clear in/out ledger; finance and auditors should trace who moved what, when, why, and against which document.

This module is the operational front door to stock changes. It should feel native to the existing CRM experience and integrate with **Inventory Management** (product-level stock ledger), **Warehouse Management** (location-level stock where enabled), **Purchase Orders**, **Sales Orders**, Products/Services, Activity Logs, and Role Permissions.

---

## 2. Problem Statement

Today, stock changes may be recorded through multiple inventory screens with technical movement types (opening, purchase, sale, damage, adjustment) or tracked entirely outside the CRM. That creates friction for warehouse staff and weak visibility for managers who simply need to answer: *what came in, what went out, and why?*

Common issues this module should solve:

- Inward and outward stock changes are recorded inconsistently or without required reason and reference
- Staff must understand inventory jargon before they can record a basic receipt or issue
- There is no unified list of all stock-in and stock-out events across products
- Movement history lacks a clear user, date, and reference on every transaction
- Manual stock corrections happen without standardized reason codes
- Purchase receipts and sales dispatches are not visibly linked to stock movements
- Location-specific stock changes (warehouse/bin) are disconnected from company-level in/out reporting
- Auditors cannot easily filter movements by direction, reason, user, or date range

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a single place to record **Stock In** and **Stock Out** movements for inventory-tracked products.
2. Require **reason**, **user** (recorder), **date**, and **reference** on every movement as first-class fields.
3. Support fast capture for common inward events (purchase receipt, return, transfer in, found stock) and outward events (sale/issue, damage, transfer out, write-off).
4. Maintain an auditable movement ledger showing quantity before/after each in/out event.
5. Update product on-hand quantity immediately after each recorded movement.
6. Give operations a filterable in/out history by product, direction, reason, user, and date.
7. Support optional linkage to purchase orders, sales orders, warehouse locations, and transfer references.
8. Preserve compatibility with existing `StockMovement` and `LocationStockMovement` records.
9. Support role-based permissions for recording stock in, stock out, viewing ledger, and exporting.

### 3.2 Non-Goals (This Phase)

1. Full warehouse management with bin optimization and pick paths (see Warehouse Management PRD).
2. Barcode scanner, RFID, or mobile WMS terminal integrations.
3. Batch/lot tracking, expiry dates, and serial-number traceability.
4. Automated MRP, reorder point optimization, or demand forecasting.
5. Full accounting ledger posting, COGS automation, or inventory valuation policy engine.
6. Physical stocktake workflow with blind counts and variance approval queues (Phase 2+).
7. Real-time 3PL or carrier warehouse integrations.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Warehouse / Store Operator: Records daily stock in and stock out events.
- Receiving Clerk: Records inward movements from vendor deliveries and PO receipts.
- Dispatch / Fulfillment User: Records outward movements for customer orders and internal issues.
- Operations Executive: Monitors in/out activity and investigates discrepancies.
- Procurement Coordinator: Links inward movements to purchase orders.
- Manager / Team Lead: Reviews high-value or unusual movements; approves sensitive adjustments.

### 4.2 Secondary Users

- Finance Executive: Reviews movement audit trail and stock value impact.
- Sales Executive: Checks recent outward movements tied to orders.
- Accountant / Auditor: Reviews in/out ledger filtered by user, reason, and reference.
- Leadership: Reviews inward vs outward trends and movement volume.

---

## 5. Scope Overview

### 5.1 In Scope

- Stock In / Stock Out list and detail views
- Record Stock In form (inward movements)
- Record Stock Out form (outward movements)
- Unified movement ledger with direction badges (In / Out)
- Required fields: product, quantity, reason, movement date, reference (number or linked document)
- Auto-captured user (recorded by) and timestamp
- Quantity before/after preview on form submit
- Reason code lists by direction (configurable sets)
- Optional notes and unit valuation per movement
- Optional warehouse/location when Warehouse Management is enabled
- Filters by direction, product, reason, user, date range, reference
- Summary dashboard: today’s in qty, today’s out qty, net change, recent movements
- Export of filtered movement list
- Activity log entries for all in/out events
- Cross-links from PO receipt, SO fulfillment, and warehouse transfer where applicable

### 5.2 Out of Scope (Phase 1)

- Opening stock setup as a separate wizard (remains under Inventory → Opening Stock)
- Inter-warehouse transfer workflow UI (remains under Warehouses → Transfer)
- Automated stock reservation and allocation
- Approval workflow for all movements (only high-value adjustment override in Phase 2)
- Returns RMA automation
- Inventory valuation method changes mid-period

---

## 6. Core Product Concept

Every physical stock change should happen through a **Stock In** or **Stock Out** record—not silent quantity edits. Each record is an auditable event that answers four questions:

1. **What moved?** — product and quantity  
2. **Which direction?** — in or out  
3. **Why?** — reason code + optional notes  
4. **What proves it?** — reference number or linked document (PO, SO, GRN, transfer ref)

Every movement also preserves **who** recorded it and **when** it happened.

### 6.1 Direction Model

| Direction | Meaning | Examples |
|-----------|---------|----------|
| **Stock In** | Increases on-hand quantity | Purchase receipt, customer return, transfer in, found stock, positive adjustment |
| **Stock Out** | Decreases on-hand quantity | Sale dispatch, internal issue, damage, transfer out, write-off, negative adjustment |

### 6.2 Mapping to Inventory Movement Types

Stock In / Stock Out is the **operational UX layer**. Each event maps to an underlying inventory movement type:

| User-facing flow | Direction | Underlying `movement_type` |
|------------------|-----------|----------------------------|
| Purchase receipt | In | `purchase` |
| Customer / vendor return | In | `purchase` or `adjustment` (in) |
| Found stock / correction up | In | `adjustment` (in) |
| Opening stock (via Inventory) | In | `opening` |
| Sale / dispatch | Out | `sale` |
| Damage / loss | Out | `damage` |
| Write-off / correction down | Out | `adjustment` (out) |

Warehouse-enabled companies may also create linked `LocationStockMovement` records (`receipt`, `issue`, `damage`, `adjustment`, `transfer_in`, `transfer_out`).

### 6.3 Relationship to Existing Modules

| Module | Relationship |
|--------|--------------|
| **Inventory Management** | Authoritative product-level ledger (`StockMovement`); on-hand qty and stock value |
| **Warehouse Management** | Optional location selector; location balances updated in parallel |
| **Purchase Orders** | PO receipt may auto-suggest or auto-create Stock In |
| **Sales Orders** | SO fulfillment may auto-suggest or auto-create Stock Out |
| **Products / Services** | Only `inventory_tracked` products appear in in/out forms |
| **Vendor Bills** | Indirect link via PO receipt context (no direct bill posting) |

---

## 7. Movement Lifecycle and Rules

### 7.1 Record States

Stock In / Out records are **posted immediately** on save (no draft approval in Phase 1 except override cases):

1. **Recorded** — movement saved; product quantity updated  
2. **Reversed** — compensating movement created (Phase 2; not delete)  
3. **Linked** — movement tied to PO/SO/transfer source  

There is no editable draft state in Phase 1—users preview quantity before/after, then post.

### 7.2 Business Rules

- Product must be inventory-tracked before accepting in/out movements.
- Quantity must be greater than zero.
- Reason is required for every movement.
- Reference is required for purchase receipt, sale dispatch, and transfer movements; strongly recommended for all others.
- Movement date cannot be in the future (configurable grace: same-day backdating allowed).
- Stock Out cannot reduce quantity below zero unless user has `stock_movements.override_negative` permission.
- Each movement stores `quantity_before` and `quantity_after` at post time.
- Posted movements cannot be edited; corrections require a new compensating in/out entry (Phase 2: formal reversal).
- Export reflects the same filters visible on screen.

---

## 8. Information Architecture and Navigation

### 8.1 Primary Navigation

Add **Stock In / Out** under Operations in the main sidebar, near Inventory and Warehouses.

Suggested routes:

- `/stock-movements` — Unified ledger (all in/out)
- `/stock-movements/in` — Record Stock In
- `/stock-movements/out` — Record Stock Out
- `/stock-movements/summary` — Daily / weekly in-out dashboard

Alternative: nest under Inventory as tabs (“Overview”, “Stock In/Out”, “Low Stock”) if nav space is limited—product decision at sign-off.

### 8.2 Entry Points

- From sidebar: Stock In / Out ledger → Record In or Record Out
- From Product detail: Record Stock In / Record Stock Out (prefilled product)
- From Purchase Order receipt: Create Stock In (prefilled from PO line)
- From Sales Order fulfillment: Create Stock Out (prefilled from SO line)
- From Warehouse location detail: Record receipt (In) or issue (Out) at location
- From Dashboard widgets: recent movements, net change today

### 8.3 Cross-Module Visibility

- Product stock detail shows linked in/out movements with direction badges
- PO detail shows inward movements tied to receipt events
- SO detail shows outward movements tied to dispatch events
- Warehouse location shows location-level in/out history

---

## 9. Detailed Functional Requirements

## 9.1 Stock Movement Ledger (List Page)

### Required Elements

- Search by product name, SKU, reference number, notes, or recorder name
- Filters:
  - Direction (In / Out / All)
  - Product
  - Reason
  - Recorded by (user)
  - Movement date range
  - Reference type (PO, SO, manual, transfer, GRN)
  - Location (when warehouses enabled)
- Sort options:
  - Latest movement date
  - Product name
  - Quantity
  - Direction
- Table columns (default):
  - Movement #
  - Date
  - Direction
  - Product / SKU
  - Quantity
  - Reason
  - Reference
  - Qty before → after
  - Recorded by
  - Location (optional)
- Bulk actions:
  - Export list

### UX Behaviors

- Saved views: “Today’s movements”, “Stock In only”, “Stock Out only”, “My movements”, “This week”.
- Strong color cues: green badge for In, red/orange badge for Out.
- Empty state with CTAs to Record Stock In and Record Stock Out.

## 9.2 Record Stock In Flow

### Required Fields

- Product (inventory-tracked only)
- Quantity
- Unit (from product; read-only)
- Reason (required; from Stock In reason list)
- Movement date (required; default today)
- Reference (required or strongly recommended based on reason)
- Recorded by (auto: current user)
- Optional: unit valuation, notes, warehouse/location, linked PO line

### Stock In Reason List (Initial)

- Purchase receipt
- Customer return
- Transfer in
- Found stock
- Stock count correction (increase)
- Opening balance (redirect to Inventory opening flow)
- Other (requires notes)

### Form Behaviors

- Show current on-hand quantity and projected quantity after on product select
- If linked PO selected, prefill product, qty, and reference from PO receipt line
- If warehouse enabled, default to default receiving location
- Validate quantity > 0 and reason present before post
- On success: toast confirmation, redirect to movement detail or product stock view

## 9.3 Record Stock Out Flow

### Required Fields

Same structure as Stock In, with Stock Out reason list.

### Stock Out Reason List (Initial)

- Sale / dispatch
- Internal consumption
- Damage
- Transfer out
- Write-off
- Stock count correction (decrease)
- Other (requires notes)

### Form Behaviors

- Block post if result would be negative unless override permission
- Show warning when movement would trigger low-stock or out-of-stock state
- If linked SO selected, prefill product, qty, and reference from order line
- If warehouse enabled, validate location has sufficient quantity

## 9.4 Movement Detail Page

### Layout Blocks

- Header: movement #, direction badge, date, recorded by
- Product summary: name, SKU, unit
- Movement summary: quantity, reason, reference, notes
- Quantity impact: before → after, unit valuation, total value
- Linked documents panel (PO, SO, transfer, location)
- Reversal link (Phase 2)

## 9.5 Summary Dashboard

### KPI Cards

- Stock In quantity today
- Stock Out quantity today
- Net change today (in − out)
- Movement count today
- Top products by outward movement this week

### Charts / Tables

- In vs Out trend (last 7 / 30 days)
- Recent movements table
- Movements by reason (pie or bar)

---

## 10. UX and Design Requirements

## 10.1 Visual Design

- Follow existing CRM design language (`crm-*` components, tables, badges)
- Direction badges: **Stock In** = green; **Stock Out** = amber/red
- Reason shown as secondary label in ledger rows
- Quantity before/after shown inline (e.g. `12 → 20`)

## 10.2 Responsive Behavior

- Record forms usable on tablet for warehouse floor
- Ledger readable on desktop and tablet
- Quick-action buttons for Record In / Record Out on mobile-width layouts

## 10.3 Error Handling

- Inline validation on required fields
- Negative stock blocked with clear message and override path for authorized users
- Failed post preserves entered values
- Duplicate reference warning (same product + reference + date) — warn, not block in Phase 1

## 10.4 Accessibility

- Keyboard operable forms and ledger filters
- Accessible labels for quantity, date, and reason fields
- High contrast direction badges

---

## 11. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- stock_movements.view
- stock_movements.record_in
- stock_movements.record_out
- stock_movements.override_negative
- stock_movements.export
- stock_movements.manage_settings

### Role Expectations

- Warehouse / Operations: record in and out, view ledger
- Manager: all of the above plus override negative stock
- Finance: view ledger and export
- Employee (limited): view only or record out for dispatch roles
- Admin: manage reason lists and permissions

### Mapping from Existing Inventory Permissions (Transition)

| New permission | Existing equivalent |
|----------------|---------------------|
| stock_movements.record_in | `inventory.record_purchase`, `inventory.record_opening`, adjustment-in |
| stock_movements.record_out | `inventory.record_sale`, `inventory.record_damage`, adjustment-out |
| stock_movements.view | `inventory.view` |
| stock_movements.override_negative | `inventory.override_negative` |

Phase 1 may alias new permissions to existing inventory permissions to avoid duplication.

---

## 12. Data Fields (UI-Centric Definition)

### 12.1 Core Movement Fields

- Movement ID / number (system-generated, e.g. `SM-2026-00042`)
- Direction (`in` | `out`)
- Underlying movement type (`purchase`, `sale`, `damage`, `adjustment`, `opening`)
- Product
- Quantity
- Unit
- Reason (required)
- Movement date (required)
- Reference number (string)
- Reference type (`manual`, `purchase_order`, `sales_order`, `transfer`, `grn`, `other`)
- Reference ID (optional FK to source record)
- Recorded by (user)
- Created at (system timestamp)

### 12.2 Optional Context Fields

- Warehouse / location
- Unit valuation
- Total value
- Notes
- Quantity before
- Quantity after
- Negative override flag
- Linked PO line / SO line
- Source module (`manual`, `purchase_order`, `sales_order`, `warehouse`)

### 12.3 Audit Fields

- Recorded by / at
- Activity log action name
- IP address (via activity log)

---

## 13. Validation and Business Rules

1. Product must be inventory-tracked.
2. Quantity must be greater than zero.
3. Reason is required on every movement.
4. Reference required when reason is purchase receipt, sale dispatch, or transfer in/out.
5. Movement date cannot be in the future (default policy).
6. Stock Out cannot exceed on-hand quantity without override permission.
7. Location Stock Out cannot exceed location on-hand when warehouses enabled.
8. Posted movements are immutable in Phase 1.
9. Quantity before/after must match ledger math at post time.
10. Export matches active list filters.

---

## 14. Notifications and Reminders

### Internal Notifications (Phase 2)

- Large Stock Out recorded (threshold)
- Negative stock override used
- Unusual reason frequency alert for a product

### Operational Reminders

- Daily summary email of in/out counts to warehouse manager (Phase 2)
- Low-stock alert after Stock Out pushes product below reorder level

---

## 15. Reporting and Insights

### Operational Reports

- Movements by direction (in vs out)
- Movements by reason
- Movements by product
- Movements by user
- Net quantity change by product (period)
- In/out trend by day/week/month

### UI Artifacts

- KPI cards on summary dashboard
- Direction-filtered ledger
- Top products by outflow
- Reason breakdown chart

---

## 16. Analytics Events

- stock_movement_in_recorded
- stock_movement_out_recorded
- stock_movement_viewed
- stock_movement_exported
- stock_movement_negative_override
- stock_movement_created_from_po
- stock_movement_created_from_so

Event payload should include direction, reason, quantity bucket, product category, reference type, and source module.

---

## 17. Integration Points

### 17.1 CRM Modules

- **Inventory Management:** writes to `StockMovement`; updates `Product.on_hand_quantity`
- **Warehouse Management:** optional location fields; writes to `LocationStockMovement`
- **Purchase Orders:** PO receipt → suggest/create Stock In with PO reference
- **Sales Orders:** SO dispatch → suggest/create Stock Out with SO reference
- **Products:** inventory-tracked flag gates eligibility
- **Activity Log:** all in/out events

### 17.2 Existing Code Alignment

The codebase already implements stock movements via:

- `StockMovement` model (`movement_type`, `direction`, `reason`, `reference_number`, `recorded_by_id`, `movement_date`)
- `inventory_router.py` — `POST /inventory/products/{id}/movements`
- `InventoryRecordMovement.jsx` — technical movement type form

Stock In / Stock Out Phase 1 should:

1. Introduce direction-first UX (`/stock-movements/in`, `/stock-movements/out`)
2. Map user reasons to existing movement types internally
3. Reuse ledger data—unified list reads from `stock_movements` with direction filter
4. Optionally add `movement_number` for human-readable references
5. Keep Inventory screens for opening stock, valuation, and low-stock admin

### 17.3 Future Integrations

- Formal reversal / void workflow
- Barcode scan to product SKU
- Auto Stock In from PO receipt approval
- Auto Stock Out from SO shipment confirmation
- Stocktake variance posting

---

## 18. Risks and Mitigations

1. **Risk:** Duplicates Inventory “Record Movement” and confuses users.  
   **Mitigation:** Position Stock In/Out as the primary operational path; keep Inventory for setup, valuation, and admin views; link between screens.

2. **Risk:** Users skip reference field.  
   **Mitigation:** Require reference for key reasons; show “missing reference” filter on dashboard.

3. **Risk:** Reason lists become inconsistent across teams.  
   **Mitigation:** Controlled reason codes with admin configuration in Phase 2.

4. **Risk:** Negative stock from rushed Stock Out entries.  
   **Mitigation:** Before/after preview, block by default, override permission for managers.

5. **Risk:** Location and company totals drift when warehouses enabled.  
   **Mitigation:** Post location and product movements in one transaction; show both balances on detail.

---

## 19. Release Phasing

### Phase 1 (MVP)

- Unified Stock In / Out ledger with direction filters
- Record Stock In and Record Stock Out forms
- Required reason, date, user; reference required for key reasons
- Quantity before/after preview
- Product on-hand update via existing `StockMovement` API
- Summary dashboard (today in/out/net)
- Export filtered list
- Permissions and nav entry
- Product detail quick actions

### Phase 2

- PO receipt → Stock In prefill
- SO dispatch → Stock Out prefill
- Warehouse location selector on forms
- Movement reversal workflow
- Reason list admin configuration
- Large movement alerts
- Duplicate reference detection

### Phase 3

- Auto in/out from PO/SO events
- Stocktake variance integration
- Barcode-assisted entry
- Advanced analytics and SLA dashboards
- Approval queue for high-value adjustments

---

## 20. UAT Acceptance Checklist

1. User can record Stock In for an inventory-tracked product with reason, date, and reference.
2. User can record Stock Out with reason, date, and reference.
3. Product on-hand quantity updates correctly after in and out movements.
4. Ledger shows direction, reason, user, date, reference, and qty before/after.
5. Stock Out blocked when quantity would go negative (without override).
6. Authorized user can override negative stock block when permitted.
7. Filters work by direction, product, reason, user, and date range.
8. Summary dashboard shows today’s in, out, and net change.
9. Export matches filtered ledger.
10. Permissions correctly limit view, record in, record out, override, and export.
11. Movement appears on product stock detail history.
12. Activity log entry created for each posted movement.

---

## 21. UI Suggestions Summary

1. Make **Record Stock In** and **Record Stock Out** the two primary CTAs everywhere in this module.
2. Use direction-first language in the UI—not “purchase” or “damage” as the main label.
3. Show quantity before → after prominently on the form before post.
4. Require reason on every row; never allow silent stock changes.
5. Keep reference visible in the ledger, not buried in detail-only view.
6. Link to PO/SO/location from movement detail when references exist.

---

## 22. Open Product Questions for Final Sign-Off

1. Should Stock In / Out be a top-level nav item or a tab inside Inventory?
2. Is reference mandatory for all movements in Phase 1, or only PO/SO/transfer reasons?
3. Should existing `InventoryRecordMovement` be deprecated or kept as an advanced view?
4. When warehouses are enabled, is location required on every in/out or optional in Phase 1?
5. Do we need a human-readable movement number (`SM-2026-0001`) in Phase 1?
6. Should customer returns map to Stock In reason “Customer return” or a distinct movement type?
7. Should managers approve Stock Out above a configurable quantity threshold?

---

## Appendix A: Suggested Screen Inventory

1. Stock Movements - Ledger (In / Out)
2. Stock Movements - Record Stock In
3. Stock Movements - Record Stock Out
4. Stock Movements - Detail
5. Stock Movements - Summary Dashboard
6. Stock Movements - Export Preview

---

## Appendix B: Recommended Badge Labels

- Stock In
- Stock Out
- Purchase Receipt
- Sale Dispatch
- Damage
- Transfer
- Adjustment
- Override Used
- Low Stock After Out
- Out of Stock After Out

---

## Appendix C: Stock In Reasons (Initial Set)

- Purchase receipt
- Customer return
- Transfer in
- Found stock
- Stock count correction (increase)
- Other

---

## Appendix D: Stock Out Reasons (Initial Set)

- Sale / dispatch
- Internal consumption
- Damage
- Transfer out
- Write-off
- Stock count correction (decrease)
- Other

---

## Appendix E: Example Ledger Row

| # | Date | Direction | Product | Qty | Reason | Reference | Before → After | User |
|---|------|-----------|---------|-----|--------|-----------|----------------|------|
| SM-2026-0042 | 21 Jun 2026 | Stock In | Printer toner | 10 | Purchase receipt | PO-2026-0018 / GRN-44 | 5 → 15 | Priya S. |
| SM-2026-0043 | 21 Jun 2026 | Stock Out | Printer toner | 2 | Sale / dispatch | SO-2026-0091 | 15 → 13 | Rahul M. |

---

## Appendix F: Stock In/Out vs Inventory Movement Types

| User sees | Direction | System `movement_type` | Updates on-hand |
|-----------|-----------|------------------------|-----------------|
| Purchase receipt | In | `purchase` | +qty |
| Sale / dispatch | Out | `sale` | −qty |
| Damage | Out | `damage` | −qty |
| Found stock | In | `adjustment` (in) | +qty |
| Write-off | Out | `adjustment` (out) | −qty |
| Opening stock | In | `opening` | +qty (Inventory module) |

---

End of document.
