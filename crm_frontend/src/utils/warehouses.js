export const LOCATION_TYPE_LABELS = {
  branch: "Branch",
  warehouse: "Warehouse",
  store: "Store",
  project_site: "Project Site",
  zone: "Zone",
  rack: "Rack",
  bin: "Bin",
  staging_area: "Staging Area",
  quarantine: "Quarantine",
};

export const LOCATION_STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  maintenance: "Maintenance",
  closed: "Closed",
};

export const MOVEMENT_LABELS = {
  receipt: "Receipt",
  issue: "Issue",
  damage: "Damage",
  adjustment: "Adjustment",
  transfer_in: "Transfer In",
  transfer_out: "Transfer Out",
};

export const STOCK_STATUS_LABELS = {
  active: "Active",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

export { formatCurrency, formatDate, exportCsv } from "./inventory";

export function locationTypeBadgeClass(type) {
  return `crm-badge crm-wh-type-${type}`;
}

export function locationStatusBadgeClass(status) {
  return `crm-badge crm-wh-status-${status}`;
}

export function movementBadgeClass(type) {
  return `crm-badge crm-wh-move-${type}`;
}

export function stockStatusBadgeClass(status) {
  return `crm-badge crm-wh-stock-${status}`;
}
