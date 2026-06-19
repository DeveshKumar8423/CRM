# Product Requirements Document (PRD)
## Inventory Management (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Operations / Warehouse / Stock Control  
**Document Version:** v1.0  
**Date:** 2026-06-19  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Inventory Management provides a structured way to track stock levels, stock value, and stock movements inside the CRM. Users should be able to monitor **item quantity** and **stock value** at the product level, set **opening stock**, and record movements caused by **purchase**, **sale**, **damage**, and **adjustment** events with a clear audit trail.

The module must bridge product catalog data and operational stock reality. Operations and warehouse staff should see current on-hand quantity quickly; finance should understand stock value without manual spreadsheet reconciliation; managers should see low-stock risk and movement history in one place.

This module should feel native to the existing CRM experience and integrate with current entities (Products/Services, Purchase Orders, Sales Orders, Invoices, Deals, Activity Logs, Role Permissions).

---

## 2. Problem Statement

Today, product records in the CRM may describe what can be sold or procured, but they do not reliably represent what is physically available or what stock is worth. Stock changes from purchases, sales, damage, and manual corrections are often tracked outside the system.

Common issues this module should solve:

- Product quantity on hand is unknown or outdated
- Opening stock is not captured when items are introduced into inventory
- Purchases increase stock inconsistently or only in external tools
- Sales or fulfillment reduce stock without a visible movement record
- Damaged, lost, or written-off stock is not tracked formally
- Manual stock corrections happen without reason codes or audit history
- Stock value is calculated manually and disagrees across teams
- Inventory data is disconnected from purchase orders, sales orders, and invoices

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a single place to view current item quantity and stock value by product.
2. Support opening stock setup for inventory-tracked products.
3. Record stock movements for purchase, sale, damage, and adjustment with required context.
4. Maintain an auditable stock ledger showing quantity before/after each movement.
5. Calculate stock value from quantity and valuation method configured for the item.
6. Give operations and finance visibility into low stock, recent movements, and stock value totals.
7. Support role-based permissions for viewing stock, recording movements, and making adjustments.
8. Enable optional linkage between stock movements and purchase orders, sales orders, or invoices.

### 3.2 Non-Goals (This Phase)

1. Full warehouse management with bin locations, racks, and pick paths.
2. Multi-warehouse / multi-location inventory optimization.
3. Barcode scanning hardware integrations and RFID workflows.
4. Automated MRP, reorder point optimization, or demand forecasting engines.
5. Batch/lot tracking, expiry dates, and serial-number traceability.
6. Full accounting ledger posting and COGS automation.
7. Real-time carrier or 3PL warehouse integrations.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Operations Executive: Monitors stock and records day-to-day movements.
- Warehouse / Store User: Records receipts, issues, damage, and adjustments.
- Procurement Coordinator: Reviews stock impact of purchase receipts.
- Sales / Fulfillment User: Reviews stock availability before confirming orders.
- Finance Executive: Reviews stock value and movement audit trail.
- Manager / Team Lead: Monitors low stock and approves sensitive adjustments.
- Admin: Configures inventory defaults, valuation rules, and permissions.

### 4.2 Secondary Users

- Project Owner: Checks stock tied to operational work.
- Accountant / Auditor: Reviews stock ledger and valuation history.
- Leadership: Reviews total stock value and movement trends.

---

## 5. Scope Overview

### 5.1 In Scope

- Inventory list and product stock detail views
- Current quantity and stock value per inventory-tracked product
- Opening stock entry for new or newly tracked items
- Stock movement types:
  - Opening stock
  - Purchase (stock in)
  - Sale (stock out)
  - Damage (stock out)
  - Adjustment (increase or decrease)
- Stock ledger / movement history per product
- Manual movement recording with reason, notes, and reference
- Optional automatic movement from:
  - Purchase order receipt events
  - Sales order fulfillment / delivery events
- Low-stock indicators and filters
- Inventory summary dashboard
- Export of stock list and movement history
- Activity timeline and audit fields on movement records
- Role-based permissions for view, record, adjust, and export

### 5.2 Out of Scope (Phase 1)

- Bin/location-level stock
- Batch, lot, and serial tracking
- Stock reservation and allocation engine
- Inter-warehouse transfers
- Automated reorder purchase generation
- Physical stocktake workflow with scanner devices
- Returns and reverse logistics automation

---

## 6. Core Product Concept

An inventory-tracked product should have a current **on-hand quantity** and a calculated **stock value** derived from its unit valuation and movement history. Every change to quantity should happen through a stock movement record rather than silent edits.

The product should support two key patterns:

- **Setup pattern:** define opening stock when a product enters inventory tracking
- **Movement pattern:** record purchase, sale, damage, or adjustment events that update quantity and preserve audit context

Every movement should preserve who recorded it, what changed, why it changed, and what the resulting quantity and value were.

### 6.1 Stock Tracking Model

Each inventory-tracked product should maintain:

| Field | Definition |
|-------|------------|
| On-hand quantity | Current available stock quantity |
| Unit valuation | Cost/value basis used to calculate stock value |
| Stock value | On-hand quantity × unit valuation (unless overridden by policy) |
| Reorder level | Optional threshold for low-stock warnings |
| Last movement date | Most recent stock movement timestamp |

Each stock movement should maintain:

| Field | Definition |
|-------|------------|
| Movement type | opening, purchase, sale, damage, adjustment |
| Direction | in or out |
| Quantity | Units moved |
| Unit value | Value per unit at time of movement |
| Total value | Quantity × unit value |
| Quantity before | Stock before movement |
| Quantity after | Stock after movement |
| Reference | PO, SO, invoice, or manual reference |
| Reason / notes | Business context for the movement |

### 6.2 Movement Type Definitions

- **Opening stock:** Initial quantity when inventory tracking starts for a product.
- **Purchase:** Stock increase from vendor receipt or procurement event.
- **Sale:** Stock decrease from customer sale, dispatch, or fulfillment.
- **Damage:** Stock decrease from spoilage, breakage, loss, or write-off.
- **Adjustment:** Manual correction up or down with required reason.

---

## 7. Stock Lifecycle and Rules

### 7.1 Product Inventory States

1. Not tracked
2. Tracked — no opening stock yet
3. Tracked — active
4. Tracked — low stock
5. Tracked — out of stock
6. Inactive / discontinued

### 7.2 Product Rules

- Only products marked as inventory-tracked participate in stock calculations.
- Opening stock can be recorded once per product unless admin override is allowed.
- Sale and damage movements cannot reduce quantity below zero unless override permission is granted.
- Adjustments require a reason and should be visible in the movement ledger.
- Stock value should recalculate immediately after each movement.
- Inactive products should remain readable but not accept new movements unless reactivated.

### 7.3 Integration Rules

- Purchase receipt on a PO line linked to a tracked product may auto-create a **purchase** movement.
- Sales order fulfillment on a tracked product may auto-create a **sale** movement.
- Manual movements remain available when automation is disabled or for exceptions.
- Linked source records should be preserved on the movement for traceability.

---

## 8. Information Architecture and Navigation

### 8.1 New Navigation Entry

- Main nav: Inventory
- Quick actions:
  - Inventory overview
  - Record movement
  - Low stock items
  - Opening stock setup
  - Movement history

### 8.2 Primary Screens

1. Inventory List
2. Product Stock Detail
3. Record Movement Form
4. Opening Stock Setup
5. Movement History / Ledger
6. Low Stock View
7. Inventory Summary Dashboard
8. Export View

### 8.3 Cross-Module Entry Points

- From Product detail: enable tracking, set opening stock, view movements
- From Purchase Order receipt: view resulting stock movement
- From Sales Order fulfillment: view resulting stock movement
- From Dashboard widgets: open low-stock or total stock value summary
- From Finance area: open stock value report

---

## 9. Detailed Functional Requirements

## 9.1 Inventory List Page

### Required Elements

- Search by product name, SKU/service code, or category
- Filters:
  - Tracking status
  - Category
  - Low stock
  - Out of stock
  - Recently moved
- Sort options:
  - Product name
  - On-hand quantity
  - Stock value
  - Last movement date
  - Reorder level proximity
- Table columns (default):
  - Product / SKU
  - Category
  - On-hand qty
  - Unit
  - Unit valuation
  - Stock value
  - Reorder level
  - Status
  - Last movement
- Bulk actions:
  - Export list

### UX Behaviors

- Saved views such as “Low stock”, “Out of stock”, “High value items”, and “Recently adjusted”.
- Strong visual cues for out-of-stock and below-reorder-level items.
- Empty state with CTA to enable inventory tracking on a product.

## 9.2 Product Stock Detail Page

### Layout Blocks

- Header with product name, SKU, tracking status, on-hand quantity, and stock value
- Action bar based on permissions
- Summary cards:
  - current quantity
  - stock value
  - opening stock
  - total purchased in
  - total sold out
  - total damaged
  - net adjustments
- Movement ledger table
- Linked purchase/sales references section
- Notes and product metadata section

### Action Matrix

- Not tracked: enable tracking, set opening stock
- Tracked: record purchase, record sale, record damage, record adjustment, export ledger
- Low stock: record purchase, view linked POs
- Out of stock: record purchase, record adjustment

## 9.3 Opening Stock Setup

### Required Fields

- Product
- Opening quantity
- Unit valuation
- Effective date
- Notes (optional)
- Reference (optional)

### Rules

- Opening stock creates the first movement of type `opening`.
- Quantity after movement equals opening quantity.
- Stock value initializes from opening quantity × unit valuation.
- Re-opening should be blocked unless admin override is enabled.

## 9.4 Record Movement Flow

### Required Fields

- Product
- Movement type (purchase, sale, damage, adjustment)
- Quantity
- Unit valuation (default from product; editable if policy allows)
- Movement date
- Reference number / linked document (optional)
- Reason / notes (required for damage and adjustment)

### UX Expectations

- Show quantity before and projected quantity after before confirmation
- Prevent negative stock unless override permission exists
- Fast entry for common purchase and sale events
- Mobile-friendly form for warehouse use

## 9.5 Movement History / Ledger

### Required Elements

- Chronological list of all movements for a product or company-wide
- Filters by movement type, date range, user, and reference
- Columns:
  - Date
  - Product
  - Type
  - In / out
  - Quantity
  - Unit value
  - Total value
  - Qty before
  - Qty after
  - Recorded by
  - Reference
  - Notes
- Export current filtered ledger

## 9.6 Low Stock View

### Required Elements

- List of products at or below reorder level
- On-hand quantity vs reorder level
- Suggested follow-up CTA to create purchase order or record purchase movement
- Sort by urgency and stock value

## 9.7 Inventory Summary Dashboard

### Required KPI Cards

- Total stock value
- Total tracked products
- Low stock count
- Out of stock count
- Movements this month
- Top product by stock value

### Required Charts / Tables

- Stock value by category
- Low stock table
- Recent movements
- Purchase vs sale vs damage vs adjustment trend

## 9.8 Export and Reporting

### Required Behaviors

- Export current filtered inventory list
- Export movement ledger with applied filters
- Include product, quantity, stock value, movement type, and audit fields
- Print-friendly stock detail view

---

## 10. UI / UX Specifications

## 10.1 Visual Language

- Reuse the CRM’s existing panel, table, badge, and filter styling patterns.
- Quantities and values should align consistently and be easy to scan.
- Movement type badges must differentiate opening, purchase, sale, damage, and adjustment clearly.
- Low-stock and out-of-stock states should use strong but accessible warning colors.

## 10.2 Suggested Page Layouts

### Inventory List

- Top row: title + record movement CTA
- Second row: search, filters, saved views
- Main area: stock table with value and quantity columns
- Right-side optional cards: low stock, total stock value

### Product Stock Detail

- Header summary with current quantity and value
- Action bar for movement types
- Movement ledger below summary cards

### Record Movement

- Single-column form with projected before/after quantity
- Compact confirmation footer on mobile

## 10.3 Interaction Patterns

- Confirmation modal for sale, damage, and adjustment movements
- Inline validation for quantity, date, and required reason
- Immediate ledger refresh after movement save
- Autofill unit valuation from product defaults

## 10.4 Empty, Loading, and Error States

- Empty inventory list should explain that no products are tracked yet
- Product with no movements should prompt for opening stock setup
- Failed movement save should preserve entered form data

## 10.5 Accessibility

- Keyboard operable primary actions
- Focus states for all controls
- High contrast for warning badges and stock alerts
- Accessible labels for quantity, value, and movement type

---

## 11. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- inventory.view
- inventory.enable_tracking
- inventory.record_opening
- inventory.record_purchase
- inventory.record_sale
- inventory.record_damage
- inventory.adjust
- inventory.override_negative
- inventory.export
- inventory.manage_settings

### Role Expectations

- Operations / Warehouse: view stock, record purchase, sale, damage, and opening stock
- Sales / Fulfillment: view stock, record sale movements where allowed
- Manager: all movement types, approve sensitive adjustments, export
- Finance Executive: view stock value, export ledger, review adjustments
- Admin: manage settings, valuation defaults, and permissions

---

## 12. Data Fields (UI-Centric Definition)

### 12.1 Product Inventory Fields

- Product ID
- SKU / service code
- Product name
- Category
- Inventory tracked (yes/no)
- On-hand quantity
- Unit
- Unit valuation
- Stock value
- Reorder level
- Inventory status
- Last movement date

### 12.2 Stock Movement Fields

- Movement ID
- Product
- Movement type
- Direction
- Quantity
- Unit valuation
- Total value
- Quantity before
- Quantity after
- Movement date
- Reference type
- Reference ID / number
- Reason
- Notes
- Recorded by
- Created at

### 12.3 Audit Fields

- Created by / at
- Updated by / at
- Source module (manual, purchase_order, sales_order, invoice)
- Approval status for sensitive adjustments (optional future)

---

## 13. Validation and Business Rules

1. Only inventory-tracked products can receive stock movements.
2. Movement quantity must be greater than zero.
3. Opening stock can only be created if no prior opening movement exists, unless override is allowed.
4. Sale and damage movements cannot reduce stock below zero without override permission.
5. Adjustment movements require a reason.
6. Unit valuation must be zero or greater.
7. Stock value must recalculate immediately after each movement.
8. Movement date cannot be in the future unless policy allows.
9. Export should reflect the same filters visible on screen.
10. Linked purchase or sales references must belong to the same company context.

---

## 14. Notifications and Reminders

### Internal Notifications

- Product dropped below reorder level
- Product out of stock
- Opening stock recorded
- Large adjustment recorded
- Negative stock override used

### Workflow Reminders

- Remind procurement when low-stock items remain unresolved
- Remind operations when purchase receipt did not update inventory
- Surface weekly stock value summary to managers

---

## 15. Reporting and Insights

### Operational Reports

- Stock value by category
- Low stock items
- Out of stock items
- Movement summary by type
- Purchase vs sale trend
- Damage/write-off summary
- Adjustment audit list

### UI Artifacts

- KPI cards for stock value and low stock
- Category value chart
- Recent movements table
- Top products by stock value

---

## 16. Analytics Events

- inventory_tracking_enabled
- inventory_opening_recorded
- inventory_movement_recorded
- inventory_adjustment_recorded
- inventory_low_stock_viewed
- inventory_exported
- inventory_viewed

Event payload should include product category, movement type, quantity bucket, stock value bucket, and linked module context.

---

## 17. Integration Points

### 17.1 CRM Modules

- Products / Services: inventory tracking flag, reorder level, unit valuation
- Purchase Orders: receipt → purchase movement
- Sales Orders: fulfillment/delivery → sale movement
- Invoices: optional stock impact for billed goods (future)
- Deals / Projects: contextual visibility only in Phase 1
- Activity Log: all major inventory events

### 17.2 Future Integrations

- Multi-warehouse locations
- Barcode scanning
- Accounting COGS posting
- Automated reorder suggestions

---

## 18. Risks and Mitigations

1. Risk: Teams record stock movements inconsistently.  
   Mitigation: Standardize movement types and require reasons for damage/adjustment.

2. Risk: Stock value drifts from finance expectations.  
   Mitigation: Show unit valuation on every movement and preserve historical values in the ledger.

3. Risk: Purchase and sales modules update stock differently.  
   Mitigation: Define explicit integration rules and show source linkage on each movement.

4. Risk: Negative stock corrupts reporting.  
   Mitigation: Block by default and allow only with elevated permission.

5. Risk: Inventory feels disconnected from CRM work.  
   Mitigation: Surface stock on product, PO, and SO detail screens.

---

## 19. Release Phasing

### Phase 1 (MVP)

- Inventory list and product stock detail
- Enable tracking on products
- Opening stock setup
- Manual movements: purchase, sale, damage, adjustment
- Movement ledger
- Low stock view
- Basic inventory dashboard
- Export stock list and ledger

### Phase 2

- Auto stock updates from purchase order receipts
- Auto stock updates from sales order fulfillment
- Reorder level configuration and alerts
- Adjustment approval for high-value changes
- Better stock value reporting

### Phase 3

- Multi-location inventory
- Batch/serial tracking
- Stock reservation against sales orders
- Accounting handoff and COGS integration

---

## 20. UAT Acceptance Checklist

1. User can enable inventory tracking on a product.
2. User can record opening stock and see resulting on-hand quantity and stock value.
3. User can record purchase, sale, damage, and adjustment movements.
4. Movement ledger shows quantity before/after and audit context.
5. Sale or damage cannot reduce stock below zero without override permission.
6. Inventory list supports search and low-stock filtering.
7. Product stock detail shows summary cards and movement history.
8. Low stock view highlights items at or below reorder level.
9. Dashboard shows total stock value and movement summary.
10. Export matches the currently filtered inventory list or ledger.
11. Permissions correctly limit view, record, adjust, and export actions.

---

## 21. UI Suggestions Summary

1. Show current quantity and stock value directly in the inventory list.
2. Make movement recording fast with clear before/after quantity preview.
3. Use distinct badges for purchase, sale, damage, and adjustment.
4. Surface low-stock items prominently on the overview page.
5. Keep the movement ledger close to the product stock detail screen.
6. Preserve audit context on every stock movement.

---

## 22. Open Product Questions for Final Sign-Off

1. Should all products be inventory-tracked by default, or only selected physical goods?
2. Should purchase order receipts automatically increase stock in Phase 1 or Phase 2?
3. Should sales order fulfillment automatically decrease stock in Phase 1 or Phase 2?
4. Which valuation method should MVP use: last purchase cost, average cost, or manual unit valuation?
5. Should adjustments above a threshold require manager approval?
6. Do we need reorder level and low-stock alerts in the first release?

---

## Appendix A: Suggested Screen Inventory

1. Inventory - List
2. Inventory - Product Stock Detail
3. Inventory - Record Movement
4. Inventory - Opening Stock Setup
5. Inventory - Movement Ledger
6. Inventory - Low Stock
7. Inventory - Summary Dashboard
8. Inventory - Export Preview

---

## Appendix B: Recommended Badge Labels

- Tracked
- Not Tracked
- Opening
- Purchase
- Sale
- Damage
- Adjustment
- Low Stock
- Out of Stock
- Negative Override
- Inactive

---

## Appendix C: Suggested Movement Reasons (Initial Set)

### Damage
- Breakage
- Spoilage
- Transit loss
- Quality rejection
- Obsolete write-off

### Adjustment
- Stock count correction
- System migration
- Found stock
- Data cleanup
- Other

---

## Appendix D: Example Stock Ledger View

| Date | Type | In/Out | Qty | Unit Value | Total | Qty Before | Qty After | Reference |
|------|------|--------|-----|------------|-------|------------|-----------|-----------|
| 01 Jun | Opening | In | 100 | ₹250 | ₹25,000 | 0 | 100 | INIT-001 |
| 05 Jun | Purchase | In | 40 | ₹255 | ₹10,200 | 100 | 140 | PO-2026-0012 |
| 08 Jun | Sale | Out | 25 | ₹255 | ₹6,375 | 140 | 115 | SO-2026-0048 |
| 10 Jun | Damage | Out | 3 | ₹255 | ₹765 | 115 | 112 | DMG-2026-0003 |
| 12 Jun | Adjustment | In | 2 | ₹255 | ₹510 | 112 | 114 | ADJ-2026-0001 |

**Current on-hand:** 114 units  
**Current stock value:** ₹29,070

---

End of document.
