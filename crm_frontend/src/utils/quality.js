export const INSPECTION_STATUS_LABELS = {
  pending: "Pending",
  passed: "Passed",
  failed: "Failed",
  waived: "Waived",
  cancelled: "Cancelled",
};

export const CAPA_STATUS_LABELS = {
  open: "Open",
  in_progress: "In progress",
  verified: "Verified",
  closed: "Closed",
};

export function inspectionStatusClass(status) {
  if (status === "passed" || status === "waived") return "crm-badge crm-badge-success";
  if (status === "failed") return "crm-badge crm-badge-danger";
  if (status === "pending") return "crm-badge crm-badge-warning";
  return "crm-badge crm-badge-muted";
}

export function alertSeverityClass(severity) {
  if (severity === "critical") return "qc-alert-critical";
  if (severity === "high") return "qc-alert-high";
  return "qc-alert-normal";
}
