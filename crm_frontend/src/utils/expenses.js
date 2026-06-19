export const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const CATEGORY_LABELS = {
  travel: "Travel",
  meals_entertainment: "Meals & Entertainment",
  office_supplies: "Office Supplies",
  software_subscriptions: "Software & Subscriptions",
  marketing: "Marketing",
  client_gifts: "Client Gifts",
  logistics_courier: "Logistics & Courier",
  repairs_maintenance: "Repairs & Maintenance",
  professional_services: "Professional Services",
  miscellaneous: "Miscellaneous",
};

export const PAYMENT_MODE_LABELS = {
  cash: "Cash",
  company_card: "Company Card",
  personal_reimbursement: "Personal Reimbursement",
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  petty_cash: "Petty Cash",
  other: "Other",
};

export function formatCurrency(value, currency = "INR") {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function statusBadgeClass(status) {
  return `crm-badge crm-expense-${status}`;
}

export const emptyForm = () => ({
  title: "",
  category: "miscellaneous",
  vendor_name: "",
  amount: "",
  tax_amount: "0",
  currency: "INR",
  expense_date: new Date().toISOString().slice(0, 10),
  reimbursement_due_date: "",
  payment_mode: "personal_reimbursement",
  notes: "",
  receipt_reference: "",
  cost_center: "",
  deal_id: "",
  contact_id: "",
});

export function exportCsv(filename, headers, rows) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
