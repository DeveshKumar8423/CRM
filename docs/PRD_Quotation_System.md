# Product Requirements Document (PRD)
## Quotation System (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Sales / Deals / Commercial Documents  
**Document Version:** v1.0  
**Date:** 2026-06-13  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

The Quotation System enables sales and account teams to create, manage, send, track, and close branded quotations directly inside CRM. It must support product/service line items, pricing, taxes, discounts, terms, revisions, approvals, client-facing quote viewing, and conversion to downstream workflows after acceptance.

This module should feel native to the existing CRM experience and integrate with current entities (Companies, Contacts, Leads, Deals, Products/Services, Activity Logs, Role Permissions).

---

## 2. Problem Statement

Current CRM flow supports leads/deals and product/service master data, but there is no standardized quotation workflow. Teams likely rely on external documents and manual coordination, leading to:

- Inconsistent branding and commercial terms
- Pricing and tax errors
- Slow turnaround time for quote creation and revisions
- No reliable tracking of viewed/accepted/expired quotes
- Low visibility for managers on quote pipeline health

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Create a complete in-app quote lifecycle from draft to acceptance.
2. Produce professional, branded quotations suitable for external sharing.
3. Improve sales velocity via reusable templates and rapid line-item composition.
4. Provide clear status tracking and reminders for follow-ups.
5. Maintain auditability with version history and activity logs.
6. Enable role-based control for creation, approval, discount governance, and final send.

### 3.2 Non-Goals (This Phase)

1. Full invoicing and payment collection workflows.
2. Advanced legal e-signature platform integrations.
3. Complex revenue recognition or finance accounting logic.
4. Multi-entity global tax engine with country-by-country compliance automation.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Sales Executive: Creates and sends quotations for assigned leads/deals.
- Account Manager: Reviews, negotiates, and updates quote versions.
- Sales Manager/Admin: Approves high-discount quotes, monitors performance, sets defaults.

### 4.2 Secondary Users

- Client Recipient: Views quote via secure link, accepts/rejects/requests changes.
- Finance/Operations (optional observer role): Reviews accepted quote details.

---

## 5. Scope Overview

### 5.1 In Scope

- Quote creation from deal/contact/lead context and standalone mode
- Branded quotation document generation
- Product/service line item builder
- Pricing, taxes, discounts, and totals
- Terms and conditions blocks
- Quote statuses and lifecycle transitions
- Revisioning and version history
- Internal approval workflow
- Client-facing share/view/accept/reject flow
- List views, filters, and dashboards for quote tracking
- Activity timeline and reminders

### 5.2 Out of Scope (Phase 1)

- Direct payment gateway checkout
- Auto-generated invoice posting to accounting systems
- Multi-language document generation beyond configured default language

---

## 6. Quote Lifecycle

### 6.1 Canonical Statuses

1. Draft
2. Pending Approval
3. Approved
4. Sent
5. Viewed
6. Negotiation (optional intermediate status)
7. Accepted
8. Rejected
9. Expired
10. Cancelled

### 6.2 Transition Rules (Product-Level)

- Draft -> Pending Approval: when approval is required by policy (for example high discount).
- Draft -> Approved: when no approval is required.
- Approved -> Sent: when shared with client.
- Sent -> Viewed: when recipient opens quote.
- Sent/Viewed -> Negotiation: if client requests changes.
- Sent/Viewed/Negotiation -> Accepted: when client confirms acceptance.
- Sent/Viewed/Negotiation -> Rejected: when client declines.
- Sent/Viewed/Negotiation -> Expired: at validity end date.
- Any non-final status -> Cancelled: internal cancellation.

Final states: Accepted, Rejected, Expired, Cancelled.

---

## 7. Information Architecture and Navigation

### 7.1 New Navigation Entry

- Main nav: Quotations
- Quick actions:
  - New Quotation
  - Quotes awaiting approval
  - Expiring soon

### 7.2 Primary Screens

1. Quotation List
2. Quotation Detail (read view)
3. Quotation Builder (create/edit)
4. Quotation Preview (print/share format)
5. Approval Queue
6. Quote Templates & Settings (admin)
7. Client Quote View (external-facing)

### 7.3 Cross-Module Entry Points

- From Deal detail: Create quotation
- From Lead detail: Create quotation
- From Contact detail: Create quotation
- From Product/Service list: Add to quotation (context action)

---

## 8. Detailed Functional Requirements

## 8.1 Quotation List Page

### Required Elements

- Search by quote number, deal name, contact name, company, creator
- Filters:
  - Status
  - Date range
  - Owner
  - Amount range
  - Expiring in (today/7 days/30 days)
- Sort options:
  - Last updated
  - Quote value
  - Expiry date
- Table columns (default):
  - Quote Number
  - Title
  - Client
  - Deal
  - Amount
  - Status
  - Expiry Date
  - Owner
  - Last Updated
- Bulk actions:
  - Send reminder
  - Mark cancelled
  - Export list

### UX Behaviors

- Saved views (for example “My Sent Quotes”, “Expiring This Week”).
- Sticky filter bar on scroll.
- Empty state with CTA to create first quote.

## 8.2 Quotation Builder (Create/Edit)

### Form Sections

1. Header
- Quote title
- Quote number (auto or manual based on settings)
- Quote date
- Valid until date
- Currency

2. Party Details
- Company (sender)
- Client account / contact
- Billing address
- Shipping/service address (optional)
- Attention/recipient details

3. Source Context
- Link to deal (optional but preferred)
- Link to lead/contact (optional)
- Owner/assignee

4. Line Items
- Add from product/service master
- Add custom line item
- Fields per line:
  - Item name
  - Description
  - Quantity
  - Unit
  - Unit price
  - Discount (line level)
  - Tax group/rate
  - Subtotal
- Drag to reorder line items
- Group line items by section (optional)

5. Pricing Summary
- Subtotal
- Line discounts total
- Header discount (amount or %)
- Tax breakdown by rate
- Round-off rule
- Grand total

6. Terms & Commercials
- Scope notes
- Deliverables summary
- Timeline / SLA notes
- Payment terms
- Validity clause
- Cancellation/refund clause
- Legal footer/disclaimer

7. Internal Notes (Not visible to client)
- Negotiation notes
- Approval comments

8. Attachments
- Brochure/annexure references (displayed in quote package)

### Builder Actions

- Save draft
- Preview
- Submit for approval
- Approve (authorized roles)
- Send to client
- Duplicate quote
- Create revision
- Cancel quote

## 8.3 Quotation Detail Page

### Layout Blocks

- Header strip: quote number, status badge, amount, expiry, owner
- Action bar based on status
- Snapshot cards:
  - Client details
  - Deal linkage
  - Financial summary
- Line item table (read-only in detail mode)
- Terms block
- Activity timeline
- Version history panel
- Approval trail panel

### Action Matrix (Examples)

- Draft: Edit, Preview, Submit for approval, Delete
- Pending Approval: Approve/Reject (authorized), Request changes
- Approved: Send, Edit (if policy allows)
- Sent/Viewed: Send reminder, Create revision, Mark accepted/rejected (internal fallback)
- Final statuses: Duplicate, Export

## 8.4 Approval Workflow (UI/Process)

### Trigger Conditions (Configurable)

- Discount exceeds threshold
- Total value exceeds threshold
- Non-standard terms selected

### Approval UX

- Dedicated “Awaiting My Approval” queue
- Quote summary card + risk flags
- Inline comment box for approver
- Decision buttons: Approve / Reject / Request Changes
- Visible approval chain and timestamps

## 8.5 Client-Facing Quote View

### Experience Goals

- Clean, professional, brand-consistent document page
- Mobile-friendly readability
- Clear total, validity, and acceptance controls

### Required Client Actions

- View/download quote
- Accept quote
- Reject quote (with reason optional)
- Request changes / ask query

### Trust Elements

- Sender identity and company branding
- Quote validity and issue timestamp
- Optional watermark for expired/cancelled states

## 8.6 Revision and Versioning

### Rules

- “Create Revision” clones existing quote into new version (V2, V3...)
- Previous versions become locked/read-only
- Version chain visible in timeline and version panel
- Current active version clearly highlighted

### UI Requirement

- Side-by-side version compare view:
  - line item changes
  - amount changes
  - terms changes

## 8.7 Notifications and Reminders

### Internal Notifications

- Approval requested
- Approval completed/rejected
- Quote viewed by client
- Quote accepted/rejected
- Quote expiring soon

### Client Notifications

- Quote sent
- Reminder before expiry
- Revised quote sent

### Reminder Rules (Configurable)

- Auto-reminder: X days before expiry
- Manual reminder from quote detail and list views

## 8.8 Search, Reporting, and Insights

### Operational Reporting

- Total quotes by status
- Conversion rate (sent -> accepted)
- Average time to acceptance
- Value by owner/team
- Expired and stale quote count

### UI Artifacts

- Quotations dashboard cards
- Trend charts (weekly/monthly)
- “Top pending quotes” list

---

## 9. UI/UX Specifications (Front-End Product Guidance)

## 9.1 Visual Language

- Reuse CRM panel/table/filter patterns for consistency.
- Status badges should be visually distinct and persist across list/detail/pipeline contexts.
- Financial numbers should be right-aligned in tables and use locale-aware formatting.

## 9.2 Suggested Page Layouts

### Quotation List

- Top row: title + primary CTA (New Quotation)
- Second row: search + filters + saved view selector
- Main area: table + pagination
- Right utility panel (optional): KPI mini-cards (sent today, expiring soon)

### Quotation Builder

- Two-column layout on desktop:
  - Left: editable sections (line items + terms)
  - Right: sticky summary (totals, validity, actions)
- Single-column progressive sections on mobile

### Quotation Detail

- Header + action bar
- Tabbed body:
  - Overview
  - Line Items
  - Terms
  - Activity
  - Versions

### Client View

- Document-style page with limited navigation
- Prominent Accept / Reject controls near summary and footer

## 9.3 Interaction Patterns

- Autosave indicator in builder (Saving... Saved)
- Inline validation near field level
- Confirmation modals for irreversible actions (cancel, reject, mark accepted)
- Sticky action footer in long-form quote builder

## 9.4 Empty, Error, and Loading States

- Empty list: illustration + “Create first quotation” CTA
- Error state: concise message + retry action
- Skeleton loaders for list and detail cards

## 9.5 Accessibility

- Keyboard-navigable forms and action buttons
- Sufficient contrast for all status badges
- Semantic headings for screen reader structure
- Error messages associated with fields

---

## 10. Content and Copy Guidelines

## 10.1 Microcopy Principles

- Use clear commercial wording, avoid technical jargon.
- Keep action labels explicit: “Submit for Approval”, “Create Revision”, “Send Reminder”.

## 10.2 Standard Text Blocks (Configurable)

- Default validity clause
- Payment terms block
- Service delivery disclaimer
- Tax note and statutory footer

## 10.3 Tone

- Professional, confident, and concise
- Client-facing copy should reinforce trust and clarity

---

## 11. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- quotations.view
- quotations.create
- quotations.edit_draft
- quotations.submit_approval
- quotations.approve
- quotations.send
- quotations.cancel
- quotations.accept_override (internal fallback)
- quotations.manage_templates

### Role Expectations (Illustrative)

- Employee/Sales: create/edit own drafts, submit for approval, send when approved
- Manager: approve/reject, edit team quotes, view reports
- Admin: full access including templates/settings/governance

---

## 12. Data Fields (UI-Centric Definition)

### 12.1 Core Quote Fields

- Quote Number
- Title
- Status
- Version
- Currency
- Quote Date
- Valid Until
- Owner
- Linked Deal / Lead / Contact

### 12.2 Financial Fields

- Line subtotal
- Total discount
- Total tax
- Grand total
- Net payable amount

### 12.3 Audit Fields

- Created by / at
- Updated by / at
- Approved by / at
- Sent at
- Viewed at
- Accepted/Rejected at

---

## 13. Rules and Validations (UI + Product Logic)

1. Valid until date must be on or after quote date.
2. At least one line item required before sending.
3. Quantity and unit price must be non-negative.
4. Discount % capped by policy threshold.
5. Finalized quotes cannot be edited directly; revisions required.
6. Expired quotes cannot be accepted unless reissued/revised.
7. Mandatory terms sections must be present before send.

---

## 14. KPIs and Success Metrics

1. Quote creation turnaround time (median)
2. Quote acceptance rate
3. Revision count per won quote
4. Average days from sent to accepted
5. Expired quote rate
6. Approval cycle time

Success criterion for launch: measurable reduction in quote turnaround and improved acceptance visibility within first release cycle.

---

## 15. Analytics Events (Product Instrumentation)

- quote_created
- quote_saved_draft
- quote_submitted_approval
- quote_approved
- quote_rejected_by_approver
- quote_sent
- quote_viewed_by_client
- quote_accepted_by_client
- quote_rejected_by_client
- quote_expired
- quote_revision_created
- quote_reminder_sent

Event payload should include role, owner, amount bucket, quote age, and source context (deal/lead/contact).

---

## 16. Risks and Mitigations (Product/UX)

1. Risk: Overly complex builder slows adoption.  
   Mitigation: Provide presets, defaults, and template-first workflow.

2. Risk: Approval friction delays quote sending.  
   Mitigation: Threshold-based approval and manager queue with quick decision cards.

3. Risk: Client confusion in external view.  
   Mitigation: Keep summary and action CTAs clear, add help/contact strip.

4. Risk: Inconsistent terms across teams.  
   Mitigation: Admin-managed terms templates and mandatory sections.

---

## 17. Release Phasing (Functional Rollout)

### Phase 1 (MVP)

- Quote create/edit draft
- Line items + totals + taxes + discounts
- Branded preview and send
- Basic statuses and list management
- Client view with accept/reject

### Phase 2

- Approval workflow
- Revisions and version compare
- Reminder automation
- Dashboard insights

### Phase 3

- Advanced templates
- Negotiation workflow enhancements
- Deeper analytics and team benchmarks

---

## 18. UAT Acceptance Checklist

1. User can create quote from deal/contact/lead context.
2. User can compose line items with accurate totals and tax breakdown.
3. User can preview branded quotation before sending.
4. User can send quote and track sent/viewed/accepted/rejected states.
5. Client can open quote link and accept/reject successfully.
6. User can create revised version without overwriting prior accepted/sent versions.
7. Approval path works according to configured thresholds.
8. Quotations list supports robust filter/search/sort flows.
9. Expiry behaviors and reminders function as expected in UI.
10. All states and actions are role-consistent from a user perspective.

---

## 19. UI Suggestions Summary (Quick Reference)

1. Keep quoting flow fast: template defaults + sticky summary panel.
2. Use a document-like preview to improve trust before send.
3. Keep status clarity high: persistent badges + timeline + next recommended action.
4. Use tabbed detail pages to prevent long-scroll fatigue.
5. Make client acceptance UI minimal, mobile-first, and action-oriented.
6. Surface “expiring soon” and “awaiting approval” prominently on list/dashboard.

---

## 20. Open Product Questions for Final Sign-Off

1. Should acceptance require explicit checkbox consent for terms?
2. Are partial acceptance or line-item negotiation states needed?
3. What exact approval thresholds should apply by role and quote size?
4. Should client rejection reason be mandatory?
5. Do we need multilingual quote output in near-term roadmap?

---

## Appendix A: Suggested Screen Inventory

1. Quotations - List
2. Quotations - New/Edit Builder
3. Quotations - Detail
4. Quotations - Preview
5. Quotations - Approval Queue
6. Quotations - Templates & Defaults
7. Client Quote View (external)

---

## Appendix B: Recommended Status Badge Language

- Draft
- Awaiting Approval
- Approved
- Sent
- Viewed
- In Negotiation
- Accepted
- Rejected
- Expired
- Cancelled

---

End of document.
