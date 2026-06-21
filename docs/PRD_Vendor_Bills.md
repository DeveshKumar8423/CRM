# Product Requirements Document (PRD)
## Vendor Bills (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Finance / Accounts Payable / Procurement  
**Document Version:** v1.0  
**Date:** 2026-06-21  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Vendor Bills provides a structured workflow for recording bills received from suppliers and connecting them with purchase orders and payments inside the CRM. Users should be able to capture vendor invoices with line items, taxes, and due dates; link bills to approved purchase orders for fulfillment context; track approval and payment status; and see outstanding payables without reconciling spreadsheets.

The module must bridge operational procurement and finance oversight. Accounts payable staff should register supplier bills quickly with clear vendor and tax context; finance should approve payables and record disbursements; procurement should see how billed amounts relate to what was ordered and received on linked POs.

This module is the accounts-payable counterpart to the customer **Invoice Generator** and the natural evolution of **Purchase Orders Phase 3** billing progress. It should feel native to the existing CRM experience and integrate with current entities (Companies, Contacts, Purchase Orders, Expenses, Deals, Activity Logs, Role Permissions).

---

## 2. Problem Statement

Today, vendor bills are tracked outside the CRM—in email attachments, accounting tools, or lightweight PO billing notes (`bill_reference` strings on purchase orders). That creates friction for finance teams and weak visibility for procurement and leadership.

Common issues this module should solve:

- Supplier bills are recorded inconsistently or without standardized vendor and tax detail
- There is no first-class payable document linked to purchase orders and receipts
- Payment status for vendor obligations is fragmented or disconnected from PO fulfillment
- Finance cannot easily see outstanding payables, due dates, or aging by vendor
- Three-way match (ordered vs received vs billed) requires manual cross-checking across PO screens
- Month-end vendor reconciliation requires manual assembly from PO notes, expense records, and external accounting files
- The existing `/payments` module serves customer (AR) invoices only, leaving AP payment tracking undefined

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a single place to record vendor bills with required commercial and tax context.
2. Support vendor identity, line items, quantities, pricing, taxes, bill date, due date, and payment terms as first-class fields.
3. Enable a clear bill lifecycle from draft to approved, partially paid, paid, or closed.
4. Link bills to purchase orders and PO line items so billed quantities roll up correctly.
5. Record vendor payments against bills with outstanding balance visibility.
6. Give finance review queues and visibility by vendor, status, due date, and owner.
7. Preserve auditability through timestamps, approver notes, PO match context, and payment history.
8. Make bill entry fast enough for day-to-day accounts payable use.
9. Support role-based visibility and approval permissions.
10. Distinguish vendor bills (supplier payables) from employee expenses (already-incurred spend).

### 3.2 Non-Goals (This Phase)

1. Full accounting ledger posting and double-entry bookkeeping automation.
2. Bank reconciliation, payment gateway execution, or disbursement automation.
3. Vendor portal with supplier self-service login or bill submission.
4. Automated OCR extraction from supplier invoice PDFs.
5. Advanced three-way match engine with tolerance rules, exception queues, and auto-rejection.
6. Multi-currency FX conversion beyond display and storage of bill currency.
7. Government e-invoicing portal integration or statutory AP compliance automation.
8. Full vendor master / supplier relationship management as a standalone module.
9. Conflating AP vendor payments with existing AR customer payment UX on `/payments`.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Finance Executive: Registers, approves, and pays vendor bills; monitors outstanding payables.
- Accounts Payable Coordinator: Enters bills from supplier invoices and links them to POs.
- Procurement Coordinator: Confirms PO linkage and billed vs received alignment.
- Manager / Team Lead: Approves high-value bills and monitors vendor spend commitments.
- Admin: Configures approval rules, numbering, defaults, and permissions.

### 4.2 Secondary Users

- Operations Executive: References bills linked to operational POs and projects.
- Accountant / Auditor: Reviews bill history, PO match trail, payments, and approvals.
- Leadership: Reviews open payables, vendor aging, and monthly AP trends.

---

## 5. Scope Overview

### 5.1 In Scope

- Vendor bill list, detail, and creation screens
- Vendor capture via free-text name plus optional Contact (Vendor type) linkage
- Line items with quantity, unit price, tax, and totals
- Bill approval workflow and review queue
- Bill statuses and lifecycle transitions
- Linkage to purchase orders and PO line items (full or partial bills)
- Standalone bill creation without a PO (ad hoc supplier invoices)
- Payment recording against bills (partial and full)
- Outstanding balance and due-date visibility
- Three-way match summary on linked POs: ordered / received / billed / pending billing
- Filters by date, vendor, status, due date, payment status, and PO reference
- Finance dashboards for outstanding payables and overdue bills
- Export of filtered bill lists
- Activity timeline and audit fields on bill records
- Attachment support for supplier invoice PDFs and supporting documents
- Optional linkage to deal, project, cost center, or expense context

### 5.2 Out of Scope (Phase 1)

- Inventory stock deduction on bill posting
- Automated bank payment execution
- Budget planning and hard budget enforcement
- Debit note / credit note automation from vendor disputes
- Purchase requisition module as upstream workflow
- Vendor performance scorecards
- Returns processing tied to vendor bills

---

## 6. Core Product Concept

A vendor bill is the authoritative payable document for goods or services received from a supplier. It should capture enough context that finance can approve payment without follow-up questions and procurement can confirm the bill aligns with what was ordered and received.

The product should support three key creation patterns:

1. **Bill from Purchase Order (preferred path):** Generate a bill from an approved PO with line items prefilled from received (or ordered, per policy) quantities and PO pricing.
2. **Bill with PO Linkage:** Create a bill manually but link it to one or more PO lines for match context.
3. **Standalone Bill:** Record a supplier invoice with no PO—for utilities, retainers, one-off services, or legacy vendor obligations.

Every vendor bill should preserve who entered it, which supplier it belongs to, what PO context it matches, who approved it, how much has been paid, and what proof supports it.

### 6.1 Relationship to Existing Modules

| Module | Relationship |
|--------|--------------|
| **Purchase Orders** | Upstream procurement document; bill lines link to PO lines; billed qty rolls up to PO `billed_quantity` |
| **Invoice Generator (AR)** | Symmetric AP counterpart—similar document structure, tax fields, numbering, payment tracking |
| **Expenses** | Distinct spend type—employee/ops expenses vs supplier payables; optional cross-link for informal spend |
| **Payments (AR)** | Separate concern—customer invoice payments remain on `/payments`; vendor bill payments live on bill detail |
| **Contacts** | Optional vendor identity via Contact with type Vendor |
| **Current PO Billing stub** | `PurchaseOrderBilling` events evolve into or link to full Vendor Bill records in Phase 1 |

---

## 7. Vendor Bill Lifecycle

### 7.1 Canonical Statuses

1. Draft
2. Submitted
3. Under Review
4. Approved
5. Rejected
6. Partially Paid
7. Paid
8. Overdue
9. Cancelled
10. Closed

### 7.2 Status Definitions

| Status | Meaning |
|--------|---------|
| Draft | Bill captured but not submitted for approval |
| Submitted | Sent to reviewer queue |
| Under Review | Assigned to finance or manager for approval |
| Approved | Approved for payment; outstanding balance tracked |
| Rejected | Returned to submitter with reason |
| Partially Paid | One or more payments recorded; balance remains |
| Paid | Full amount settled |
| Overdue | Approved bill past due date with outstanding balance |
| Cancelled | Voided before payment completion |
| Closed | Administrative closure after payment or write-off |

### 7.3 Allowed Transitions

- Draft → Submitted
- Submitted → Under Review → Approved | Rejected
- Rejected → Draft (edit and resubmit)
- Approved → Partially Paid → Paid
- Approved → Overdue (system-derived when due date passes with balance > 0)
- Approved | Partially Paid → Cancelled (with reason)
- Paid → Closed
- Any non-terminal state → Cancelled (admin/finance only, with reason)

### 7.4 Business Rules

- Bill number must be unique once approved (configurable: unique on issue/submit).
- Due date cannot precede bill date.
- At least one line item is required before submission.
- On PO-linked bills, billed quantity per line cannot exceed received quantity (default policy; configurable).
- Partial bills against a PO are supported; multiple bills may reference the same PO line until billed qty equals received qty.
- Approved bills cannot be edited like drafts; corrections require cancellation + re-entry or a future adjustment workflow.
- Partial payments cannot exceed the outstanding balance.
- Overdue status is derived from due date + outstanding balance, not manually set.

---

## 8. Information Architecture and Navigation

### 8.1 Primary Navigation

Add **Vendor Bills** under Finance / Procurement in the main sidebar, near Purchase Orders and Expenses.

Suggested routes:

- `/vendor-bills` — List
- `/vendor-bills/new` — Create
- `/vendor-bills/:id` — Detail
- `/vendor-bills/approval-queue` — Review queue
- `/vendor-bills/payables-summary` — Outstanding / aging dashboard

### 8.2 Entry Points

- From sidebar: Vendor Bills list → New Bill
- From Purchase Order detail: **Create Vendor Bill** (when PO is received or partially received)
- From PO billing section: promote inline billing to full vendor bill (Phase 1 enhancement)
- From Contact detail (Vendor type): Create bill for vendor
- From Dashboard widgets: access overdue payables or pending approval queue
- From Vendor Bill detail: Record payment

### 8.3 Cross-Module Visibility

- PO detail shows linked vendor bills with bill number, date, amount, and status
- Vendor bill detail shows linked PO summary with ordered / received / billed match indicators
- Deal or project context surfaces linked bill totals where configured

---

## 9. Detailed Functional Requirements

## 9.1 Vendor Bill List Page

### Required Elements

- Search by bill number, vendor name, PO number, amount, creator, or payment reference
- Filters:
  - Status
  - Vendor
  - Bill date range
  - Due date range
  - Payment status (unpaid, partial, paid, overdue)
  - Linked PO (yes/no/specific PO)
  - Owner
- Sort options:
  - Latest bill date
  - Due date
  - Total amount
  - Outstanding amount
  - Last updated
- Table columns (default):
  - Bill Number
  - Vendor
  - Linked PO
  - Bill Date
  - Due Date
  - Total Amount
  - Outstanding Amount
  - Status
  - Owner
  - Last Updated
- Bulk actions:
  - Export list
  - Assign owner
  - Send approval reminder (Phase 2)

### UX Behaviors

- Saved views such as “All Open”, “Due This Week”, “Overdue”, “Pending Approval”, and “Unlinked to PO”.
- Strong status color cues for overdue and partially paid bills.
- Empty state with CTA to create bill or generate from PO.

## 9.2 Vendor Bill Creation Flow

### Creation Sources

1. Generate from purchase order (prefill from PO lines)
2. Create manually with optional PO linkage
3. Create standalone bill (no PO)
4. Clone an existing bill as draft template (Phase 2)

### PO Conversion Flow Requirements

- When generating from a PO, the user should see a prefill summary:
  - vendor identity from PO
  - PO number and status
  - line items with ordered, received, and already-billed quantities
  - pending billable quantity per line (default: received − billed)
  - unit price, tax rate, and line totals from PO
- User must confirm bill quantities per line (supports partial billing).
- The generated bill must remain linked to the PO and specific PO line items.
- Recording the bill updates PO line `billed_quantity` and PO header billing status.

### Manual / Standalone Creation Requirements

- User can enter vendor (free text + optional Contact picker), add line items, define tax and totals, and set bill/due dates.
- Standalone bills follow the same numbering, status, and lifecycle rules as PO-linked bills.
- Supplier invoice number (vendor's own reference) is a required or strongly recommended field.

## 9.3 Vendor Bill Builder / Draft Editor

### Form Sections

1. **Header**
   - Bill title / summary
   - Internal bill number (system-generated on save/submit)
   - Supplier invoice number (vendor reference)
   - Bill date
   - Due date
   - Currency (INR default)
   - Payment terms

2. **Vendor Details**
   - Vendor name (required)
   - Linked contact (optional, Vendor type)
   - Vendor GSTIN (from contact or manual entry)
   - Vendor email and phone
   - Vendor address

3. **Purchase Order Reference**
   - Linked PO (optional for standalone)
   - PO line picker when PO selected
   - Match summary: ordered / received / billed / this bill qty

4. **Line Items**
   - Add from PO lines (when PO linked)
   - Add custom line item (standalone or additional charges)
   - Fields per line:
     - Item name / description
     - Linked PO line (optional)
     - Quantity
     - Unit
     - Unit price
     - Tax rate / tax amount
     - Line subtotal
     - Line total

5. **Financial Summary**
   - Subtotal
   - Tax breakdown by rate
   - Round-off (if applicable)
   - Grand total
   - Amount paid
   - Outstanding amount

6. **Internal Notes**
   - Entry notes
   - Approval notes
   - Payment instructions / remittance reference

7. **Attachments**
   - Supplier invoice PDF
   - Delivery note / GRN copy
   - Supporting correspondence

### Builder Actions

- Save draft
- Preview
- Submit for approval
- Approve / reject (reviewers)
- Record payment (approved bills)
- Cancel bill
- Export / print (Phase 2)

## 9.4 Vendor Bill Detail Page

### Layout Blocks

- Header strip with bill number, status, total, outstanding balance, due date, and owner
- Action bar based on bill lifecycle and permissions
- Snapshot cards:
  - vendor summary
  - PO match summary (when linked)
  - financial summary
  - payment summary
- Line item section with PO line cross-reference
- Tax breakdown section
- Payment history section
- Three-way match panel (PO-linked bills): ordered / received / billed comparison
- Status timeline
- Notes and attachments section
- Linked documents panel (PO, deal, expense)

### Action Matrix

| Status | Actions |
|--------|---------|
| Draft | edit, preview, submit, delete |
| Submitted / Under Review | approve, reject, request changes |
| Approved | record payment, cancel, export |
| Partially Paid | record payment, cancel remainder if allowed |
| Paid | export, close |
| Overdue | record payment, send reminder (Phase 2) |
| Rejected | edit, resubmit |
| Cancelled / Closed | duplicate, export, archive view |

## 9.5 PO Linkage and Three-Way Match

### Match Summary (PO-Linked Bills)

For each linked PO line, display:

| Metric | Source |
|--------|--------|
| Ordered | PO line ordered quantity |
| Received | PO line received quantity |
| Previously Billed | PO line billed quantity before this bill |
| This Bill | Quantity on current bill line |
| Pending Billing | Received − total billed (after save) |

### Match Indicators

- **Matched:** Bill qty ≤ pending billable qty on PO line
- **Warning:** Bill qty exceeds received qty (blocked by default)
- **Info:** Standalone bill with no PO—no match panel shown

### PO Status Rollup

When bills are approved against a PO:

- Update PO line `billed_quantity` and billed amount
- Transition PO status toward Partially Billed / Fully Billed per existing PO rules
- Surface linked bills in PO detail billing section (replacing or augmenting inline `PurchaseOrderBilling` events)

## 9.6 Payment Tracking

### Payment Recording

- Finance users record payments on approved or partially paid bills
- Payment fields:
  - Payment date
  - Amount
  - Payment method (bank transfer, cheque, UPI, cash, other)
  - Payment reference / UTR / cheque number
  - Notes
- Multiple partial payments supported until outstanding = 0
- Bill status transitions: Approved → Partially Paid → Paid

### Outstanding and Aging

- Outstanding amount = grand total − sum(payments)
- Aging buckets: Current, 1–30 days overdue, 31–60, 61–90, 90+
- Overdue derived from due date when outstanding > 0

### Separation from AR Payments

- Customer invoice payments remain on `/payments` (AR module)
- Vendor bill payments are recorded on vendor bill detail only
- Future Phase 3 may introduce unified treasury view; Phase 1 keeps AP payments on bills

## 9.7 Approval Workflow

### Review Queue

- Bills above configurable threshold require finance or manager approval
- Queue shows: bill number, vendor, amount, due date, submitter, age in queue
- Reviewer actions: approve, reject with reason, request changes

### Thresholds (Suggested Defaults)

- Auto-approve below ₹10,000 (configurable, optional in Phase 1)
- Finance approval required at ₹10,000+
- Manager + finance dual approval at ₹100,000+ (Phase 2)

## 9.8 Dashboards and Summary Views

### Payables Summary Dashboard

- KPI cards: total outstanding, overdue amount, due this week, pending approval count
- Vendor outstanding leaderboard
- Overdue bills table
- Pending approval queue snippet
- Monthly AP trend (Phase 2)

---

## 10. UX and Design Requirements

## 10.1 Visual Design

- Follow existing CRM design language (`crm-*` components, badge colors, table layouts)
- Bill statuses use distinct badge colors consistent with Invoice and PO modules
- Overdue and partially paid states must be visually prominent
- Financial summary panel should be sticky or always visible during bill editing

## 10.2 Responsive Behavior

- List and detail usable on tablet widths
- Payment recording form usable on mobile for quick finance updates
- Attachment preview works on desktop and tablet

## 10.3 Error Handling

- Validation errors inline on form fields
- PO match violations show clear message (e.g., “Billed quantity exceeds received quantity on line 2”)
- Payment amount exceeding outstanding blocked with explanation
- Failed save preserves entered values

## 10.4 Accessibility

- Keyboard operable primary actions
- Focus states for all controls
- High contrast for status badges and overdue warnings
- Accessible labels for amount, date, and quantity fields

---

## 11. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- vendor_bills.view
- vendor_bills.create
- vendor_bills.edit_own
- vendor_bills.edit_all
- vendor_bills.submit
- vendor_bills.approve
- vendor_bills.reject
- vendor_bills.record_payment
- vendor_bills.cancel
- vendor_bills.delete
- vendor_bills.export
- vendor_bills.manage_settings

### Role Expectations

- Accounts Payable / Finance: create, submit, approve, record payment, export, view company-wide bills
- Procurement: create drafts linked to POs, view bills for their POs
- Manager: approve high-value bills, view team/vendor summaries
- Operations: view bills linked to their POs or projects
- Admin: manage thresholds, numbering, defaults, and permissions

---

## 12. Data Fields (UI-Centric Definition)

### 12.1 Core Bill Fields

- Bill Number (internal, e.g. `VB-2026-0001`)
- Supplier Invoice Number (vendor reference)
- Title / Summary
- Status
- Bill Date
- Due Date
- Currency
- Payment Terms
- Vendor Name
- Vendor Contact (optional)
- Vendor GSTIN
- Linked Purchase Order (optional)
- Owner / Creator
- Approver

### 12.2 Line Item Fields

- Line number
- Description
- Linked PO line (optional)
- Quantity
- Unit
- Unit price
- Tax rate / tax amount
- Line subtotal
- Line total

### 12.3 Financial Fields

- Subtotal
- Tax Total
- Round-off
- Grand Total
- Amount Paid
- Outstanding Amount

### 12.4 Payment Fields (per payment record)

- Payment Date
- Amount
- Payment Method
- Payment Reference
- Notes
- Recorded By

### 12.5 Context Fields

- Internal notes
- Approval notes
- Rejection reason
- Linked deal
- Linked project / cost center
- Linked expense (optional)
- Linked contact (Vendor)

### 12.6 Audit Fields

- Created by / at
- Submitted by / at
- Approved by / at
- Rejected by / at
- Last payment by / at
- Closed by / at
- Last updated

---

## 13. Validation and Business Rules

1. Bill number must be unique once approved (or on submit, per configuration).
2. Supplier invoice number should be unique per vendor (warning on duplicate, not hard block in Phase 1).
3. Due date cannot precede bill date.
4. At least one line item with quantity > 0 is required before submission.
5. Grand total must reflect line item, tax, and round-off logic.
6. On PO-linked lines, billed quantity cannot exceed received quantity (default policy).
7. Approved bills cannot be edited like drafts.
8. Cancelled bills require a reason.
9. Partial payments cannot exceed the outstanding balance.
10. PO billed quantities must recalculate immediately when a linked bill is approved, updated, or cancelled.
11. Standalone bills do not affect PO billed quantities.
12. Export should reflect the same filters visible on screen.

---

## 14. Notifications and Reminders

### Internal Notifications

- Vendor bill submitted for approval
- Vendor bill approved
- Vendor bill rejected
- Vendor bill partially paid
- Vendor bill fully paid
- Vendor bill overdue
- High-value bill submitted

### Workflow Reminders

- Remind approver when bill remains pending too long
- Remind finance when approved bills approach due date
- Overdue bill escalation to manager (Phase 2)

---

## 15. Reporting and Insights

### Operational Reports

- Vendor bills by status
- Outstanding payables by vendor
- Overdue bills by age bucket
- Approved vs rejected ratio
- Average approval time
- Average days to payment
- PO-linked vs standalone bill ratio
- Monthly AP trend

### UI Artifacts

- KPI cards for total payables, overdue, due this week, pending approval
- Vendor outstanding leaderboard
- Aging buckets table
- Pending approval queue
- Billing backlog tied to PO pending billing

---

## 16. Analytics Events

- vendor_bill_created
- vendor_bill_created_from_po
- vendor_bill_submitted
- vendor_bill_approved
- vendor_bill_rejected
- vendor_bill_payment_recorded
- vendor_bill_partially_paid
- vendor_bill_paid
- vendor_bill_overdue
- vendor_bill_cancelled
- vendor_bill_exported
- vendor_bill_viewed

Event payload should include vendor, amount bucket, PO linkage flag, due date risk, payment status, and linked module context.

---

## 17. Integration Points

### 17.1 CRM Modules

- **Purchase Orders:** primary upstream; bill lines link to PO lines; rollup to billed quantity; replace/enhance inline `PurchaseOrderBilling` stub
- **Contacts:** vendor identity via Contact type Vendor
- **Deals / Projects:** operational and cost context
- **Expenses:** optional cross-link when informal spend matures into formal payable
- **Invoice Generator:** symmetric document patterns (numbering, tax, lifecycle)—no direct data link
- **Activity Log:** all major bill events

### 17.2 Migration from PO Billing Stub

The existing `PurchaseOrderBilling` model records lightweight billing events with `bill_reference` strings. Phase 1 should:

1. Introduce `VendorBill` and `VendorBillLineItem` as first-class entities
2. Link new bills to PO lines and auto-update PO billed quantities
3. Optionally migrate existing `PurchaseOrderBilling` rows to vendor bill records or display legacy events alongside new bills
4. Deprecate inline “Record billing” on PO detail in favor of “Create Vendor Bill” (keep quick-entry as Phase 2 fallback if needed)

### 17.3 Future Integrations

- Vendor master synchronization
- Accounts payable GL posting
- Bank payment file export
- Unified treasury dashboard (AR + AP)
- Automated three-way match with tolerance rules

---

## 18. Risks and Mitigations

1. **Risk:** Users enter bills without linking to POs when a PO exists.  
   **Mitigation:** Prompt “Create from PO” when vendor and amount match open POs; show unlinked bill filter on dashboard.

2. **Risk:** Billed quantities drift from received quantities.  
   **Mitigation:** Enforce received-qty cap by default; show three-way match panel prominently on PO-linked bills.

3. **Risk:** AP payments confused with AR customer payments.  
   **Mitigation:** Keep vendor payments on bill detail; do not add vendor bills to `/payments` in Phase 1.

4. **Risk:** Duplicate supplier invoice numbers across vendors.  
   **Mitigation:** Warn on duplicate vendor + supplier invoice number combination.

5. **Risk:** Approval queues become backlogged.  
   **Mitigation:** Surface aging, reminders, and finance queue views.

6. **Risk:** Module feels disconnected from procurement workflow.  
   **Mitigation:** Primary entry from PO detail; show linked bills on PO; align statuses with PO Partially Billed / Fully Billed.

---

## 19. Release Phasing

### Phase 1 (MVP)

- Vendor bill list and detail views
- Bill builder with vendor, line items, taxes, bill/due dates
- Draft → submit → approve/reject lifecycle
- Generate bill from PO with line prefill and PO linkage
- Standalone bill creation
- Payment recording (partial and full) on bill detail
- PO billed quantity rollup on bill approval
- Three-way match summary on PO-linked bills
- Approval queue
- Basic payables dashboard (outstanding, overdue, pending approval)
- Attachment upload for supplier invoice
- Export filtered list
- Permissions and nav entry

### Phase 2

- Approval threshold configuration
- Bill PDF export and print view
- Due date and overdue reminders
- Duplicate supplier invoice detection
- Clone bill as template
- Migrate or reconcile legacy `PurchaseOrderBilling` records
- Better finance aging and vendor analytics
- Optional quick billing entry on PO (creates draft vendor bill)

### Phase 3

- Advanced three-way match with tolerance rules and exception queue
- Debit note / vendor credit adjustment workflow
- Unified treasury view (AR + AP)
- Budget visibility and policy automation
- Deeper accounting handoff and GL mapping
- Vendor payment batch export

---

## 20. UAT Acceptance Checklist

1. User can create and submit a standalone vendor bill with vendor, line items, taxes, and amounts.
2. User can generate a vendor bill from an approved PO with prefilled lines and partial quantities.
3. PO-linked bill approval updates PO line billed quantities and PO billing status correctly.
4. Billed quantity cannot exceed received quantity on PO-linked lines (default policy).
5. Manager or finance user can approve or reject a bill with comments.
6. Finance user can record partial and full payments; outstanding balance updates correctly.
7. Bill list supports search and filtering by status, vendor, due date, and PO reference.
8. Bill detail shows financial summary, payment history, and PO match panel when linked.
9. Three-way match panel displays ordered, received, billed, and pending billing correctly.
10. Pending approval queue is visible to authorized reviewers.
11. Payables dashboard shows outstanding, overdue, and pending approval totals.
12. Permissions correctly limit view, create, submit, approve, payment, and export actions.
13. Export matches the currently filtered bill list.
14. Supplier invoice attachment can be uploaded and viewed on detail page.
15. Vendor bill payments are recorded on bill detail and do not appear in AR `/payments`.

---

## 21. UI Suggestions Summary

1. Make “Create from PO” the default path when entering from purchase order detail.
2. Show three-way match directly on bill detail, not buried in a sub-tab.
3. Use a sticky financial summary panel so totals and outstanding are always visible.
4. Make overdue and partially paid states highly visible across list and detail screens.
5. Keep payment recording one click away on approved bills.
6. Preserve PO and supplier invoice traceability in every view.
7. Distinguish internal bill number from supplier invoice number in all displays.

---

## 22. Open Product Questions for Final Sign-Off

1. Should billing be based on received quantity only, or can some vendors be billed directly from ordered quantity (matching PO PRD open question)?
2. Should supplier invoice number be mandatory before submission?
3. Do we need separate approval paths for manager vs finance, or a single finance queue in Phase 1?
4. Should legacy `PurchaseOrderBilling` inline entries be migrated automatically or coexist with new vendor bills?
5. Should standalone bills require finance approval at a lower threshold than PO-linked bills?
6. Is a formal debit note / vendor credit workflow required in Phase 1 or deferred to Phase 3?
7. Should vendor GSTIN be mandatory for bills above a GST registration threshold?
8. Do we need TDS (tax deducted at source) fields on vendor bills in Phase 1 for India compliance presentation?

---

## Appendix A: Suggested Screen Inventory

1. Vendor Bills - List
2. Vendor Bills - New / Edit
3. Vendor Bills - Detail
4. Vendor Bills - Create from PO
5. Vendor Bills - Approval Queue
6. Vendor Bills - Record Payment
7. Vendor Bills - Payables Summary Dashboard
8. Vendor Bills - Export Preview

---

## Appendix B: Recommended Badge Labels

- Draft
- Submitted
- Under Review
- Approved
- Rejected
- Partially Paid
- Paid
- Overdue
- Cancelled
- Closed
- PO Linked
- Standalone
- Match Warning
- Pending Approval

---

## Appendix C: Suggested Payment Methods (Initial Set)

- Bank Transfer (NEFT/RTGS/IMPS)
- UPI
- Cheque
- Cash
- Credit Card (Corporate)
- Other

---

## Appendix D: Example Three-Way Match View (PO-Linked Bill)

| PO Line | Ordered | Received | Prev. Billed | This Bill | Total Billed | Pending Billing |
|---------|---------|----------|--------------|-----------|--------------|-----------------|
| Office chairs | 20 | 20 | 0 | 20 | 20 | 0 |
| Printer toner | 10 | 10 | 5 | 5 | 10 | 0 |
| Courier retainer | 1 | 1 | 0 | 1 | 1 | 0 |

**Bill Total:** ₹1,42,500 · **PO:** PO-2026-0042 · **Status:** Approved · **Outstanding:** ₹1,42,500

---

## Appendix E: Vendor Bill vs Expense vs PO Billing Stub

| Aspect | Vendor Bill | Expense | PO Billing Stub (current) |
|--------|-------------|---------|---------------------------|
| Purpose | Supplier payable document | Employee/ops spend | Lightweight PO billing note |
| Payment | Partial/full AP payments | Mark paid / reimbursed | No payment tracking |
| PO Link | Full line-level linkage | Optional | Required (PO line only) |
| Document | Numbered bill with tax | Expense number | Event log with reference string |
| Approval | Finance approval queue | Manager + finance | None (inline on PO) |

---

End of document.
