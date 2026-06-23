export const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  partially_paid: "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  closed: "Closed",
};

export const PAYMENT_METHOD_LABELS = {
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  cheque: "Cheque",
  cash: "Cash",
  credit_card: "Credit Card",
  other: "Other",
};

export function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount || 0);
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function statusBadgeClass(status) {
  return `crm-badge crm-vb-${status}`;
}

export function emptyLineItem() {
  return {
    purchase_order_line_item_id: "",
    description: "",
    quantity: "1",
    unit: "Unit",
    unit_price: "0",
    tax_rate: "18",
  };
}

export function emptyForm() {
  return {
    title: "",
    supplier_invoice_number: "",
    currency: "INR",
    bill_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    payment_terms: "Net 30",
    purchase_order_id: "",
    vendor_name: "",
    vendor_email: "",
    vendor_phone: "",
    vendor_gstin: "",
    vendor_address: "",
    deal_id: "",
    contact_id: "",
    round_off: "0",
    internal_notes: "",
    line_items: [emptyLineItem()],
  };
}

export function computeLineTotals(line) {
  const qty = Number(line.quantity) || 0;
  const price = Number(line.unit_price) || 0;
  const taxRate = Number(line.tax_rate) || 0;
  const subtotal = qty * price;
  const tax = subtotal * (taxRate / 100);
  return { subtotal, tax, total: subtotal + tax };
}

export function computeBillTotals(lineItems, roundOff = 0) {
  let subtotal = 0;
  let totalTax = 0;
  lineItems.forEach((line) => {
    const t = computeLineTotals(line);
    subtotal += t.subtotal;
    totalTax += t.tax;
  });
  const ro = Number(roundOff) || 0;
  return { subtotal, totalTax, roundOff: ro, grandTotal: subtotal + totalTax + ro };
}

export { exportCsv, exportFilename, standardHeaderRows } from "./exportCsv";
