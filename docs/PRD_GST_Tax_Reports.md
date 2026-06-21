# Product Requirements Document (PRD)
## GST / Tax Reports (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Finance / Compliance / Tax Reporting  
**Document Version:** v1.0  
**Date:** 2026-06-21  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

GST / Tax Reports provides a dedicated reporting experience for generating **tax-ready sales, purchase, and summary reports** from CRM financial documents. Users should be able to filter by period, review outward supplies (customer invoices), inward supplies (vendor bills and qualifying purchases), and consolidated tax summaries—then export results for compliance review and filing support.

The module must bridge day-to-day CRM billing/procurement data and finance compliance needs. Accounts and finance teams should see taxable value and tax collected/paid without manually consolidating invoices and vendor bills in spreadsheets; leadership should understand tax exposure and document completeness before month-end or return filing.

This module complements **Sales Reports** (pipeline and revenue performance) and focuses specifically on **GST/tax compliance presentation**. It should feel native to the existing CRM experience and integrate with **Invoices**, **Vendor Bills**, **Purchase Orders**, **Expenses**, **Company** settings (GSTIN, PAN, financial year), Activity Logs, and Role Permissions.

---

## 2. Problem Statement

Today, the CRM stores tax-related data on invoices, vendor bills, purchase orders, and expenses—but there is no unified tax reporting layer. Finance teams must export or manually copy document totals to prepare GST summaries, B2B registers, and purchase tax reconciliations outside the system.

Common issues this module should solve:

- Outward supply (sales) tax cannot be summarized by period in one view
- Inward supply (purchase) tax from vendor bills is not rolled up for input tax visibility
- Taxable value and tax amount are scattered across invoice and vendor bill screens
- There is no document-level register showing GSTIN, invoice/bill number, date, and tax breakdown
- Finance cannot easily identify missing GSTIN or incomplete tax fields before filing prep
- Credit notes and cancelled documents may be included inconsistently in manual reports
- Month-end and quarterly tax review requires manual assembly from multiple modules
- Sales Reports show revenue performance but not tax-compliance-oriented purchase/summary views

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a single place to view and export **tax-ready sales (outward)**, **purchase (inward)**, and **summary** reports.
2. Aggregate tax data from issued customer invoices and approved vendor bills (primary sources).
3. Support period filtering aligned with company financial year (April–March default).
4. Show taxable value, tax amount, and document counts by period, tax rate, and document type.
5. Provide drill-down from summary to document-level registers with GSTIN and reference numbers.
6. Highlight data quality issues (missing GSTIN, draft/unissued documents, zero-tax anomalies).
7. Enable CSV/Excel export of filtered reports for accountant handoff and filing support.
8. Support role-based access for finance, admin, and leadership.
9. Preserve traceability back to source invoices, vendor bills, and related documents.

### 3.2 Non-Goals (This Phase)

1. Direct submission to GST portal (GSTR-1, GSTR-3B, GSTR-2B) or government API integration.
2. E-invoicing (IRN) generation and NIC portal integration.
3. Full double-entry accounting, ledger posting, or TDS/TCS automation.
4. CGST/SGST/IGST component split when source documents only store a single `tax_rate` (Phase 2 enhancement).
5. HSN/SAC code-level statutory formatting matching exact government JSON schema (Phase 2).
6. Multi-GSTIN / multi-branch consolidation across separate company entities.
7. Automated tax filing, payment, or reconciliation with bank statements.
8. Replacement of a chartered accountant’s final return preparation and sign-off.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Finance Executive: Prepares monthly/quarterly tax summaries and export packs for filing support.
- Accountant / Tax Consultant: Reviews outward/inward registers and summary totals.
- Admin: Monitors company-wide tax report completeness and permissions.
- Accounts Payable Coordinator: Validates inward supply (vendor bill) tax data.

### 4.2 Secondary Users

- Leadership / Founder: Reviews tax collected vs paid and period trends.
- Operations Manager: Checks document completeness before finance handoff.
- Auditor: Reviews tax report exports and drill-down traceability.

---

## 5. Scope Overview

### 5.1 In Scope

- GST / Tax Reports overview dashboard
- **Sales (Outward Supply) Tax Report** from customer invoices
- **Purchase (Inward Supply) Tax Report** from vendor bills
- **Tax Summary Report** combining outward and inward totals
- Period filters: month, quarter, financial year, custom date range
- Document-level registers with GSTIN, document number, date, taxable value, tax amount
- Tax rate breakdown (e.g. 5%, 12%, 18%, 28%, exempt/zero-rated where applicable)
- Status filters (e.g. issued/paid invoices; approved vendor bills)
- Credit note / adjustment visibility on outward side
- Data quality panel: missing GSTIN, drafts excluded, incomplete records
- Export filtered reports (CSV; PDF summary in Phase 2)
- Drill-down links to source invoice or vendor bill
- Activity log on report export events

### 5.2 Out of Scope (Phase 1)

- GSTR-1 / GSTR-3B JSON export matching government schema
- B2C large-invoice threshold logic per latest statutory rules automation
- Reverse charge mechanism (RCM) workflows
- ITC eligibility rules engine and blocked-credit logic
- Expense-only tax report as primary inward source (secondary in Phase 2)
- Purchase order tax accrual report (PO is commitment, not inward supply document)
- Multi-currency tax conversion

---

## 6. Core Product Concept

GST / Tax Reports transforms existing CRM tax-bearing documents into **compliance-oriented views**. The user selects a reporting period, chooses outward (sales), inward (purchase), or summary mode, and receives auditable totals plus document registers suitable for review and export.

The product should support three primary report types:

1. **Sales Tax Report (Outward):** Tax collected on customer invoices—taxable value, tax amount, count, rate-wise split.
2. **Purchase Tax Report (Inward):** Tax paid on vendor bills—taxable value, tax amount, vendor GSTIN register.
3. **Tax Summary Report:** Net view of outward tax, inward tax, and document counts for the period (informational net; not a substitute for statutory net tax payable calculation).

Every report row should preserve a link to its source document so finance can verify totals before external filing.

### 6.1 Relationship to Existing Modules

| Module | Role in Tax Reports |
|--------|---------------------|
| **Invoice Generator (AR)** | Primary **outward supply** source—`subtotal`, `total_tax`, `grand_total`, `client_gstin`, line `tax_rate` |
| **Vendor Bills (AP)** | Primary **inward supply** source—`subtotal`, `total_tax`, `vendor_gstin`, line `tax_rate` |
| **Sales Reports** | Revenue/pipeline analytics—not tax compliance registers |
| **Purchase Orders** | Procurement commitment; excluded from inward tax report unless converted to vendor bill |
| **Expenses** | Secondary inward/adhoc spend; optional inclusion in Phase 2 |
| **Company** | Reporting entity GSTIN, PAN, financial year start month |
| **Contacts** | Customer/vendor GSTIN reference |
| **Credit notes (Invoices)** | Reduce outward tax in period when issued |

### 6.2 Current Data Model Notes

The CRM today stores:

- Header-level: `subtotal`, `total_tax`, `round_off`, `grand_total`
- Line-level: `tax_rate`, line subtotal/total
- Party GSTIN: `client_gstin` (invoice), `vendor_gstin` (vendor bill)
- Company: `gstin`, `financial_year_start_month` (April default)

**Gap:** No CGST/SGST/IGST split fields exist yet. Phase 1 reports present **total tax** and **tax rate buckets**; Phase 2 adds place-of-supply and component split for India GST returns.

---

## 7. Report Types and Definitions

### 7.1 Sales Tax Report (Outward Supply)

**Source documents:** Customer invoices in qualifying statuses (default: `issued`, `sent`, `viewed`, `partially_paid`, `paid`, `overdue`; credit notes as negative adjustments).

| Metric | Definition |
|--------|------------|
| Taxable value | Sum of invoice subtotal (after line/header discounts, before tax) |
| Tax collected | Sum of `total_tax` |
| Gross value | Sum of `grand_total` |
| Document count | Count of qualifying invoices/credit notes in period |
| B2B count | Invoices with valid customer GSTIN |
| B2C count | Invoices without customer GSTIN |

**Register columns:** Invoice #, date, customer, GSTIN, taxable value, tax, total, status, tax rate summary.

### 7.2 Purchase Tax Report (Inward Supply)

**Source documents:** Vendor bills in qualifying statuses (default: `approved`, `partially_paid`, `paid`, `overdue`).

| Metric | Definition |
|--------|------------|
| Taxable value | Sum of vendor bill subtotal |
| Input tax | Sum of `total_tax` |
| Gross value | Sum of `grand_total` |
| Document count | Count of qualifying vendor bills |
| Vendors with GSTIN | Bills with valid `vendor_gstin` |

**Register columns:** Bill #, supplier invoice #, date, vendor, GSTIN, taxable value, tax, total, status, PO reference.

### 7.3 Tax Summary Report

Combines outward and inward totals for the selected period:

| Section | Content |
|---------|---------|
| Outward summary | Taxable value, tax collected, invoice count |
| Inward summary | Taxable value, input tax, bill count |
| Rate-wise summary | Taxable value and tax by rate (5/12/18/28/other) across outward + inward |
| Data quality | Missing GSTIN counts, excluded drafts |
| Period | Selected month/quarter/FY/custom range |

**Note:** Summary net tax payable is **informational only** in Phase 1; statutory calculation may require adjustments outside CRM.

---

## 8. Period and Filtering Rules

### 8.1 Reporting Periods

- **This month**
- **Last month**
- **This quarter** (Indian FY quarters: Q1 Apr–Jun, Q2 Jul–Sep, Q3 Oct–Dec, Q4 Jan–Mar)
- **This financial year** (from company `financial_year_start_month`)
- **Last financial year**
- **Custom date range**

### 8.2 Date Basis

| Report | Default date field |
|--------|-------------------|
| Sales (Outward) | Invoice `issue_date` |
| Purchase (Inward) | Vendor bill `bill_date` |
| Optional toggle | Payment date (Phase 2; cash basis) |

### 8.3 Document Inclusion Rules (Defaults)

| Document | Include when | Exclude when |
|----------|--------------|--------------|
| Invoice | Status is issued or post-issue lifecycle | Draft, cancelled (unless credit note) |
| Credit note | Issued in period | Draft |
| Vendor bill | Approved or post-approval payable | Draft, rejected, cancelled |
| Expense | Phase 2 optional | Draft, rejected |

---

## 9. Information Architecture and Navigation

### 9.1 Primary Navigation

Add **GST / Tax Reports** under Finance in the main sidebar, near Sales Reports and Payments.

Suggested routes:

- `/tax-reports` — Overview dashboard
- `/tax-reports/sales` — Outward supply report
- `/tax-reports/purchase` — Inward supply report
- `/tax-reports/summary` — Combined summary
- `/tax-reports/export` — Export preview (optional dedicated screen)

### 9.2 Entry Points

- From sidebar: GST / Tax Reports
- From Invoices list: “View in tax report” (filtered to period)
- From Vendor Bills list: “View in tax report”
- From Sales Reports: link to tax reports for finance users (cross-link only)
- From Dashboard widget: “Tax summary this month” (Phase 2)

### 9.3 Cross-Module Visibility

- Invoice detail shows “Included in outward tax report” indicator when qualifying
- Vendor bill detail shows “Included in inward tax report” when qualifying
- Company settings surfaces reporting GSTIN used on exports

---

## 10. Detailed Functional Requirements

## 10.1 Tax Reports Overview Dashboard

### Required Elements

- KPI cards:
  - Outward taxable value (period)
  - Outward tax collected
  - Inward taxable value
  - Inward input tax
  - Documents missing GSTIN
- Period selector (month/quarter/FY/custom)
- Quick links to Sales, Purchase, and Summary reports
- Recent export history snippet (Phase 2)

### UX Behaviors

- Default period: current month
- Finance users land here first; drill into detail reports from cards
- Warning banner if company GSTIN is not configured

## 10.2 Sales Tax Report (Outward)

### Required Elements

- Period and status filters
- Summary cards: taxable value, tax collected, gross total, document count, B2B/B2C split
- Tax rate breakdown table (rate → taxable value → tax amount → count)
- Document register table with drill-down to invoice
- Search by invoice #, customer, GSTIN
- Export CSV

### Register Columns (Default)

- Invoice number
- Issue date
- Customer name
- Customer GSTIN
- Taxable value
- Tax amount
- Grand total
- Status
- Dominant tax rate / mixed indicator

### Credit Notes

- Show as separate rows with negative taxable value and tax
- Link to parent invoice where applicable

## 10.3 Purchase Tax Report (Inward)

### Required Elements

- Period and status filters
- Summary cards: taxable value, input tax, gross total, bill count, vendors with GSTIN
- Tax rate breakdown table
- Vendor-wise summary (top vendors by input tax)
- Document register with drill-down to vendor bill
- Search by bill #, vendor, supplier invoice #, GSTIN
- Export CSV

### Register Columns (Default)

- Bill number
- Supplier invoice number
- Bill date
- Vendor name
- Vendor GSTIN
- Taxable value
- Tax amount
- Grand total
- Status
- Linked PO (if any)

## 10.4 Tax Summary Report

### Required Elements

- Side-by-side outward vs inward summary
- Combined rate-wise tax table
- Net tax indicator (outward tax − inward tax) labeled **informational**
- Data quality section:
  - Outward docs missing customer GSTIN (B2B candidates)
  - Inward docs missing vendor GSTIN
  - Excluded drafts count
- Export combined summary CSV

## 10.5 Export and Filing Support Pack

### Phase 1 Export

- CSV per report type with current filters
- Filename pattern: `gst-sales-2026-06.csv`, `gst-purchase-2026-Q1.csv`, `gst-summary-FY2025-26.csv`
- Include company name and GSTIN in export header rows

### Phase 2 Export

- PDF summary suitable for management review
- Multi-sheet Excel workbook (summary + outward + inward registers)
- GSTR-1 / GSTR-3B **worksheet-style** templates (not portal JSON)

---

## 11. UX and Design Requirements

## 11.1 Visual Design

- Follow existing CRM design language (`crm-*` components, stat cards, tables)
- Use distinct colors for outward (sales/blue-green) vs inward (purchase/amber) sections
- Data quality warnings use amber/red badges—not blocking unless export disclaimer accepted

## 11.2 Responsive Behavior

- Dashboard and tables usable on desktop and tablet
- Export actions available on all supported widths

## 11.3 Error Handling

- Empty period: clear empty state with link to Invoices / Vendor Bills
- Company GSTIN missing: persistent warning on all tax report screens
- Large datasets: paginated registers with export of full filtered set

## 11.4 Accessibility

- Keyboard navigable filters and tables
- Accessible labels on period selectors and export buttons

---

## 12. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- tax_reports.view
- tax_reports.view_sales
- tax_reports.view_purchase
- tax_reports.view_summary
- tax_reports.export
- tax_reports.manage_settings

### Role Expectations

- Finance / Admin: full view and export
- Manager: summary view only (optional)
- Employee: no access by default
- Accountant (external): export via finance handoff only; no separate portal login in Phase 1

### Mapping from Existing Permissions (Transition)

| New permission | Existing equivalent |
|----------------|---------------------|
| tax_reports.view | `reports.view_financial` |
| tax_reports.export | `reports.export` |

Phase 1 may alias new permissions to existing financial report permissions.

---

## 13. Data Fields (Report Output Definition)

### 13.1 Outward Register Fields

- Company GSTIN (header)
- Invoice number, issue date, due date
- Customer name, customer GSTIN, billing state (Phase 2)
- Subtotal, discount totals, taxable value
- Tax rate breakdown lines
- Total tax, round-off, grand total
- Invoice status, payment status
- Source order/quote reference

### 13.2 Inward Register Fields

- Company GSTIN (header)
- Bill number, supplier invoice number, bill date
- Vendor name, vendor GSTIN
- Subtotal, taxable value, total tax, grand total
- Bill status, payment status
- PO reference

### 13.3 Summary Fields

- Period label and date range
- Outward taxable / tax / count
- Inward taxable / tax / count
- Rate-wise combined table
- Informational net tax
- Data quality counts

---

## 14. Validation and Business Rules

1. Reports must respect document status inclusion rules consistently across UI and export.
2. Draft documents never appear in default tax reports.
3. Cancelled invoices excluded unless credit note handling applies.
4. Credit notes reduce outward totals in the same period as issue date.
5. Tax totals on reports must match sum of included source documents (reconciliation check in UAT).
6. Missing GSTIN documents appear in register but flagged in data quality section.
7. Period boundaries use company timezone/date formatting (`en-IN`).
8. Export reflects active filters exactly.
9. Only one company entity per report (current CRM single-company model).
10. Rounding differences across line vs header tax must be documented in export footnote if detected.

---

## 15. Notifications and Reminders

### Internal Notifications (Phase 2)

- Month-end reminder to finance: generate tax summary
- Alert when outward documents missing GSTIN exceed threshold
- Alert when approved vendor bills lack vendor GSTIN

---

## 16. Reporting and Insights (Meta)

### Operational Outputs (This Module)

- Outward tax register by period
- Inward tax register by period
- Combined tax summary
- Rate-wise tax breakdown
- Vendor-wise input tax ranking
- Customer-wise outward tax ranking (Phase 2)
- Missing GSTIN exception list

### UI Artifacts

- Overview KPI cards
- Rate-wise bar/table chart
- Outward vs inward comparison panel
- Exception/data quality panel

---

## 17. Analytics Events

- tax_report_viewed
- tax_report_sales_viewed
- tax_report_purchase_viewed
- tax_report_summary_viewed
- tax_report_exported
- tax_report_drilldown_invoice
- tax_report_drilldown_vendor_bill
- tax_report_period_changed

Event payload should include period type, document counts, total tax buckets, and export format.

---

## 18. Integration Points

### 18.1 CRM Modules

- **Invoices:** outward supply calculations and registers
- **Vendor Bills:** inward supply calculations and registers
- **Company:** GSTIN, legal name, financial year
- **Contacts:** fallback GSTIN for customer/vendor
- **Sales Reports:** cross-link only; no duplicate revenue KPIs
- **Activity Log:** export and significant view events

### 18.2 Existing Code Alignment

Tax-bearing fields already exist on:

- `Invoice`: `subtotal`, `total_tax`, `grand_total`, `client_gstin`, line items `tax_rate`
- `VendorBill`: `subtotal`, `total_tax`, `grand_total`, `vendor_gstin`, line items `tax_rate`
- `Company`: `gstin`, `financial_year_start_month`

Phase 1 implementation should:

1. Add `tax_reports_router.py` aggregating invoice and vendor bill queries
2. Reuse period filter patterns from `sales_reports_router.py`
3. Add frontend pages under `/tax-reports/*`
4. Not duplicate document CRUD—read-only reporting layer

### 18.3 Future Integrations

- CGST/SGST/IGST split by place of supply
- HSN/SAC summary reports
- GSTR-1 / GSTR-3B export templates
- Expense and PO-accrual inclusion toggles
- TDS/TCS summary reports
- E-invoice IRN linkage column

---

## 19. Risks and Mitigations

1. **Risk:** Users treat CRM summary as final statutory return.  
   **Mitigation:** Label reports “for compliance support”; disclaimer on summary and exports.

2. **Risk:** Single `tax_rate` field insufficient for full GST return split.  
   **Mitigation:** Phase 1 focuses on registers and totals; Phase 2 adds component split.

3. **Risk:** Draft or cancelled documents skew totals if rules are wrong.  
   **Mitigation:** Strict status inclusion rules; reconciliation totals in UAT.

4. **Risk:** Missing GSTIN on B2B documents.  
   **Mitigation:** Data quality panel and exception export.

5. **Risk:** Overlap with Sales Reports confuses users.  
   **Mitigation:** Clear nav labels—Sales Reports = performance; GST / Tax Reports = compliance.

6. **Risk:** Vendor bills not adopted yet leave inward report empty.  
   **Mitigation:** Show empty state with CTA; Phase 2 optional expense inclusion.

---

## 20. Release Phasing

### Phase 1 (MVP)

- Tax reports overview dashboard
- Sales (outward) tax report with register and rate breakdown
- Purchase (inward) tax report with register and rate breakdown
- Tax summary report (informational net)
- Period filters (month, quarter, FY, custom)
- Data quality panel (missing GSTIN, excluded drafts)
- CSV export per report
- Permissions and nav entry
- Drill-down to invoice / vendor bill

### Phase 2

- PDF and Excel export pack
- Customer-wise and vendor-wise tax ranking
- Expense tax optional inclusion
- Credit note and adjustment report tab
- Month-end reminder notifications
- Saved report views

### Phase 3

- CGST/SGST/IGST split and place-of-supply rules
- HSN/SAC summary report
- GSTR-1 / GSTR-3B worksheet exports
- Cash vs accrual date basis toggle
- TDS/TCS summary (if source fields added)
- Multi-period comparison trends

---

## 21. UAT Acceptance Checklist

1. Sales tax report shows only qualifying issued invoices for selected period.
2. Purchase tax report shows only qualifying approved vendor bills for selected period.
3. Taxable value and tax totals match sum of included source documents.
4. Credit notes appear as negative outward adjustments when issued in period.
5. Draft and cancelled documents are excluded from default reports.
6. Rate-wise breakdown sums reconcile to header totals within rounding tolerance.
7. Missing GSTIN documents appear in register and data quality panel.
8. Summary report shows outward, inward, and informational net tax.
9. Period filters work for month, quarter, financial year, and custom range.
10. CSV export matches filtered register on screen.
11. Drill-down links open correct invoice or vendor bill detail.
12. Permissions limit tax report access to authorized finance/admin roles.
13. Warning shown when company GSTIN is not configured.

---

## 22. UI Suggestions Summary

1. Lead with **period selector** and three clear tabs: Sales | Purchase | Summary.
2. Show **data quality warnings** before export, not after.
3. Use **document registers** as the trust layer—summary cards alone are insufficient for finance.
4. Label net tax as **informational** everywhere it appears.
5. Link every register row to its source document.
6. Keep Sales Reports and GST / Tax Reports visually related but clearly labeled.

---

## 23. Open Product Questions for Final Sign-Off

1. Should cash basis (payment date) be supported in Phase 1 or deferred to Phase 3?
2. Which invoice statuses exactly qualify for outward tax reporting?
3. Should expenses with `tax_amount` appear in inward report in Phase 1 or Phase 2?
4. Is B2B vs B2C split required in Phase 1 based on customer GSTIN presence?
5. Do we need HSN/SAC on line items before HSN summary can be scoped?
6. Should credit notes always reduce the original invoice period or the credit note issue period?
7. Is a single company GSTIN sufficient for all exports in Phase 1?

---

## Appendix A: Suggested Screen Inventory

1. GST / Tax Reports - Overview
2. GST / Tax Reports - Sales (Outward)
3. GST / Tax Reports - Purchase (Inward)
4. GST / Tax Reports - Summary
5. GST / Tax Reports - Export Preview
6. GST / Tax Reports - Data Quality Exceptions

---

## Appendix B: Recommended Badge Labels

- Outward
- Inward
- B2B
- B2C
- Missing GSTIN
- Draft Excluded
- Credit Note
- Informational Net
- Rate 18%
- Data Quality Warning

---

## Appendix C: Document Status Inclusion (Suggested Defaults)

### Outward (Invoices)

| Status | Include |
|--------|---------|
| Draft | No |
| Awaiting Review | No |
| Approved | No (until issued) |
| Issued | Yes |
| Sent | Yes |
| Viewed | Yes |
| Partially Paid | Yes |
| Paid | Yes |
| Overdue | Yes |
| Cancelled | No |
| Credit note (issued) | Yes (negative) |

### Inward (Vendor Bills)

| Status | Include |
|--------|---------|
| Draft | No |
| Submitted / Under Review | No |
| Approved | Yes |
| Partially Paid | Yes |
| Paid | Yes |
| Overdue | Yes |
| Rejected | No |
| Cancelled | No |

---

## Appendix D: Example Summary View

**Period:** June 2026 · **Company GSTIN:** 27AAAAA0000A1Z5

| | Taxable Value | Tax | Documents |
|---|---------------|-----|-----------|
| **Outward (Sales)** | ₹12,45,000 | ₹2,24,100 | 38 |
| **Inward (Purchase)** | ₹4,80,000 | ₹86,400 | 15 |
| **Informational net tax** | — | ₹1,37,700 | — |

**Rate-wise (Outward):**

| Rate | Taxable | Tax |
|------|---------|-----|
| 18% | ₹10,00,000 | ₹1,80,000 |
| 12% | ₹2,45,000 | ₹29,400 |

---

## Appendix E: GST / Tax Reports vs Sales Reports

| Aspect | Sales Reports | GST / Tax Reports |
|--------|---------------|-------------------|
| Purpose | Pipeline & sales performance | Tax compliance & filing support |
| Primary data | Leads, deals, orders, revenue KPIs | Invoices, vendor bills, tax totals |
| User | Sales manager, leadership | Finance, accountant |
| Metrics | Conversion, revenue, pending deals | Taxable value, tax collected/paid |
| Export | Sales analytics CSV | Tax registers for compliance handoff |

---

End of document.
