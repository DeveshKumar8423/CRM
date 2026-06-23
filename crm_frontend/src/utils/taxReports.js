export const PERIOD_LABELS = {
  month: "This month",
  last_month: "Last month",
  quarter: "This quarter (FY)",
  financial_year: "This financial year",
  last_financial_year: "Last financial year",
  custom: "Custom range",
};

export const REPORT_TABS = [
  { key: "overview", label: "Overview", permission: "tax_reports.view" },
  { key: "sales", label: "Sales (Outward)", permission: "tax_reports.view_sales" },
  { key: "purchase", label: "Purchase (Inward)", permission: "tax_reports.view_purchase" },
  { key: "summary", label: "Summary", permission: "tax_reports.view_summary" },
];

export const REPORT_ENDPOINTS = {
  overview: "/tax-reports/overview",
  sales: "/tax-reports/sales",
  purchase: "/tax-reports/purchase",
  summary: "/tax-reports/summary",
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

export function exportFilename(reportType, period, periodLabel) {
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = (periodLabel || period).replace(/[^\w-]+/g, "-").replace(/-+/g, "-");
  return `gst-${reportType}-${slug}-${stamp}.csv`;
}

export function badgeClass(type) {
  const map = {
    outward: "crm-tax-outward",
    inward: "crm-tax-inward",
    b2b: "crm-tax-b2b",
    b2c: "crm-tax-b2c",
    missing_gstin: "crm-tax-missing-gstin",
    credit_note: "crm-tax-credit-note",
    informational: "crm-tax-informational",
  };
  return `crm-badge ${map[type] || ""}`;
}

export function canViewTab(tab, hasPermission) {
  const perm = tab.permission;
  if (hasPermission(perm)) return true;
  if (hasPermission("tax_reports.view")) return true;
  return hasPermission("reports.view_financial");
}

export function canExportReport(hasPermission) {
  return hasPermission("tax_reports.export") || hasPermission("reports.export");
}
