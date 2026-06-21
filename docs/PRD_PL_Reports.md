# Product Requirements Document (PRD)
## P&L Reports (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Finance / Management Reporting / Profit & Loss  
**Document Version:** v1.0  
**Date:** 2026-06-21  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

P&L Reports provides a **period-based Profit & Loss view** of business performance derived from existing CRM financial documents. Users should be able to select a reporting period and see **revenue**, **cost of sales / purchases**, **gross profit**, **operating expenses**, **net profit**, and supporting margin KPIs—with drill-down to source invoices, vendor bills, and expenses.

The module must bridge operational CRM data and management oversight. Finance and leadership should answer “how did we perform this month / quarter / financial year?” without manually consolidating Sales Reports, GST registers, expense lists, and vendor bill totals in spreadsheets.

This module complements **Sales Reports** (pipeline and booked revenue analytics), **GST / Tax Reports** (tax compliance registers), **Customer Ledger** (AR statements), and **Vendor Ledger** (AP statements). It focuses specifically on **income-statement-style performance by period**. It should feel native to the existing CRM experience and integrate with **Invoices**, **Vendor Bills**, **Expenses**, **Company** settings (financial year, currency), Activity Logs, and Role Permissions.

---

## 2. Problem Statement

Today, the CRM stores revenue on invoices, direct costs on vendor bills, and operating spend on expenses—but there is no unified **Profit & Loss** report. Finance and founders must manually assemble revenue minus costs from multiple modules to estimate gross and net profit.

Common issues this module should solve:

- No single view of revenue, costs, and profit for a selected period
- Sales Reports show pipeline/booked revenue but not a full income statement
- GST / Tax Reports show taxable totals, not business profit
- Vendor bills and employee expenses both represent spend but are not rolled into one P&L
- Credit notes and write-offs affect true revenue but are not reflected in a management P&L
- Expenses linked to vendor bills may be double-counted if consolidated manually
- Month-end and board reviews require external spreadsheet P&L assembly
- No gross margin or net margin visibility by period
- No period-over-period comparison for leadership reviews

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a dedicated **P&L Reports** experience with period-filtered income statement summary.
2. Calculate **net revenue** from qualifying customer invoices and credit notes (accrual basis, ex-GST by default).
3. Calculate **cost of sales / purchases** from qualifying vendor bills as the Phase 1 COGS proxy.
4. Calculate **operating expenses** from qualifying employee/adhoc expenses by category.
5. Display **gross profit**, **gross margin %**, **net profit**, and **net margin %** for the selected period.
6. Support period filters aligned with company financial year (month, quarter, FY, custom).
7. Provide drill-down registers for revenue lines, purchase/cost lines, and expense lines.
8. Show **period comparison** vs previous period (amount and % change) on summary KPIs.
9. Provide a simple **trend view** (monthly bars for revenue, expenses, net profit) for the trailing 6–12 months.
10. Enable **CSV export** of summary and detail registers for accountant / board handoff (Phase 1).
11. Support role-based access for finance, admin, and leadership.
12. Preserve traceability to source invoices, vendor bills, and expenses.

### 3.2 Non-Goals (This Phase)

1. Full double-entry accounting, chart of accounts, or GL posting.
2. Statutory audited financial statements or Schedule III formatting.
3. Balance sheet, cash flow statement, or fund-flow reporting.
4. Product-level or SKU-level COGS from inventory costing (no unit cost field in current model).
5. Budget vs actual, forecast scenarios, or variance commentary automation.
6. Multi-entity / multi-branch consolidated P&L.
7. Multi-currency FX conversion and consolidated reporting.
8. Payroll, depreciation, interest, and tax expense automation (manual/other bucket in Phase 2 only).
9. Replacement of chartered accountant final books and sign-off.
10. Direct Tally / Zoho Books / ERP sync.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Finance Executive: Prepares monthly/quarterly P&L, validates totals against source documents.
- Admin: Monitors company performance and permissions.
- Leadership / Founder: Reviews revenue, margins, and net profit trends.

### 4.2 Secondary Users

- Accountant / External Consultant: Reviews exported P&L detail for advisory work.
- Operations Manager: Understands expense category spend vs revenue context.
- Sales Manager: Views revenue contribution context (not primary owner of P&L module).
- Auditor: Reviews exported registers and drill-down traceability.

---

## 5. Scope Overview

### 5.1 In Scope

- P&L Reports overview dashboard (summary statement)
- Period filters: this month, last month, quarter, financial year, last financial year, custom range
- Revenue section: gross sales, credit notes/returns, net revenue
- Cost section: purchases / direct costs (vendor bills)
- Gross profit and gross margin %
- Operating expenses section by expense category
- Net profit and net margin %
- Period-over-period comparison on headline KPIs
- Monthly trend chart (trailing 6 months minimum)
- Drill-down document registers:
  - Revenue register (invoices + credit notes)
  - Purchases / COGS register (vendor bills)
  - Operating expense register (expenses)
- Data quality panel: excluded drafts, double-count warnings (expense linked to vendor bill)
- CSV export of summary + registers
- Activity log on export events
- Permissions and sidebar navigation entry
- Cross-links from summary rows to Invoices, Vendor Bills, Expenses modules

### 5.2 Out of Scope (Phase 1)

- Cash-basis P&L toggle (accrual only in Phase 1)
- PDF branded P&L with letterhead (Phase 2)
- Budget / forecast lines
- Manual journal adjustments layer
- Payroll module integration
- Inventory valuation COGS from stock movements
- Project / deal-level P&L (Phase 2 optional)
- Customer-segment or product-category revenue breakdown (Phase 2)
- Consolidated P&L email scheduling

---

## 6. Core Product Concept

P&L Reports transforms existing CRM financial documents into a **management income statement** for a selected period. The user picks a period, reviews headline revenue/cost/expense/profit metrics, drills into supporting registers, and exports results for review.

The product presents a simplified **single-step P&L** suitable for SMB management reporting:

```
Net Revenue
− Cost of Sales / Purchases (vendor bills)
= Gross Profit
− Operating Expenses (employee expenses)
= Net Profit (Phase 1 simplified)
```

Every total must be explainable from underlying CRM documents. The UI should clearly state that this is **management P&L for review—not statutory audited accounts**.

### 6.1 Relationship to Existing Modules

| Module | Role in P&L Reports |
|--------|---------------------|
| **Invoices (AR)** | Primary **revenue** source—`subtotal` (ex-GST) by `issue_date`; credit notes reduce revenue |
| **Vendor Bills (AP)** | Primary **cost of sales / purchases** source—`subtotal` by `bill_date` |
| **Expenses** | **Operating expenses**—`amount` by `expense_date` (approved/paid) |
| **Sales Reports** | Pipeline/booked revenue analytics—not income statement |
| **GST / Tax Reports** | Tax compliance registers—not profit calculation |
| **Customer Ledger** | Per-customer AR statement—not company P&L |
| **Vendor Ledger** | Per-vendor AP statement—not company P&L |
| **Payments** | Cash collection tracking; not primary revenue basis in Phase 1 (accrual) |
| **Purchase Orders** | Commitment only; excluded until vendor bill exists |
| **Company** | Currency, financial year start month, timezone for period boundaries |

### 6.2 Current Data Model Notes

The CRM today stores:

**Invoice:** `subtotal`, `total_tax`, `grand_total`, `issue_date`, `status`, `invoice_type`, `write_off_amount`

**Vendor bill:** `subtotal`, `total_tax`, `grand_total`, `bill_date`, `status`, `expense_id` (optional link)

**Expense:** `amount`, `tax_amount`, `expense_date`, `category`, `status`, `cost_center`

**Gap:** No product `cost_price` or inventory COGS engine. Phase 1 uses **vendor bill subtotals** as the cost/purchases proxy.

**Gap:** No dedicated `pl_report_snapshots` table. Phase 1 should **compute P&L dynamically** from source documents (read-only aggregation), mirroring GST / Tax Reports and ledger modules.

**Gap:** Vendor bills and expenses may represent the same economic event when `VendorBill.expense_id` is set. Phase 1 must **deduplicate**—include vendor bill subtotal and exclude linked expense from operating expenses (or configurable rule in Phase 2).

**Gap:** No separate “operating vs capital” expense classification beyond expense category. Phase 1 treats all qualifying expenses as operating.

---

## 7. P&L Line Definitions (Phase 1)

### 7.1 Revenue

| Line | Source | Amount field | Sign |
|------|--------|--------------|------|
| **Gross sales** | Issued invoices (`standard`, `advance`, `interim`, `final`, `debit_note`) | `subtotal` | + |
| **Sales returns / credit notes** | Issued credit note invoices | `subtotal` | − |
| **Net revenue** | Calculated | gross sales − credit notes | = |

**Excluded from revenue:**

- `draft`, `awaiting_review`, `approved` (not yet issued), `cancelled`
- `pro_forma` invoice type
- GST component (`total_tax`)—report revenue **excluding tax** by default

**Included invoice statuses (align with GST outward / customer ledger issued set):**

- `issued`, `sent`, `viewed`, `partially_paid`, `paid`, `overdue`, `written_off`, `closed`, `refunded`

**Effective date:** `issue_date` (fallback: `issued_at`, `created_at`)

**Write-offs:** Treated as revenue reduction informational line in Phase 2; Phase 1 may show write-off total in data quality panel without adjusting net revenue unless product sign-off prefers reduction via `write_off_amount`.

### 7.2 Cost of Sales / Purchases

| Line | Source | Amount field | Sign |
|------|--------|--------------|------|
| **Purchases / direct costs** | Approved+ vendor bills | `subtotal` | + (cost) |

**Included bill statuses (align with GST inward / vendor ledger):**

- `approved`, `partially_paid`, `paid`, `overdue`, `closed`

**Excluded:** `draft`, `submitted`, `under_review`, `rejected`, `cancelled`

**Effective date:** `bill_date`

**Note:** Label as “Purchases / direct costs” in UI since true COGS from inventory is not available in Phase 1.

### 7.3 Gross Profit

| Metric | Formula |
|--------|---------|
| **Gross profit** | Net revenue − Purchases / direct costs |
| **Gross margin %** | (Gross profit ÷ Net revenue) × 100 when net revenue > 0 |

### 7.4 Operating Expenses

| Line | Source | Amount field | Sign |
|------|--------|--------------|------|
| **Operating expenses** | Approved/paid expenses | `amount` | + (cost) |

**Included expense statuses:**

- `approved`, `paid`

**Excluded:** `draft`, `submitted`, `under_review`, `rejected`, `cancelled`

**Effective date:** `expense_date`

**Category breakdown:** Group by `category` using `EXPENSE_CATEGORY_LABELS`.

**Deduplication rule:** If expense id is linked on a qualifying vendor bill (`VendorBill.expense_id`), **exclude that expense** from operating expenses (cost already captured in purchases line).

### 7.5 Net Profit (Phase 1 Simplified)

| Metric | Formula |
|--------|---------|
| **Total operating expenses** | Sum of qualifying expenses after deduplication |
| **Net profit** | Gross profit − Total operating expenses |
| **Net margin %** | (Net profit ÷ Net revenue) × 100 when net revenue > 0 |

Phase 2 may add lines for interest, depreciation, payroll, and tax below operating profit.

---

## 8. Period, Filtering, and Inclusion Rules

### 8.1 Reporting Periods

- **This month**
- **Last month**
- **This quarter** (Indian FY quarters: Q1 Apr–Jun, Q2 Jul–Sep, Q3 Oct–Dec, Q4 Jan–Mar)
- **This financial year** (from company `financial_year_start_month`, default April)
- **Last financial year**
- **Custom date range**

Reuse period boundary logic from **GST / Tax Reports**, **Customer Ledger**, and `financial_year_start_month` on Company.

### 8.2 Comparison Period

For each selected period, compute **previous period** of equal length:

- This month → last month
- This quarter → previous quarter
- This FY → last FY
- Custom → immediately preceding range of same day count

Show absolute and percentage change on: Net revenue, Gross profit, Operating expenses, Net profit.

### 8.3 Amount Basis Defaults

| Setting | Phase 1 default |
|---------|-----------------|
| Revenue amount | Invoice `subtotal` (ex-GST) |
| Cost amount | Vendor bill `subtotal` (ex-GST) |
| Expense amount | Expense `amount` (typically ex-GST; if inclusive, document in UI footnote) |
| Accounting basis | **Accrual** (document date driven) |
| Currency | Company default INR; warn if mixed-currency documents exist |

Phase 2: toggle accrual vs cash basis; toggle include/exclude GST in amounts.

### 8.4 Document Exclusion Summary

| Document | Default in P&L |
|----------|----------------|
| Draft invoice / bill / expense | No |
| Cancelled / rejected | No |
| Pro forma invoice | No |
| Approved but not issued invoice | No |
| PO without vendor bill | No |
| Expense linked to included vendor bill | Expense excluded (dedup) |

---

## 9. Information Architecture and Navigation

### 9.1 Primary Navigation

Add **P&L Reports** under Finance in the main sidebar, near Sales Reports and GST / Tax Reports.

Suggested routes:

- `/pl-reports` — P&L overview dashboard
- `/pl-reports/revenue` — Revenue register drill-down (optional tab or section)
- `/pl-reports/costs` — Purchases / COGS register
- `/pl-reports/expenses` — Operating expense register

Phase 1 may implement all sections on one page with tabs: **Summary | Revenue | Costs | Expenses**.

### 9.2 Entry Points

- From sidebar: P&L Reports
- From Admin / Finance dashboard: “View P&L” shortcut (Phase 2)
- From Sales Reports: info link “For profit view see P&L Reports” (Phase 1 tooltip/banner)
- From GST / Tax Reports: info link distinguishing tax vs profit (Phase 1)

### 9.3 Cross-Module Visibility

- Invoice detail: “Included in P&L revenue” when issued and in qualifying status
- Vendor bill detail: “Included in P&L costs” when approved+
- Expense detail: “Included in P&L operating expenses” when approved/paid and not deduplicated

---

## 10. Detailed Functional Requirements

## 10.1 P&L Overview (Summary)

### Required Elements

- Period selector (see §8.1)
- Comparison label (e.g. “vs last month”)
- Headline KPI cards:
  - Net revenue
  - Purchases / direct costs
  - Gross profit (+ margin %)
  - Operating expenses
  - Net profit (+ margin %)
- Change indicators vs previous period (amount + %)
- Statement-style summary block:

  | Line | Current period | Previous period | Change |
  |------|----------------|-----------------|--------|
  | Gross sales | | | |
  | Credit notes | | | |
  | **Net revenue** | | | |
  | Purchases / direct costs | | | |
  | **Gross profit** | | | |
  | Operating expenses | | | |
  | **Net profit** | | | |

- Monthly trend mini-chart: net revenue, total costs+expenses, net profit (trailing 6 months)
- Data quality panel:
  - Draft documents excluded (counts)
  - Expenses deduplicated via vendor bill link (count + amount)
  - Missing issue dates / bill dates flagged
  - Mixed currency warning if applicable
- Export CSV button
- Disclaimer: “Management P&L for review—not statutory audited accounts”

### UX Behaviors

- Default period: **This month**
- Negative net profit styled clearly (red/neutral per design system)
- Zero revenue period shows helpful empty state with links to Invoices
- Large numbers formatted `en-IN` with company currency

## 10.2 Revenue Register

### Required Elements

- Table columns: Date, Invoice #, Customer, Type, Subtotal (revenue), Tax, Grand total, Status, Link
- Separate subtotal rows or filter for credit notes
- Summary footer: gross sales, credit notes, net revenue
- Filter within period: customer search, invoice type
- Export CSV for visible register

### UX Behaviors

- Credit notes shown as negative or flagged “Credit” badge
- Click row opens invoice detail

## 10.3 Purchases / Costs Register

### Required Elements

- Table columns: Date, Bill #, Vendor, Supplier invoice #, Subtotal (cost), Tax, Grand total, Status, PO ref, Link
- Summary footer: total purchases / direct costs
- Filter: vendor search, PO-linked only
- Export CSV

### UX Behaviors

- Click row opens vendor bill detail
- Bills linked to expenses show “Expense linked” badge (informational)

## 10.4 Operating Expenses Register

### Required Elements

- Table columns: Date, Expense #, Category, Title, Vendor, Amount, Status, Submitter, Link
- Category subtotals (travel, marketing, etc.)
- Summary footer: total operating expenses (after dedup)
- Excluded duplicates section: expenses skipped due to vendor bill link
- Export CSV

### UX Behaviors

- Click row opens expense detail
- Category chips or grouped table view toggle (Phase 1 table + category summary cards)

## 10.5 Export

### Phase 1 Export

- CSV pack or single CSV with sections:
  - Company name, period label
  - Summary statement lines
  - Revenue register
  - Purchases register
  - Expenses register
  - Data quality notes footer
- Filename pattern: `pl-report-2026-06.csv`
- Activity log event: `pl_report_exported`

### Phase 2 Export

- PDF summary with company letterhead
- Excel workbook with multiple sheets
- Scheduled monthly export email to leadership

---

## 11. UX and Design Requirements

### 11.1 Visual Design

- Follow existing CRM design language (`crm-*` components, stat cards, tables)
- Revenue lines in blue/neutral; costs and expenses in amber; profit positive in green, negative in red
- Margin % shown as secondary text under profit cards
- Distinguish P&L Reports from Sales Reports (sales performance) and GST / Tax Reports (tax compliance)

### 11.2 Responsive Behavior

- Summary usable on desktop and tablet
- Registers scroll horizontally on smaller screens

### 11.3 Error Handling

- Company not configured: blocking message with link to Company settings
- No qualifying documents in period: empty state with guidance
- Permission denied: standard CRM unauthorized state

### 11.4 Accessibility

- Keyboard navigable period selector, tabs, and export
- Accessible labels on margin and change indicators

---

## 12. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- `pl_reports.view` — View P&L summary and registers
- `pl_reports.export` — Export P&L reports
- `pl_reports.manage_settings` — Configure inclusion rules and basis toggles (Phase 2)

### Role Expectations

- Finance / Admin: full view and export
- Manager / Leadership: view (via financial reports permission)
- Sales / AP / Employee: no access by default
- User role (portal): no access

### Mapping from Existing Permissions (Transition)

| New permission | Existing equivalent |
|----------------|---------------------|
| `pl_reports.view` | `reports.view_financial` |
| `pl_reports.export` | `reports.export` |

Phase 1 may alias new permissions to existing financial report permissions.

---

## 13. Data Fields (Report Output Definition)

### 13.1 Summary Response

- Period key, label, date_from, date_to
- Comparison period label, date_from, date_to
- `gross_sales`, `credit_notes`, `net_revenue`
- `purchases_costs`, `gross_profit`, `gross_margin_pct`
- `operating_expenses`, `net_profit`, `net_margin_pct`
- Previous period values for each headline metric
- Change amount and change % for each headline metric
- `deduplicated_expense_count`, `deduplicated_expense_amount`
- `excluded_draft_counts` by document type
- `trend`: list of `{ period_label, net_revenue, gross_profit, net_profit }`

### 13.2 Revenue Register Row

- Invoice id, invoice_number, issue_date, client_name, invoice_type, subtotal, total_tax, grand_total, status, status_label

### 13.3 Purchases Register Row

- Bill id, bill_number, supplier_invoice_number, bill_date, vendor_name, subtotal, total_tax, grand_total, status, purchase_order_id, expense_id

### 13.4 Expense Register Row

- Expense id, expense_number, expense_date, category, category_label, title, vendor_name, amount, status, status_label, included_in_pl, exclusion_reason

---

## 14. Validation and Business Rules

1. P&L totals must respect document inclusion rules consistently across UI and export.
2. Revenue uses invoice `subtotal` ex-GST unless settings toggle added later.
3. Credit notes reduce net revenue in the same period as their `issue_date`.
4. Vendor bill costs use `subtotal` ex-GST for qualifying statuses.
5. Expense linked to an included vendor bill must not double-count in operating expenses.
6. Draft, cancelled, and rejected documents never affect P&L in default view.
7. Period boundaries use company timezone (`Asia/Kolkata` default) and `en-IN` formatting.
8. Export reflects active period and tab filters exactly.
9. Only one company entity per report (current CRM single-company model).
10. Net margin and gross margin divide-by-zero must return null or em dash, not error.
11. Trailing trend months use calendar month buckets in company timezone.
12. Write-off handling must be documented in UI footnote for Phase 1 (informational vs revenue reduction—confirm at sign-off).

---

## 15. Notifications and Reminders

### Internal Notifications (Phase 2)

- Month-end reminder to finance: review and export P&L
- Alert when net profit falls below threshold
- Alert when operating expenses exceed % of revenue threshold

---

## 16. Reporting and Insights (Meta)

### Operational Outputs (This Module)

- Management P&L summary by period
- Revenue, purchases, and expense registers
- Margin and period-over-period change KPIs
- Monthly profit trend

### UI Artifacts

- Summary KPI cards with comparison deltas
- Statement table (current vs previous)
- Trend chart
- Tabbed detail registers
- Category expense breakdown cards
- Data quality / deduplication panel

---

## 17. Analytics Events

- `pl_report_viewed`
- `pl_report_summary_viewed`
- `pl_report_tab_changed` (revenue | costs | expenses)
- `pl_report_period_changed`
- `pl_report_exported`
- `pl_report_drilldown_invoice`
- `pl_report_drilldown_vendor_bill`
- `pl_report_drilldown_expense`

Event payload should include period type, date range, net revenue, net profit, gross margin, export format, and register row counts.

---

## 18. Integration Points

### 18.1 CRM Modules

- **Invoices:** revenue register and gross sales / credit notes
- **Vendor bills:** purchases / direct costs
- **Expenses:** operating expenses by category
- **Company:** financial year and currency
- **Activity log:** export events

### 18.2 Existing Code Alignment

Phase 1 implementation should:

1. Add `pl_reports_config.py` with period keys, revenue/cost/expense status sets, invoice type rules
2. Add `pl_reports_router.py` aggregating invoice, vendor bill, and expense queries
3. Reuse period boundary helpers from `tax_reports_router.py` / `customer_ledger_router.py`
4. Reuse expense categories from `expense_config.py`
5. Add frontend page `/pl-reports` with tabs and export
6. Not duplicate invoice/bill/expense CRUD—read-only reporting layer

Suggested API endpoints:

- `GET /pl-reports/periods`
- `GET /pl-reports/summary?period=...`
- `GET /pl-reports/revenue?period=...`
- `GET /pl-reports/costs?period=...`
- `GET /pl-reports/expenses?period=...`
- `POST /pl-reports/export-log`

### 18.3 Future Integrations

- Cash-basis P&L using payment dates
- Inventory COGS from stock movements and product cost
- Payroll and depreciation journals
- Budget vs actual lines
- Project / deal profitability
- GL export and accounting system sync

---

## 19. Risks and Mitigations

1. **Risk:** Users treat CRM P&L as statutory audited accounts.  
   **Mitigation:** Prominent disclaimer; label “management P&L”; export footer note.

2. **Risk:** Vendor bills are not true COGS for all business types.  
   **Mitigation:** Label “Purchases / direct costs”; document Phase 1 proxy; Phase 2 inventory COGS.

3. **Risk:** Double-counting expenses and vendor bills.  
   **Mitigation:** Deduplicate via `expense_id` link; show excluded items in data quality panel.

4. **Risk:** Sales Reports revenue differs from P&L revenue.  
   **Mitigation:** Help text explaining pipeline/booked vs issued invoice accrual revenue.

5. **Risk:** GST report taxable totals differ from P&L revenue.  
   **Mitigation:** Cross-link help; both use subtotal ex-GST but credit note / status rules may differ slightly—align in implementation.

6. **Risk:** Mixed currency distorts totals.  
   **Mitigation:** Phase 1 single currency assumption with warning banner.

7. **Risk:** Write-offs handled inconsistently.  
   **Mitigation:** Explicit sign-off on write-off treatment before development.

---

## 20. Release Phasing

### Phase 1 (MVP)

- P&L summary dashboard with period filters
- Net revenue, purchases/costs, gross profit, operating expenses, net profit
- Margin % and period-over-period comparison
- Trailing 6-month trend
- Revenue, purchases, and expense registers with drill-down links
- Expense category breakdown
- Vendor bill / expense deduplication
- Data quality panel
- CSV export
- Permissions and nav entry

### Phase 2

- Cash-basis toggle
- PDF export with branding
- Write-off and adjustment lines on P&L
- Project / deal profitability view
- Customer and product revenue breakdown
- Budget vs actual comparison
- Manual journal adjustment entries
- Scheduled email export

### Phase 3

- Inventory-based COGS
- Payroll and depreciation integration
- Multi-currency normalization
- Consolidated multi-branch P&L
- AI-generated period commentary (optional)

---

## 21. UAT Acceptance Checklist

1. Summary net revenue matches sum of qualifying invoice subtotals minus credit notes for the period.
2. Purchases / costs match sum of qualifying vendor bill subtotals for the period.
3. Operating expenses match qualifying expenses minus deduplicated linked expenses.
4. Gross profit = net revenue − purchases/costs.
5. Net profit = gross profit − operating expenses.
6. Gross and net margin % calculate correctly when revenue > 0.
7. Previous period comparison uses equal-length prior range.
8. Draft/cancelled documents excluded from all totals.
9. Credit notes reduce net revenue in their issue period.
10. Expense linked to vendor bill appears in costs register context and is excluded from expense total.
11. CSV export matches on-screen summary and active register.
12. Drill-down links open correct invoice, vendor bill, and expense.
13. Permissions limit access to authorized roles.
14. Trend chart matches monthly totals for last 6 months.
15. Disclaimer visible on summary and export.

---

## 22. UI Suggestions Summary

1. Lead with **period selector** and **net profit KPI** at top for leadership scanning.
2. Show **statement table** with current vs previous period side by side.
3. Use **tabs** for Revenue / Costs / Expenses rather than separate routes in Phase 1.
4. Keep **category expense cards** visible on summary or expenses tab.
5. Surface **deduplication and exclusions** transparently—finance must trust the numbers.
6. Differentiate clearly from **Sales Reports**, **GST / Tax Reports**, and ledgers.

---

## 23. Open Product Questions for Final Sign-Off

1. Should Phase 1 revenue use **`subtotal` (ex-GST)** or **`grand_total` (inc-GST)**?
2. Should **write-offs** reduce net revenue in Phase 1 or appear informational only?
3. Are **vendor bills** the correct Phase 1 COGS proxy for all target customers (trading vs services)?
4. Should **approved but unpaid expenses** count, or only **paid** expenses?
5. Should **refunded invoices** reduce revenue in refund period?
6. Is **cash-basis P&L** required in Phase 1 for any user segment?
7. Should **Sales Reports booked revenue** appear as a comparison line on P&L (informational)?

---

## Appendix A: Suggested Screen Inventory

1. P&L Reports - Summary dashboard
2. P&L Reports - Revenue register (tab)
3. P&L Reports - Purchases / costs register (tab)
4. P&L Reports - Operating expenses register (tab)
5. Invoice / Vendor bill / Expense detail - “Included in P&L” indicator (embedded)

---

## Appendix B: Recommended Badge Labels

- Revenue
- Credit Note
- Purchase / Cost
- Operating Expense
- Excluded Draft
- Deduplicated
- Gross Profit
- Net Profit
- Negative Margin

---

## Appendix C: Phase 1 P&L Calculation Reference

| P&L line | Inclusion rule | Amount | Date field |
|----------|----------------|--------|------------|
| Gross sales | Issued standard-type invoices | `subtotal` | `issue_date` |
| Credit notes | Issued credit note invoices | `subtotal` | `issue_date` |
| Purchases / costs | Approved+ vendor bills | `subtotal` | `bill_date` |
| Operating expenses | Approved/paid expenses, not deduped | `amount` | `expense_date` |

---

## Appendix D: Example P&L Summary View

**Company:** BlackPapers Pvt Ltd · **Period:** June 2026 · **Currency:** INR

| | Current | Previous | Change |
|--|---------|----------|--------|
| Gross sales | ₹18,50,000 | ₹16,20,000 | +14.2% |
| Credit notes | ₹50,000 | ₹20,000 | |
| **Net revenue** | **₹18,00,000** | **₹16,00,000** | **+12.5%** |
| Purchases / direct costs | ₹9,40,000 | ₹8,80,000 | |
| **Gross profit** | **₹8,60,000** | **₹7,20,000** | **+19.4%** |
| Gross margin | 47.8% | 45.0% | |
| Operating expenses | ₹4,10,000 | ₹3,95,000 | |
| **Net profit** | **₹4,50,000** | **₹3,25,000** | **+38.5%** |
| Net margin | 25.0% | 20.3% | |

**Operating expenses by category (June 2026):**

| Category | Amount |
|----------|--------|
| Travel | ₹1,20,000 |
| Marketing | ₹95,000 |
| Software & Subscriptions | ₹80,000 |
| Professional Services | ₹65,000 |
| Miscellaneous | ₹50,000 |

---

## Appendix E: P&L Reports vs Related Modules

| Aspect | Sales Reports | GST / Tax Reports | P&L Reports | Customer Ledger |
|--------|---------------|-------------------|-------------|-------------------|
| Purpose | Sales performance & pipeline | Tax compliance registers | Management profit & loss | Per-customer AR statement |
| Primary data | Leads, deals, invoices (mixed) | Invoices & vendor bills (tax) | Invoices, vendor bills, expenses | One customer’s AR activity |
| Revenue basis | Booked/collected/pipeline | Taxable outward supplies | Issued invoice subtotal (ex-GST) | Customer billed/collected |
| Costs | Not primary | Inward tax totals | Vendor bills + expenses | — |
| User | Sales management | Finance, accountant | Finance, leadership | Finance, sales |
| Key metrics | Conversion, booked revenue | Taxable value, tax amount | Gross/net profit, margins | Running balance, outstanding |
| Export | CSV | CSV | CSV (Phase 1) | Customer statement CSV |

---

End of document.
