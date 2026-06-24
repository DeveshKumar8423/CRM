export const ASSET_CATEGORY_LABELS = {
  generator: "Generator",
  furniture: "Furniture",
  it: "IT equipment",
  construction: "Construction",
  av: "AV / events",
  other: "Other",
};

export const ASSET_STATUS_LABELS = {
  active: "Active",
  maintenance: "Maintenance",
  retired: "Retired",
};

export const CONTRACT_STATUS_LABELS = {
  draft: "Draft",
  confirmed: "Confirmed",
  delivered: "Delivered",
  on_rent: "On rent",
  return_scheduled: "Return scheduled",
  returned: "Returned",
  closed: "Closed",
  cancelled: "Cancelled",
};

export const RATE_BASIS_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export const RETURN_CONDITION_LABELS = {
  good: "Good",
  fair: "Fair",
  damaged: "Damaged",
};

export function contractStatusClass(status) {
  return `crm-badge crm-rental-status-${status || "draft"}`;
}

export function assetStatusClass(status) {
  return `crm-badge crm-rental-asset-${status || "active"}`;
}

export function formatCurrency(amount, currency = "INR") {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}
