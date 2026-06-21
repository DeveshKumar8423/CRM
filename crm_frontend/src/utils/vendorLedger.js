export { PERIOD_LABELS, formatCurrency, formatDate, buildStatementParams, buildIndexParams, exportCsv } from "./customerLedger";

export function entryBadgeClass(type) {
  const map = {
    bill: "crm-vl-bill",
    payment: "crm-vl-payment",
  };
  return `crm-badge ${map[type] || ""}`;
}

export function canViewVendorLedger(hasPermission) {
  return hasPermission("vendor_ledger.view") || hasPermission("vendor_bills.view");
}

export function canExportVendorLedger(hasPermission) {
  return (
    hasPermission("vendor_ledger.export")
    || hasPermission("vendor_bills.export")
    || hasPermission("reports.export")
  );
}
