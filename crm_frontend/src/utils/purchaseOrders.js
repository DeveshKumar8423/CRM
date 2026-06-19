export const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  sent_to_vendor: "Sent to Vendor",
  partially_received: "Partially Received",
  fully_received: "Fully Received",
  partially_billed: "Partially Billed",
  fully_billed: "Fully Billed",
  closed: "Closed",
  cancelled: "Cancelled",
};

export const PAYMENT_TERM_LABELS = {
  due_on_receipt: "Due on Receipt",
  net_15: "Net 15",
  net_30: "Net 30",
  net_45: "Net 45",
  net_60: "Net 60",
  advance_50_on_delivery_50: "50% Advance, 50% on Delivery",
  custom: "Custom",
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
  return `crm-badge crm-po-${status}`;
}

export function computeLineTotals(item) {
  const qty = Number(item.ordered_quantity) || 0;
  const unitPrice = Number(item.unit_price) || 0;
  const taxRate = Number(item.tax_rate) || 0;
  const lineSubtotal = qty * unitPrice;
  const lineTax = lineSubtotal * (taxRate / 100);
  return { lineSubtotal, lineTax, lineTotal: lineSubtotal + lineTax };
}

export function computePoTotals(lineItems) {
  let subtotal = 0;
  let totalTax = 0;
  lineItems.forEach((item) => {
    const { lineSubtotal, lineTax } = computeLineTotals(item);
    subtotal += lineSubtotal;
    totalTax += lineTax;
  });
  return { subtotal, totalTax, grandTotal: subtotal + totalTax };
}

export const emptyLineItem = () => ({
  product_id: "",
  description: "",
  sku: "",
  unit: "Unit",
  ordered_quantity: "1",
  unit_price: "0",
  tax_rate: "18",
});

export const emptyForm = () => ({
  title: "",
  vendor_name: "",
  vendor_contact: "",
  vendor_email: "",
  vendor_phone: "",
  currency: "INR",
  payment_terms: "net_30",
  po_date: new Date().toISOString().slice(0, 10),
  expected_delivery_date: "",
  delivery_location: "",
  notes: "",
  internal_reference: "",
  vendor_quote_reference: "",
  cost_center: "",
  deal_id: "",
  contact_id: "",
  line_items: [emptyLineItem()],
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
