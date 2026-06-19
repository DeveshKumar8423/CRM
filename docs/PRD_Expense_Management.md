# Product Requirements Document (PRD)
## Expense Management (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Finance / Operations / Spend Control  
**Document Version:** v1.0  
**Date:** 2026-06-19  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Expense Management provides a structured workflow for recording, reviewing, approving, and tracking business expenses inside the CRM. Users should be able to capture spend with category, amount, vendor, supporting proof, approval status, and payment mode in one consistent experience.

The module must bridge day-to-day operational spending and finance oversight. Employees and operations staff should submit expenses quickly; managers and finance should review them with clear audit context; leadership should see spend patterns without exporting data to spreadsheets.

---

## 2. Problem Statement

Today, business expenses may be tracked outside the CRM—in email threads, spreadsheets, chat messages, or personal notes. That creates friction for finance teams and weak visibility for managers.

Common issues this module should solve:

- Expenses are recorded inconsistently or without required proof
- Category, vendor, and payment mode are not standardized
- Approval workflows are informal and hard to audit
- Finance cannot easily see pending, approved, and reimbursed spend
- Expense data is disconnected from projects, deals, or operational context
- Month-end reconciliation requires manual assembly from multiple sources

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a single place to record business expenses with required financial context.
2. Support category, amount, vendor, proof attachment, approval, and payment mode as first-class fields.
3. Enable a clear expense lifecycle from draft to approved, paid, or rejected.
4. Give managers and finance a review queue and spend visibility by category, vendor, and owner.
5. Preserve auditability through timestamps, approver notes, and attachment history.
6. Make expense submission fast enough for field and operations use.
7. Support role-based visibility and approval permissions.

### 3.2 Non-Goals (This Phase)

1. Full accounting ledger posting and double-entry bookkeeping automation.
2. Bank feed import or automatic transaction matching.
3. Payroll reimbursement settlement automation.
4. Multi-currency FX conversion beyond display and storage of expense currency.
5. Complex tax filing or statutory expense compliance automation.
6. Corporate card issuer integrations.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Operations Executive: Submits day-to-day business expenses.
- Sales Executive: Submits travel, client, and field-related expenses.
- Finance Executive: Reviews, approves, and tracks reimbursement or payment status.
- Manager / Team Lead: Approves team expenses and monitors spend.
- Admin: Configures categories, approval rules, and permissions.

### 4.2 Secondary Users

- Project Owner: Links expenses to project or deal context.
- Accountant / Auditor: Reviews expense history, proof, and approval trail.
- Leadership: Reviews spend summaries and category trends.

---

## 5. Scope Overview

### 5.1 In Scope

- Expense list, detail, and submission screens
- Expense categories and vendor capture
- Amount, currency, tax, and payment mode fields
- Proof / receipt attachment upload and viewing
- Approval workflow and review queue
- Expense statuses and lifecycle transitions
- Filters by date, category, vendor, owner, status, and payment mode
- Manager and finance dashboards for pending and approved spend
- Export of filtered expense lists
- Activity timeline and audit fields on expense records
- Optional linkage to deal, project, contact, or internal cost center

### 5.2 Out of Scope (Phase 1)

- Automated OCR extraction from receipts
- Bank reconciliation
- Payroll payout execution
- Budget planning and hard budget enforcement
- Vendor master as a full procurement module
- Purchase order creation (separate module)

---

## 6. Core Product Concept

An expense record is the authoritative spend document for a business cost already incurred or about to be reimbursed. It should capture enough context that finance can approve it without follow-up questions and operations can understand why the spend happened.

The product should support two key patterns:

- Quick expense capture immediately after spend occurs
- Structured review and approval before reimbursement or accounting handoff

Every expense should preserve who submitted it, what it was for, who approved it, how it was paid or will be paid, and what proof supports it.

---

## 7. Expense Lifecycle

### 7.1 Canonical Statuses

1. Draft
2. Submitted
3. Under Review
4. Approved
5. Rejected
6. Paid / Reimbursed
7. Cancelled

### 7.2 Status Definitions

- Draft: Internal working record, not yet sent for approval.
- Submitted: Expense sent into the approval workflow.
- Under Review: Assigned to a reviewer or finance queue.
- Approved: Expense accepted for reimbursement or payment processing.
- Rejected: Expense declined with reason; may be edited and resubmitted if policy allows.
- Paid / Reimbursed: Expense settled through the recorded payment mode.
- Cancelled: Expense voided before or after submission according to policy.

### 7.3 Transition Rules

- Draft → Submitted: submitter confirms expense is complete.
- Submitted → Under Review: routed to approver or finance queue.
- Under Review → Approved: reviewer accepts expense.
- Under Review → Rejected: reviewer declines with reason.
- Approved → Paid / Reimbursed: finance marks settlement complete.
- Draft/Submitted/Under Review → Cancelled: expense withdrawn or voided.
- Rejected → Draft: resubmission allowed when policy permits edits.

### 7.4 Product Rules

- Expenses above a configurable threshold may require manager approval.
- Expenses without proof may be blocked or flagged based on policy.
- Approved expenses should preserve the submitted snapshot used at approval time.
- Rejected expenses must retain reviewer comments.
- Paid expenses should not be editable like drafts.

---

## 8. Information Architecture and Navigation

### 8.1 New Navigation Entry

- Main nav: Expenses
- Quick actions:
  - New Expense
  - My Expenses
  - Pending Approval
  - Approved / Unpaid

### 8.2 Primary Screens

1. Expense List
2. Expense Detail
3. Expense Submission Form
4. Approval Queue
5. Expense Summary Dashboard
6. Category / Vendor Spend Views
7. Export View

### 8.3 Cross-Module Entry Points

- From Deal detail: attach expense to deal context
- From Contact detail: attach expense to client-related spend
- From Dashboard widgets: access pending approvals or monthly spend
- From Finance area: open approved-unpaid expenses

---

## 9. Detailed Functional Requirements

## 9.1 Expense List Page

### Required Elements

- Search by expense title, vendor, category, submitter, or reference number
- Filters:
  - Status
  - Category
  - Vendor
  - Payment mode
  - Date range
  - Owner / submitter
  - Approval state
  - Amount range
- Sort options:
  - Latest submitted
  - Expense date
  - Amount
  - Status
  - Last updated
- Table columns (default):
  - Expense #
  - Title
  - Category
  - Vendor
  - Amount
  - Expense Date
  - Payment Mode
  - Status
  - Submitter
  - Last Updated
- Bulk actions:
  - Export list
  - Assign reviewer (admin/manager)
  - Mark reviewed (role-based)

### UX Behaviors

- Saved views such as “My Drafts”, “Pending Approval”, “Approved Unpaid”, and “This Month”.
- Strong status color cues for rejected and pending approval items.
- Empty state with CTA to submit first expense.

## 9.2 Expense Submission Flow

### Required Fields

- Expense title / description
- Category
- Amount
- Currency
- Expense date
- Vendor name
- Payment mode
- Proof / receipt attachment
- Notes (optional)
- Linked deal / project / contact (optional)

### Payment Modes

- Cash
- Company card
- Personal reimbursement
- Bank transfer
- UPI
- Petty cash
- Other

### UX Expectations

- Can be completed in under a minute for common cases
- Attachment upload should support image and PDF proof
- Defaults should minimize typing for repeat categories and vendors
- Mobile-friendly form layout

## 9.3 Expense Detail Page

### Layout Blocks

- Header strip with expense number, status, amount, expense date, and submitter
- Action bar based on lifecycle and permissions
- Snapshot cards:
  - category summary
  - vendor summary
  - payment summary
  - approval summary
- Proof / attachments section
- Approval history section
- Notes and linked records section
- Status timeline

### Action Matrix

- Draft: edit, submit, delete
- Submitted / Under Review: approve, reject, request changes
- Approved: mark paid / reimbursed, export
- Rejected: edit and resubmit, cancel
- Paid: export, archive view

## 9.4 Approval Queue

### Required Elements

- Queue of expenses awaiting review
- Compact cards with amount, category, vendor, and expense date
- Proof preview or attachment indicator
- Comment box for approver notes
- Actions: Approve, Reject, Request Changes

### Trigger Conditions

- Amount exceeds approval threshold
- Missing proof on required category
- Unusual vendor or duplicate-looking expense
- Policy-based escalation to finance

## 9.5 Expense Summary Dashboard

### Required KPI Cards

- Total spend this month
- Pending approval amount
- Approved unpaid amount
- Rejected count
- Top category
- Top vendor

### Required Charts / Tables

- Spend by category
- Spend by vendor
- Spend by owner
- Monthly trend
- Approval turnaround time

## 9.6 Proof and Attachments

### Requirements

- Upload one or more proof files per expense
- Supported types: image (JPG, PNG, WEBP), PDF
- Preview attachment in detail view
- Show upload timestamp and uploader
- Block submission if proof is required and missing

## 9.7 Export and Reporting

### Required Behaviors

- Export current filtered list to spreadsheet-friendly format
- Include applied filters in export header
- Show expense status, category, vendor, amount, payment mode, and approval fields
- Print-friendly expense detail view

---

## 10. UI / UX Specifications

## 10.1 Visual Language

- Reuse the CRM’s existing panel, table, badge, and filter styling patterns.
- Financial amounts should align consistently and be easy to scan.
- Expense status badges must differentiate draft, pending, approved, rejected, and paid states clearly.

## 10.2 Suggested Page Layouts

### Expense List

- Top row: title + primary CTA
- Second row: search, filters, saved views
- Main area: expense table
- Right-side optional cards: pending approval, approved unpaid

### Expense Form

- Desktop: single-column form with sticky summary/actions
- Mobile: sequential sections with compact action footer

### Expense Detail

- Header summary with expense state
- Horizontal action bar
- Sections for proof, approval, and linked context

## 10.3 Interaction Patterns

- Autosave for drafts
- Confirmation modal for submit, reject, and mark-paid actions
- Inline validation for amount, date, and required proof
- Fast attachment upload with immediate preview

## 10.4 Empty, Loading, and Error States

- Empty list should explain whether there are no expenses or no matches
- Draft loading should show skeleton placeholders
- Upload failure should preserve entered form data

## 10.5 Accessibility

- Keyboard operable primary actions
- Focus states for all controls
- High contrast for status badges and warnings
- Accessible labels for amount, date, and payment mode

---

## 11. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- expenses.view
- expenses.create
- expenses.edit_own
- expenses.edit_all
- expenses.submit
- expenses.approve
- expenses.reject
- expenses.mark_paid
- expenses.delete
- expenses.export
- expenses.manage_settings

### Role Expectations

- Operations / Sales Executive: create, edit own drafts, submit expenses
- Manager: approve team expenses, view team spend
- Finance Executive: approve, mark paid, export, view company spend
- Admin: manage categories, thresholds, and permissions

---

## 12. Data Fields (UI-Centric Definition)

### 12.1 Core Expense Fields

- Expense Number
- Title
- Category
- Amount
- Currency
- Expense Date
- Vendor Name
- Payment Mode
- Status
- Submitter
- Approver

### 12.2 Context Fields

- Notes
- Tax amount
- Receipt reference
- Linked deal
- Linked contact
- Linked project / cost center
- Reimbursement due date

### 12.3 Audit Fields

- Created by / at
- Submitted by / at
- Reviewed by / at
- Approved by / at
- Paid by / at
- Rejection reason
- Last updated

---

## 13. Validation and Business Rules

1. Expense amount must be greater than zero.
2. Expense date cannot be in the future unless policy allows.
3. Category and vendor are required before submission.
4. Payment mode is required before submission.
5. Proof may be mandatory for selected categories or amount thresholds.
6. Approved and paid expenses cannot be edited like drafts.
7. Rejected expenses require a reviewer reason.
8. Duplicate-looking expenses should be flagged when same vendor, amount, and date match closely.
9. Export should reflect the same filters visible on screen.

---

## 14. Notifications and Reminders

### Internal Notifications

- Expense submitted for approval
- Expense approved
- Expense rejected
- Expense marked paid
- Expense missing proof
- High-value expense submitted

### Workflow Reminders

- Remind approver when expense remains pending too long
- Remind finance when approved expenses remain unpaid
- Surface monthly spend summary to managers

---

## 15. Reporting and Insights

### Operational Reports

- Expenses by category
- Expenses by vendor
- Expenses by owner
- Approved vs rejected ratio
- Average approval time
- Unpaid approved expenses
- Monthly spend trend

### UI Artifacts

- KPI cards for spend, pending approval, and unpaid totals
- Category breakdown chart
- Vendor leaderboard
- Approval aging list

---

## 16. Analytics Events

- expense_created
- expense_submitted
- expense_approved
- expense_rejected
- expense_marked_paid
- expense_attachment_uploaded
- expense_exported
- expense_viewed

Event payload should include category, amount bucket, vendor, payment mode, approval status, and linked module context.

---

## 17. Risks and Mitigations

1. Risk: Users submit expenses without adequate proof.  
   Mitigation: Require proof by category/threshold and show clear validation.

2. Risk: Approval queues become backlogged.  
   Mitigation: Surface aging, reminders, and manager/finance queue views.

3. Risk: Spend categories become inconsistent.  
   Mitigation: Use controlled category lists with admin configuration.

4. Risk: Finance and operations use different definitions of “paid”.  
   Mitigation: Standardize payment mode labels and paid status behavior.

5. Risk: Expense module feels disconnected from CRM work.  
   Mitigation: Allow linking to deals, contacts, and projects where relevant.

---

## 18. Release Phasing

### Phase 1 (MVP)

- Expense list and detail views
- Expense submission with category, amount, vendor, proof, payment mode
- Draft → submit → approve/reject → mark paid lifecycle
- Approval queue
- Basic spend summary dashboard
- Export filtered list

### Phase 2

- Category and threshold configuration
- Duplicate detection
- Better finance queue and unpaid tracking
- Spend trends and approval SLA insights

### Phase 3

- Budget visibility
- Deeper accounting handoff
- Advanced vendor analytics
- Policy-based automation rules

---

## 19. UAT Acceptance Checklist

1. User can create and submit an expense with category, amount, vendor, proof, and payment mode.
2. Manager or finance user can approve or reject an expense with comments.
3. Approved expenses can be marked paid / reimbursed.
4. Expense list supports search and filtering by status, category, vendor, and date.
5. Proof attachments can be uploaded and viewed on the detail page.
6. Pending approval queue is visible to authorized reviewers.
7. Spend summary shows monthly totals and category breakdown.
8. Rejected expenses retain reason and can be resubmitted when allowed.
9. Permissions correctly limit view, submit, approve, and export actions.
10. Export matches the currently filtered expense list.

---

## 20. UI Suggestions Summary

1. Make expense submission fast with sensible defaults for category and payment mode.
2. Keep proof upload prominent so approvals do not stall.
3. Use a clear approval queue for managers and finance.
4. Surface pending and unpaid approved spend on the overview page.
5. Make category and vendor reporting easy to scan for management review.
6. Preserve audit context on every expense detail screen.

---

## 21. Open Product Questions for Final Sign-Off

1. Should all expenses require proof, or only above a configurable amount?
2. Do we need separate approval paths for manager vs finance?
3. Should reimbursement due date be mandatory for personal-out-of-pocket expenses?
4. Which categories should be fixed vs admin-configurable?
5. Should expenses link to deals, projects, or both in the first release?

---

## Appendix A: Suggested Screen Inventory

1. Expenses - List
2. Expenses - New / Edit
3. Expenses - Detail
4. Expenses - Approval Queue
5. Expenses - Summary Dashboard
6. Expenses - Category Spend View
7. Expenses - Export Preview

---

## Appendix B: Recommended Badge Labels

- Draft
- Submitted
- Under Review
- Approved
- Rejected
- Paid
- Reimbursed
- Cancelled
- Missing Proof
- High Value
- Pending Action

---

## Appendix C: Suggested Expense Categories (Initial Set)

- Travel
- Meals & Entertainment
- Office Supplies
- Software & Subscriptions
- Marketing
- Client Gifts
- Logistics & Courier
- Repairs & Maintenance
- Professional Services
- Miscellaneous

---

End of document.
