export const STATUS_LABELS = {
  draft: "Draft",
  awaiting_confirmation: "Awaiting Customer Confirmation",
  confirmed: "Confirmed",
  in_preparation: "In Preparation",
  partially_delivered: "Partially Delivered",
  delivered: "Delivered",
  in_billing: "In Billing",
  in_execution: "In Execution",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
  closed: "Closed",
};

export const ORDER_TYPES = {
  delivery: "Delivery",
  service_execution: "Service Execution",
  billing_only: "Billing Only",
  mixed: "Mixed",
};

export function formatCurrency(value, currency = "INR") {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function statusBadgeClass(status) {
  return `crm-badge crm-order-${status}`;
}

export function computeLineTotals(item) {
  const qty = Number(item.quantity) || 0;
  const unitPrice = Number(item.unit_price) || 0;
  const discountPercent = Number(item.discount_percent) || 0;
  const discountAmount = Number(item.discount_amount) || 0;
  const taxRate = Number(item.tax_rate) || 0;
  const lineSubtotal = qty * unitPrice;
  const lineDiscount = discountAmount > 0 ? discountAmount : lineSubtotal * (discountPercent / 100);
  const afterDiscount = Math.max(lineSubtotal - lineDiscount, 0);
  const lineTax = afterDiscount * (taxRate / 100);
  return { lineSubtotal, lineDiscount, lineTax, lineTotal: afterDiscount + lineTax };
}

export function computeOrderTotals(lineItems, headerDiscountAmount, headerDiscountPercent) {
  let subtotal = 0;
  let lineDiscountTotal = 0;
  let totalTax = 0;
  lineItems.forEach((item) => {
    const { lineSubtotal, lineDiscount, lineTax } = computeLineTotals(item);
    subtotal += lineSubtotal;
    lineDiscountTotal += lineDiscount;
    totalTax += lineTax;
  });
  const afterLineDiscounts = Math.max(subtotal - lineDiscountTotal, 0);
  const headerDiscount = headerDiscountAmount > 0
    ? headerDiscountAmount
    : afterLineDiscounts * ((headerDiscountPercent || 0) / 100);
  const taxable = Math.max(afterLineDiscounts - headerDiscount, 0);
  const taxScale = afterLineDiscounts > 0 ? taxable / afterLineDiscounts : 0;
  totalTax *= taxScale;
  return { subtotal, lineDiscountTotal, headerDiscount, totalTax, grandTotal: taxable + totalTax };
}

export const emptyLineItem = () => ({
  product_id: "",
  sort_order: 0,
  section: "",
  item_name: "",
  description: "",
  quantity: "1",
  unit: "Service",
  unit_price: "",
  discount_percent: "0",
  discount_amount: "0",
  tax_rate: "18",
});

export const emptyMilestone = () => ({
  sort_order: 0,
  title: "",
  description: "",
  status: "pending",
  due_date: "",
  owner_id: "",
});

export const emptyForm = () => ({
  title: "",
  order_type: "mixed",
  currency: "INR",
  order_date: new Date().toISOString().slice(0, 10),
  due_date: "",
  internal_target_date: "",
  quotation_id: "",
  deal_id: "",
  lead_id: "",
  contact_id: "",
  assigned_to_id: "",
  client_name: "",
  client_email: "",
  client_phone: "",
  client_org: "",
  attention_to: "",
  billing_address: "",
  delivery_address: "",
  header_discount_amount: "0",
  header_discount_percent: "0",
  billing_notes: "",
  payment_milestone_notes: "",
  delivery_instructions: "",
  internal_notes: "",
  line_items: [emptyLineItem()],
  milestones: [],
});
