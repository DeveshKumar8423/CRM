export const PERIOD_LABELS = {
  today: "Today",
  week: "This week",
  month: "This month",
  quarter: "This quarter",
  custom: "Custom range",
};

export const REPORT_TABS = [
  { key: "overview", label: "Overview" },
  { key: "conversion", label: "Conversion" },
  { key: "revenue", label: "Revenue" },
  { key: "sources", label: "Lead sources" },
  { key: "team", label: "Team performance" },
  { key: "pending", label: "Pending deals" },
  { key: "pipeline", label: "Pipeline health" },
];

export function formatCurrency(value, currency = "INR") {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value) {
  if (value == null) return "—";
  return `${Number(value).toFixed(1)}%`;
}

export function buildReportParams(period, ownerId, dateFrom, dateTo) {
  const params = new URLSearchParams({ period });
  if (ownerId) params.set("owner_id", String(ownerId));
  if (period === "custom" && dateFrom) params.set("date_from", new Date(`${dateFrom}T00:00:00`).toISOString());
  if (period === "custom" && dateTo) params.set("date_to", new Date(`${dateTo}T23:59:59`).toISOString());
  return params;
}

export { exportCsv, exportFilename, standardHeaderRows } from "./exportCsv";

export function badgeClass(badge) {
  const map = {
    "High Performer": "crm-report-high_performer",
    Underperforming: "crm-report-underperforming",
    "Strong Source": "crm-report-strong_source",
    "Weak Source": "crm-report-weak_source",
    Overdue: "crm-report-overdue",
    Stale: "crm-report-stale",
    "High Value": "crm-report-high_value",
    "On Track": "crm-report-on_track",
    "At Risk": "crm-report-at_risk",
    "Needs Attention": "crm-report-needs_attention",
  };
  return `crm-badge ${map[badge] || "crm-report-default"}`;
}
