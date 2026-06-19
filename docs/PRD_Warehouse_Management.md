# Product Requirements Document (PRD)
## Warehouse Management (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Operations / Warehouse / Multi-Location Stock Control  
**Document Version:** v1.0  
**Date:** 2026-06-19  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Warehouse Management extends the CRM’s inventory capabilities to manage stock across **multiple locations, branches, warehouses, racks, and storage units**. Users should be able to define a location hierarchy, see on-hand quantity and stock value at each level, record receipts and issues against specific storage points, and transfer stock between locations with a full audit trail.

The module must bridge company-wide inventory totals and physical warehouse reality. Operations teams should know not only how much stock exists, but **where** it is stored; branch managers should monitor local availability; finance should roll up stock value by location, warehouse, and company.

This module should feel like a natural extension of Inventory Management and integrate with Products/Services, Purchase Orders, Sales Orders, Invoices, Deals, Activity Logs, and Role Permissions.

---

## 2. Problem Statement

Inventory Management today tracks product quantity and value at the company or product level, but many businesses store goods in multiple physical places—main warehouse, branch stores, project sites, racks, and bins. Without location-aware stock control, teams cannot answer basic operational questions accurately.

Common issues this module should solve:

- Stock exists in the system but its physical location is unknown
- Branch or warehouse teams maintain separate spreadsheets for local stock
- Receipts and issues are recorded globally without knowing which storage area was affected
- Transfers between warehouses or branches are informal and hard to audit
- Picking and fulfillment staff cannot see rack- or bin-level availability
- Managers cannot compare stock levels across branches or warehouses
- Purchase receipts and sales issues do not reflect the correct receiving or issuing location
- Stock value cannot be analyzed by warehouse, branch, or storage zone

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a structured location hierarchy for branches, warehouses, zones, racks, and storage units.
2. Track on-hand quantity and stock value at location level as well as company roll-up level.
3. Support location-specific stock movements for receipt, issue, damage, adjustment, and transfer.
4. Enable inter-location transfers with from/to audit context.
5. Give warehouse staff a clear view of what is stored where.
6. Give managers visibility into stock by branch, warehouse, and storage area.
7. Preserve compatibility with existing Inventory Management product totals and movement ledger.
8. Support role-based permissions by location and operation type.

### 3.2 Non-Goals (This Phase)

1. Advanced pick-path optimization and wave picking automation.
2. Barcode scanner hardware, RFID, and mobile WMS terminal integrations.
3. Automated robotic warehouse or AGV orchestration.
4. Full 3PL / external fulfillment provider API integrations.
5. Batch, lot, expiry, and serial-number traceability.
6. Dock scheduling, yard management, and carrier load planning.
7. Full accounting COGS and ledger posting automation.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Warehouse Manager: Configures warehouses, zones, racks, and storage rules.
- Store / Branch Manager: Monitors local stock and branch transfers.
- Warehouse Operator: Records receipts, picks, issues, and bin-level adjustments.
- Receiving Clerk: Assigns inbound stock to warehouse locations on receipt.
- Fulfillment / Dispatch User: Issues stock from the correct warehouse or rack.
- Procurement Coordinator: Reviews which warehouse should receive PO stock.
- Finance Executive: Reviews stock value by location and transfer audit trail.
- Admin: Configures location master data, defaults, and permissions.

### 4.2 Secondary Users

- Sales Executive: Checks branch or warehouse availability before promising delivery.
- Project Owner: Tracks stock allocated to project or site storage.
- Leadership: Reviews stock distribution and warehouse utilization.

---

## 5. Scope Overview

### 5.1 In Scope

- Location master setup:
  - Branch
  - Warehouse
  - Zone / area
  - Rack / aisle
  - Bin / storage unit
- Location hierarchy and parent-child relationships
- Location stock balances by product
- Location-aware stock movements:
  - Receipt into location
  - Issue from location
  - Damage at location
  - Adjustment at location
  - Transfer between locations
- Warehouse stock list and location stock detail screens
- Transfer request and transfer completion workflow
- Company roll-up totals derived from location balances
- Low-stock and out-of-stock views by location
- Warehouse dashboard and stock-by-location reporting
- Export of location stock and transfer history
- Permissions scoped by warehouse/branch where relevant
- Integration hooks with Inventory Management, Purchase Orders, and Sales Orders

### 5.2 Out of Scope (Phase 1)

- Pick list optimization and route sequencing inside warehouse
- Cartonization and packing automation
- Cycle-count scanner workflows with device integrations
- Returns putaway automation
- Vendor-managed inventory at supplier site
- Real-time temperature-controlled monitoring for cold storage

---

## 6. Core Product Concept

Warehouse Management introduces a **location-aware layer** on top of inventory-tracked products. A product may have a company-wide on-hand total, but that total should be explainable as the sum of quantities stored across defined locations.

The product should support three key patterns:

- **Locate pattern:** define where stock can live in the business
- **Store pattern:** record receipts and adjustments against a specific location
- **Move pattern:** transfer stock from one location to another without losing audit context

Every location-level movement should preserve who recorded it, which location changed, what product moved, quantity before/after at that location, and any linked PO, SO, or transfer reference.

### 6.1 Location Hierarchy Model

Suggested hierarchy:

| Level | Example | Purpose |
|-------|---------|---------|
| Branch | Mumbai Branch | Business or regional grouping |
| Warehouse | Andheri Main WH | Physical storage facility |
| Zone | Receiving, Bulk, Pick Face | Logical area inside warehouse |
| Rack | Rack A-12 | Physical rack or aisle position |
| Bin / Storage Unit | Bin A-12-03 | Smallest storable location |

Rules:

- A location has one parent except top-level branches.
- Stock is stored at the **lowest usable location level** configured by the business.
- Parent locations may show rolled-up quantity from child locations.
- A product may exist in multiple locations simultaneously.

### 6.2 Location Stock Model

Each product at a location should maintain:

| Field | Definition |
|-------|------------|
| On-hand quantity | Quantity currently stored at the location |
| Reserved quantity | Optional hold for orders/projects (Phase 2) |
| Available quantity | On-hand minus reserved |
| Unit valuation | Location/product valuation basis |
| Stock value | On-hand × unit valuation |
| Reorder level | Optional threshold for location-level alerts |
| Last movement date | Most recent location movement |

Company/product totals from Inventory Management should reconcile to the sum of active location balances.

### 6.3 Location Movement Types

| Type | Direction | Description |
|------|-----------|-------------|
| Receipt | In | Stock received into a location |
| Issue | Out | Stock issued from a location |
| Damage | Out | Stock lost/damaged at a location |
| Adjustment | In/Out | Manual correction at a location |
| Transfer out | Out | Stock leaving source location |
| Transfer in | In | Stock arriving at destination location |

Transfers should be represented as paired or linked movements with a shared transfer reference.

---

## 7. Warehouse Lifecycle and Rules

### 7.1 Location Statuses

1. Active
2. Inactive
3. Maintenance
4. Closed

### 7.2 Location Rules

- Only active locations can receive new stock movements.
- A child location cannot belong to a different branch/warehouse tree than its parent.
- Location codes should be unique within company scope.
- Deactivating a location with stock should be blocked unless stock is transferred or adjusted out.
- Rack and bin names should be human-readable for warehouse operators.

### 7.3 Stock Rules

- Location movements are allowed only for inventory-tracked products.
- Issue, damage, and transfer out cannot reduce location quantity below zero unless override permission is granted.
- Transfer must specify both source and destination locations.
- Source and destination cannot be the same location.
- Company-level inventory totals should update when location movements are posted.
- Opening stock may be entered at a default warehouse location when tracking is enabled.

### 7.4 Integration Rules

- PO receipt may post to a selected receiving warehouse/location.
- Sales fulfillment may issue from a selected dispatch warehouse/location.
- Inventory Management remains the system of record for product-level movement history; Warehouse Management adds location context to those events or creates linked location movement records.
- Transfers between branches should be visible in both branch stock views.

---

## 8. Information Architecture and Navigation

### 8.1 New Navigation Entry

- Main nav: Warehouses
- Quick actions:
  - Warehouse overview
  - Location directory
  - Record receipt
  - Record issue
  - Transfer stock
  - Stock by location

### 8.2 Primary Screens

1. Warehouse / Location Directory
2. Location Detail
3. Stock by Location List
4. Product Stock by Location View
5. Record Location Movement
6. Transfer Stock Flow
7. Warehouse Dashboard
8. Transfer History / Audit View
9. Export View

### 8.3 Cross-Module Entry Points

- From Inventory product detail: view stock breakdown by location
- From Product detail: see default warehouse and branch availability
- From Purchase Order receipt: choose receiving warehouse/location
- From Sales Order fulfillment: choose issuing warehouse/location
- From Branch or company dashboard: open warehouse stock summary

---

## 9. Detailed Functional Requirements

## 9.1 Warehouse / Location Directory

### Required Elements

- Tree or nested list of branches, warehouses, zones, racks, and bins
- Search by location name, code, branch, or warehouse
- Filters:
  - Location type
  - Branch
  - Warehouse
  - Status
  - Has stock / empty
- Location summary cards:
  - total locations
  - active warehouses
  - locations with stock
  - locations below reorder threshold
- Actions:
  - Add branch
  - Add warehouse
  - Add zone / rack / bin
  - Deactivate location

### UX Behaviors

- Breadcrumb navigation through location hierarchy
- Clear badges for active, inactive, maintenance, and closed
- Empty locations should still be visible for setup and future putaway

## 9.2 Location Detail Page

### Layout Blocks

- Header with location name, code, type, parent, and status
- Summary cards:
  - SKU count
  - total on-hand quantity
  - total stock value
  - low-stock SKUs
- Product stock table at this location
- Recent movements at this location
- Child locations list

### Action Matrix

- Active location: record receipt, issue, damage, adjustment, transfer out, transfer in
- Warehouse level: add child zone/rack/bin
- Location with stock: block deactivation until stock cleared
- Manager: export location stock

## 9.3 Stock by Location List

### Required Elements

- Search by product, SKU, location, branch, or warehouse
- Filters:
  - Branch
  - Warehouse
  - Zone / rack / bin
  - Low stock
  - Out of stock
  - Category
- Table columns (default):
  - Product / SKU
  - Branch
  - Warehouse
  - Location
  - On-hand qty
  - Available qty
  - Unit valuation
  - Stock value
  - Status
  - Last movement
- Export current filtered list

## 9.4 Record Location Movement

### Required Fields

- Product
- Location
- Movement type (receipt, issue, damage, adjustment)
- Quantity
- Unit valuation
- Movement date
- Reference / linked document
- Reason (required for damage and adjustment)
- Notes

### UX Expectations

- Show location quantity before and projected after
- Default location based on user’s assigned warehouse where configured
- Prevent negative location stock unless override permission exists
- Fast entry for receiving and picking operations

## 9.5 Transfer Stock Flow

### Required Fields

- Product
- Quantity
- Source location
- Destination location
- Transfer date
- Transfer reference
- Notes
- Optional reason

### Workflow

1. User selects source and destination locations.
2. System validates available quantity at source.
3. User confirms transfer.
4. System creates linked transfer-out and transfer-in movements.
5. Source and destination balances update immediately.
6. Company/product inventory totals remain balanced.

### Rules

- Partial transfers allowed.
- Failed transfers should not partially post unless explicitly supported with rollback.
- Transfer history must show both sides and the user who initiated it.

## 9.6 Warehouse Dashboard

### Required KPI Cards

- Total stock value across all warehouses
- Stock value by branch
- Active warehouses
- Locations with low stock
- Open transfers in transit (if in-transit state added later)
- Top product by warehouse value

### Required Charts / Tables

- Stock by warehouse
- Stock by branch
- Low-stock locations
- Recent transfers
- Receipts vs issues by warehouse trend

## 9.7 Purchase and Sales Integration

### Purchase Order Receipt

- When PO line is received, user may specify:
  - receiving warehouse
  - target location / bin
- Receipt posts:
  - location stock increase
  - linked inventory purchase movement
  - linked PO receipt record

### Sales Order Fulfillment

- When stock is issued for fulfillment, user may specify:
  - dispatch warehouse
  - source rack/bin
- Issue posts:
  - location stock decrease
  - linked inventory sale movement
  - linked fulfillment record

## 9.8 Export and Reporting

### Required Behaviors

- Export stock by location
- Export transfer history
- Export location movement ledger
- Include branch, warehouse, location, product, quantity, value, and audit fields

---

## 10. UI / UX Specifications

## 10.1 Visual Language

- Reuse CRM panel, table, badge, and filter styling from Inventory and Purchase Orders.
- Location hierarchy should be easy to scan in tree or indented list format.
- Quantities and values should align consistently.
- Movement and location status badges should be visually distinct.

## 10.2 Suggested Page Layouts

### Warehouse Directory

- Left: location tree
- Right: selected location summary and stock table

### Stock by Location

- Top row: title + transfer CTA
- Second row: search and filters
- Main area: location stock table

### Transfer Stock

- Source and destination selectors with quantity preview
- Confirmation step showing both sides of the transfer

## 10.3 Interaction Patterns

- Confirmation modal for transfer, issue, and damage
- Inline validation for quantity and location selection
- Immediate refresh of location and roll-up totals after save
- Breadcrumb navigation across branch → warehouse → rack → bin

## 10.4 Empty, Loading, and Error States

- Empty warehouse should prompt location setup
- Location with no stock should still allow receipts and transfers in
- Failed transfer should preserve entered form values

## 10.5 Accessibility

- Keyboard operable location tree and primary actions
- Accessible labels for location, quantity, and movement type
- High contrast for low-stock and negative-stock warnings

---

## 11. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- warehouses.view
- warehouses.manage_locations
- warehouses.view_stock
- warehouses.record_receipt
- warehouses.record_issue
- warehouses.record_damage
- warehouses.adjust
- warehouses.transfer
- warehouses.override_negative
- warehouses.export
- warehouses.manage_settings

### Role Expectations

- Warehouse Operator: view stock, record receipt/issue/damage at assigned locations
- Branch Manager: view branch stock, initiate transfers, export branch reports
- Warehouse Manager: manage locations, transfers, adjustments, and exports
- Finance Executive: view stock value by location, export audit data
- Admin: full configuration and permission management

Optional future enhancement: restrict users to assigned branch or warehouse scope.

---

## 12. Data Fields (UI-Centric Definition)

### 12.1 Location Fields

- Location ID
- Location code
- Location name
- Location type (branch, warehouse, zone, rack, bin)
- Parent location
- Branch
- Warehouse
- Status
- Address / notes
- Default receiving location flag
- Default dispatch location flag

### 12.2 Location Stock Fields

- Product
- Location
- On-hand quantity
- Available quantity
- Reserved quantity
- Unit valuation
- Stock value
- Reorder level
- Last movement date

### 12.3 Location Movement Fields

- Movement ID
- Product
- Location
- Movement type
- Direction
- Quantity
- Unit value
- Total value
- Quantity before
- Quantity after
- Transfer reference
- Linked inventory movement ID
- Linked PO / SO / transfer ID
- Reason
- Notes
- Recorded by
- Created at

---

## 13. Validation and Business Rules

1. Location code and name are required.
2. Location must have a valid parent except top-level branch records.
3. Only active locations can receive stock movements.
4. Transfer requires different source and destination locations.
5. Issue, damage, and transfer out cannot reduce location stock below zero without override permission.
6. Damage and adjustment require a reason.
7. Location stock totals must reconcile with company inventory totals.
8. Deactivation is blocked for locations holding stock.
9. Export should reflect the same filters visible on screen.
10. Linked PO/SO references must belong to the same company context.

---

## 14. Notifications and Reminders

### Internal Notifications

- Location dropped below reorder level
- Location out of stock
- Transfer completed
- Transfer failed due to insufficient source stock
- Large location adjustment recorded
- Attempt to deactivate location with remaining stock

### Workflow Reminders

- Remind warehouse manager when branch stock is imbalanced
- Remind receiving team when PO receipt has no target location
- Surface weekly stock distribution summary to leadership

---

## 15. Reporting and Insights

### Operational Reports

- Stock by branch
- Stock by warehouse
- Stock by rack/bin
- Low-stock locations
- Transfer history
- Receipts vs issues by warehouse
- Location adjustment audit list

### UI Artifacts

- KPI cards for total stock value and low-stock locations
- Branch/warehouse distribution chart
- Recent transfers table
- Top products by location value

---

## 16. Analytics Events

- warehouse_location_created
- warehouse_stock_viewed
- warehouse_receipt_recorded
- warehouse_issue_recorded
- warehouse_transfer_created
- warehouse_transfer_completed
- warehouse_adjustment_recorded
- warehouse_exported

Event payload should include branch, warehouse, location type, movement type, quantity bucket, and stock value bucket.

---

## 17. Integration Points

### 17.1 CRM Modules

- Inventory Management: company-level totals and movement ledger
- Products / Services: inventory-tracked products and valuation
- Purchase Orders: receipt into warehouse location
- Sales Orders: issue from warehouse location
- Invoices: optional dispatch context in later phase
- Deals / Projects: optional site or project storage linkage
- Activity Log: all major warehouse events

### 17.2 Future Integrations

- Barcode scanning for bin confirmation
- Pick list generation
- 3PL warehouse sync
- In-transit transfer state and logistics tracking

---

## 18. Risks and Mitigations

1. Risk: Location hierarchy becomes too complex for users.  
   Mitigation: Support configurable depth and sensible defaults by business size.

2. Risk: Location stock and company inventory totals drift apart.  
   Mitigation: Reconcile on every movement and show roll-up totals in both modules.

3. Risk: Warehouse staff avoid bin-level tracking.  
   Mitigation: Allow warehouse-level tracking first, with optional rack/bin granularity.

4. Risk: Transfers are recorded informally outside the system.  
   Mitigation: Make transfer flow fast and show both sides in one audit record.

5. Risk: Module feels disconnected from PO and SO workflows.  
   Mitigation: Add receiving and issuing location selectors to those flows.

---

## 19. Release Phasing

### Phase 1 (MVP)

- Branch and warehouse master setup
- Location directory and location detail
- Stock by location list
- Location receipt, issue, damage, and adjustment
- Transfer between locations
- Warehouse dashboard
- Export location stock and transfer history
- Reconciliation with Inventory Management totals

### Phase 2

- Zone, rack, and bin hierarchy
- PO receipt and SO fulfillment location selectors
- Low-stock alerts by location
- User assignment to branch/warehouse scope
- Reserved stock for orders/projects

### Phase 3

- In-transit transfer state
- Pick list and bin confirmation
- Barcode scanning support
- 3PL and advanced fulfillment integrations

---

## 20. UAT Acceptance Checklist

1. User can create branch, warehouse, and storage locations in a hierarchy.
2. User can view product stock at a specific location.
3. User can record receipt, issue, damage, and adjustment at a location.
4. User can transfer stock from one location to another with linked audit records.
5. Location stock before/after values are visible on movement history.
6. Company/product inventory totals reconcile with location roll-ups.
7. Stock-by-location list supports search and branch/warehouse filters.
8. Warehouse dashboard shows stock value and low-stock locations.
9. Location with stock cannot be deactivated until cleared.
10. Export matches the currently filtered location stock or transfer list.
11. Permissions correctly limit view, movement, transfer, and export actions.

---

## 21. UI Suggestions Summary

1. Show branch → warehouse → location context everywhere stock is displayed.
2. Make transfers a first-class action, not a hidden adjustment workaround.
3. Use a location tree for fast navigation in larger warehouses.
4. Surface low-stock locations on the warehouse overview page.
5. Keep location movement history close to location detail screens.
6. Preserve source/destination audit context on every transfer.

---

## 22. Open Product Questions for Final Sign-Off

1. What is the minimum location depth required in MVP: warehouse only, or rack/bin from day one?
2. Should branches be a separate master entity or just a location type?
3. Do transfers need an in-transit state, or is immediate post sufficient?
4. Should users be restricted to assigned branch/warehouse locations in Phase 1?
5. Should PO receipts always require a target warehouse/location?
6. Should reserved stock be included in MVP or deferred to Phase 2?

---

## Appendix A: Suggested Screen Inventory

1. Warehouses - Location Directory
2. Warehouses - Location Detail
3. Warehouses - Stock by Location
4. Warehouses - Record Movement
5. Warehouses - Transfer Stock
6. Warehouses - Dashboard
7. Warehouses - Transfer History
8. Warehouses - Export Preview

---

## Appendix B: Recommended Badge Labels

- Active
- Inactive
- Maintenance
- Closed
- Branch
- Warehouse
- Zone
- Rack
- Bin
- Receipt
- Issue
- Transfer
- Low Stock
- Out of Stock
- In Transit

---

## Appendix C: Suggested Location Types (Initial Set)

- Branch
- Warehouse
- Store
- Project Site
- Zone
- Rack
- Bin
- Staging Area
- Quarantine

---

## Appendix D: Example Location Stock View

| Product | Branch | Warehouse | Location | On Hand | Value | Status |
|---------|--------|-----------|----------|---------|-------|--------|
| Office chairs | Mumbai | Andheri WH | Rack A-12 | 24 | ₹61,200 | Active |
| Printer toner | Mumbai | Andheri WH | Bin A-12-03 | 18 | ₹14,400 | Low stock |
| Courier boxes | Pune | Hinjewadi WH | Bulk Zone | 120 | ₹9,600 | Active |

---

## Appendix E: Example Transfer Audit

| Ref | Product | From | To | Qty | By | Date |
|-----|---------|------|----|-----|----|------|
| TRF-2026-0042 | Office chairs | Andheri WH / Rack A-12 | Pune Store / Stockroom | 6 | R. Mehta | 12 Jun 2026 |

---

End of document.
