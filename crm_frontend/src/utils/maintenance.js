export const ASSET_STATUS_LABELS = {
  operational: "Operational",
  under_maintenance: "Under maintenance",
  breakdown: "Breakdown",
  retired: "Retired",
};

export const ASSET_CRITICALITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const MWO_TYPE_LABELS = {
  preventive: "Preventive",
  breakdown: "Breakdown",
  inspection: "Inspection",
  other: "Other",
};

export const MWO_STATUS_LABELS = {
  draft: "Draft",
  open: "Open",
  in_progress: "In progress",
  waiting_parts: "Waiting parts",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const MWO_PRIORITY_LABELS = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export function assetStatusClass(status) {
  return `crm-badge crm-mnt-status-${status || "operational"}`;
}

export function mwoStatusClass(status) {
  return `crm-badge crm-mnt-mwo-${status || "open"}`;
}

export function criticalityClass(level) {
  return `crm-badge crm-mnt-criticality-${level || "medium"}`;
}

export function formatDowntime(minutes) {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}
