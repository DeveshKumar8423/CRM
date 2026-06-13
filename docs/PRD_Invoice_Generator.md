# Product Requirements Document (PRD)
## Invoice Generator (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Finance / Billing / Tax-Ready Documents  
**Document Version:** v1.0  
**Date:** 2026-06-13  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

The Invoice Generator turns approved commercial transactions into tax-ready invoices linked to customers, sales orders, quotations, products, payments, and ledger-facing records. It should provide a reliable billing workflow that bridges sales completion and finance operations while preserving business context, tax correctness, and document traceability.

This module must feel like a natural continuation of the existing CRM workflow. A user should be able to generate an invoice from an approved sales order, a completed quotation, or a manual billing scenario; review the tax breakdown; finalize the invoice; track payment status; and export or share the invoice in a professional format.

---

## 2. Problem Statement

Today, the CRM has quotation, sales order, and billing-related data, but there is no centralized invoice generation experience described as a first-class product workflow. That creates avoidable friction at the moment when commercial commitments must become a compliant billing record.

Common issues this module should solve:

- Invoices are generated inconsistently or outside the CRM
- Sales orders and invoices are not tightly traceable
- Tax, subtotal, and discount logic may be manually recreated
- Finance and sales teams do not share a common invoice status view
- Payment tracking is fragmented or disconnected from the invoice record
- Document numbering, branding, and tax formatting are not standardized across users

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Generate professional, tax-ready invoices from approved business transactions.
2. Preserve traceability back to source quotation, sales order, customer, and product data.
3. Support correct tax, discount, currency, and total calculations in the UI workflow.
4. Provide a clear invoice lifecycle from draft to paid or closed.
5. Enable finance and operations teams to monitor invoice status and payment progress.
6. Support partial payments, credit notes, reversals, and adjustments as visible product concepts.
7. Make invoice generation fast and consistent through templates, defaults, and reusable line-item data.

### 3.2 Non-Goals (This Phase)

1. Full accounting ledger posting and double-entry bookkeeping automation.
2. Bank reconciliation or payment gateway settlement automation.
3. Complex country-specific e-invoicing integrations and statutory portal submission.
4. Inventory valuation or stock movement logic.
5. Legal tax filing automation beyond invoice-level tax presentation and compliance-friendly formatting.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Finance Executive: Creates and manages invoices, tracks receipts, and handles adjustments.
- Billing Coordinator: Prepares invoices from sales orders or approved quotes.
- Sales Executive: Initiates invoice generation from closed commercial activity.
- Operations Manager: Reviews invoice readiness tied to completed work.
- Admin/Supervisor: Controls numbering, defaults, permissions, and document formatting.

### 4.2 Secondary Users

- Client Recipient: Receives invoice, views details, and downloads the document.
- Accountant/Reviewer: Audits invoice totals, taxes, and payment status.
- Project Owner: Confirms that billable milestones or deliverables are complete.

---

## 5. Scope Overview

### 5.1 In Scope

- Create invoices from sales orders, quotations, and manual entry
- Invoice list, invoice detail, and invoice generation screens
- Customer, order, product, and payment linkage
- Tax-ready line items with subtotal, tax, discount, and rounding support
- Invoice numbering, date formatting, and company branding
- Invoice statuses and lifecycle transitions
- Partial payment and outstanding balance visibility
- Credit note / reversal / adjustment concepts
- Export, print, share, and send actions
- Activity timeline and audit trail visibility
- Dashboard widgets and filtered lists for finance teams

### 5.2 Out of Scope (Phase 1)

- Automated accounting journal posting
- Inventory deduction and stock management
- Direct payment processor integration
- Government e-invoice API submission
- Advanced dunning automation with multi-step collections workflows

---

## 6. Core Product Concept

An invoice is the authoritative billing document for goods or services already agreed, delivered, or scheduled for delivery. It should be derived from trusted source records rather than re-entered from scratch whenever possible.

The product should support three key creation patterns:

- Invoice from Sales Order: preferred path for committed fulfillment or project billing
- Invoice from Quotation: useful when the quote is accepted and billing begins immediately
- Manual Invoice: for ad hoc billing, legacy accounts, or exceptional cases

The invoice must preserve links back to its origin so users can always trace why the invoice exists and what commercial context it represents.

---

## 7. Invoice Lifecycle

### 7.1 Canonical Statuses

1. Draft
2. Awaiting Review
3. Approved
4. Issued
5. Sent
6. Viewed
7. Partially Paid
8. Paid
9. Overdue
10. Cancelled
11. Refunded
12. Written Off
13. Closed

### 7.2 Status Definitions

- Draft: Internal working record, not yet finalized.
- Awaiting Review: Ready for finance or managerial review.
- Approved: Ready to issue to the customer.
- Issued: Finalized invoice number assigned.
- Sent: Shared with the customer.
- Viewed: Customer opened the invoice.
- Partially Paid: Some amount received.
- Paid: Fully settled.
- Overdue: Payment due date passed and balance remains.
- Cancelled: Invoice voided before or after issue according to policy.
- Refunded: Payment reversed or returned.
- Written Off: Balance deemed uncollectible.
- Closed: Administrative closure after settlement or cancellation.

### 7.3 Transition Rules

- Draft -> Awaiting Review: invoice is ready for finance validation.
- Awaiting Review -> Approved: reviewer confirms accuracy.
- Approved -> Issued: invoice number is committed and final document is produced.
- Issued -> Sent: invoice is delivered to the customer.
- Sent -> Viewed: customer opens the invoice.
- Sent/Viewed -> Partially Paid: partial receipt is recorded.
- Partially Paid -> Paid: full balance is settled.
- Sent/Viewed/Partially Paid -> Overdue: due date passes with outstanding balance.
- Any non-final state -> Cancelled: invoice is voided.
- Any open balance -> Refunded or Written Off: special finance actions.
- Paid/Cancelled/Refunded/Written Off -> Closed: administrative finalization.

### 7.4 Product Rules

- Invoice numbers must be unique and visible once issued.
- Finalized invoices should preserve the source line-item snapshot used at issue time.
- Cancelled or issued invoices should not be editable like drafts.
- Adjustments should be represented as explicit invoice actions or linked documents.

---

## 8. Information Architecture and Navigation

### 8.1 New Navigation Entry

- Main nav: Invoices
- Quick actions:
  - New Invoice
  - Generate from Order
  - Pending Review
  - Overdue Invoices
  - Partially Paid

### 8.2 Primary Screens

1. Invoice List
2. Invoice Detail
3. Invoice Builder / Draft Editor
4. Invoice Preview / Print View
5. Review / Approval Queue
6. Payment Tracking View
7. Credit Note / Adjustment View
8. Invoice Settings (admin)
9. Client Invoice View (external-facing)

### 8.3 Cross-Module Entry Points

- From Sales Order detail: Generate invoice
- From Quotation detail: Generate invoice
- From Contact detail: Create manual invoice
- From Dashboard widgets: access overdue or unpaid invoices
- From Payment record: open linked invoice

---

## 9. Detailed Functional Requirements

## 9.1 Invoice List Page

### Required Elements

- Search by invoice number, customer, order number, quotation number, amount, creator, or payment reference
- Filters:
  - Status
  - Customer
  - Source type
  - Issue date
  - Due date
  - Payment status
  - Overdue/partially paid/paid
- Sort options:
  - Latest issued
  - Due date
  - Total amount
  - Outstanding amount
  - Last updated
- Table columns (default):
  - Invoice Number
  - Customer
  - Source Order / Quote
  - Issue Date
  - Due Date
  - Total Amount
  - Outstanding Amount
  - Status
  - Owner
  - Last Updated
- Bulk actions:
  - Send reminder
  - Export list
  - Mark as reviewed
  - Assign owner

### UX Behaviors

- Saved views such as “All Issued”, “Due This Week”, “Overdue”, “Partially Paid”, and “Needs Review”.
- Strong status color cues for overdue and partially paid invoices.
- Empty state with CTA to create or generate an invoice.

## 9.2 Invoice Creation Flow

### Creation Sources

1. Generate from confirmed sales order
2. Generate from approved quotation
3. Create manually for ad hoc billing
4. Clone an invoice as a draft template

### Conversion Flow Requirements

- When generating from an order or quotation, the user should see a prefill summary:
  - customer identity
  - source document number
  - line items
  - taxes and discounts
  - delivery or billing notes
  - outstanding billable amount
- User must be able to confirm whether the invoice is full, partial, advance, milestone-based, or final.
- The generated invoice must remain linked to the source document.

### Manual Creation Requirements

- User can select a customer, add line items, define tax and discount values, and set issue/due dates.
- Manual invoices should still follow the same numbering, status, and lifecycle rules as generated invoices.

## 9.3 Invoice Builder / Draft Editor

### Form Sections

1. Header
- Invoice title
- Invoice number
- Issue date
- Due date
- Currency
- Invoice type (standard, advance, interim, final, credit note, debit note, pro forma)

2. Customer & Billing Details
- Customer name
- Billing contact
- Email and phone
- Billing address
- Tax identification details
- Billing recipient attention line

3. Source Reference
- Linked sales order
- Linked quotation
- Linked deal or project context
- Billing milestone reference

4. Line Items
- Add from product/service master
- Add from sales order lines
- Add custom line item
- Fields per line:
  - Item name
  - Description
  - Quantity
  - Unit
  - Unit price
  - Discount (line level)
  - Tax rate / group
  - Taxable flag if relevant
  - Line subtotal
- Group lines by section or billing phase

5. Financial Summary
- Subtotal
- Line discounts total
- Header discount
- Tax breakdown by rate or category
- Round-off amount
- Grand total
- Amount paid
- Outstanding amount

6. Payment Terms and Billing Notes
- Payment terms
- Bank or remittance instructions
- Late fee note
- Milestone billing note
- Credit reference note
- Cancellation or refund policy text

7. Internal Notes
- Review notes
- Billing exceptions
- Collection notes

8. Attachments
- Purchase order copy
- Delivery certificate
- Acceptance note
- Supporting billing documents

### Builder Actions

- Save draft
- Preview
- Submit for review
- Approve
- Issue invoice
- Send to customer
- Duplicate invoice
- Create adjustment / credit note
- Cancel invoice

## 9.4 Invoice Detail Page

### Layout Blocks

- Header strip with invoice number, status, total, outstanding balance, due date, and owner
- Action bar based on invoice lifecycle and permissions
- Snapshot cards:
  - customer summary
  - source document summary
  - financial summary
  - payment summary
- Line item section
- Tax breakdown section
- Payment history section
- Status timeline
- Notes and attachments section
- Linked documents panel

### Action Matrix

- Draft: edit, preview, submit for review, delete
- Awaiting Review: approve, request changes, edit allowed fields
- Approved: issue, preview, cancel
- Issued/Sent: resend, record payment, create adjustment, export
- Partially Paid: record payment, send reminder, write off remainder if allowed
- Paid: export, receipt view, close
- Overdue: send reminder, record payment, create adjustment
- Cancelled/Closed: duplicate, export, archive

## 9.5 Client Invoice View

### Goals

- Make the invoice easy to understand and act on
- Present total due, due date, tax summary, and payment instructions clearly
- Provide a professional document-like experience on desktop and mobile

### Required Customer Actions

- View invoice
- Download PDF
- Mark as acknowledged if enabled by policy
- View payment instructions
- Open linked payment receipt if available

### UX Requirements

- Minimal top navigation
- Prominent total due and due date
- Strong branding and company identity
- Clear outstanding balance and payment status indicators

## 9.6 Payment Tracking View

### Required Tracking Features

- Record payment date, amount, and method
- Support partial payments
- Show payment history by invoice
- Show remaining balance after each payment
- Display receipt or transaction reference

### Payment Actions

- Add payment
- Edit payment note before lock
- Void or reverse payment according to role policy
- Generate receipt view for settled payment

### Payment Status UX

- Outstanding, partially paid, paid, refunded, written off, disputed

## 9.7 Adjustment / Credit Note Flow

### Rules

- Adjustments should preserve the original invoice history.
- A credit note or debit note should be linked back to the source invoice.
- The UI should make it obvious whether the adjustment reduces or increases amount due.

### UI Expectations

- “Create Adjustment” and “Create Credit Note” actions on eligible invoices
- Comparison summary between original and adjusted invoice
- Clear reason field and approval requirement for high-value adjustments

## 9.8 Review and Approval Flow

### Trigger Conditions

- Tax or amount exceeds threshold
- Non-standard tax treatment
- Manual invoice created without source document
- Credit note or write-off requires approval

### Approval UI

- Queue of invoices waiting review
- Compact detail cards with amount, customer, and issue date
- Comment box for approver notes
- Actions: Approve, Reject, Request Changes

---

## 10. UI / UX Specifications

## 10.1 Visual Language

- Reuse the CRM’s existing panel, table, badge, and filter styling patterns.
- Financial amounts should be easy to scan and align consistently.
- Invoice state badges must differentiate draft, issued, outstanding, overdue, and paid states clearly.

## 10.2 Suggested Page Layouts

### Invoice List

- Top row: title + primary CTA
- Second row: search, filters, saved views
- Main area: invoice table
- Right-side optional cards: overdue, due soon, part paid

### Invoice Builder

- Desktop: two-column layout
  - left side for invoice form and line items
  - right side sticky financial summary and issue/send actions
- Mobile: sequential sections with a compact action footer

### Invoice Detail

- Header summary with invoice state
- Horizontal action bar
- Tabs or sections for overview, items, payments, timeline, and attachments

### Client Invoice View

- Document-like layout with minimal controls
- Payment summary at top
- Download and payment instruction actions clearly separated

## 10.3 Interaction Patterns

- Autosave for drafts
- Inline tax and total recalculation feedback
- Confirmation modal for issue, cancel, write-off, and credit note actions
- Sticky issue/send footer in builder

## 10.4 Empty, Loading, and Error States

- Empty list should explain whether there are no invoices or no matches
- Draft loading should show clear skeleton placeholders
- Failure to fetch a document should present a human-readable retry state

## 10.5 Accessibility

- Keyboard operable primary actions
- Focus states for all controls
- High contrast for status badges and warnings
- Accessible labels for due date, balance due, and payment state
- Form groups with clear heading structure

---

## 11. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- invoices.view
- invoices.create
- invoices.edit_draft
- invoices.generate_from_order
- invoices.review
- invoices.issue
- invoices.send
- invoices.record_payment
- invoices.create_adjustment
- invoices.cancel
- invoices.write_off
- invoices.manage_settings

### Role Expectations

- Finance Executive: create, review, issue, record payments, create adjustments
- Billing Coordinator: generate from orders and manage drafts
- Sales Executive: initiate invoice generation from order or quote
- Manager/Admin: approve exceptions, manage settings, and handle write-offs

---

## 12. Data Fields (UI-Centric Definition)

### 12.1 Core Invoice Fields

- Invoice Number
- Invoice Title
- Invoice Type
- Status
- Issue Date
- Due Date
- Currency
- Source Order
- Source Quotation
- Customer Name
- Owner

### 12.2 Financial Fields

- Subtotal
- Discount Total
- Tax Total
- Round-off
- Grand Total
- Amount Paid
- Outstanding Amount
- Write-off Amount

### 12.3 Payment Fields

- Payment Date
- Payment Method
- Payment Reference
- Payment Note
- Receipt Identifier

### 12.4 Audit Fields

- Created by / at
- Reviewed by / at
- Issued by / at
- Sent by / at
- Last payment by / at
- Closed by / at

---

## 13. Validation and Business Rules

1. Invoice number must be unique once issued.
2. Due date cannot precede issue date.
3. At least one billable line item is required before issue.
4. Totals must always reflect line item, discount, tax, and round-off logic.
5. Issued invoices cannot be edited like drafts.
6. Cancelled or written-off invoices require a reason.
7. Partial payments cannot exceed the outstanding balance.
8. Credit notes and adjustments must preserve a link to the source invoice.
9. Invoice generation from order or quote should carry forward source pricing unless intentionally overridden.
10. Final invoice status should be clearly visible in all linked module views.

---

## 14. Notifications and Reminders

### Internal Notifications

- Invoice draft submitted for review
- Invoice approved and issued
- Invoice due soon
- Invoice overdue
- Payment recorded
- Invoice partially paid
- Invoice fully paid
- Credit note created

### Customer Notifications

- Invoice sent
- Payment reminder
- Payment receipt issued
- Credit note issued

### Reminder Rules

- Due date reminder before payment deadline
- Overdue reminders based on configurable timing
- Escalation reminder for overdue invoices

---

## 15. Reporting and Insights

### Operational Reports

- Invoices by status
- Issued vs paid ratio
- Outstanding balance by customer
- Overdue invoices by age bucket
- Average days to payment
- Partially paid invoice count
- Adjustments and credit notes summary

### UI Artifacts

- KPI cards for total billed, collected, outstanding, overdue
- Aging buckets chart
- Paid vs unpaid trend chart
- Customer outstanding leaderboard

---

## 16. Analytics Events

- invoice_created
- invoice_generated_from_order
- invoice_generated_from_quote
- invoice_submitted_review
- invoice_approved
- invoice_issued
- invoice_sent
- invoice_viewed
- invoice_payment_recorded
- invoice_partially_paid
- invoice_paid
- invoice_overdue
- invoice_adjustment_created
- invoice_cancelled
- invoice_written_off

Event payload should include amount bucket, customer, source type, due date risk, and payment status.

---

## 17. Risks and Mitigations

1. Risk: Invoice generation duplicates quotation or order views.  
   Mitigation: Clearly position invoices as the billing record with distinct statuses and payment data.

2. Risk: Tax and total calculations become confusing for users.  
   Mitigation: Use a visible financial summary panel and immediate recalculation feedback.

3. Risk: Partial payments and adjustments create confusion.  
   Mitigation: Show outstanding balance, payment history, and adjustment history prominently.

4. Risk: Users mix draft and issued invoice editing behavior.  
   Mitigation: Use clear state labels and lock finalized documents.

5. Risk: Client-facing invoice pages feel too operational or cluttered.  
   Mitigation: Keep customer view minimal, branded, and action-oriented.

---

## 18. Release Phasing

### Phase 1 (MVP)

- Generate invoices from orders, quotations, and manual entry
- Invoice list and detail views
- Draft/edit/issue/send lifecycle
- Tax-ready line items and totals
- Basic payment tracking
- Client-facing invoice view

### Phase 2

- Review/approval queue
- Partial payment handling improvements
- Adjustments and credit notes
- Overdue reminders and aging insights

### Phase 3

- Advanced write-off workflows
- Deeper reporting and accounting handoff visibility
- More configurable templates and billing rules

---

## 19. UAT Acceptance Checklist

1. Invoice can be generated from approved sales order.
2. Invoice can be generated from approved quotation.
3. Invoice can also be created manually.
4. Invoice number, issue date, due date, and source references are visible.
5. Taxes, discounts, and totals calculate correctly in the UI.
6. User can issue, send, and view invoice status progression.
7. User can record partial and full payments.
8. User can create a credit note or adjustment with preserved history.
9. Overdue and outstanding states are clearly visible in list and detail views.
10. Customer-facing invoice view is clear, branded, and mobile-friendly.

---

## 20. UI Suggestions Summary

1. Make generation from orders the default path, with quotations as the next most common source.
2. Keep the invoice builder finance-friendly but not accounting-heavy.
3. Use a sticky financial summary panel so totals are always visible.
4. Make outstanding and overdue states highly visible across the list and detail screens.
5. Preserve source-document traceability in every view.
6. Keep the client invoice view clean and document-like, with payment details easy to find.

---

## 21. Open Product Questions for Final Sign-Off

1. Should pro forma invoices be a distinct user-visible type or a template mode?
2. Do we need separate handling for debit notes and credit notes in the first release?
3. Should invoice approval be mandatory for all invoices or only above a configurable threshold?
4. Should payment receipts be a separate module concept or part of invoice detail?
5. Which invoice statuses should be exposed to customers versus kept internal?

---

## Appendix A: Suggested Screen Inventory

1. Invoices - List
2. Invoices - New / Edit Draft
3. Invoices - Detail
4. Invoices - Preview / Print
5. Invoices - Review Queue
6. Invoices - Payment Tracking
7. Invoices - Credit Note / Adjustment
8. Invoices - Settings
9. Client Invoice View

---

## Appendix B: Recommended Badge Labels

- Draft
- Awaiting Review
- Approved
- Issued
- Sent
- Viewed
- Partially Paid
- Paid
- Overdue
- Cancelled
- Refunded
- Written Off
- Closed

---

End of document.
