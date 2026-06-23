export const JOB_STATUS_LABELS = {
  draft: "Draft",
  open: "Open",
  on_hold: "On Hold",
  closed: "Closed",
};

export const APPLICANT_STATUS_LABELS = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function jobBadgeClass(status) {
  return `crm-recruitment-job crm-recruitment-job-${status || "open"}`;
}

export function applicantBadgeClass(status) {
  return `crm-recruitment-applicant crm-recruitment-applicant-${status || "applied"}`;
}

export function formatCurrency(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
