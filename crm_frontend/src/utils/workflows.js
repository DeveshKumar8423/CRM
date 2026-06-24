export const MODULE_LABELS = {
  sales: "Sales",
  finance: "Finance",
  inventory: "Inventory",
  hr: "HR",
  operations: "Operations",
  platform: "Platform",
};

export const RUN_STATUS_CLASS = {
  executed: "crm-workflow-status-executed",
  partial: "crm-workflow-status-partial",
  failed: "crm-workflow-status-failed",
  skipped: "crm-workflow-status-skipped",
};

export function runStatusClass(status) {
  return `crm-badge ${RUN_STATUS_CLASS[status] || "crm-workflow-status-skipped"}`;
}

export function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export function recordLinkPath(recordType, recordId) {
  const paths = {
    deal: `/deals/${recordId}`,
    lead: `/leads/${recordId}`,
    leave: `/leaves/${recordId}`,
  };
  return paths[recordType] || null;
}
