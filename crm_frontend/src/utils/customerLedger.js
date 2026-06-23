export const PERIOD_LABELS = {
  all_time: "All time",
  month: "This month",
  last_month: "Last month",
  quarter: "This quarter (FY)",
  financial_year: "This financial year",
  last_financial_year: "Last financial year",
  custom: "Custom range",
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

export function buildStatementParams(period, dateFrom, dateTo, page) {
  const params = new URLSearchParams({ period });
  if (period === "custom" && dateFrom) {
    params.set("date_from", new Date(`${dateFrom}T00:00:00`).toISOString());
  }
  if (period === "custom" && dateTo) {
    params.set("date_to", new Date(`${dateTo}T23:59:59`).toISOString());
  }
  if (page) params.set("page", String(page));
  return params;
}

export function buildIndexParams({ search, outstandingOnly, overdueOnly, sort, page }) {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  if (outstandingOnly) params.set("outstanding_only", "true");
  if (overdueOnly) params.set("overdue_only", "true");
  if (sort) params.set("sort", sort);
  if (page) params.set("page", String(page));
  return params;
}

export { exportCsv, standardHeaderRows } from "./exportCsv";

export function entryBadgeClass(type) {
  const map = {
    invoice: "crm-cl-invoice",
    payment: "crm-cl-payment",
    credit_note: "crm-cl-credit",
    debit_note: "crm-cl-debit",
    write_off: "crm-cl-writeoff",
  };
  return `crm-badge ${map[type] || ""}`;
}

export function canViewLedger(hasPermission) {
  return (
    hasPermission("customer_ledger.view")
    || hasPermission("invoices.view")
    || hasPermission("payments.view")
  );
}

export function canExportLedger(hasPermission) {
  return (
    hasPermission("customer_ledger.export")
    || hasPermission("reports.export")
    || hasPermission("invoices.view")
  );
}
