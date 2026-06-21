export const IN_REASON_LABELS = {
  purchase_receipt: "Purchase receipt",
  customer_return: "Customer return",
  transfer_in: "Transfer in",
  found_stock: "Found stock",
  stock_count_correction_in: "Stock count correction (increase)",
  other: "Other",
};

export const OUT_REASON_LABELS = {
  sale_dispatch: "Sale / dispatch",
  internal_consumption: "Internal consumption",
  damage: "Damage",
  transfer_out: "Transfer out",
  write_off: "Write-off",
  stock_count_correction_out: "Stock count correction (decrease)",
  other: "Other",
};

export const REFERENCE_REQUIRED = new Set([
  "purchase_receipt",
  "sale_dispatch",
  "transfer_in",
  "transfer_out",
]);

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function directionBadgeClass(direction) {
  return direction === "in" ? "crm-badge crm-sm-in" : "crm-badge crm-sm-out";
}

export function directionLabel(direction) {
  return direction === "in" ? "Stock In" : "Stock Out";
}

export function reasonLabel(reason, direction) {
  if (direction === "in") return IN_REASON_LABELS[reason] || reason;
  return OUT_REASON_LABELS[reason] || reason;
}

export function exportCsv(filename, headers, rows) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function emptyForm(productId = "") {
  return {
    product_id: productId,
    quantity: "",
    reason: "",
    movement_date: new Date().toISOString().slice(0, 10),
    reference_number: "",
    reference_type: "manual",
    notes: "",
    unit_valuation: "",
  };
}
