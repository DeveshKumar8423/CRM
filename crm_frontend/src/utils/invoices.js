export { parseBankInstructions } from "./bankDetails";

export const STATUS_LABELS = {

  draft: "Draft",

  awaiting_review: "Awaiting Review",

  approved: "Approved",

  issued: "Issued",

  sent: "Sent",

  viewed: "Viewed",

  partially_paid: "Partially Paid",

  paid: "Paid",

  overdue: "Overdue",

  cancelled: "Cancelled",

  refunded: "Refunded",

  written_off: "Written Off",

  closed: "Closed",

};



export const INVOICE_TYPES = {

  standard: "Standard",

  advance: "Advance",

  interim: "Interim",

  final: "Final",

  credit_note: "Credit Note",

  debit_note: "Debit Note",

  pro_forma: "Pro Forma",

};



export function formatCurrency(value, currency = "INR") {

  if (value == null) return "—";

  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);

}



export function formatDate(value) {

  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

}



export function formatInvoiceDate(value) {

  if (!value) return "—";

  const d = new Date(value);

  const day = String(d.getDate()).padStart(2, "0");

  const month = String(d.getMonth() + 1).padStart(2, "0");

  const year = d.getFullYear();

  return `${day}/${month}/${year}`;

}



export function statusBadgeClass(status) {
  return `crm-badge crm-invoice-${status}`;
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



export function computeInvoiceTotals(lineItems, headerDiscountAmount, headerDiscountPercent, roundOff = 0) {

  let subtotal = 0, lineDiscountTotal = 0, totalTax = 0;

  lineItems.forEach((item) => {

    const { lineSubtotal, lineDiscount, lineTax } = computeLineTotals(item);

    subtotal += lineSubtotal;

    lineDiscountTotal += lineDiscount;

    totalTax += lineTax;

  });

  const afterLineDiscounts = Math.max(subtotal - lineDiscountTotal, 0);

  const headerDiscount = headerDiscountAmount > 0 ? headerDiscountAmount : afterLineDiscounts * ((headerDiscountPercent || 0) / 100);

  const taxable = Math.max(afterLineDiscounts - headerDiscount, 0);

  const taxScale = afterLineDiscounts > 0 ? taxable / afterLineDiscounts : 0;

  totalTax *= taxScale;

  const grandTotal = taxable + totalTax + (Number(roundOff) || 0);

  return { subtotal, lineDiscountTotal, headerDiscount, totalTax, grandTotal };

}



export const emptyLineItem = () => ({

  product_id: "", sort_order: 0, section: "", item_name: "", description: "",

  quantity: "1", unit: "Service", unit_price: "", discount_percent: "0", discount_amount: "0", tax_rate: "0",

});



export const DEFAULT_INVOICE_PAYMENT_TERMS = "Due on receipt";



export const DEFAULT_INVOICE_BANK_INSTRUCTIONS = (

  "Bank Name: Kotak Bank\n"

  + "A/c No.: 1910202300\n"

  + "IFSC: KKBK0004599\n"

  + "UPI ID: blackpapers@kotak\n"

  + "Account Type: Current Account"

);



export const DEFAULT_INVOICE_BILLING_NOTES = "Thank you for your business with us!";



export const emptyForm = () => ({

  title: "", invoice_type: "standard", currency: "INR",

  issue_date: new Date().toISOString().slice(0, 10), due_date: "",

  sales_order_id: "", quotation_id: "", deal_id: "", contact_id: "", assigned_to_id: "",

  client_name: "", client_email: "", client_phone: "", client_org: "", client_gstin: "",

  attention_to: "", billing_address: "", header_discount_amount: "0", header_discount_percent: "0", round_off: "0",

  payment_terms: DEFAULT_INVOICE_PAYMENT_TERMS,

  bank_instructions: DEFAULT_INVOICE_BANK_INSTRUCTIONS,

  billing_notes: DEFAULT_INVOICE_BILLING_NOTES,

  internal_notes: "",

  line_items: [emptyLineItem()],

});

