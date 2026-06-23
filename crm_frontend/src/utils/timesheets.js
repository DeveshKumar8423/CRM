export const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatHours(hours) {
  if (hours == null) return "—";
  const n = Number(hours);
  return `${n % 1 === 0 ? n : n.toFixed(2)}h`;
}

export function statusBadgeClass(status) {
  return `crm-timesheet-status crm-timesheet-status-${status || "draft"}`;
}

export function emptyForm() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    work_date: today,
    hours: "2",
    is_billable: true,
    description: "",
    project_id: "",
    task_id: "",
    contact_id: "",
  };
}

export function exportCsv(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
