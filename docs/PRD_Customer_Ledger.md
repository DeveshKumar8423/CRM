# Product Requirements Document (PRD)
## Customer Ledger (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Finance / Accounts Receivable / Customer Balances  
**Document Version:** v1.0  
**Date:** 2026-06-21  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Customer Ledger provides a **single customer-centric financial view** of all receivable activity: invoices, payments, credit notes, debit notes, write-offs, and outstanding balances. Users should be able to browse customers with open or historical AR activity, open a chronological ledger statement for any customer, and reconcile what was billed, collected, adjusted, and still due—without jumping between Invoices, Payments, and Contact screens.

The module must bridge day-to-day billing operations and finance oversight. Accounts receivable staff should answer “what does this customer owe us?” in one place; sales and account managers should see payment history before follow-ups; leadership should understand customer exposure and ageing without exporting spreadsheets.

This module complements the existing **Payments** screen (company-wide AR cash and outstanding lists) and **Invoice Generator** (document CRUD). It focuses specifically on **per-customer account statements** and running balances. It should feel native to the existing CRM experience and integrate with **Contacts**, **Invoices**, **Payments**, **Sales Orders**, **Deals**, **Company** settings, Activity Logs, and Role Permissions.

---

## 2. Problem Statement

Today, the CRM stores rich invoice and payment data—but there is no unified **customer ledger** or running-balance statement. Finance and sales teams must manually trace a customer’s history across invoice lists, payment registers, and contact records.

Common issues this module should solve:

- No single view of all invoices, payments, credits, and debits for a customer
- Outstanding balance is visible per invoice, not rolled up clearly at customer level
- Credit notes and write-offs are hard to see in context of overall customer balance
- Payments module shows company-wide activity, not a customer account statement
- Contact detail shows CRM activity but not financial ledger history
- Collections follow-ups require manual assembly of “what was billed vs paid”
- Unlinked invoices (missing `contact_id`) may be excluded from customer views inconsistently
- Month-end customer reconciliation and statement sharing requires external spreadsheets

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a dedicated **Customer Ledger** experience listing customers with AR activity and balances.
2. Show a **chronological ledger statement** per customer with debits, credits, and running balance.
3. Include **invoices**, **payments**, **credit notes**, **debit notes**, and **write-offs** as ledger entries.
4. Display **outstanding amount** per customer and per open invoice.
5. Support filters by period, document type, status, and outstanding-only views.
6. Link every ledger row to its source invoice or payment record.
7. Surface customer summary KPIs: total billed, total collected, total outstanding, overdue amount.
8. Enable **CSV/PDF statement export** for customer communication and audit (Phase 1 CSV).
9. Support role-based access for finance, admin, sales managers, and account owners.
10. Preserve traceability to contacts, deals, sales orders, and activity logs.

### 3.2 Non-Goals (This Phase)

1. Full double-entry accounting, GL posting, or chart-of-accounts integration.
2. Vendor / supplier ledger (accounts payable counterpart)—see Vendor Bills; vendor ledger is Phase 2+.
3. Automated dunning, payment reminders, or collections workflow automation (partially exists on invoices).
4. Bank reconciliation or payment gateway settlement matching.
5. Multi-currency FX revaluation and consolidated reporting across currencies.
6. Customer portal login for self-service statement download.
7. Formal legal “Statement of Account” PDF with statutory wording and digital signature.
8. TDS/TCS deduction tracking on customer receipts.
9. Replacement of chartered accountant final balance confirmation.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Finance Executive: Reviews customer balances, prepares statements, validates collections.
- Accounts Receivable Coordinator: Tracks open invoices and payment application per customer.
- Admin: Monitors company-wide receivable exposure and permissions.

### 4.2 Secondary Users

- Sales Manager / Account Owner: Checks customer payment history before renewals or escalations.
- Operations Manager: Confirms billing completeness before handoff to finance.
- Leadership / Founder: Reviews top customers by outstanding and ageing.
- Auditor: Reviews exported statements and drill-down traceability.

---

## 5. Scope Overview

### 5.1 In Scope

- Customer Ledger index (customer list with balances)
- Customer Ledger detail / statement view
- Ledger entry types: invoice, payment, credit note, debit note, write-off
- Running balance calculation on statement
- Outstanding summary and open invoice list per customer
- Ageing buckets per customer (0–30, 31–60, 61–90, 90+ days) aligned with Payments module
- Period filters: all time, this month, last month, quarter, financial year, custom range
- Search by customer name, organization, GSTIN, email, phone
- Filters: outstanding only, overdue only, include/exclude closed invoices
- Drill-down links to invoice detail and payment source invoice
- Entry from Contact detail: “View customer ledger”
- Entry from Invoice detail: “View customer ledger” (when contact linked)
- Entry from Payments: link to customer ledger for invoice’s customer
- CSV export of filtered customer statement
- Activity log on statement export events
- Permissions and sidebar navigation entry

### 5.2 Out of Scope (Phase 1)

- Vendor ledger / supplier statement (AP counterpart)
- PDF branded statement with letterhead (Phase 2)
- Bulk statement email to customers
- Payment allocation UI beyond existing invoice payment recording
- Creating invoices/payments from ledger (link out to existing modules only)
- Advance / unallocated receipt handling as separate ledger bucket (Phase 2)
- Customer credit limit enforcement engine

---

## 6. Core Product Concept

Customer Ledger transforms existing CRM receivable documents into a **chronological account statement** per customer. The user selects a customer (or searches the ledger index), optionally filters by period, and sees every financial movement affecting that customer’s balance—with a running total and clear outstanding summary.

The product supports two primary surfaces:

1. **Customer Ledger Index:** All customers with receivable activity, sortable by outstanding, last activity, or name—with quick KPIs at top.
2. **Customer Ledger Statement:** Chronological register of debits and credits for one customer, with opening balance, period activity, closing balance, and open invoice breakdown.

Every ledger row preserves a link to its source document so finance can verify balances before sharing statements externally.

### 6.1 Relationship to Existing Modules

| Module | Role in Customer Ledger |
|--------|-------------------------|
| **Contacts** | Primary customer identity; `contact_id` linkage on invoices; GSTIN/PAN reference |
| **Invoice Generator (AR)** | Source of invoice, credit note, debit note, write-off entries |
| **Invoice Payments** | Source of payment (credit) entries linked to invoices |
| **Payments (`/payments`)** | Company-wide AR summary; cross-link to customer ledger |
| **Sales Orders** | Context reference on invoice rows; optional filter |
| **Deals** | Context reference on invoice rows |
| **GST / Tax Reports** | Tax compliance view; ledger is balance/collections view (complementary) |
| **Sales Reports** | Pipeline/revenue performance—not customer balance statements |
| **Vendor Bills** | AP module; excluded from customer ledger |
| **Company** | Currency, financial year, timezone for period boundaries |

### 6.2 Current Data Model Notes

The CRM today stores:

**Invoice header:** `contact_id`, `client_name`, `client_org`, `client_gstin`, `invoice_number`, `invoice_type`, `status`, `issue_date`, `due_date`, `grand_total`, `amount_paid`, `outstanding_amount`, `write_off_amount`, `currency`, `parent_invoice_id`

**Invoice types:** `standard`, `advance`, `interim`, `final`, `credit_note`, `debit_note`, `pro_forma`

**Invoice payments:** `amount`, `payment_date`, `payment_method`, `reference`, `note`, linked to `invoice_id`

**Contact:** `name`, `organization_name`, `email`, `phone`, `gstin`, `pan`, `contact_type` (`Customer`, `Vendor`, etc.)

**Gap:** No dedicated `customer_ledger_entries` table. Phase 1 should **compute the ledger dynamically** from invoices and invoice payments (read-only aggregation layer), similar to GST / Tax Reports.

**Gap:** Some invoices may lack `contact_id` but have `client_name` / `client_org`. Phase 1 should support **contact-linked ledger** as primary; unmatched invoices appear in an “Unassigned receivables” bucket (Phase 1) or matching rules (Phase 2).

---

## 7. Ledger Entry Types and Definitions

### 7.1 Entry Types

| Type | Source | Ledger effect | Default sign |
|------|--------|---------------|--------------|
| **Invoice** | `Invoice` where `invoice_type` in standard/advance/interim/final | Increases customer balance (debit) | + |
| **Debit note** | `Invoice` where `invoice_type = debit_note` | Increases customer balance (debit) | + |
| **Credit note** | `Invoice` where `invoice_type = credit_note` | Decreases customer balance (credit) | − (stored negative or normalized negative) |
| **Payment** | `InvoicePayment` on customer invoice | Decreases customer balance (credit) | − |
| **Write-off** | `Invoice.write_off_amount` when status `written_off` | Decreases customer balance (credit/adjustment) | − |

**Pro forma invoices:** Excluded from ledger balance by default (informational only unless issued).

**Cancelled / draft invoices:** Excluded from balance; optionally visible in statement with “Excluded” badge when “Show all documents” toggle enabled.

### 7.2 Customer Summary Metrics

| Metric | Definition |
|--------|------------|
| Total billed | Sum of qualifying invoice/debit note `grand_total` (credit notes reduce) |
| Total collected | Sum of payment amounts on qualifying invoices |
| Total outstanding | Sum of `outstanding_amount` on open receivable invoices |
| Overdue outstanding | Outstanding where `due_date < today` |
| Last activity date | Latest of issue date, payment date, write-off date |
| Open invoice count | Count of invoices with `outstanding_amount > 0` in receivable statuses |

### 7.3 Running Balance Rules

1. Ledger sorted **chronologically** by effective date (see §8.2).
2. **Opening balance** = sum of net effect of all entries before period start.
3. Each row shows **movement amount** (signed) and **running balance** after the row.
4. **Closing balance** at period end should equal sum of open invoice outstanding + any unapplied logic (Phase 1: closing balance = opening + debits − credits; must reconcile to outstanding on open invoices within rounding tolerance).
5. Credit notes created with negative line amounts should normalize to credit (negative movement) in display.
6. Write-offs appear as separate ledger rows on write-off date (or status change date), not double-counted with payments.

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

Reuse period boundary logic from **GST / Tax Reports** / `financial_year_start_month` on Company.

### 8.2 Effective Date by Entry Type

| Entry type | Default date field |
|------------|-------------------|
| Invoice / credit / debit | `issue_date` (fallback: `issued_at`, `created_at`) |
| Payment | `payment_date` |
| Write-off | `last_status_change_at` or write-off action timestamp |

Phase 2: toggle accrual (issue date) vs cash (payment date) basis for statement subtotals.

### 8.3 Document Inclusion Rules (Defaults)

| Document | Include in balance | Show in statement |
|----------|-------------------|-------------------|
| Draft invoice | No | Optional with toggle |
| Awaiting review / approved (pre-issue) | No | Optional with toggle |
| Issued and post-issue lifecycle | Yes | Yes |
| Pro forma | No | Optional informational |
| Cancelled | No | Optional excluded row |
| Credit note (issued) | Yes | Yes |
| Debit note (issued) | Yes | Yes |
| Written off | Yes (via write-off entry) | Yes |
| Closed / paid | Yes (historical) | Yes |

**Receivable statuses for outstanding:** `issued`, `sent`, `viewed`, `partially_paid`, `paid`, `overdue`, `written_off`, `closed` (historical paid items included in statement but not in outstanding sum).

---

## 9. Information Architecture and Navigation

### 9.1 Primary Navigation

Add **Customer Ledger** under Finance in the main sidebar, near Invoices and Payments.

Suggested routes:

- `/customer-ledger` — Customer index with balances
- `/customer-ledger/unassigned` — Invoices without contact linkage (Phase 1 optional)
- `/customer-ledger/:contactId` — Customer statement detail
- `/customer-ledger/:contactId/export` — Export preview (optional dedicated screen)

### 9.2 Entry Points

- From sidebar: Customer Ledger
- From Contact detail (`Customer` type): “View ledger” / “Customer ledger”
- From Invoice detail: “View customer ledger” when `contact_id` present
- From Payments outstanding row: customer name links to ledger
- From Dashboard widget: “Top outstanding customers” (Phase 2)

### 9.3 Cross-Module Visibility

- Contact detail shows summary strip: outstanding, last payment, open invoices count
- Invoice detail shows “Included in customer ledger” when contact linked and status qualifies
- Payments page links customer name to ledger statement

---

## 10. Detailed Functional Requirements

## 10.1 Customer Ledger Index

### Required Elements

- KPI cards:
  - Total outstanding (all customers)
  - Overdue outstanding
  - Customers with open balance
  - Collected this month (optional)
- Search by name, organization, GSTIN, email, phone
- Filters: outstanding only, overdue only, contact type = Customer
- Sort: outstanding (desc), name (A–Z), last activity (desc)
- Table columns:
  - Customer name / organization
  - GSTIN
  - Total billed (all time or filtered period)
  - Total collected
  - Outstanding
  - Overdue
  - Last activity date
  - Open invoices count
  - Actions: View ledger

### UX Behaviors

- Default sort: highest outstanding first
- Empty state when no customers with receivable activity
- Pagination for large customer lists
- Click row opens customer statement

## 10.2 Customer Ledger Statement (Detail)

### Required Elements

- Customer header: name, organization, GSTIN, PAN, email, phone, billing address summary
- Period selector (see §8.1)
- Summary cards:
  - Opening balance (period)
  - Debits (invoices + debit notes)
  - Credits (payments + credit notes + write-offs)
  - Closing balance
  - Current outstanding (as of today)
- Chronological ledger table
- Open invoices sub-table (invoice #, issue date, due date, grand total, paid, outstanding, status, overdue flag)
- Ageing summary for customer (reuse Payments ageing bucket pattern)
- Export CSV
- Quick actions (link out): Create invoice, Record payment (on specific invoice), View contact

### Ledger Table Columns (Default)

- Date
- Entry type (Invoice, Payment, Credit note, Debit note, Write-off)
- Reference (# / payment ref)
- Description (invoice title or payment note)
- Debit amount
- Credit amount
- Running balance
- Status badge
- Link to source

### UX Behaviors

- Running balance column fixed on scroll (desktop) optional Phase 2
- Credit notes show as credits even if stored with negative totals
- Payments show invoice number reference
- Write-offs linked to source invoice
- Warning if customer has outstanding but no GSTIN (B2B data quality—informational)
- Empty period: show opening/closing with no rows and helpful message

## 10.3 Unassigned Receivables (Phase 1 Optional)

### Required Elements

- List invoices with `contact_id IS NULL` and qualifying issued status
- Group by `client_name` / `client_org` fingerprint
- Action: Link to contact (Phase 2) or manual contact assignment via invoice edit
- Outstanding total for unassigned bucket on index KPI

## 10.4 Export and Statement Pack

### Phase 1 Export

- CSV statement with:
  - Company name, customer name, GSTIN, period label
  - Opening balance, each ledger row, closing balance
  - Open invoices appendix
- Filename pattern: `customer-ledger-{customer-slug}-2026-06.csv`
- Activity log event: `customer_ledger_exported`

### Phase 2 Export

- PDF statement with company letterhead
- Email statement to customer contact email (manual trigger)
- Bulk export for multiple customers

---

## 11. UX and Design Requirements

### 11.1 Visual Design

- Follow existing CRM design language (`crm-*` components, stat cards, tables)
- Debits in neutral/dark text; credits in green-tinted column; outstanding in amber/red when overdue
- Entry type badges: Invoice, Payment, Credit, Debit, Write-off
- Distinguish Customer Ledger (per-account) from Payments (company-wide register)

### 11.2 Responsive Behavior

- Index and statement usable on desktop and tablet
- Running balance readable on mobile with horizontal scroll on table

### 11.3 Error Handling

- Contact not found: clear empty state with back link
- Contact is Vendor type: show info banner (“Vendor contacts use Vendor Bills, not customer ledger”) with link to vendor bills if applicable
- No activity: empty ledger with CTA to create invoice
- Large statements: paginated ledger with export of full filtered set

### 11.4 Accessibility

- Keyboard navigable filters, tables, and export
- Accessible labels on period selectors and amount columns

---

## 12. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- `customer_ledger.view` — View ledger index and statements
- `customer_ledger.view_all` — View all customers (not only assigned)
- `customer_ledger.export` — Export statements
- `customer_ledger.manage_settings` — Configure inclusion rules (Phase 2)

### Role Expectations

- Finance / Admin: full view and export
- Manager: view all customers, export
- Employee / Sales: view assigned customers only (optional Phase 1: view all read-only if `invoices.view`)
- User role (portal): no access

### Mapping from Existing Permissions (Transition)

| New permission | Existing equivalent |
|----------------|---------------------|
| `customer_ledger.view` | `invoices.view` + `payments.view` |
| `customer_ledger.export` | `reports.export` or `invoices.view` |

Phase 1 may alias new permissions to existing invoice/payment view permissions.

---

## 13. Data Fields (Report Output Definition)

### 13.1 Customer Index Row

- Contact id, name, organization
- GSTIN, email, phone
- Currency (from company default or dominant invoice currency)
- Total billed, total collected, outstanding, overdue
- Last activity date, open invoice count

### 13.2 Ledger Statement Row

- Entry id (composite: type + source id)
- Entry type
- Effective date
- Reference number (invoice # or payment reference)
- Description
- Debit amount, credit amount, signed movement, running balance
- Source invoice id, payment id (if applicable)
- Status, overdue flag

### 13.3 Statement Summary

- Period label and date range
- Opening balance, period debits, period credits, closing balance
- Current outstanding, overdue outstanding
- Ageing buckets
- Open invoice list

---

## 14. Validation and Business Rules

1. Ledger must respect document inclusion rules consistently across UI and export.
2. Draft invoices never affect balance in default view.
3. Cancelled invoices excluded from balance unless “Show all” enabled.
4. Credit notes reduce customer balance in period of credit note issue date.
5. Payments reduce balance in period of payment date.
6. Write-offs reduce outstanding; must not double-count with payment totals.
7. Customer outstanding = sum of `outstanding_amount` on open receivable invoices for that customer (reconciliation check in UAT).
8. Running balance on full all-time statement must reconcile to current outstanding + paid historical logic within rounding tolerance.
9. Period boundaries use company timezone (`Asia/Kolkata` default) and `en-IN` formatting.
10. Export reflects active filters exactly.
11. Only one company entity per ledger (current CRM single-company model).
12. Pro forma invoices excluded from default balance.

---

## 15. Notifications and Reminders

### Internal Notifications (Phase 2)

- Alert when customer outstanding exceeds threshold
- Month-end reminder to finance: review top overdue customer ledgers
- Notify account owner when payment recorded on assigned customer

---

## 16. Reporting and Insights (Meta)

### Operational Outputs (This Module)

- Customer statement (chronological ledger)
- Customer outstanding and ageing summary
- Top customers by outstanding
- Unassigned receivables list

### UI Artifacts

- Index KPI cards
- Customer summary cards on statement
- Ledger register table with running balance
- Open invoices table
- Ageing bucket panel

---

## 17. Analytics Events

- `customer_ledger_viewed`
- `customer_ledger_index_viewed`
- `customer_ledger_statement_viewed`
- `customer_ledger_exported`
- `customer_ledger_drilldown_invoice`
- `customer_ledger_drilldown_payment`
- `customer_ledger_period_changed`
- `customer_ledger_filter_applied`

Event payload should include contact id, period type, entry counts, outstanding amount, and export format.

---

## 18. Integration Points

### 18.1 CRM Modules

- **Contacts:** customer identity and entry point
- **Invoices:** debits, credits (credit/debit notes), write-offs
- **Invoice payments:** payment credits
- **Payments:** cross-links and shared ageing logic
- **Sales orders / deals:** contextual references on invoice rows
- **Activity log:** export events

### 18.2 Existing Code Alignment

Receivable fields already exist on:

- `Invoice`: `contact_id`, `grand_total`, `amount_paid`, `outstanding_amount`, `write_off_amount`, `invoice_type`, `status`, `issue_date`
- `InvoicePayment`: `amount`, `payment_date`, linked to invoice
- `Contact`: customer master fields

Phase 1 implementation should:

1. Add `customer_ledger_router.py` aggregating invoice and payment queries by `contact_id`
2. Reuse period filter patterns from `tax_reports_router.py` / `sales_reports_router.py`
3. Reuse ageing bucket logic from `payments_router.py`
4. Add frontend pages under `/customer-ledger/*`
5. Not duplicate invoice/payment CRUD—read-only statement layer

### 18.3 Future Integrations

- Vendor ledger (AP counterpart from Vendor Bills)
- Advance receipts / unallocated payments bucket
- Customer credit limit and hold flags
- Automated statement email
- GL export and accounting system sync

---

## 19. Risks and Mitigations

1. **Risk:** Users treat CRM ledger as statutory audited statement.  
   **Mitigation:** Label “for account review”; disclaimer on export footer.

2. **Risk:** Invoices without `contact_id` understate customer balance.  
   **Mitigation:** Unassigned receivables view; prompt to link contact on invoice.

3. **Risk:** Credit notes stored as negative amounts confuse running balance.  
   **Mitigation:** Normalize display columns (debit/credit) in API layer.

4. **Risk:** Overlap with Payments page confuses users.  
   **Mitigation:** Clear nav labels—Payments = company cash register; Customer Ledger = per-customer statement.

5. **Risk:** Running balance performance on long history.  
   **Mitigation:** Period filtering, pagination, indexed queries on `contact_id` + dates.

6. **Risk:** Multi-currency customers skew totals.  
   **Mitigation:** Phase 1 single currency (INR) or group by currency with warning (Phase 2).

---

## 20. Release Phasing

### Phase 1 (MVP)

- Customer ledger index with outstanding balances
- Customer statement with chronological ledger
- Entry types: invoice, payment, credit note, debit note, write-off
- Running balance and open invoice list
- Period filters (month, FY, custom, all time)
- Ageing summary per customer
- Search and outstanding/overdue filters
- CSV export
- Permissions and nav entry
- Contact and invoice detail cross-links
- Unassigned receivables list (optional)

### Phase 2

- PDF statement export with branding
- Email statement to customer
- Link unassigned invoices to contacts from ledger UI
- Assigned-customer-only visibility for sales roles
- Customer index trends (collected vs billed chart)
- Bulk statement export

### Phase 3

- Vendor ledger (supplier AP statements)
- Advance / unallocated payment handling
- Credit limit enforcement
- Multi-currency statements
- GL posting export

---

## 21. UAT Acceptance Checklist

1. Customer index shows correct outstanding per contact linked to invoices.
2. Statement includes issued invoices, payments, credit notes, and write-offs for the customer.
3. Draft and cancelled documents excluded from default balance.
4. Running balance reconciles to opening + debits − credits for the selected period.
5. Current outstanding matches sum of open invoice `outstanding_amount` for the customer.
6. Credit notes appear as credits reducing balance.
7. Payments appear on payment date and link to source invoice.
8. Period filters work for month, financial year, custom range, and all time.
9. Ageing buckets match Payments module logic for the same customer invoices.
10. CSV export matches filtered statement on screen.
11. Drill-down links open correct invoice detail.
12. Permissions limit access to authorized roles.
13. Contact detail link opens correct customer statement.
14. Vendor-type contact shows appropriate message (not customer AR ledger).

---

## 22. UI Suggestions Summary

1. Lead with **customer search** and **outstanding sort** on the index.
2. On statement, show **summary cards above the register**—finance needs opening/closing/outstanding at a glance.
3. Use **debit/credit columns** plus running balance—not signed amounts alone.
4. Keep **open invoices table** visible below the ledger for collections workflow.
5. Link every row to its source; never orphan payments in the UI.
6. Differentiate clearly from **Payments** (company-wide) and **GST / Tax Reports** (tax compliance).

---

## 23. Open Product Questions for Final Sign-Off

1. Should Phase 1 include **unassigned invoices** (no `contact_id`) as a separate bucket or hide them entirely?
2. Which invoice statuses exactly contribute to **running balance** vs display-only?
3. Should **pro forma** invoices appear in the statement when toggled, or always excluded?
4. Is **assigned-customer-only** visibility required in Phase 1 for sales users?
5. Should **debit note** creation workflow be added if not yet available, or ledger read-only for existing types?
6. Running balance on partial period vs **always show current outstanding** in header—which is primary?
7. Should ledger include **refunded** invoice status handling explicitly in Phase 1?

---

## Appendix A: Suggested Screen Inventory

1. Customer Ledger - Index
2. Customer Ledger - Statement (by contact)
3. Customer Ledger - Unassigned receivables
4. Customer Ledger - Export preview
5. Contact detail - Ledger summary strip (embedded)

---

## Appendix B: Recommended Badge Labels

- Invoice
- Payment
- Credit Note
- Debit Note
- Write-off
- Outstanding
- Overdue
- Paid
- Draft Excluded
- Pro Forma
- Unassigned

---

## Appendix C: Ledger Entry Sign Convention (Suggested Defaults)

| Entry | Debit | Credit | Effect on balance |
|-------|-------|--------|-----------------|
| Standard invoice | grand_total | — | Increases |
| Debit note | grand_total | — | Increases |
| Credit note | — | abs(grand_total) | Decreases |
| Payment | — | amount | Decreases |
| Write-off | — | write_off_amount | Decreases |

---

## Appendix D: Example Customer Statement View

**Customer:** Acme Industries Pvt Ltd · **GSTIN:** 27AAAAA0000A1Z5  
**Period:** April 2026 – June 2026 · **Currency:** INR

| Opening balance | | ₹50,000 |
| Debits (invoices) | | ₹2,00,000 |
| Credits (payments + CN) | | ₹1,40,000 |
| **Closing balance** | | **₹1,10,000** |
| **Current outstanding** | | **₹1,10,000** |

**Ledger (excerpt):**

| Date | Type | Ref | Debit | Credit | Balance |
|------|------|-----|-------|--------|---------|
| 01 Apr 2026 | — | Opening | | | ₹50,000 |
| 05 Apr 2026 | Invoice | INV-2026-0042 | ₹1,00,000 | | ₹1,50,000 |
| 12 Apr 2026 | Payment | PAY-REF-9912 | | ₹50,000 | ₹1,00,000 |
| 20 May 2026 | Credit note | CN-2026-0003 | | ₹10,000 | ₹90,000 |
| 15 Jun 2026 | Invoice | INV-2026-0088 | ₹1,00,000 | | ₹1,90,000 |
| 18 Jun 2026 | Payment | NEFT-4410 | | ₹80,000 | ₹1,10,000 |

---

## Appendix E: Customer Ledger vs Payments vs GST Tax Reports

| Aspect | Payments | Customer Ledger | GST / Tax Reports |
|--------|----------|-----------------|-------------------|
| Purpose | Company AR cash & outstanding lists | Per-customer account statement | Tax compliance registers |
| Primary data | All payments & open invoices | One customer’s invoices + payments | Taxable totals by period |
| User | Finance collections | Finance, sales account mgmt | Finance, accountant |
| Metrics | Received, outstanding, ageing (company) | Running balance, customer outstanding | Taxable value, tax collected |
| Export | — (Phase 1) | Customer statement CSV | Tax register CSV |

---

End of document.
