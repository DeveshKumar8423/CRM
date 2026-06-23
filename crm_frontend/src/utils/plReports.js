export const PERIOD_LABELS = {
  month: "This month",
  last_month: "Last month",
  quarter: "This quarter (FY)",
  financial_year: "This financial year",
  last_financial_year: "Last financial year",
  custom: "Custom range",
};

export const REPORT_TABS = [
  { key: "summary", label: "Summary" },
  { key: "revenue", label: "Revenue" },
  { key: "costs", label: "Costs" },
  { key: "expenses", label: "Expenses" },
];

export const REPORT_ENDPOINTS = {
  summary: "/pl-reports/summary",
  revenue: "/pl-reports/revenue",
  costs: "/pl-reports/costs",
  expenses: "/pl-reports/expenses",
};

export function formatCurrency(value, currency = "INR") {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN");
}

export function formatPct(value) {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function buildReportParams(period, dateFrom, dateTo, search, page) {
  const params = new URLSearchParams({ period });
  if (period === "custom" && dateFrom) {
    params.set("date_from", new Date(`${dateFrom}T00:00:00`).toISOString());
  }
  if (period === "custom" && dateTo) {
    params.set("date_to", new Date(`${dateTo}T23:59:59`).toISOString());
  }
  if (search?.trim()) params.set("search", search.trim());
  if (page) params.set("page", String(page));
  return params;
}

export { exportCsv, standardHeaderRows } from "./exportCsv";

export function exportFilename(period, periodLabel) {
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = (periodLabel || period).replace(/[^\w-]+/g, "-").replace(/-+/g, "-");
  return `pl-report-${slug}-${stamp}.csv`;
}

export function badgeClass(type) {
  const map = {
    revenue: "crm-pl-revenue",
    credit: "crm-pl-credit",
    cost: "crm-pl-cost",
    expense: "crm-pl-expense",
    linked: "crm-pl-linked",
    profit: "crm-pl-profit",
    loss: "crm-pl-loss",
  };
  return `crm-badge ${map[type] || ""}`;
}

export function canViewPL(hasPermission) {
  return hasPermission("pl_reports.view") || hasPermission("reports.view_financial");
}

export function canExportPL(hasPermission) {
  return hasPermission("pl_reports.export") || hasPermission("reports.export");
}

export function profitClass(value) {
  if (value == null) return "";
  return value >= 0 ? "crm-pl-profit-value" : "crm-pl-loss-value";
}

export function changeClass(value) {
  if (value == null || value === 0) return "crm-muted";
  return value >= 0 ? "crm-pl-positive" : "crm-pl-negative";
}
