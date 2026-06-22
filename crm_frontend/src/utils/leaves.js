export const TYPE_LABELS = {
  casual: "Casual Leave",
  sick: "Sick Leave",
  earned: "Earned / Privilege Leave",
  unpaid: "Unpaid Leave",
  other: "Other",
};

export const STATUS_LABELS = {
  draft: "Draft",
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const HALF_DAY_LABELS = {
  morning: "Morning",
  afternoon: "Afternoon",
};

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateRange(start, end, totalDays, isHalfDay) {
  if (!start || !end) return "—";
  const startStr = formatDate(start);
  const endStr = formatDate(end);
  const daysLabel = isHalfDay ? "0.5 day" : `${totalDays} day${totalDays === 1 ? "" : "s"}`;
  if (startStr === endStr) return `${startStr} (${daysLabel})`;
  return `${startStr} – ${endStr} (${daysLabel})`;
}

export function statusBadgeClass(status) {
  return `crm-leave-status crm-leave-status-${status || "draft"}`;
}

export function emptyForm() {
  return {
    leave_type: "casual",
    start_date: "",
    end_date: "",
    reason: "",
    is_half_day: false,
    half_day_period: "morning",
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
