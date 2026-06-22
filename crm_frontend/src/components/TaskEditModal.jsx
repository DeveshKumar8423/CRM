import { useEffect, useState } from "react";

import {
  PRIORITY_LABELS,
  STAGE_LABELS,
  STAGES,
  TASK_STATUS_LABELS,
  emptyTaskForm,
} from "../utils/projects";

function taskFormFromTask(task) {
  if (!task) return emptyTaskForm();
  return {
    title: task.title || "",
    description: task.description || "",
    stage_key: task.stage_key || "kickoff",
    assigned_to_id: task.assigned_to_id ? String(task.assigned_to_id) : "",
    status: task.status || "todo",
    priority: task.priority || "normal",
    due_date: task.due_date ? task.due_date.slice(0, 10) : "",
    blocked_reason: task.blocked_reason || "",
  };
}

function TaskEditModal({
  task,
  assignees,
  meta,
  onClose,
  onSave,
  saving,
  error,
}) {
  const [form, setForm] = useState(taskFormFromTask(task));

  useEffect(() => {
    setForm(taskFormFromTask(task));
  }, [task]);

  if (!task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title: form.title.trim(),
      description: form.description || null,
      stage_key: form.stage_key,
      assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
      status: form.status,
      priority: form.priority,
      due_date: form.due_date ? new Date(`${form.due_date}T23:59:59`).toISOString() : null,
      blocked_reason: form.blocked_reason || null,
    });
  };

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal crm-proj-task-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Edit task</h3>
        {error && <p className="crm-error">{error}</p>}
        <form onSubmit={handleSubmit} className="crm-form">
          <label>
            Title *
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label>
            Description
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <div className="crm-form-grid">
            <label>
              Stage
              <select value={form.stage_key} onChange={(e) => setForm({ ...form, stage_key: e.target.value })}>
                {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </label>
            <label>
              Assignee
              <select value={form.assigned_to_id} onChange={(e) => setForm({ ...form, assigned_to_id: e.target.value })}>
                <option value="">Unassigned</option>
                {assignees.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
            <label>
              Due date
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </label>
            <label>
              Priority
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {(meta.priorities || Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))).map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {(meta.task_statuses || Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({ value, label }))).map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
          {form.status === "blocked" && (
            <label>
              Blocked reason
              <input value={form.blocked_reason} onChange={(e) => setForm({ ...form, blocked_reason: e.target.value })} placeholder="Why is this blocked?" />
            </label>
          )}
          <div className="crm-form-actions">
            <button type="submit" className="crm-btn" disabled={saving}>{saving ? "Saving…" : "Save task"}</button>
            <button type="button" className="crm-btn crm-btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskEditModal;
