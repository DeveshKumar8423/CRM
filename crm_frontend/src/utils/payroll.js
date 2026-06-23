export const STATUS_LABELS = {
  draft: "Draft",
  generated: "Generated",
  paid: "Paid",
};

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatCurrency(amount) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function statusBadgeClass(status) {
  return `crm-payroll-status crm-payroll-status-${status || "generated"}`;
}
