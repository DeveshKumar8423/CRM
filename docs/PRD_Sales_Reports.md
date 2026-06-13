# Product Requirements Document (PRD)
## Sales Reports (Level 2 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Sales Intelligence / Performance Analytics / Management Reporting  
**Document Version:** v1.0  
**Date:** 2026-06-13  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Sales Reports provides a dedicated reporting experience for measuring sales performance across conversion rate, revenue, lead source performance, sales executive performance, and pending deals. It should help managers, executives, and operators understand what is happening in the pipeline, where revenue is coming from, who is performing well, and which opportunities need attention.

The module must be highly visual, filterable, and drill-down friendly. It should transform raw CRM activity into actionable business insight while fitting naturally into the existing CRM dashboard and role-based experience.

---

## 2. Problem Statement

At present, sales data may be visible in operational screens such as leads, deals, quotations, orders, and invoices, but there is no clear dedicated analytics layer for management decisions. That means teams may struggle to answer questions like:

- What is our conversion rate from leads to deals or from deals to revenue?
- Which lead sources generate the best outcomes?
- Which sales executive is performing best by conversion, revenue, or deal velocity?
- Which deals are stuck and need follow-up?
- How much potential revenue is sitting in the pipeline right now?

Without a reporting layer, leadership must manually assemble data from multiple screens.

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a single sales reporting surface for core performance metrics.
2. Show conversion rate, revenue, lead source performance, sales executive performance, and pending deals.
3. Allow managers to filter, compare, and drill down into performance by time, team, source, and stage.
4. Make it easy to identify bottlenecks, high performers, and pipeline risk.
5. Support both high-level dashboard cards and detailed reporting tables/charts.
6. Enable exportable, presentation-friendly reporting views for management use.

### 3.2 Non-Goals (This Phase)

1. Full business intelligence platform with custom SQL-like report building.
2. Predictive forecasting or AI-driven revenue prediction.
3. Territory planning, quota planning, or compensation calculation.
4. Cross-company benchmark analytics beyond the CRM dataset.
5. Deep statistical modeling or data warehouse-style semantic layer design.

---

## 4. Target Users and Roles

### 4.1 Primary Users

- Sales Manager: Reviews performance, pipeline health, and team output.
- Admin: Monitors company-wide numbers and configuration-driven reporting.
- Sales Executive: Views personal performance and pending work.
- Leadership / Founder: Reviews revenue and conversion trends.

### 4.2 Secondary Users

- Operations Manager: Reads pipeline conversion and pending deal status.
- Finance User: Views sales-to-revenue activity at a summary level.
- Team Lead: Uses reporting to coach individual sales members.

---

## 5. Scope Overview

### 5.1 In Scope

- Sales dashboard with KPI cards and charts
- Conversion rate reporting
- Revenue reporting
- Lead source performance reporting
- Sales executive performance reporting
- Pending deals and deal aging reporting
- Filterable, drill-down reporting tables
- Time-based comparisons and trend views
- Export and share-friendly report views
- Role-specific report visibility

### 5.2 Out of Scope (Phase 1)

- Custom report designer
- Multi-source data blending outside CRM records
- Predictive sales scoring or AI recommendation engine
- Automated executive narration or commentary generation
- Finance accounting reconciliation reporting

---

## 6. Core Product Concept

Sales Reports should answer the business’s most common sales questions quickly and clearly. The user should be able to start with a high-level KPI, drill into the underlying dataset, and then jump to the relevant CRM record if action is needed.

The product should support a top-down analytics model:

- Top row: KPI cards and trend indicators
- Middle section: charts and breakdowns
- Bottom section: ranked tables and drill-down lists

The reporting layer must remain simple enough for daily use while still being useful for weekly and monthly management reviews.

---

## 7. Reporting Domains

### 7.1 Conversion Reporting

Measures how effectively leads move through the sales process into deals, quotations, orders, and eventually revenue outcomes.

### 7.2 Revenue Reporting

Tracks total revenue, expected revenue, collected revenue, outstanding potential, and trends over time.

### 7.3 Lead Source Performance

Measures which acquisition channels or sources produce the best conversion and revenue outcomes.

### 7.4 Sales Executive Performance

Compares performance by individual sales owner across volume, value, conversion, and deal progression.

### 7.5 Pending Deals Reporting

Surfaces opportunities that require attention because they are stale, overdue, blocked, or likely at risk.

### 7.6 Pipeline Health Reporting

Shows the health of the current sales pipeline by stage, aging, and value concentration.

---

## 8. Information Architecture and Navigation

### 8.1 Entry Points

- Main nav: Sales Reports
- Dashboard shortcut: Sales Analytics
- Manager dashboard widget: key sales summary
- Deal / lead views: contextual “View report” entry points

### 8.2 Primary Screens

1. Sales Reports Overview
2. Conversion Rate Report
3. Revenue Report
4. Lead Source Performance Report
5. Sales Executive Performance Report
6. Pending Deals Report
7. Pipeline Health Report
8. Report Detail / Drill-Down View
9. Export / Share View

### 8.3 Suggested Navigation Structure

- Overview
- Conversion
- Revenue
- Sources
- Team Performance
- Pending Deals
- Pipeline Health
- Exports

---

## 9. Detailed Functional Requirements

## 9.1 Sales Reports Overview Page

### Required Elements

- KPI summary cards:
  - Conversion rate
  - Revenue
  - Pending deals value
  - Average deal size
  - Closed won count
  - Deal aging indicator
- Time period selector:
  - today
  - this week
  - this month
  - quarter
  - custom range
- Team scope selector:
  - all sales
  - specific executive
  - manager team view
- Trend line or bar summary for main metrics
- Top pending deals widget
- Top lead sources widget
- Top performers widget

### UX Behaviors

- Default view should open with the current month or current quarter.
- KPI cards should be immediately understandable without chart interpretation.
- Clicking a KPI should drill into the relevant detailed report.

## 9.2 Conversion Rate Report

### Metrics

- Lead-to-deal conversion rate
- Deal-to-win conversion rate
- Quote-to-order conversion rate where applicable
- Order-to-invoice conversion visibility where relevant for sales closure
- Conversion by source, owner, and time period

### Report Layout

- Conversion trend chart
- Funnel visualization
- Conversion table by owner/source/stage
- Comparison against previous period

### Required Behaviors

- Show both count-based and value-based conversion where useful.
- Allow the user to compare multiple periods side by side.
- Display conversion drop-off points clearly.

## 9.3 Revenue Report

### Metrics

- Total revenue booked
- Revenue from won deals
- Revenue by product/service category
- Revenue by customer
- Revenue by salesperson
- Expected revenue from open pipeline
- Collected vs outstanding revenue when invoice data is available

### Report Layout

- Revenue trend chart over time
- Revenue by source breakdown
- Revenue by owner ranking
- Revenue by customer table
- Top contributing deals/customers widget

### Required Behaviors

- Support gross and net reporting labels where applicable.
- Show revenue trends in a way that supports month-over-month review.
- Allow the user to jump from a revenue row to the underlying deal/order/invoice.

## 9.4 Lead Source Performance Report

### Metrics

- Leads generated by source
- Source conversion rate
- Revenue per source
- Average deal size by source
- Source quality by stage progression
- Source aging and drop-off rate

### Source Categories

- Omnichannel
- Referral
- Website
- Social media
- Direct
- Partner
- Event
- Import / CSV
- Custom source labels

### Report Layout

- Source ranking table
- Source conversion chart
- Source-to-revenue funnel comparison
- Source quality score indicator

### Required Behaviors

- Allow comparison between top-performing and low-performing lead sources.
- Show both quantity and quality so a high-volume source does not mask poor conversion.
- Make it easy to identify which channels deserve more investment.

## 9.5 Sales Executive Performance Report

### Metrics

- Leads handled
- Deals created
- Conversion rate
- Revenue closed
- Average deal size
- Pending deal count
- Overdue follow-up count
- Win rate
- Average sales cycle time

### Report Layout

- Leaderboard table
- Executive comparison chart
- Performance summary cards
- Detail drill-down per executive

### Required Behaviors

- Support self-view, manager view, and admin view.
- Allow ranking by multiple metrics, not just revenue.
- Show a balanced view so volume and quality are both visible.

## 9.6 Pending Deals Report

### Metrics

- Number of open deals
- Pending value
- Deals by stage
- Deals past expected close date
- Stale deals by aging bucket
- Deals with no recent activity
- Deals missing owner or next action

### Report Layout

- Pending deals table
- Aging buckets chart
- Stale pipeline list
- High-value at-risk deals widget

### Required Behaviors

- Flag deals that have not moved for a defined period.
- Surface the next action or owner where available.
- Make it easy for a manager to act immediately on stalled deals.

## 9.7 Pipeline Health Report

### Metrics

- Value by stage
- Number of deals by stage
- Stage aging
- Stage velocity
- Stage conversion ratio
- Concentration risk by large deals

### Report Layout

- Stage bar chart or pipeline board summary
- Aging distribution chart
- Deal count vs value comparison
- Risk indicators for slow-moving stages

### Required Behaviors

- Help users see whether the pipeline is healthy or overloaded in one stage.
- Highlight pipeline concentration risk where a few large deals dominate the forecast.

## 9.8 Drill-Down Reporting

### Required Behaviors

- Every chart or KPI should support drill-down to the underlying data.
- Drill-down tables should preserve filters from the parent report.
- Users should be able to jump from a report row to the original lead, deal, quotation, order, or invoice.

### Drill-Down UX

- Right-side drawer or dedicated detail page
- Breadcrumbs showing report context
- Quick action links to underlying CRM records

## 9.9 Export and Sharing

### Required Behaviors

- Export current report view to spreadsheet-friendly format
- Export charts and tables to presentation-friendly output
- Share current filtered view through a link or saved report state where allowed
- Print-friendly report view for management review

### UX Suggestions

- Prominent export button near page title
- Clear indication of applied filters in exported content
- Optional report snapshot header with date range and owner scope

---

## 10. UI / UX Specifications

## 10.1 Visual Language

- Use a clean analytics style that still matches the CRM’s existing panel and card system.
- KPI cards should be visually dominant and easy to scan.
- Charts should be practical and comparison-oriented rather than decorative.

## 10.2 Suggested Layouts

### Reports Overview

- Top row: KPI cards
- Middle row: charts and comparisons
- Bottom row: ranking tables and pending deal lists

### Detailed Report Page

- Header with selected filters and export actions
- Main chart or funnel visualization
- Supporting comparison table below
- Drill-down table drawer or section

### Manager View

- Emphasize ranking, comparisons, and risk flags
- Keep key attention items above the fold

## 10.3 Interaction Patterns

- Filters should update reports quickly and clearly.
- Period selectors should be consistent across all report types.
- Report cards should show delta versus previous period when possible.
- Drill-down should feel immediate and preserve context.

## 10.4 Empty, Loading, and Error States

- Empty states should explain whether no data exists or no results match filters.
- Loading states should use skeleton cards for KPIs and charts.
- Error states should avoid technical language and encourage retry.

## 10.5 Accessibility

- Charts should have textual summaries and not rely on color alone.
- Tables should remain usable without visual chart interpretation.
- Keyboard navigation should work for filters, tabs, and drill-down controls.
- Form labels and date selectors must be explicit.

---

## 11. Reporting Filters and Dimensions

### Required Global Filters

- Date range
- Owner / salesperson
- Team / role
- Lead source
- Deal stage
- Customer
- Product/service category
- Conversion status
- Revenue bucket

### Suggested Comparison Dimensions

- Current vs previous period
- Month over month
- Quarter over quarter
- Team vs team
- Executive vs executive
- Source vs source

---

## 12. Permission Model (Product-Level Behavior)

### Suggested Permission Capabilities

- reports.view
- reports.view_team
- reports.view_company
- reports.view_financial
- reports.export
- reports.manage_saved_views

### Role Expectations

- Sales Executive: view own performance and assigned pipeline metrics
- Team Lead / Manager: view team performance and pending deal risk
- Admin: view all reports and exports
- Finance/Leadership: view revenue and collection-oriented summaries where permitted

---

## 13. Data Fields (UI-Centric Definition)

### 13.1 Core Report Fields

- Date range
- Source type
- Owner
- Team
- Stage
- Revenue amount
- Deal count
- Conversion count
- Pending value
- Aging bucket

### 13.2 Executive Performance Fields

- Leads handled
- Deals created
- Closed won count
- Win rate
- Average deal size
- Follow-up lag
- Pending deal count

### 13.3 Revenue Fields

- Booked revenue
- Forecast revenue
- Expected revenue
- Collected revenue
- Outstanding revenue
- Revenue by customer/source/category

### 13.4 Drill-Down Fields

- Source record link
- Related lead/deal/order/invoice
- Responsible owner
- Last activity date
- Next action date

---

## 14. Validation and Business Rules

1. Reports must respect the selected time period and filters consistently.
2. Conversion metrics should be defined clearly so users understand what is being measured.
3. Revenue values should not mix incompatible document states unless explicitly labeled.
4. Pending deal lists should distinguish between open, stale, overdue, and blocked opportunities.
5. Sales executive rankings should support multiple sorting metrics.
6. Drill-down views should preserve report context.
7. Exports should reflect the same filters and time range visible on screen.

---

## 15. Notifications and Reminders

### Internal Reporting Alerts

- Weekly summary ready
- Revenue target at risk
- Pipeline aging exceeds threshold
- Sales executive below target
- Lead source underperforming
- Pending deal backlog increasing

### UX Suggestions

- Optional dashboard notification cards for managers
- Visible insight flags on reports where performance changes sharply

---

## 16. Reporting Insights and Scorecards

### Recommended Scorecards

- Conversion rate score
- Revenue score
- Pipeline health score
- Source quality score
- Sales activity score
- Pending deal risk score

### UI Suggestions

- Show scorecards as concise summary cards with trend arrows.
- Use explanatory labels so the score is understandable without a legend.

---

## 17. Analytics Events

- sales_report_viewed
- sales_report_filtered
- sales_report_drilled_down
- sales_report_exported
- conversion_report_opened
- revenue_report_opened
- lead_source_report_opened
- executive_performance_report_opened
- pending_deals_report_opened
- pipeline_health_report_opened

Event payload should include date range, role, team scope, source filters, and report type.

---

## 18. Risks and Mitigations

1. Risk: Users do not trust report numbers.  
   Mitigation: Keep metric definitions visible and consistent across reports.

2. Risk: Reports are too dense for quick management use.  
   Mitigation: Lead with KPI cards and simple charts, then drill into tables.

3. Risk: Sales executives feel over-monitored.  
   Mitigation: Keep personal views clear and role-appropriate.

4. Risk: Pending deal reports become noisy.  
   Mitigation: Prioritize stale, overdue, and high-value items first.

5. Risk: Revenue and conversion definitions vary by user.  
   Mitigation: Standardize terminology in the UI and report headers.

---

## 19. Release Phasing

### Phase 1 (MVP)

- Sales reports overview
- Conversion rate report
- Revenue report
- Lead source performance report
- Sales executive performance report
- Pending deals report
- Basic drill-down and export

### Phase 2

- Pipeline health report
- Trend comparison and period comparisons
- Saved views and alert summaries
- Better executive scorecards

### Phase 3

- More advanced segmentation
- Deeper cross-module revenue insights
- Presentation-ready report packs

---

## 20. UAT Acceptance Checklist

1. User can view conversion rate, revenue, lead source performance, executive performance, and pending deal metrics.
2. User can filter reports by time period, owner, team, source, and stage.
3. User can drill down from a KPI or chart into underlying records.
4. Revenue report shows clear comparisons over time.
5. Lead source report clearly ranks sources by quality and value.
6. Executive performance report supports ranking and comparison.
7. Pending deals report flags stale and overdue items.
8. Export matches the currently filtered view.
9. Permissions limit report visibility correctly by role.
10. The UI presents insight clearly enough for management review without needing manual data assembly.

---

## 21. UI Suggestions Summary

1. Make the overview page instantly useful with KPI cards and a short trend strip.
2. Keep the reports organized by business question instead of data source.
3. Use drill-downs generously so users can move from insight to action.
4. Surface pending and stale deals prominently because they need immediate follow-up.
5. Make lead source comparisons visually obvious so marketing and sales decisions are easier.
6. Balance charts and tables so the report is both readable and actionable.

---

## 22. Open Product Questions for Final Sign-Off

1. What exact conversion definitions should be used for each stage of the pipeline?
2. Should revenue reports reflect invoiced revenue, closed-won value, or both?
3. Should sales executives be able to see only their own reports or also team averages?
4. Which lead source taxonomy should be standardized in the report UI?
5. Should pending deal aging thresholds be configurable by management?

---

## Appendix A: Suggested Screen Inventory

1. Sales Reports - Overview
2. Sales Reports - Conversion Rate
3. Sales Reports - Revenue
4. Sales Reports - Lead Source Performance
5. Sales Reports - Sales Executive Performance
6. Sales Reports - Pending Deals
7. Sales Reports - Pipeline Health
8. Sales Reports - Drill-Down Detail
9. Sales Reports - Export Preview

---

## Appendix B: Recommended Badge Labels

- On Track
- At Risk
- Stale
- Overdue
- High Performer
- Underperforming
- Strong Source
- Weak Source
- High Value
- Pending Action

---

End of document.
