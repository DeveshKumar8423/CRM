export const STATUS_LABELS = {
  not_tracked: "Not Tracked",
  awaiting_opening: "Awaiting Opening",
  active: "Active",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  inactive: "Inactive",
};

export const MOVEMENT_LABELS = {
  opening: "Opening",
  purchase: "Purchase",
  sale: "Sale",
  damage: "Damage",
  adjustment: "Adjustment",
};

export const DAMAGE_REASON_LABELS = {
  breakage: "Breakage",
  spoilage: "Spoilage",
  transit_loss: "Transit Loss",
  quality_rejection: "Quality Rejection",
  obsolete_write_off: "Obsolete Write-off",
};

export const ADJUSTMENT_REASON_LABELS = {
  stock_count_correction: "Stock Count Correction",
  system_migration: "System Migration",
  found_stock: "Found Stock",
  data_cleanup: "Data Cleanup",
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
  return `crm-badge crm-inv-${status}`;
}

export function movementBadgeClass(type) {
  return `crm-badge crm-inv-move-${type}`;
}

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
