# Product Requirements Document (PRD)
## Sales Orders (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Sales / Commercial Operations / Delivery Handoff  
**Document Version:** v1.0  
**Date:** 2026-06-13  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

The Sales Orders module converts approved quotations into confirmed sales orders that can be used for delivery, billing, and project execution. It must give sales and operations teams a clear handoff point from commercial agreement to fulfillment, while preserving the original quotation context, pricing, terms, and customer approval trail.

This module should feel like a natural continuation of the quotation experience already present in the CRM. The product must support order creation, review, confirmation, scheduling, fulfillment status tracking, partial execution, and downstream handoff visibility without introducing unnecessary process complexity.

---

## 2. Problem Statement

Today, once a quotation is approved, the confirmation step and all downstream operational coordination are likely handled manually or outside the CRM. That creates risk in the exact moment where business commitment becomes operational reality.

Common problems this module should solve:

- Approved quotations do not reliably become tracked sales orders
- Operations teams lack a single source of truth for delivery or project execution
- Billing teams may not have a clean handoff from commercial approval to invoicing readiness
- Sales teams cannot easily see whether an order is confirmed, scheduled, partially delivered, or completed
- Order amendments may overwrite the original commercial agreement instead of preserving version history

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Convert approved quotations into confirmed sales orders in a controlled, auditable flow.
2. Preserve quote values, terms, and customer context at the moment of confirmation.
3. Support operational execution tracking for delivery, billing, or project work.
4. Give users a clear order lifecycle from confirmation to completion.
5. Provide status visibility for sales, management, and operations teams.
6. Make it easy to handle partial fulfillment, amendments, cancellations, and re-confirmations.

### 3.2 Non-Goals (This Phase)

1. Full warehouse management or inventory optimization.
2. Deep ERP-style procurement, stock reservation, or MRP planning.
3. Advanced accounting ledger posting or tax filing automation.
4. Shipment carrier integrations and real-time logistics tracking.
5. Complex project management beyond lightweight execution handoff and milestone visibility.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Sales Executive: Converts approved quotes into orders and follows up on confirmation.
- Account Manager: Monitors customer order status and handles changes or escalations.
- Operations Coordinator: Reviews confirmed orders and prepares delivery or execution.
- Billing/Finance User: Uses confirmed orders as a basis for invoicing readiness.
- Sales Manager/Admin: Oversees order pipeline, approvals, and exception handling.

### 4.2 Secondary Users

- Client Recipient: Confirms order, views summary, and reviews change requests.
- Delivery/Project Owner: Tracks assigned scope, milestones, and completion status.

---

## 5. Scope Overview

### 5.1 In Scope

- Convert approved quotations into sales orders
- Manual sales order creation for special cases
- Order list, order detail, and order confirmation views
- Confirmation numbers and reference tracking
- Order-level items, quantities, taxes, discounts, and totals
- Delivery or execution status tracking
- Partial fulfillment and milestone progress
- Order revision/amendment flow
- Cancellation and close-out handling
- Role-based visibility and approval logic
- Operational handoff to billing or project execution
- Notifications, reminders, and activity logs

### 5.2 Out of Scope (Phase 1)

- Inventory deductions and warehouse picking logic
- Real-time shipment carrier tracking
- Automated invoice generation engine
- Resource scheduling optimization for project staffing
- Contract negotiation redlining tools

---

## 6. Core Product Concept

A sales order is the committed version of a commercial agreement. It should represent what the customer has formally accepted and what internal teams are expected to deliver or bill against.

The order may originate from:

- An approved quotation
- A manually created order for an existing customer relationship
- A converted deal that bypasses a formal quote in exceptional cases

The system should preserve the quotation as the source record when conversion occurs, rather than replacing it.

---

## 7. Order Lifecycle

### 7.1 Canonical Statuses

1. Draft
2. Awaiting Customer Confirmation
3. Confirmed
4. In Preparation
5. Partially Delivered
6. Delivered
7. In Billing
8. In Execution
9. On Hold
10. Completed
11. Cancelled
12. Closed

### 7.2 Status Definitions

- Draft: Internal working record not yet finalized.
- Awaiting Customer Confirmation: Ready for client review and acceptance.
- Confirmed: Customer has accepted and order is active.
- In Preparation: Internal teams are setting up delivery, billing, or execution.
- Partially Delivered: Some part of the order has been completed.
- Delivered: Fulfillment scope is completed on the delivery side.
- In Billing: Billing readiness or invoicing follow-up is active.
- In Execution: Project/service work is being performed.
- On Hold: Temporarily paused due to customer or internal dependency.
- Completed: All contractual work and handoffs are done.
- Cancelled: Order stopped before completion.
- Closed: Final administrative closure after completion or cancellation.

### 7.3 Transition Rules

- Draft -> Awaiting Customer Confirmation: order is ready to share.
- Awaiting Customer Confirmation -> Confirmed: customer accepts the order.
- Confirmed -> In Preparation: internal handoff begins.
- In Preparation -> In Execution: delivery/project work starts.
- In Preparation/In Execution -> Partially Delivered: only part of the scope is completed.
- Partially Delivered -> Delivered: all delivery items are fulfilled.
- Delivered -> In Billing: billing follow-up is pending or underway.
- Delivered/In Billing/In Execution -> Completed: all business obligations are done.
- Any active state -> On Hold: order is paused.
- Any non-final state -> Cancelled: order is stopped.
- Completed/Cancelled -> Closed: administrative finalization.

### 7.4 Product Rules

- Confirmed orders should preserve the quote snapshot used at the moment of confirmation.
- Status changes must be visible in the order timeline.
- Final states should be read-only except for administrative notes or archival actions.

---

## 8. Information Architecture and Navigation

### 8.1 New Navigation Entry

- Main nav: Sales Orders
- Quick actions:
  - New Sales Order
  - Convert from Quotation
  - Orders awaiting confirmation
  - Orders in progress

### 8.2 Primary Screens

1. Sales Order List
2. Sales Order Detail
3. Sales Order Builder / Edit Draft
4. Quote Conversion Confirmation Screen
5. Customer Order Confirmation View
6. Fulfillment / Execution Tracking View
7. Amend Order Flow
8. Admin Settings for order defaults

### 8.3 Cross-Module Entry Points

- From Quotation detail: Convert to Sales Order
- From Deal detail: Create order from confirmed commercial agreement
- From Contact detail: Create order for an existing customer
- From Dashboard widgets: open urgent or delayed orders

---

## 9. Detailed Functional Requirements

## 9.1 Sales Order List Page

### Required Elements

- Search by order number, customer name, quotation number, deal name, project name, or assigned owner
- Filters:
  - Status
  - Origin source (quotation, manual, deal)
  - Customer
  - Assigned owner
  - Date range
  - Delivery due date
  - Billing status
- Sort options:
  - Latest updated
  - Order date
  - Due date
  - Value
  - Progress
- Table columns (default):
  - Order Number
  - Customer
  - Source Quote / Deal
  - Total Value
  - Status
  - Delivery / Execution Due Date
  - Owner
  - Last Updated
- Bulk actions:
  - Mark on hold
  - Send reminder
  - Export list
  - Assign owner

### UX Behaviors

- Saved views such as “My Orders”, “Ready for Billing”, “Late Delivery Risk”, and “Recently Confirmed”.
- Sticky filter row for long lists.
- Highlight urgent orders with due-date visual cues.
- Empty state with primary CTA to create or convert an order.

## 9.2 Sales Order Creation Flow

### Creation Sources

1. Convert approved quotation
2. Create manually from scratch
3. Create from deal context
4. Clone existing order as a new draft

### Conversion Flow Requirements

- On quotation detail, a user can choose “Convert to Sales Order”.
- Conversion should display a confirmation summary:
  - quote number
  - customer
  - total amount
  - currency
  - key terms
  - effective dates
- User should be able to adjust order-specific fields before final confirmation.
- The resulting order should retain a visible link back to the source quotation.

### Manual Creation Requirements

- User can define customer, source context, order title, order date, delivery due date, owner, and line items.
- Manual creation should still support the same order lifecycle and tracking fields as converted orders.

## 9.3 Sales Order Builder / Edit Draft

### Form Sections

1. Header
- Order title
- Order number
- Order date
- Confirmation date
- Currency
- Order type (delivery, service execution, billing-only, mixed)

2. Customer Details
- Company / customer account
- Contact person
- Email and phone
- Billing address
- Delivery/service address
- Attention line

3. Source Reference
- Linked quotation
- Linked deal
- Linked lead/contact if relevant
- Internal owner and responsible team

4. Commercial Summary
- Line items copied from quote or added manually
- Quantities
- Rate / unit price
- Discounts
- Taxes
- Item notes
- Section grouping

5. Delivery or Execution Plan
- Requested delivery date
- Internal target date
- Milestones or phases
- Dependencies
- Special instructions

6. Billing Readiness
- Billing trigger style
- Invoice reference placeholder
- Payment milestone notes
- Advance / partial billing notes if applicable

7. Internal Notes
- Operations notes
- Risk flags
- Special handling instructions

8. Attachments
- Signed acceptance copy
- PO reference file
- Supporting order documents

### Builder Actions

- Save draft
- Preview order
- Send for customer confirmation
- Confirm order internally
- Mark on hold
- Cancel order
- Duplicate order
- Create amendment

## 9.4 Order Detail Page

### Layout Blocks

- Top summary bar with order number, status, value, due date, and owner
- Action bar based on status and permissions
- Snapshot cards:
  - customer summary
  - source quote/deal
  - delivery / execution summary
  - billing summary
- Line item table
- Status timeline
- Fulfillment progress panel
- Handoff panel for billing or execution
- Notes and attachments section

### Action Matrix

- Draft: edit, preview, send for confirmation, delete
- Awaiting Customer Confirmation: resend, edit permitted fields, cancel
- Confirmed: begin preparation, create amendment, print/export
- In Preparation / In Execution: update progress, mark partial delivery, place on hold
- Partially Delivered: continue execution, close delivered scope, create billing handoff
- Completed: duplicate, archive, export
- Cancelled: duplicate, reopen by admin policy only

## 9.5 Customer Confirmation View

### Goals

- Make the order easy to understand and approve
- Present a clean summary of scope, amount, delivery date, and key terms
- Reduce customer friction for confirmation

### Required Customer Actions

- View order summary
- Confirm order
- Request changes
- Reject order with reason
- Download summary PDF

### UX Requirements

- Simple layout optimized for mobile and email link access
- Prominent confirmation button
- Terms section visible without excessive scrolling
- Trust cues such as company branding and reference to source quotation

## 9.6 Fulfillment / Execution Tracking

### Required Tracking Features

- Progress state by order line or milestone
- Partial completion support
- Due date warnings
- Owner assignment for each milestone or task group
- Notes for blockers and dependencies

### Progress Views

- Percentage complete summary
- Milestone checklist
- Delivery stage cards
- Execution activity stream

### User Actions

- Mark milestone completed
- Mark part delivered
- Update expected completion date
- Add blocker note
- Reassign owner

## 9.7 Amendment Flow

### Rules

- Amendments must preserve the original confirmed order history.
- The amended order should be linked to the parent order.
- A revision number or amendment number should be visible.

### UI Expectations

- “Create Amendment” action on eligible orders
- Side-by-side comparison between current and amended details
- Clear banner explaining what changed and why

## 9.8 Cancellation and Hold Handling

### Cancellation Requirements

- Cancellation should require a reason for auditability.
- Users should see whether cancellation came from customer, sales, or internal operations.

### Hold Requirements

- On Hold status should capture a reason and optional expected resume date.
- Hold reason should be visible in list and detail views.

---

## 10. UI / UX Specifications

## 10.1 Visual Language

- Reuse the CRM’s existing panel, table, badge, and filter patterns.
- Order status badges must be highly legible and immediately scannable.
- Use strong visual hierarchy in the order detail page so the commercial summary is seen before secondary notes.

## 10.2 Suggested Page Layouts

### Sales Order List

- Top area: page title + primary CTA
- Second row: search, filters, saved views
- Main area: data table with status cues
- Optional side cards: overdue, due soon, ready to bill

### Sales Order Builder

- Desktop: two-column layout
  - left side for editable fields and line items
  - right side for sticky summary, source reference, and actions
- Mobile: stacked sections with a bottom sticky action bar

### Sales Order Detail

- Header summary + status badge
- Action row
- Tabs or sections for overview, items, fulfillment, billing, notes, and timeline

### Customer Confirmation View

- Minimal document-like layout
- Large confirmation button
- Brief summary first, detailed terms below

## 10.3 Interaction Patterns

- Autosave indicator for draft editing
- Inline validation for required dates and numeric amounts
- Confirmation modals for destructive actions such as cancellation
- Contextual CTAs based on current status to reduce user confusion

## 10.4 Empty, Loading, and Error States

- Empty list should explain whether there are no orders or no matches for filters
- Builder loading state should be short and clear
- Detail views should show a friendly fallback if the order cannot be found

## 10.5 Accessibility

- Keyboard support for all primary actions
- Visible focus states
- Readable badge contrast
- Clear labels for order status and action buttons
- Screen-reader-friendly headings and form grouping

---

## 11. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- sales_orders.view
- sales_orders.create
- sales_orders.edit_draft
- sales_orders.convert_from_quote
- sales_orders.confirm
- sales_orders.update_progress
- sales_orders.hold
- sales_orders.cancel
- sales_orders.amend
- sales_orders.manage_settings

### Role Expectations

- Sales Executive: create drafts, convert from quote, send confirmation, update notes
- Operations Coordinator: update fulfillment progress, place on hold, complete milestones
- Billing User: view confirmed orders and billing readiness data
- Manager/Admin: approve exceptions, amend, cancel, and manage defaults

---

## 12. Data Fields (UI-Centric Definition)

### 12.1 Core Order Fields

- Order Number
- Order Title
- Status
- Order Type
- Order Date
- Confirmation Date
- Due Date
- Owner
- Source Quotation
- Source Deal

### 12.2 Customer Fields

- Customer Name
- Contact Name
- Contact Email
- Contact Phone
- Billing Address
- Delivery / Service Address

### 12.3 Commercial Fields

- Subtotal
- Discount Total
- Tax Total
- Grand Total
- Currency
- Billing Notes

### 12.4 Operational Fields

- Preparation status
- Fulfillment progress
- Delivery milestones
- Hold reason
- Cancellation reason
- Completion notes

### 12.5 Audit Fields

- Created by / at
- Updated by / at
- Confirmed by / at
- Closed by / at
- Last status change timestamp

---

## 13. Validation and Business Rules

1. A confirmed order must have a linked customer.
2. At least one line item is required before confirmation.
3. Order due date cannot be earlier than the order date.
4. Confirmed orders should not allow silent price changes; amendments are required.
5. Hold and cancellation require a reason.
6. Partial delivery states require at least one fulfilled milestone or line.
7. Billing handoff should only be possible for confirmed orders.
8. Closed orders should be read-only except for archival metadata.

---

## 14. Notifications and Reminders

### Internal Notifications

- Order confirmed
- Order placed on hold
- Order overdue
- Order partially delivered
- Order ready for billing
- Order completed

### Customer Notifications

- Order confirmation request sent
- Order confirmed
- Amendment issued
- Order cancelled

### Reminder Rules

- Reminder before due date
- Reminder when order remains in preparation too long
- Reminder when billing handoff is pending

---

## 15. Reporting and Insights

### Operational Reports

- Orders by status
- Orders by owner
- Confirmed vs completed order ratio
- Average time from confirmation to completion
- Partially delivered backlog
- On-hold order count
- Billing-ready order count

### UI Artifacts

- KPI cards on dashboard
- Progress chart for order stages
- Due-soon and overdue queues
- Team performance summary

---

## 16. Analytics Events

- sales_order_created
- sales_order_converted_from_quote
- sales_order_sent_for_confirmation
- sales_order_confirmed
- sales_order_amended
- sales_order_put_on_hold
- sales_order_progress_updated
- sales_order_partially_delivered
- sales_order_completed
- sales_order_cancelled

Event payload should include order value bucket, source type, owner, current status, and due date risk.

---

## 17. Risks and Mitigations

1. Risk: Orders become a duplicate of quotations and confuse users.  
   Mitigation: Make the order’s role explicit as the operational commitment stage.

2. Risk: Overly complex execution tracking slows adoption.  
   Mitigation: Keep tracking lightweight with optional milestones and progress cards.

3. Risk: Amendments overwrite the original commitment.  
   Mitigation: Version every amendment and preserve a visible chain.

4. Risk: Billing and fulfillment teams interpret order state differently.  
   Mitigation: Define the state labels clearly and show what each status means in the UI.

---

## 18. Release Phasing

### Phase 1 (MVP)

- Convert approved quotations into sales orders
- Sales order list and detail pages
- Basic confirmation and cancellation flow
- Status tracking and owner assignment
- Lightweight fulfillment progress tracking

### Phase 2

- Amendments and version comparison
- Billing readiness and handoff indicators
- Partial delivery support
- Reminder automation and dashboard insights

### Phase 3

- Advanced execution milestones
- Deeper reporting and risk scoring
- More configurable order templates and workflows

---

## 19. UAT Acceptance Checklist

1. Approved quotation can be converted into a sales order.
2. Sales order preserves the source quotation reference and values.
3. User can view, search, filter, and sort orders in the list page.
4. User can confirm an order and customer confirmation is visible.
5. User can update fulfillment progress and partial delivery state.
6. User can place an order on hold with a reason.
7. User can cancel an order with audit trail.
8. User can create an amendment without losing the original order history.
9. Billing-ready and execution-ready states are clear in the UI.
10. Order statuses and actions remain role-appropriate throughout the flow.

---

## 20. UI Suggestions Summary

1. Make quote-to-order conversion the primary entry path.
2. Keep the detail page status-heavy and action-light so users know exactly what to do next.
3. Use progress cards and milestones instead of a complex project-management interface.
4. Make customer confirmation minimal and trust-focused.
5. Surface due-date risk and on-hold states prominently in the list view.
6. Preserve history through amendments instead of editing confirmed orders in place.

---

## 21. Open Product Questions for Final Sign-Off

1. Should customer confirmation require explicit acceptance of terms before a sales order becomes confirmed?
2. Do we need separate order types for delivery, billing-only, and project execution?
3. Should partial delivery be tracked by line item, milestone, or both?
4. Which roles can create amendments after confirmation?
5. Should billing handoff be a visible status or a hidden internal checkpoint?

---

## Appendix A: Suggested Screen Inventory

1. Sales Orders - List
2. Sales Orders - New / Edit Draft
3. Sales Orders - Detail
4. Sales Orders - Convert from Quotation
5. Sales Orders - Customer Confirmation View
6. Sales Orders - Execution Tracking
7. Sales Orders - Amendments
8. Sales Orders - Admin Settings

---

## Appendix B: Recommended Badge Labels

- Draft
- Awaiting Customer Confirmation
- Confirmed
- In Preparation
- In Execution
- Partially Delivered
- Delivered
- In Billing
- On Hold
- Completed
- Cancelled
- Closed

---

End of document.
