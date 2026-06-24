export const BILLING_INTERVAL_LABELS = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  custom_days: "Custom days",
};

export const PLAN_STATUS_LABELS = {
  active: "Active",
  archived: "Archived",
};

export const SUBSCRIPTION_STATUS_LABELS = {
  trialing: "Trialing",
  active: "Active",
  past_due: "Past due",
  cancelled: "Cancelled",
  expired: "Expired",
};

export function subscriptionStatusClass(status) {
  return `crm-badge crm-sub-status-${status || "active"}`;
}

export function formatCurrency(amount, currency = "INR") {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}
