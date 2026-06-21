# Product Requirements Document (PRD)
## Vendor Ledger (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Finance / Accounts Payable / Vendor Balances  
**Document Version:** v1.0  
**Date:** 2026-06-21  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Vendor Ledger provides a **single vendor-centric financial view** of all payable activity: vendor bills, payments, purchase context, advances (where recorded), and outstanding payables. Users should be able to browse vendors with open or historical AP activity, open a chronological ledger statement for any supplier, and reconcile what was billed, paid, adjusted, and still due—without jumping between Vendor Bills, Purchase Orders, and Contact screens.

The module must bridge day-to-day procurement/AP operations and finance oversight. Accounts payable staff should answer “what do we owe this vendor?” in one place; procurement should see bill and payment history against PO commitments; leadership should understand vendor exposure and ageing without exporting spreadsheets.

This module complements **Vendor Bills** (document CRUD and approval workflow) and **Payables Summary** (company-wide AP KPIs). It focuses specifically on **per-vendor account statements** and running payable balances. It should feel native to the existing CRM experience and integrate with **Contacts**, **Vendor Bills**, **Purchase Orders**, **Expenses**, **GST / Tax Reports**, **Customer Ledger**, **Company** settings, Activity Logs, and Role Permissions.

---

## 2. Problem Statement

Today, the CRM stores rich vendor bill and payment data—but there is no unified **vendor ledger** or running-balance statement per supplier. Finance and procurement teams must manually trace a vendor’s history across bill lists, payables dashboards, PO screens, and contact records.

Common issues this module should solve:

- No single view of all bills, payments, and payable adjustments for a vendor
- Outstanding payable is visible per bill, not rolled up clearly at vendor level
- Company-wide payables summary does not replace a vendor account statement
- Purchase order commitment vs billed vs paid requires manual cross-checking
- Advance payments to vendors are not visible in one vendor balance view (Phase 2 when advances are tracked)
- Contact detail for vendors shows CRM activity but not AP ledger history
- Month-end vendor reconciliation and statement review requires external spreadsheets
- Unlinked bills (missing `contact_id`) may be excluded from vendor views inconsistently
- GST purchase tax reports show tax registers but not vendor balance / payment history

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a dedicated **Vendor Ledger** experience listing vendors with AP activity and payable balances.
2. Show a **chronological ledger statement** per vendor with payables accrued, payments made, and running balance.
3. Include **vendor bills** and **bill payments** as primary ledger entries in Phase 1.
4. Display **outstanding payable** per vendor and per open bill.
5. Support filters by period, document type, status, and outstanding-only views.
6. Link every ledger row to its source vendor bill, payment, or PO reference.
7. Surface vendor summary KPIs: total billed, total paid, total outstanding, overdue payable.
8. Enable **CSV statement export** for vendor reconciliation and audit (Phase 1); PDF in Phase 2.
9. Support role-based access for finance, admin, procurement, and AP coordinators.
10. Preserve traceability to contacts, purchase orders, deals, and activity logs.

### 3.2 Non-Goals (This Phase)

1. Full double-entry accounting, GL posting, or chart-of-accounts integration.
2. Customer / AR ledger (see **Customer Ledger** module).
3. Bank reconciliation, disbursement automation, or payment gateway execution.
4. Vendor portal login for self-service statement download.
5. Automated OCR from supplier invoice PDFs.
6. Advanced three-way match engine with tolerance rules and auto-rejection.
7. Multi-currency FX revaluation and consolidated reporting across currencies.
8. Formal legal “Statement of Account” PDF with statutory wording (Phase 2).
9. TDS/TCS deduction automation on vendor payments.
10. Replacement of chartered accountant final balance confirmation.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Finance Executive: Reviews vendor payables, prepares reconciliation statements, validates disbursements.
- Accounts Payable Coordinator: Tracks open bills and payment application per vendor.
- Procurement Coordinator: Confirms billed vs ordered context before payment release.
- Admin: Monitors company-wide vendor exposure and permissions.

### 4.2 Secondary Users

- Manager / Team Lead: Reviews high-value vendor balances and overdue payables.
- Operations Manager: Confirms vendor billing completeness before finance handoff.
- Leadership / Founder: Reviews top vendors by outstanding payables and ageing.
- Auditor: Reviews exported vendor statements and drill-down traceability.

---

## 5. Scope Overview

### 5.1 In Scope

- Vendor Ledger index (vendor list with payable balances)
- Vendor Ledger detail / statement view
- Ledger entry types: vendor bill (payable), bill payment
- Running payable balance calculation on statement
- Outstanding summary and open bill list per vendor
- Ageing buckets per vendor (aligned with Vendor Bills payables summary logic)
- Period filters: all time, this month, last month, quarter, financial year, custom range
- Search by vendor name, organization, GSTIN, email, phone
- Filters: outstanding only, overdue only, vendor contact type = Vendor
- Drill-down links to vendor bill detail and payment source bill
- PO reference column / link when bill linked to purchase order
- Entry from Contact detail (Vendor type): “View vendor ledger”
- Entry from Vendor Bill detail: “View vendor ledger” (when contact linked)
- Entry from Payables Summary: vendor name links to vendor ledger
- Unassigned payables list (bills without `contact_id`)
- CSV export of filtered vendor statement
- Activity log on statement export events
- Permissions and sidebar navigation entry

### 5.2 Out of Scope (Phase 1)

- Purchase order accrual rows in running balance (informational PO panel in Phase 2)
- Vendor credit note / debit note document types (Phase 2; no bill adjustment types in current model)
- Advance payment bucket separate from bill payments (Phase 2)
- PDF branded statement with letterhead (Phase 2)
- Bulk statement email to vendors
- Creating bills/payments from ledger (link out to Vendor Bills only)
- Expense inclusion in vendor ledger (Phase 2 optional cross-link)
- Vendor credit limit enforcement engine

---

## 6. Core Product Concept

Vendor Ledger transforms existing CRM payable documents into a **chronological vendor account statement**. The user selects a vendor (or searches the ledger index), optionally filters by period, and sees every financial movement affecting that vendor’s payable balance—with a running total and clear outstanding summary.

The product supports two primary surfaces:

1. **Vendor Ledger Index:** All vendors with AP activity, sortable by outstanding, last activity, or name—with quick KPIs at top.
2. **Vendor Ledger Statement:** Chronological register of payables accrued and payments made for one vendor, with opening balance, period activity, closing balance, and open bill breakdown.

Every ledger row preserves a link to its source document so finance can verify balances before external reconciliation or audit.

### 6.1 Relationship to Existing Modules

| Module | Role in Vendor Ledger |
|--------|------------------------|
| **Contacts** | Primary vendor identity when `contact_id` linked; GSTIN/PAN reference |
| **Vendor Bills (AP)** | Source of bill (payable) and bill payment entries |
| **Purchase Orders** | Context reference on bill rows; optional PO summary panel (Phase 2) |
| **Payables Summary** | Company-wide AP KPIs; cross-link to vendor ledger |
| **GST / Tax Reports** | Inward supply tax compliance; ledger is balance/disbursement view |
| **Customer Ledger** | AR counterpart; complementary not overlapping |
| **Payments (`/payments`)** | Customer AR only; excluded from vendor ledger |
| **Expenses** | Employee/adhoc spend; excluded by default (optional Phase 2 link) |
| **Company** | Currency, financial year, timezone for period boundaries |

### 6.2 Current Data Model Notes

The CRM today stores:

**Vendor bill header:** `contact_id`, `vendor_name`, `vendor_gstin`, `bill_number`, `supplier_invoice_number`, `status`, `bill_date`, `due_date`, `grand_total`, `amount_paid`, `outstanding_amount`, `currency`, `purchase_order_id`

**Vendor bill payments:** `amount`, `payment_date`, `payment_method`, `reference`, `note`, linked to `vendor_bill_id`

**Contact:** `name`, `organization_name`, `email`, `phone`, `gstin`, `pan`, `contact_type` (`Vendor`, `Customer`, etc.)

**Purchase order:** commitment document; billing tracked via linked vendor bills—not a payable until bill approved

**Gap:** No dedicated `vendor_ledger_entries` table. Phase 1 should **compute the ledger dynamically** from vendor bills and vendor bill payments (read-only aggregation layer), mirroring **Customer Ledger** and **GST / Tax Reports**.

**Gap:** Some vendor bills may lack `contact_id` but have `vendor_name`. Phase 1 should support **contact-linked ledger** as primary; unmatched bills appear in an **Unassigned payables** bucket.

**Gap:** No vendor advance payment entity. Phase 1 treats all disbursements as bill payments; Phase 2 adds advance/unallocated payment bucket.

**Gap:** No vendor credit note bill type. Phase 1 uses bill `grand_total` only; negative adjustment documents deferred to Phase 2.

---

## 7. Ledger Entry Types and Definitions

### 7.1 Entry Types (Phase 1)

| Type | Source | Ledger effect | Default sign (payable balance) |
|------|--------|---------------|--------------------------------|
| **Vendor bill** | `VendorBill` in qualifying approved/payable statuses | Increases payable (we owe vendor) | + |
| **Bill payment** | `VendorBillPayment` on vendor bill | Decreases payable (disbursement) | − |

### 7.2 Entry Types (Phase 2)

| Type | Source | Ledger effect |
|------|--------|---------------|
| **Vendor credit note** | Adjustment bill document | Decreases payable |
| **Advance payment** | Unallocated vendor payment | Decreases payable / advance bucket |
| **PO accrual (informational)** | Approved PO not yet fully billed | Display only; optional accrual toggle |

**Draft / rejected / cancelled bills:** Excluded from balance; optionally visible with “Excluded” badge when “Show all documents” toggle enabled (Phase 2).

### 7.3 Vendor Summary Metrics

| Metric | Definition |
|--------|------------|
| Total billed | Sum of qualifying vendor bill `grand_total` |
| Total paid | Sum of bill payment amounts on qualifying bills |
| Total outstanding | Sum of `outstanding_amount` on open payable bills |
| Overdue outstanding | Outstanding where `due_date < today` |
| Last activity date | Latest of bill date, payment date, approval date |
| Open bill count | Count of bills with `outstanding_amount > 0` in payable statuses |

### 7.4 Running Balance Rules

1. Ledger sorted **chronologically** by effective date (see §8.2).
2. **Opening balance** = sum of net effect of all entries before period start.
3. Each row shows **debit (payable increase)** and **credit (payment)** columns plus **running payable balance**.
4. **Closing balance** at period end = opening + bill debits − payment credits.
5. **Current outstanding** header always reflects sum of open bill `outstanding_amount` as of today (reconciliation check in UAT).
6. Bill payments must not double-count against bill `grand_total`—bill row records obligation; payment rows record settlement.

**Sign convention (payable balance):**

- Higher balance = more owed to vendor
- Bills increase balance; payments decrease balance

---

## 8. Period, Filtering, and Inclusion Rules

### 8.1 Reporting Periods

- **All time** (default on statement)
- **This month**
- **Last month**
- **This quarter** (Indian FY quarters: Q1 Apr–Jun, Q2 Jul–Sep, Q3 Oct–Dec, Q4 Jan–Mar)
- **This financial year** (from company `financial_year_start_month`, default April)
- **Last financial year**
- **Custom date range**

Reuse period boundary logic from **Customer Ledger** / **GST / Tax Reports** / `financial_year_start_month` on Company.

### 8.2 Effective Date by Entry Type

| Entry type | Default date field |
|------------|-------------------|
| Vendor bill | `bill_date` (fallback: `approved_at`, `created_at`) |
| Bill payment | `payment_date` |

Phase 2: optional accrual date vs cash (payment) basis toggle for subtotals.

### 8.3 Document Inclusion Rules (Defaults)

| Document | Include in balance | Show in statement |
|----------|-------------------|-------------------|
| Draft bill | No | Optional with toggle (Phase 2) |
| Submitted / under review | No | Optional excluded row |
| Approved | Yes | Yes |
| Partially paid | Yes | Yes |
| Paid | Yes (historical) | Yes |
| Overdue | Yes | Yes |
| Rejected | No | No |
| Cancelled | No | No |
| Closed | Yes (historical) | Yes |

**Payable statuses for outstanding:** `approved`, `partially_paid`, `overdue` with `outstanding_amount > 0`.

Align with **GST / Tax Reports** inward inclusion (`approved`, `partially_paid`, `paid`, `overdue`) for billed amounts; ledger outstanding uses open payable subset.

---

## 9. Information Architecture and Navigation

### 9.1 Primary Navigation

Add **Vendor Ledger** under Finance in the main sidebar, near Vendor Bills and GST / Tax Reports.

Suggested routes:

- `/vendor-ledger` — Vendor index with balances
- `/vendor-ledger/unassigned` — Bills without contact linkage
- `/vendor-ledger/:contactId` — Vendor statement detail
- `/vendor-ledger/:contactId/export` — Export preview (optional dedicated screen)

### 9.2 Entry Points

- From sidebar: Vendor Ledger
- From Contact detail (`Vendor` type): “View vendor ledger”
- From Vendor Bill detail: “View vendor ledger” when `contact_id` present
- From Payables Summary: vendor name links to ledger (Phase 1 enhancement)
- From Purchase Order detail: linked vendor bills section links to vendor ledger (Phase 2)
- From GST / Tax Reports purchase register: vendor name cross-link (Phase 2)

### 9.3 Cross-Module Visibility

- Contact detail (Vendor) shows summary strip: outstanding, last payment, open bills count
- Vendor bill detail shows “Included in vendor ledger” when contact linked and status qualifies
- Customer Ledger shows info banner if user opens Customer-type contact (AR vs AP distinction)

---

## 10. Detailed Functional Requirements

## 10.1 Vendor Ledger Index

### Required Elements

- KPI cards:
  - Total outstanding (all vendors)
  - Overdue outstanding
  - Vendors with open balance
  - Paid this month (optional; align with payables summary)
  - Unassigned outstanding (bills without contact)
- Search by name, organization, GSTIN, email, phone
- Filters: outstanding only, overdue only
- Sort: outstanding (desc), name (A–Z), last activity (desc)
- Table columns:
  - Vendor name / organization
  - GSTIN
  - Total billed
  - Total paid
  - Outstanding
  - Overdue
  - Last activity date
  - Open bills count
  - Actions: View ledger

### UX Behaviors

- Default sort: highest outstanding first
- Empty state when no vendors with AP activity
- Pagination for large vendor lists
- Click row opens vendor statement

## 10.2 Vendor Ledger Statement (Detail)

### Required Elements

- Vendor header: name, organization, GSTIN, PAN, email, phone, address summary
- Period selector (see §8.1)
- Summary cards:
  - Opening payable balance (period)
  - Bills accrued (debits)
  - Payments made (credits)
  - Closing payable balance
  - Current outstanding (as of today)
  - Overdue outstanding
- Chronological ledger table
- Open bills sub-table (bill #, supplier invoice #, bill date, due date, grand total, paid, outstanding, status, PO ref, overdue flag)
- Ageing summary for vendor (reuse payables ageing bucket pattern)
- Export CSV
- Quick actions (link out): Create vendor bill, View contact, View linked POs (Phase 2)

### Ledger Table Columns (Default)

- Date
- Entry type (Bill, Payment)
- Reference (bill # / payment ref / supplier invoice #)
- Description (bill title or payment note)
- Payable debit (bill amount)
- Payment credit
- Running balance
- Status badge
- Link to source

### UX Behaviors

- Bills show as payable debits; payments as credits
- Payments show bill number reference
- Warning if vendor has outstanding but no GSTIN (B2B data quality—informational)
- Empty period: show opening/closing with no rows and helpful message
- Vendor contact type `Customer` shows info banner directing to Customer Ledger
- Disclaimer: “For account review—not a statutory audited statement”

## 10.3 Unassigned Payables (Phase 1)

### Required Elements

- List bills with `contact_id IS NULL` and qualifying payable status
- Group by `vendor_name` fingerprint
- Outstanding total for unassigned bucket on index KPI
- Action: open bill detail to assign contact via Vendor Bill edit

## 10.4 Purchase Context Panel (Phase 2)

### Required Elements

- List open POs for vendor with ordered / received / billed / pending billing
- Informational only—not included in running balance unless accrual toggle enabled

## 10.5 Export and Statement Pack

### Phase 1 Export

- CSV statement with:
  - Company name, vendor name, GSTIN, period label
  - Opening balance, each ledger row, closing balance
  - Open bills appendix
- Filename pattern: `vendor-ledger-{vendor-slug}-2026-06.csv`
- Activity log event: `vendor_ledger_exported`

### Phase 2 Export

- PDF statement with company letterhead
- Bulk export for multiple vendors
- Advance balance section when advance entity exists

---

## 11. UX and Design Requirements

### 11.1 Visual Design

- Follow existing CRM design language (`crm-*` components, stat cards, tables)
- Payable debits in amber/neutral; payment credits in green-tinted column; overdue in red badge
- Entry type badges: Bill, Payment, Credit (Phase 2), Advance (Phase 2)
- Distinguish Vendor Ledger (per-vendor AP) from Payables Summary (company-wide) and Customer Ledger (AR)

### 11.2 Responsive Behavior

- Index and statement usable on desktop and tablet
- Running balance readable on mobile with horizontal scroll on table

### 11.3 Error Handling

- Contact not found: clear empty state with back link
- No AP activity: empty ledger with CTA to create vendor bill
- Large statements: paginated ledger with export of full filtered set

### 11.4 Accessibility

- Keyboard navigable filters, tables, and export
- Accessible labels on period selectors and amount columns

---

## 12. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- `vendor_ledger.view` — View ledger index and statements
- `vendor_ledger.view_all` — View all vendors (not only assigned)
- `vendor_ledger.export` — Export statements
- `vendor_ledger.manage_settings` — Configure inclusion rules (Phase 2)

### Role Expectations

- Finance / Admin: full view and export
- Manager: view all vendors, export
- Procurement / AP Employee: view via `vendor_bills.view`
- User role (portal): no access

### Mapping from Existing Permissions (Transition)

| New permission | Existing equivalent |
|----------------|---------------------|
| `vendor_ledger.view` | `vendor_bills.view` |
| `vendor_ledger.export` | `vendor_bills.export` or `reports.export` |

Phase 1 may alias new permissions to existing vendor bill permissions.

---

## 13. Data Fields (Report Output Definition)

### 13.1 Vendor Index Row

- Contact id, name, organization
- GSTIN, email, phone
- Currency (company default or dominant bill currency)
- Total billed, total paid, outstanding, overdue
- Last activity date, open bill count

### 13.2 Ledger Statement Row

- Entry id (composite: type + source id)
- Entry type
- Effective date
- Reference number
- Description
- Payable debit, payment credit, running balance
- Source bill id, payment id (if applicable)
- PO reference (if any)
- Status, overdue flag

### 13.3 Statement Summary

- Period label and date range
- Opening balance, period bill debits, period payment credits, closing balance
- Current outstanding, overdue outstanding
- Ageing buckets
- Open bill list

---

## 14. Validation and Business Rules

1. Ledger must respect document status inclusion rules consistently across UI and export.
2. Draft and rejected bills never affect balance in default view.
3. Cancelled bills excluded from balance.
4. Bill payments reduce payable balance on payment date.
5. Vendor outstanding = sum of `outstanding_amount` on open payable bills for that vendor (reconciliation check in UAT).
6. Running balance on full all-time statement must reconcile with current outstanding logic within rounding tolerance.
7. Period boundaries use company timezone (`Asia/Kolkata` default) and `en-IN` formatting.
8. Export reflects active filters exactly.
9. Only one company entity per ledger (current CRM single-company model).
10. Group unassigned bills by `vendor_name` when `contact_id` is null; do not merge unrelated vendors with same display name without review (Phase 2 fuzzy match).

---

## 15. Notifications and Reminders

### Internal Notifications (Phase 2)

- Alert when vendor outstanding exceeds threshold
- Month-end reminder to finance: review top overdue vendor ledgers
- Notify procurement when bill payment recorded on linked PO vendor

---

## 16. Reporting and Insights (Meta)

### Operational Outputs (This Module)

- Vendor statement (chronological ledger)
- Vendor outstanding and ageing summary
- Top vendors by outstanding payables
- Unassigned payables list

### UI Artifacts

- Index KPI cards
- Vendor summary cards on statement
- Ledger register table with running balance
- Open bills table
- Ageing bucket panel

---

## 17. Analytics Events

- `vendor_ledger_viewed`
- `vendor_ledger_index_viewed`
- `vendor_ledger_statement_viewed`
- `vendor_ledger_exported`
- `vendor_ledger_drilldown_bill`
- `vendor_ledger_drilldown_payment`
- `vendor_ledger_period_changed`
- `vendor_ledger_filter_applied`

Event payload should include contact id, period type, entry counts, outstanding amount, and export format.

---

## 18. Integration Points

### 18.1 CRM Modules

- **Contacts:** vendor identity and entry point
- **Vendor bills:** payable bills and payments
- **Purchase orders:** PO reference on bill rows
- **Payables summary:** cross-links and shared ageing logic
- **GST / Tax Reports:** inward tax register cross-link
- **Activity log:** export events

### 18.2 Existing Code Alignment

Payable fields already exist on:

- `VendorBill`: `contact_id`, `vendor_name`, `grand_total`, `amount_paid`, `outstanding_amount`, `status`, `bill_date`, `purchase_order_id`
- `VendorBillPayment`: `amount`, `payment_date`, linked to vendor bill
- `Contact`: vendor master fields

Phase 1 implementation should:

1. Add `vendor_ledger_router.py` aggregating vendor bill and payment queries by `contact_id` / `vendor_name`
2. Reuse period filter patterns from `customer_ledger_router.py` / `tax_reports_router.py`
3. Reuse ageing bucket logic from `vendor_bills_router.py` stats
4. Add frontend pages under `/vendor-ledger/*`
5. Not duplicate vendor bill CRUD—read-only statement layer

### 18.3 Future Integrations

- Vendor advance payments and unallocated disbursements
- Vendor credit / debit note documents
- PO accrual in ledger view
- Expense cross-link for informal vendor spend
- GL export and accounting system sync
- TDS on vendor payments summary

---

## 19. Risks and Mitigations

1. **Risk:** Users treat CRM ledger as statutory audited vendor statement.  
   **Mitigation:** Label “for account review”; disclaimer on export footer.

2. **Risk:** Bills without `contact_id` understate vendor balance.  
   **Mitigation:** Unassigned payables view; prompt to link contact on bill.

3. **Risk:** Overlap with Payables Summary confuses users.  
   **Mitigation:** Payables Summary = company-wide KPIs; Vendor Ledger = per-vendor statement.

4. **Risk:** PO commitment confused with payable balance.  
   **Mitigation:** Phase 1 excludes PO from balance; Phase 2 informational panel only.

5. **Risk:** Same vendor name spelled differently splits ledger.  
   **Mitigation:** Encourage `contact_id` linkage; Phase 2 vendor matching rules.

6. **Risk:** Multi-currency vendors skew totals.  
   **Mitigation:** Phase 1 single currency (INR) or group by currency with warning (Phase 2).

---

## 20. Release Phasing

### Phase 1 (MVP)

- Vendor ledger index with outstanding balances
- Vendor statement with chronological ledger (bills + payments)
- Running balance and open bill list
- Period filters (month, FY, custom, all time)
- Ageing summary per vendor
- Search and outstanding/overdue filters
- Unassigned payables list
- CSV export
- Permissions and nav entry
- Contact and vendor bill detail cross-links

### Phase 2

- PDF statement export with branding
- Vendor credit note / adjustment entries
- Advance payment bucket
- PO accrual / commitment informational panel
- Link unassigned bills to contacts from ledger UI
- Payables Summary and GST purchase register cross-links
- Bulk vendor statement export

### Phase 3

- TDS summary on vendor ledger
- Multi-currency vendor statements
- Automated vendor statement email
- GL posting export
- Vendor performance trends (billed vs paid chart)

---

## 21. UAT Acceptance Checklist

1. Vendor index shows correct outstanding per contact linked to vendor bills.
2. Statement includes approved bills and bill payments for the vendor.
3. Draft, rejected, and cancelled bills excluded from default balance.
4. Running balance reconciles to opening + bill debits − payment credits for the selected period.
5. Current outstanding matches sum of open bill `outstanding_amount` for the vendor.
6. Bill payments appear on payment date and link to source bill.
7. Period filters work for month, financial year, custom range, and all time.
8. Ageing buckets align with vendor bills payables logic for the same vendor bills.
9. CSV export matches filtered statement on screen.
10. Drill-down links open correct vendor bill detail.
11. Permissions limit access to authorized roles.
12. Contact detail (Vendor) link opens correct vendor statement.
13. Customer-type contact shows appropriate message (not AP vendor ledger).
14. Unassigned payables list shows bills without `contact_id`.

---

## 22. UI Suggestions Summary

1. Lead with **vendor search** and **outstanding sort** on the index.
2. On statement, show **summary cards above the register**—finance needs opening/closing/outstanding at a glance.
3. Use **payable debit / payment credit columns** plus running balance.
4. Keep **open bills table** visible below the ledger for disbursement workflow.
5. Link every row to its source bill or payment.
6. Differentiate clearly from **Payables Summary** (company-wide), **Customer Ledger** (AR), and **GST / Tax Reports** (tax compliance).

---

## 23. Open Product Questions for Final Sign-Off

1. Should Phase 1 group vendors by **`contact_id` only**, or also merge by exact `vendor_name` when contact is missing?
2. Which bill statuses exactly contribute to **running balance** vs display-only?
3. Should **paid** historical bills always appear in all-time statement?
4. Is a separate **advance payment** entity required before “advances” appear in the feature screenshot scope?
5. Should **purchase orders** appear as informational rows in Phase 1 or only Phase 2?
6. Running balance on partial period vs **always show current outstanding** in header—which is primary?
7. Should informal **expenses** paid to vendors appear in vendor ledger in Phase 2?

---

## Appendix A: Suggested Screen Inventory

1. Vendor Ledger - Index
2. Vendor Ledger - Statement (by contact)
3. Vendor Ledger - Unassigned payables
4. Vendor Ledger - Export preview
5. Contact detail - Vendor ledger summary strip (embedded)

---

## Appendix B: Recommended Badge Labels

- Bill
- Payment
- Credit Note (Phase 2)
- Advance (Phase 2)
- Outstanding
- Overdue
- Paid
- Draft Excluded
- Unassigned
- PO Linked

---

## Appendix C: Ledger Entry Sign Convention (Suggested Defaults)

| Entry | Payable debit | Payment credit | Effect on balance |
|-------|---------------|----------------|-------------------|
| Vendor bill (approved+) | grand_total | — | Increases payable |
| Bill payment | — | amount | Decreases payable |
| Vendor credit note (Phase 2) | — | abs(amount) | Decreases payable |
| Advance payment (Phase 2) | — | amount | Decreases payable / advance bucket |

---

## Appendix D: Example Vendor Statement View

**Vendor:** Steel Supplies India · **GSTIN:** 29BBBBB0000B1Z5  
**Period:** April 2026 – June 2026 · **Currency:** INR

| Opening payable | | ₹80,000 |
| Bills accrued | | ₹3,20,000 |
| Payments made | | ₹2,50,000 |
| **Closing payable** | | **₹1,50,000** |
| **Current outstanding** | | **₹1,50,000** |

**Ledger (excerpt):**

| Date | Type | Ref | Debit | Credit | Balance |
|------|------|-----|-------|--------|---------|
| 01 Apr 2026 | — | Opening | | | ₹80,000 |
| 08 Apr 2026 | Bill | VB-2026-0012 | ₹1,20,000 | | ₹2,00,000 |
| 15 Apr 2026 | Payment | NEFT-8821 | | ₹50,000 | ₹1,50,000 |
| 02 May 2026 | Bill | VB-2026-0028 | ₹80,000 | | ₹2,30,000 |
| 20 May 2026 | Payment | CHQ-4410 | | ₹80,000 | ₹1,50,000 |
| 10 Jun 2026 | Bill | VB-2026-0041 | ₹1,20,000 | | ₹2,70,000 |
| 18 Jun 2026 | Payment | NEFT-9932 | | ₹1,20,000 | ₹1,50,000 |

---

## Appendix E: Vendor Ledger vs Related Modules

| Aspect | Payables Summary | Vendor Ledger | GST / Tax Reports (Purchase) | Customer Ledger |
|--------|------------------|---------------|------------------------------|-----------------|
| Purpose | Company AP KPIs | Per-vendor account statement | Tax compliance register | Per-customer AR statement |
| Primary data | All vendor bills | One vendor’s bills + payments | Inward tax totals by period | Customer invoices + payments |
| User | Finance AP | Finance, procurement | Finance, accountant | Finance, sales |
| Metrics | Total outstanding, ageing | Running payable, vendor outstanding | Taxable value, input tax | Running balance, customer outstanding |
| Export | — (Phase 1) | Vendor statement CSV | Tax register CSV | Customer statement CSV |

---

End of document.
