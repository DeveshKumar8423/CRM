export const STATUS_LABELS = {
  draft: "Draft",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const TASK_STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
  cancelled: "Cancelled",
};

export const STAGE_LABELS = {
  kickoff: "Kickoff",
  discovery: "Discovery",
  execution: "Execution",
  review: "Review",
  closure: "Closure",
};

export const PRIORITY_LABELS = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

export const TYPE_LABELS = {
  client: "Client",
  internal: "Internal",
};

export const STAGES = ["kickoff", "discovery", "execution", "review", "closure"];

export const OPEN_TASK_STATUSES = ["todo", "in_progress", "blocked"];

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function statusBadgeClass(status) {
  return `crm-proj-status crm-proj-status-${status?.replace(/_/g, "-") || "draft"}`;
}

export function taskStatusBadgeClass(status) {
  return `crm-proj-task-status crm-proj-task-status-${status?.replace(/_/g, "-") || "todo"}`;
}

export function priorityBadgeClass(priority) {
  return `crm-proj-priority crm-proj-priority-${priority || "normal"}`;
}

export function exportProjectTasksCsv(project, filename) {
  const rows = [
    [
      "Project Number",
      "Project Name",
      "Client",
      "Manager",
      "Stage",
      "Task",
      "Assignee",
      "Due Date",
      "Priority",
      "Status",
      "Blocked Reason",
    ],
    ...(project.tasks || []).map((t) => [
      project.project_number || "",
      project.name,
      project.contact_name || "",
      project.project_manager_name || "",
      STAGE_LABELS[t.stage_key] || t.stage_key,
      t.title,
      t.assigned_to_name || "Unassigned",
      t.due_date ? formatDate(t.due_date) : "",
      PRIORITY_LABELS[t.priority] || t.priority,
      TASK_STATUS_LABELS[t.status] || t.status,
      t.blocked_reason || "",
    ]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function emptyProjectForm() {
  return {
    name: "",
    description: "",
    project_type: "client",
    status: "draft",
    priority: "normal",
    contact_id: "",
    deal_id: "",
    sales_order_id: "",
    project_manager_id: "",
    start_date: "",
    deadline: "",
  };
}

export function emptyTaskForm() {
  return {
    title: "",
    description: "",
    stage_key: "kickoff",
    assigned_to_id: "",
    status: "todo",
    priority: "normal",
    due_date: "",
    blocked_reason: "",
  };
}

export function canViewProjects(hasPermission) {
  return hasPermission("projects.view");
}

export function unassignedLabel() {
  return "Unassigned";
}

export function isTaskOpen(status) {
  return OPEN_TASK_STATUSES.includes(status);
}

export function buildTaskUpdatePayload(form) {
  return {
    title: form.title.trim(),
    description: form.description || null,
    stage_key: form.stage_key,
    assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
    status: form.status,
    priority: form.priority,
    due_date: form.due_date ? new Date(`${form.due_date}T23:59:59`).toISOString() : null,
    blocked_reason: form.blocked_reason || null,
  };
}
