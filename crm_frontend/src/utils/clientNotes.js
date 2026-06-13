export const NOTE_TYPE_LABELS = {
  call: "Call Note",
  meeting: "Meeting Note",
  email_summary: "Email Summary",
  message_summary: "Message Summary",
  requirement: "Requirement",
  objection: "Objection",
  preference: "Preference",
  follow_up: "Follow-Up",
  risk: "Risk",
  internal: "Internal",
  escalation: "Escalation",
  billing: "Billing / Payment",
};

export const VISIBILITY_LABELS = {
  team: "Team",
  internal: "Internal",
  sensitive: "Sensitive",
};

export function noteTypeBadgeClass(type) {
  return `crm-badge crm-note-${type}`;
}

export function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const emptyNoteForm = () => ({
  note_type: "call",
  title: "",
  body: "",
  visibility_scope: "team",
  tags: "",
  is_pinned: false,
  is_sensitive: false,
  follow_up_required: false,
  follow_up_due_date: "",
  follow_up_priority: "normal",
});

export function buildNoteQuery(context) {
  const params = new URLSearchParams();
  if (context.contactId) params.set("contact_id", String(context.contactId));
  if (context.leadId) params.set("lead_id", String(context.leadId));
  if (context.dealId) params.set("deal_id", String(context.dealId));
  if (context.quotationId) params.set("quotation_id", String(context.quotationId));
  if (context.salesOrderId) params.set("sales_order_id", String(context.salesOrderId));
  if (context.invoiceId) params.set("invoice_id", String(context.invoiceId));
  return params;
}
