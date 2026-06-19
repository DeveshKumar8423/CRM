# Product Requirements Document (PRD)
## Purchase Orders (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Finance / Procurement / Vendor Operations  
**Document Version:** v1.0  
**Date:** 2026-06-19  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Purchase Orders provides a structured workflow for creating vendor purchase orders and tracking fulfillment progress inside the CRM. Users should be able to raise POs against vendors, define line items with quantities and pricing, route them through approval, send them to suppliers, and monitor what has been **ordered**, **received**, **billed**, and what remains **pending** at both header and line-item level.

The module must bridge operational procurement and finance oversight. Operations and purchasing staff should create POs quickly with clear vendor and delivery context; warehouse or receiving teams should record receipts; finance should see billing progress and outstanding commitments without reconciling spreadsheets.

This module should feel native to the existing CRM experience and integrate with current entities (Companies, Contacts, Products/Services, Expenses, Invoices, Deals, Activity Logs, Role Permissions).

---

## 2. Problem Statement

Today, vendor purchasing may be tracked outside the CRM—in email threads, spreadsheets, chat messages, or accounting tools disconnected from operational context. That creates friction for finance teams and weak visibility for managers and operations.

Common issues this module should solve:

- Purchase orders are created inconsistently or without standardized vendor and item detail
- There is no single view of ordered vs received vs billed quantities
- Receiving and billing progress is tracked manually across multiple systems
- Approval workflows for vendor spend are informal and hard to audit
- Finance cannot easily see open PO commitments, pending receipts, or unbilled received goods
- Procurement data is disconnected from projects, deals, cost centers, or expense records
- Month-end vendor reconciliation requires manual assembly from multiple sources

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a single place to create and manage vendor purchase orders with required commercial context.
2. Support vendor, line items, quantities, pricing, taxes, delivery dates, and terms as first-class fields.
3. Enable a clear PO lifecycle from draft to approved, sent, received, billed, and closed.
4. Track **ordered**, **received**, **billed**, and **pending** quantities at line-item and PO summary level.
5. Give managers, operations, and finance review queues and visibility by vendor, status, and owner.
6. Preserve auditability through timestamps, approver notes, receipt history, and billing linkage.
7. Make PO creation fast enough for day-to-day procurement use.
8. Support role-based visibility and approval permissions.

### 3.2 Non-Goals (This Phase)

1. Full accounting ledger posting and accounts payable automation.
2. Advanced warehouse management, bin locations, or inventory optimization.
3. Vendor portal with supplier self-service login.
4. Automated three-way match engine with tolerance rules and exception queues.
5. Multi-currency FX conversion beyond display and storage of PO currency.
6. Complex statutory procurement compliance automation.
7. Full vendor master / supplier relationship management as a standalone module.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Operations Executive: Creates POs for materials, logistics, and day-to-day vendor purchases.
- Procurement Coordinator: Manages vendor POs, follow-ups, and receipt coordination.
- Finance Executive: Reviews, approves, and tracks billed vs received status.
- Manager / Team Lead: Approves team POs and monitors open commitments.
- Receiving / Warehouse User: Records goods or service receipt against PO lines.
- Admin: Configures approval rules, numbering, defaults, and permissions.

### 4.2 Secondary Users

- Project Owner: Links POs to project or operational context.
- Accountant / Auditor: Reviews PO history, receipts, billing trail, and approvals.
- Leadership: Reviews open PO value, vendor spend, and fulfillment aging.

---

## 5. Scope Overview

### 5.1 In Scope

- Purchase order list, detail, and creation screens
- Vendor capture and lightweight vendor reference fields
- Line items with ordered quantity, unit price, tax, and totals
- PO approval workflow and review queue
- PO statuses and lifecycle transitions
- Receipt recording against PO line items
- Billing status tracking per line item (billed quantity and amount)
- Pending quantity calculations:
  - Pending receipt = ordered − received
  - Pending billing = received − billed (or ordered − billed depending on policy)
- Filters by date, vendor, status, owner, and fulfillment state
- Manager and finance dashboards for open POs and pending items
- Export of filtered PO lists
- Activity timeline and audit fields on PO records
- Optional linkage to deal, project, contact, cost center, or expense context
- Attachment support for vendor quotes, delivery notes, or supporting documents

### 5.2 Out of Scope (Phase 1)

- Inventory stock deduction and warehouse picking workflows
- Automated OCR extraction from vendor invoices
- Vendor payment execution and bank disbursement
- Budget planning and hard budget enforcement
- Purchase requisition module as a separate upstream workflow
- Real-time shipment carrier integrations
- Returns / debit note automation

---

## 6. Core Product Concept

A purchase order is the authoritative procurement document for goods or services expected from a vendor. It should capture enough context that finance can approve it without follow-up questions and operations can understand what was ordered, when it should arrive, and what remains outstanding.

The product should support two key patterns:

- Quick PO creation when a vendor quote or need is already known
- Structured review and approval before the PO is sent to the vendor

Every PO should preserve who created it, what was ordered, who approved it, what has been received, what has been billed, and what proof or documents support it.

### 6.1 Fulfillment Tracking Model

Each PO line item should maintain four quantity views:

| Metric | Definition |
|--------|------------|
| Ordered | Quantity approved on the PO |
| Received | Quantity recorded as received or service delivered |
| Billed | Quantity matched to a vendor bill / payable record |
| Pending Receipt | Ordered − Received |
| Pending Billing | Received − Billed (default); configurable to Ordered − Billed if policy requires |

Header-level totals should roll up ordered value, received value, billed value, and pending amounts for quick scanning.

---

## 7. Purchase Order Lifecycle

### 7.1 Canonical Statuses

1. Draft
2. Submitted
3. Under Review
4. Approved
5. Sent to Vendor
6. Partially Received
7. Fully Received
8. Partially Billed
9. Fully Billed
10. Closed
11. Cancelled

### 7.2 Status Definitions

- Draft: Internal working record, not yet sent for approval.
- Submitted: PO sent into the approval workflow.
- Under Review: Assigned to a reviewer, manager, or finance queue.
- Approved: PO accepted and ready to issue to the vendor.
- Sent to Vendor: PO communicated to supplier; fulfillment tracking is active.
- Partially Received: At least one line has receipt progress but not all lines are fully received.
- Fully Received: All ordered quantities have been received or service delivery recorded.
- Partially Billed: Some received value has been billed but billing is incomplete.
- Fully Billed: All received or ordered value has been billed according to policy.
- Closed: Administrative closure after fulfillment and billing are complete.
- Cancelled: PO voided before or after approval according to policy.

### 7.3 Transition Rules

- Draft → Submitted: creator confirms PO is complete.
- Submitted → Under Review: routed to approver or finance queue.
- Under Review → Approved: reviewer accepts PO.
- Under Review → Rejected: reviewer declines with reason; PO returns to editable state if policy allows.
- Approved → Sent to Vendor: PO issued to supplier.
- Sent to Vendor → Partially Received: first receipt recorded.
- Partially Received → Fully Received: all lines reach received quantity.
- Fully Received → Partially Billed: first billing recorded.
- Partially Billed → Fully Billed: all billable quantity billed.
- Fully Billed → Closed: finance or admin closes the PO.
- Draft/Submitted/Under Review/Approved → Cancelled: PO withdrawn or voided.
- Rejected → Draft: resubmission allowed when policy permits edits.

### 7.4 Product Rules

- POs above a configurable amount may require manager or finance approval.
- Approved POs should preserve the submitted snapshot used at approval time.
- Rejected POs must retain reviewer comments.
- Closed and fully billed POs should be read-only except for notes or export.
- Receipt quantity cannot exceed ordered quantity unless override permission is granted.
- Billed quantity cannot exceed received quantity unless policy allows direct billing from ordered quantity.
- Partial receipts and partial billings must update pending calculations immediately.

---

## 8. Information Architecture and Navigation

### 8.1 New Navigation Entry

- Main nav: Purchase Orders
- Quick actions:
  - New Purchase Order
  - My POs
  - Pending Approval
  - Pending Receipt
  - Pending Billing

### 8.2 Primary Screens

1. Purchase Order List
2. Purchase Order Detail
3. Purchase Order Builder / Edit
4. Approval Queue
5. Receipt Recording View
6. Billing Progress View
7. PO Summary Dashboard
8. Export View

### 8.3 Cross-Module Entry Points

- From Deal detail: create PO linked to deal context
- From Contact detail: create PO for a vendor contact
- From Expense detail: reference originating spend need (optional)
- From Dashboard widgets: access pending approvals, receipts, or billing backlog
- From Finance area: open approved-unbilled or received-unbilled PO lines

---

## 9. Detailed Functional Requirements

## 9.1 Purchase Order List Page

### Required Elements

- Search by PO number, vendor, title, item description, submitter, or reference number
- Filters:
  - Status
  - Vendor
  - Owner / creator
  - Date range
  - Approval state
  - Fulfillment state (pending receipt, pending billing)
  - Amount range
- Sort options:
  - Latest created
  - PO date
  - Expected delivery date
  - Amount
  - Status
  - Last updated
- Table columns (default):
  - PO #
  - Title / summary
  - Vendor
  - Ordered amount
  - Received %
  - Billed %
  - Pending receipt qty/value
  - Pending billing qty/value
  - Status
  - Expected delivery
  - Owner
  - Last updated
- Bulk actions:
  - Export list
  - Assign reviewer (admin/manager)

### UX Behaviors

- Saved views such as “My Drafts”, “Pending Approval”, “Pending Receipt”, “Pending Billing”, and “This Month”.
- Strong status color cues for overdue delivery, pending receipt, and pending billing.
- Empty state with CTA to create first PO.

## 9.2 Purchase Order Creation Flow

### Required Fields

- PO title / summary
- Vendor name (and optional vendor contact details)
- PO date
- Expected delivery date
- Currency
- Payment terms (optional)
- Delivery location / notes (optional)
- Line items:
  - Item description
  - SKU / product reference (optional)
  - Ordered quantity
  - Unit
  - Unit price
  - Tax rate or tax amount
  - Line total
- Notes (optional)
- Supporting attachment (optional)
- Linked deal / project / contact / cost center (optional)

### UX Expectations

- Can be completed in under two minutes for common single-vendor POs
- Reuse products/services from CRM catalog where available
- Defaults should minimize typing for repeat vendors and categories
- Desktop builder with line-item table; mobile-friendly sequential layout
- Running totals for subtotal, tax, and grand total

## 9.3 Purchase Order Detail Page

### Layout Blocks

- Header strip with PO number, status, ordered amount, PO date, vendor, and owner
- Action bar based on lifecycle and permissions
- Summary cards:
  - ordered summary
  - received summary
  - billed summary
  - pending summary
- Line items table with ordered / received / billed / pending columns
- Receipt history section
- Billing linkage section
- Attachments section
- Approval history section
- Notes and linked records section
- Status timeline

### Action Matrix

- Draft: edit, submit, delete
- Submitted / Under Review: approve, reject, request changes
- Approved: send to vendor, record receipt, export
- Sent to Vendor / Partially Received: record receipt, cancel remaining lines if allowed
- Fully Received / Partially Billed: record billing progress, link vendor bill
- Fully Billed: close PO, export
- Rejected: edit and resubmit, cancel
- Closed: export, archive view

## 9.4 Approval Queue

### Required Elements

- Queue of POs awaiting review
- Compact cards with vendor, amount, expected delivery, and line count
- Attachment indicator
- Comment box for approver notes
- Actions: Approve, Reject, Request Changes

### Trigger Conditions

- Amount exceeds approval threshold
- Vendor not on approved list
- Delivery date is urgent or backdated
- Policy-based escalation to finance

## 9.5 Receipt Recording

### Required Elements

- Select PO and line item(s)
- Enter received quantity and receipt date
- Optional delivery note / GRN reference
- Optional attachment (delivery challan, photo, signed note)
- Notes for partial or damaged receipt
- Update PO status automatically based on cumulative received quantity

### Rules

- Received quantity is cumulative per line
- Partial receipts allowed
- Over-receipt requires elevated permission
- Receipt events appear in PO timeline

## 9.6 Billing Progress Tracking

### Required Elements

- Record billed quantity and billed amount per line
- Link to vendor bill reference number or future payable record
- Show pending billing quantity and value
- Header rollup of billed vs pending amounts
- Optional mark-line-as-fully-billed action

### Rules

- Billing can be recorded manually in Phase 1
- Future integration may link to accounts payable or expense records
- Billed amount should not exceed line received value unless policy allows bill-on-order

## 9.7 PO Summary Dashboard

### Required KPI Cards

- Open PO value
- Pending approval amount
- Pending receipt value
- Pending billing value
- POs overdue for delivery
- Top vendor by open PO value

### Required Charts / Tables

- Open POs by vendor
- Receipt aging list
- Billing backlog list
- Monthly PO trend
- Approval turnaround time

## 9.8 Attachments and Documents

### Requirements

- Upload one or more supporting files per PO
- Supported types: image (JPG, PNG, WEBP), PDF
- Preview attachment in detail view
- Show upload timestamp and uploader
- Optional PO PDF export for sending to vendor

## 9.9 Export and Reporting

### Required Behaviors

- Export current filtered list to spreadsheet-friendly format
- Include applied filters in export header
- Show PO status, vendor, ordered/received/billed/pending values, and approval fields
- Print-friendly PO detail view

---

## 10. UI / UX Specifications

## 10.1 Visual Language

- Reuse the CRM’s existing panel, table, badge, and filter styling patterns.
- Financial amounts should align consistently and be easy to scan.
- PO status badges must differentiate draft, pending approval, sent, received, billed, and closed states clearly.
- Line-item fulfillment should use compact progress indicators or quantity chips for ordered / received / billed / pending.

## 10.2 Suggested Page Layouts

### Purchase Order List

- Top row: title + primary CTA
- Second row: search, filters, saved views
- Main area: PO table with fulfillment columns
- Right-side optional cards: pending approval, pending receipt, pending billing

### Purchase Order Builder

- Desktop: line-item table with sticky totals/actions
- Mobile: sequential sections with compact action footer

### Purchase Order Detail

- Header summary with PO state
- Horizontal action bar
- Fulfillment summary cards above line-item grid
- Sections for receipts, billing, attachments, and approval history

## 10.3 Interaction Patterns

- Autosave for drafts
- Confirmation modal for submit, approve, send-to-vendor, and close actions
- Inline validation for quantity, date, and required vendor fields
- Fast line-item add/remove with immediate total recalculation

## 10.4 Empty, Loading, and Error States

- Empty list should explain whether there are no POs or no matches
- Draft loading should show skeleton placeholders
- Receipt or billing update failure should preserve entered values

## 10.5 Accessibility

- Keyboard operable primary actions
- Focus states for all controls
- High contrast for status badges and overdue warnings
- Accessible labels for quantity, amount, and date fields

---

## 11. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- purchase_orders.view
- purchase_orders.create
- purchase_orders.edit_own
- purchase_orders.edit_all
- purchase_orders.submit
- purchase_orders.approve
- purchase_orders.reject
- purchase_orders.send
- purchase_orders.record_receipt
- purchase_orders.record_billing
- purchase_orders.close
- purchase_orders.delete
- purchase_orders.export
- purchase_orders.manage_settings

### Role Expectations

- Operations / Procurement: create, edit own drafts, submit POs, record receipts
- Manager: approve team POs, view open commitments
- Finance Executive: approve, record billing, close POs, export, view company-wide PO status
- Admin: manage thresholds, numbering, defaults, and permissions

---

## 12. Data Fields (UI-Centric Definition)

### 12.1 Core PO Fields

- PO Number
- Title / Summary
- Vendor Name
- Vendor Contact (optional)
- PO Date
- Expected Delivery Date
- Currency
- Payment Terms
- Delivery Location / Notes
- Status
- Owner / Creator
- Approver

### 12.2 Line Item Fields

- Line number
- Description
- Product / SKU reference (optional)
- Unit
- Ordered quantity
- Received quantity
- Billed quantity
- Pending receipt quantity
- Pending billing quantity
- Unit price
- Tax rate / tax amount
- Line subtotal
- Line total

### 12.3 Context Fields

- Notes
- Internal reference
- Vendor quote reference
- Receipt / GRN reference
- Vendor bill reference
- Linked deal
- Linked contact
- Linked project / cost center

### 12.4 Audit Fields

- Created by / at
- Submitted by / at
- Reviewed by / at
- Approved by / at
- Sent to vendor by / at
- Closed by / at
- Rejection reason
- Last updated

---

## 13. Validation and Business Rules

1. PO must contain at least one line item before submission.
2. Ordered quantity must be greater than zero for each line.
3. Unit price must be zero or greater according to policy.
4. Vendor name is required before submission.
5. Expected delivery date should not be in the past unless policy allows.
6. Approved and closed POs cannot be edited like drafts.
7. Rejected POs require a reviewer reason.
8. Received quantity cannot exceed ordered quantity without override permission.
9. Billed quantity cannot exceed received quantity unless bill-on-order policy is enabled.
10. Export should reflect the same filters visible on screen.
11. Pending values must recalculate immediately after receipt or billing updates.

---

## 14. Notifications and Reminders

### Internal Notifications

- PO submitted for approval
- PO approved or rejected
- PO sent to vendor
- Receipt recorded
- Billing progress updated
- PO overdue for expected delivery
- High-value PO submitted

### Workflow Reminders

- Remind approver when PO remains pending too long
- Remind receiving team when approved PO awaits receipt
- Remind finance when received goods remain unbilled
- Surface monthly open PO summary to managers

---

## 15. Reporting and Insights

### Operational Reports

- Open POs by vendor
- Pending receipt lines
- Pending billing lines
- Approved vs rejected ratio
- Average approval time
- Receipt aging
- Billing backlog
- Monthly PO trend

### UI Artifacts

- KPI cards for open PO value, pending receipt, and pending billing
- Vendor leaderboard by open commitment
- Receipt aging table
- Billing backlog table

---

## 16. Analytics Events

- purchase_order_created
- purchase_order_submitted
- purchase_order_approved
- purchase_order_rejected
- purchase_order_sent
- purchase_order_receipt_recorded
- purchase_order_billing_recorded
- purchase_order_closed
- purchase_order_exported
- purchase_order_viewed

Event payload should include vendor, amount bucket, fulfillment status, pending receipt value, pending billing value, and linked module context.

---

## 17. Integration Points

### 17.1 CRM Modules

- Products / Services: optional line-item picker
- Contacts: vendor contact linkage
- Deals / Projects: operational context
- Expenses: optional linkage for informal spend that matures into formal PO
- Invoices / Payables (future): vendor bill matching
- Activity Log: all major PO events

### 17.2 Future Integrations

- Vendor master synchronization
- Inventory updates on receipt
- Accounts payable posting
- Email / PDF send to vendor

---

## 18. Risks and Mitigations

1. Risk: Users create POs without enough vendor or delivery detail.  
   Mitigation: Require vendor, delivery date, and line items before submission.

2. Risk: Receipt and billing data drift from reality.  
   Mitigation: Show ordered / received / billed / pending side by side and timestamp every update.

3. Risk: Approval queues become backlogged.  
   Mitigation: Surface aging, reminders, and manager/finance queue views.

4. Risk: Operations and finance use different definitions of “billed”.  
   Mitigation: Standardize billed quantity rules and show explicit pending billing calculations.

5. Risk: PO module feels disconnected from CRM work.  
   Mitigation: Allow linking to deals, contacts, projects, and cost centers where relevant.

---

## 19. Release Phasing

### Phase 1 (MVP)

- PO list and detail views
- PO builder with vendor, line items, amounts, and terms
- Draft → submit → approve/reject → send lifecycle
- Receipt recording with ordered / received / pending receipt tracking
- Manual billing progress with ordered / received / billed / pending billing tracking
- Approval queue
- Basic open PO dashboard
- Export filtered list

### Phase 2

- Vendor approved list and threshold configuration
- PO PDF export and send-to-vendor workflow improvements
- Receipt and billing history drill-down
- Overdue delivery and billing reminders
- Better finance backlog views

### Phase 3

- Vendor bill / payable linkage
- Three-way match support
- Inventory handoff on receipt
- Budget visibility and policy automation

---

## 20. UAT Acceptance Checklist

1. User can create and submit a PO with vendor, line items, quantities, and amounts.
2. Manager or finance user can approve or reject a PO with comments.
3. Approved PO can be marked sent to vendor.
4. User can record partial and full receipts; pending receipt updates correctly.
5. User can record billing progress; pending billing updates correctly.
6. PO list supports search and filtering by status, vendor, and date.
7. PO detail shows ordered, received, billed, and pending values clearly.
8. Pending approval queue is visible to authorized reviewers.
9. Open PO dashboard shows pending receipt and pending billing totals.
10. Permissions correctly limit view, submit, approve, receipt, billing, and export actions.
11. Export matches the currently filtered PO list.

---

## 21. UI Suggestions Summary

1. Make PO creation fast with reusable vendors and catalog line items.
2. Show fulfillment progress directly in the list view, not only on detail.
3. Use a clear approval queue for managers and finance.
4. Surface pending receipt and pending billing prominently on the overview page.
5. Keep receipt and billing actions close to the line-item table.
6. Preserve audit context on every PO detail screen.

---

## 22. Open Product Questions for Final Sign-Off

1. Should billing be based on received quantity only, or can some vendors be billed directly from ordered quantity?
2. Do we need separate approval paths for manager vs finance?
3. Should vendor master be introduced in Phase 1 or remain free-text with optional contact linkage?
4. Is partial cancellation of remaining line quantity required in MVP?
5. Should POs link to deals, projects, or both in the first release?
6. Do we need a formal goods receipt note (GRN) number on every receipt event?

---

## Appendix A: Suggested Screen Inventory

1. Purchase Orders - List
2. Purchase Orders - New / Edit
3. Purchase Orders - Detail
4. Purchase Orders - Approval Queue
5. Purchase Orders - Record Receipt
6. Purchase Orders - Billing Progress
7. Purchase Orders - Summary Dashboard
8. Purchase Orders - Export Preview

---

## Appendix B: Recommended Badge Labels

- Draft
- Submitted
- Under Review
- Approved
- Rejected
- Sent
- Partially Received
- Fully Received
- Partially Billed
- Fully Billed
- Closed
- Cancelled
- Pending Receipt
- Pending Billing
- Overdue Delivery
- High Value

---

## Appendix C: Suggested PO Payment Terms (Initial Set)

- Due on Receipt
- Net 15
- Net 30
- Net 45
- Net 60
- 50% Advance, 50% on Delivery
- Custom

---

## Appendix D: Example Line-Item Fulfillment View

| Item | Ordered | Received | Billed | Pending Receipt | Pending Billing |
|------|---------|----------|--------|-----------------|-----------------|
| Office chairs | 20 | 12 | 0 | 8 | 12 |
| Printer toner | 10 | 10 | 10 | 0 | 0 |
| Courier retainer | 1 | 1 | 0 | 0 | 1 |

---

End of document.
