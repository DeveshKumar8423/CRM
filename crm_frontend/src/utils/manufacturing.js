export function formatQty(qty) {
  const n = Number(qty || 0);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export const WO_STATUS_LABELS = {
  draft: "Draft",
  planned: "Planned",
  released: "Released",
  in_progress: "In progress",
  qc_pending: "QC pending",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BOM_STATUS_LABELS = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

export function woStatusClass(status) {
  if (status === "completed") return "crm-badge crm-badge-success";
  if (status === "cancelled") return "crm-badge crm-badge-muted";
  if (status === "qc_pending") return "crm-badge crm-badge-warning";
  if (status === "released" || status === "in_progress") return "crm-badge crm-badge-info";
  return "crm-badge";
}
