export const FSO_TYPE_LABELS = {
  installation: "Installation",
  inspection: "Inspection",
  repair: "Repair",
  amc_visit: "AMC visit",
  other: "Other",
};

export const FSO_STATUS_LABELS = {
  draft: "Draft",
  scheduled: "Scheduled",
  dispatched: "Dispatched",
  in_progress: "In progress",
  waiting_parts: "Waiting parts",
  completed: "Completed",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
};

export const FSO_PRIORITY_LABELS = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export function fsoStatusClass(status) {
  return `crm-badge crm-fs-status-${status || "draft"}`;
}

export function fsoPriorityClass(priority) {
  return `crm-badge crm-fs-priority-${priority || "normal"}`;
}

export function formatScheduleRange(start, end) {
  if (!start) return "—";
  const s = new Date(start);
  const opts = { dateStyle: "short", timeStyle: "short" };
  if (!end) return s.toLocaleString(undefined, opts);
  const e = new Date(end);
  return `${s.toLocaleString(undefined, opts)} – ${e.toLocaleTimeString(undefined, { timeStyle: "short" })}`;
}
