import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import DocumentsPanel from "../components/DocumentsPanel";
import TaskEditModal from "../components/TaskEditModal";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  OPEN_TASK_STATUSES,
  PRIORITY_LABELS,
  STAGE_LABELS,
  STAGES,
  STATUS_LABELS,
  TASK_STATUS_LABELS,
  emptyTaskForm,
  exportProjectTasksCsv,
  formatDate,
  isTaskOpen,
  priorityBadgeClass,
  statusBadgeClass,
  taskStatusBadgeClass,
} from "../utils/projects";

function ProjectDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [project, setProject] = useState(null);
  const [meta, setMeta] = useState({ stages: [], task_statuses: [], priorities: [] });
  const [assignees, setAssignees] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [taskForm, setTaskForm] = useState(emptyTaskForm());
  const [activeStage, setActiveStage] = useState("kickoff");
  const [memberUserId, setMemberUserId] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [taskEditError, setTaskEditError] = useState("");
  const [taskSaving, setTaskSaving] = useState(false);

  const canEdit = hasPermission("projects.edit");
  const canManageTasks = hasPermission("projects.manage_tasks");
  const canClose = hasPermission("projects.close");
  const canDelete = hasPermission("projects.delete");
  const canExport = hasPermission("projects.export");

  const load = () => {
    apiFetch(`/projects/${id}`).then(setProject).catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
    Promise.all([
      apiFetch("/projects/meta"),
      apiFetch("/projects/assignees"),
    ]).then(([m, staff]) => {
      setMeta(m);
      setAssignees(staff);
    }).catch(() => {});
  }, [id]);

  const updateTask = async (taskId, payload) => {
    await apiFetch(`/projects/${id}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    load();
  };

  const handleStatusChange = async (status) => {
    const reason = status === "on_hold" ? window.prompt("Reason for hold (optional)") : null;
    try {
      await apiFetch(`/projects/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status, reason: reason || null }),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this draft project?")) return;
    try {
      await apiFetch(`/projects/${id}`, { method: "DELETE" });
      window.location.href = "/projects";
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = async () => {
    if (!project) return;
    const code = project.project_number || project.id;
    const month = new Date().toISOString().slice(0, 7);
    exportProjectTasksCsv(project, `project-${code}-tasks-${month}.csv`);
    try {
      await apiFetch("/projects/export-log", {
        method: "POST",
        body: JSON.stringify({ project_id: project.id, row_count: project.tasks?.length || 0 }),
      });
    } catch {
      /* non-blocking */
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/projects/${id}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          title: taskForm.title.trim(),
          description: taskForm.description || null,
          stage_key: activeStage,
          assigned_to_id: taskForm.assigned_to_id ? Number(taskForm.assigned_to_id) : null,
          status: taskForm.status,
          priority: taskForm.priority,
          due_date: taskForm.due_date ? new Date(`${taskForm.due_date}T23:59:59`).toISOString() : null,
        }),
      });
      setTaskForm(emptyTaskForm());
      setShowTaskForm(false);
      setMessage("Task added");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTaskStatus = async (taskId, status, blockedReason = null) => {
    try {
      const payload = { status };
      if (status === "blocked" && blockedReason) payload.blocked_reason = blockedReason;
      await updateTask(taskId, payload);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTaskBlock = async (taskId) => {
    const reason = window.prompt("Why is this task blocked? (optional)");
    if (reason === null) return;
    await handleTaskStatus(taskId, "blocked", reason.trim() || null);
  };

  const handleTaskDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    try {
      await apiFetch(`/projects/${id}/tasks/${task.id}`, { method: "DELETE" });
      setMessage("Task deleted");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTaskEditSave = async (payload) => {
    if (!editingTask) return;
    setTaskSaving(true);
    setTaskEditError("");
    try {
      await updateTask(editingTask.id, payload);
      setEditingTask(null);
      setMessage("Task updated");
    } catch (err) {
      setTaskEditError(err.message);
    } finally {
      setTaskSaving(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberUserId) return;
    try {
      await apiFetch(`/projects/${id}/members`, {
        method: "POST",
        body: JSON.stringify({ user_id: Number(memberUserId), role: "member" }),
      });
      setMemberUserId("");
      load();
      setMessage("Team member added");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this team member?")) return;
    try {
      await apiFetch(`/projects/${id}/members/${userId}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTasks = useMemo(() => {
    if (!project?.tasks) return [];
    return project.tasks.filter((t) => {
      if (assigneeFilter === "unassigned") return !t.assigned_to_id;
      if (assigneeFilter) return String(t.assigned_to_id) === assigneeFilter;
      return true;
    });
  }, [project, assigneeFilter]);

  const tasksByStage = useMemo(() => STAGES.reduce((acc, stage) => {
    acc[stage] = filteredTasks.filter((t) => t.stage_key === stage);
    return acc;
  }, {}), [filteredTasks]);

  if (!project && !error) {
    return (
      <DashboardLayout title="Project" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  if (error && !project) {
    return (
      <DashboardLayout title="Project" roleLabel={role}>
        <div className="crm-panel"><p className="crm-error">{error}</p></div>
      </DashboardLayout>
    );
  }

  const stageTasks = tasksByStage[activeStage] || [];

  return (
    <DashboardLayout title={project.name} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/projects" className="crm-link crm-link-left">← Projects</Link>
          <div className="crm-inline-actions">
            <Link to="/projects/my-tasks" className="crm-btn crm-btn-sm crm-btn-outline">My tasks</Link>
            {canExport && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport}>Export CSV</button>
            )}
            {canEdit && !project.is_locked && (
              <Link to={`/projects/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>
            )}
            {canClose && project.status === "active" && (
              <>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => handleStatusChange("on_hold")}>Put on hold</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => handleStatusChange("completed")}>Mark complete</button>
              </>
            )}
            {canClose && project.status === "on_hold" && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => handleStatusChange("active")}>Resume</button>
            )}
            {canClose && !["cancelled", "completed"].includes(project.status) && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => handleStatusChange("cancelled")}>Cancel</button>
            )}
            {canDelete && project.status === "draft" && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-danger" onClick={handleDelete}>Delete</button>
            )}
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}

        <div className="crm-proj-header crm-mt">
          <div>
            <h2 className="crm-proj-title">{project.name}</h2>
            <p className="crm-muted">
              {project.project_number && <span>{project.project_number} · </span>}
              <span className={statusBadgeClass(project.status)}>{STATUS_LABELS[project.status]}</span>
              {" · "}
              <span className={priorityBadgeClass(project.priority)}>{PRIORITY_LABELS[project.priority]}</span>
            </p>
          </div>
          <div className="crm-proj-progress-block">
            <p className="crm-muted">Progress</p>
            <div className="crm-proj-progress-bar crm-proj-progress-lg">
              <span style={{ width: `${project.progress_percent}%` }} />
            </div>
            <p><strong>{project.progress_percent}%</strong></p>
          </div>
        </div>

        <div className="crm-stats-grid crm-mt">
          <div className="crm-stat-card"><p className="crm-stat-label">Total tasks</p><p className="crm-stat-value">{project.total_tasks}</p></div>
          <div className="crm-stat-card"><p className="crm-stat-label">Done</p><p className="crm-stat-value">{project.done_tasks}</p></div>
          <div className="crm-stat-card"><p className="crm-stat-label">Overdue</p><p className="crm-stat-value">{project.overdue_task_count}</p></div>
          <div className="crm-stat-card"><p className="crm-stat-label">Blocked</p><p className="crm-stat-value">{project.blocked_task_count}</p></div>
          <div className="crm-stat-card crm-proj-unassigned-card"><p className="crm-stat-label">Unassigned</p><p className="crm-stat-value">{project.unassigned_task_count ?? 0}</p></div>
        </div>

        <div className="crm-contact-meta crm-mt">
          <p><strong>Manager:</strong> {project.project_manager_name}</p>
          <p><strong>Deadline:</strong> {formatDate(project.deadline)}{project.is_overdue && <span className="crm-badge crm-badge-danger crm-ml">Overdue</span>}</p>
          {project.contact_id && (
            <p><strong>Client:</strong> <Link to={`/contacts/${project.contact_id}`} className="crm-nav-link">{project.contact_name}</Link></p>
          )}
          {project.deal_id && (
            <p><strong>Deal:</strong> <Link to={`/deals/${project.deal_id}`} className="crm-nav-link">{project.deal_title || `#${project.deal_id}`}</Link></p>
          )}
          {project.sales_order_id && (
            <p><strong>Sales order:</strong> <Link to={`/sales-orders/${project.sales_order_id}`} className="crm-nav-link">{project.sales_order_number || `#${project.sales_order_id}`}</Link></p>
          )}
        </div>

        {project.description && <p className="crm-mt">{project.description}</p>}

        <div className="crm-proj-layout crm-mt">
          <div className="crm-proj-main">
            <div className="crm-proj-stage-tabs">
              {STAGES.map((stage) => {
                const summary = (project.stage_summaries || []).find((s) => s.stage_key === stage);
                return (
                  <button
                    key={stage}
                    type="button"
                    className={`crm-proj-stage-tab ${activeStage === stage ? "active" : ""}`}
                    onClick={() => setActiveStage(stage)}
                  >
                    {STAGE_LABELS[stage]}
                    {summary && <span className="crm-muted"> ({summary.done_tasks}/{summary.total_tasks})</span>}
                  </button>
                );
              })}
            </div>

            <div className="crm-filters crm-mt">
              <label>
                Filter by assignee
                <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
                  <option value="">All assignees</option>
                  <option value="unassigned">Unassigned only</option>
                  {assignees.map((u) => <option key={u.id} value={String(u.id)}>{u.name}</option>)}
                </select>
              </label>
            </div>

            {canManageTasks && !project.is_locked && (
              <div className="crm-mt">
                {!showTaskForm ? (
                  <button type="button" className="crm-btn crm-btn-sm" onClick={() => setShowTaskForm(true)}>+ Add task to {STAGE_LABELS[activeStage]}</button>
                ) : (
                  <form onSubmit={handleAddTask} className="crm-proj-quick-task crm-mt">
                    <input placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
                    <select value={taskForm.assigned_to_id} onChange={(e) => setTaskForm({ ...taskForm, assigned_to_id: e.target.value })}>
                      <option value="">Unassigned</option>
                      {assignees.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                    <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                      {(meta.priorities || []).map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    <button type="submit" className="crm-btn crm-btn-sm">Add</button>
                    <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => setShowTaskForm(false)}>Cancel</button>
                  </form>
                )}
              </div>
            )}

            <div className="crm-table-wrap crm-mt">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Assignee</th>
                    <th>Due</th>
                    <th>Priority</th>
                    <th>Status</th>
                    {canManageTasks && !project.is_locked && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {stageTasks.length === 0 ? (
                    <tr><td colSpan={canManageTasks && !project.is_locked ? 6 : 5} className="crm-muted">No tasks in this stage</td></tr>
                  ) : (
                    stageTasks.map((t) => (
                      <tr key={t.id} className={t.is_overdue ? "crm-row-overdue" : ""}>
                        <td>
                          {t.title}
                          {t.description && <div className="crm-muted crm-text-sm">{t.description}</div>}
                          {t.is_overdue && <span className="crm-badge crm-badge-danger crm-ml">Overdue</span>}
                          {t.blocked_reason && <div className="crm-muted crm-text-sm">Blocked: {t.blocked_reason}</div>}
                        </td>
                        <td>
                          {t.assigned_to_name || <span className="crm-proj-unassigned">Unassigned</span>}
                        </td>
                        <td>{formatDate(t.due_date)}</td>
                        <td><span className={priorityBadgeClass(t.priority)}>{PRIORITY_LABELS[t.priority]}</span></td>
                        <td><span className={taskStatusBadgeClass(t.status)}>{TASK_STATUS_LABELS[t.status]}</span></td>
                        {canManageTasks && !project.is_locked && (
                          <td>
                            <div className="crm-inline-actions">
                              {isTaskOpen(t.status) && (
                                <>
                                  {t.status === "todo" && (
                                    <button type="button" className="crm-btn crm-btn-xs crm-btn-outline" onClick={() => handleTaskStatus(t.id, "in_progress")}>Start</button>
                                  )}
                                  <button type="button" className="crm-btn crm-btn-xs crm-btn-outline" onClick={() => handleTaskStatus(t.id, "done")}>Done</button>
                                  <button type="button" className="crm-btn crm-btn-xs crm-btn-outline" onClick={() => handleTaskBlock(t.id)}>Block</button>
                                  <button type="button" className="crm-btn crm-btn-xs crm-btn-outline" onClick={() => handleTaskStatus(t.id, "cancelled")}>Cancel</button>
                                </>
                              )}
                              <button type="button" className="crm-btn crm-btn-xs crm-btn-outline" onClick={() => { setEditingTask(t); setTaskEditError(""); }}>Edit</button>
                              <button type="button" className="crm-btn crm-btn-xs crm-btn-outline" onClick={() => handleTaskDelete(t)}>Delete</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="crm-proj-sidebar">
            <h3>Team</h3>
            <ul className="crm-proj-team-list">
              <li><strong>{project.project_manager_name}</strong> <span className="crm-muted">(Manager)</span></li>
              {(project.members || []).filter((m) => m.role !== "manager" || m.user_id !== project.project_manager_id).map((m) => (
                <li key={m.id}>
                  {m.user_name}
                  {canEdit && (
                    <button type="button" className="crm-btn crm-btn-xs crm-btn-outline crm-ml" onClick={() => handleRemoveMember(m.user_id)}>Remove</button>
                  )}
                </li>
              ))}
            </ul>
            {canEdit && (
              <form onSubmit={handleAddMember} className="crm-proj-add-member crm-mt">
                <select value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)}>
                  <option value="">Add member…</option>
                  {assignees.filter((u) => u.id !== project.project_manager_id && !(project.members || []).some((m) => m.user_id === u.id)).map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <button type="submit" className="crm-btn crm-btn-sm">Add</button>
              </form>
            )}

            <h3 className="crm-mt">Stage summary</h3>
            <table className="crm-table crm-table-compact">
              <thead><tr><th>Stage</th><th>Done</th><th>Overdue</th></tr></thead>
              <tbody>
                {(project.stage_summaries || []).map((s) => (
                  <tr key={s.stage_key}>
                    <td>{s.stage_label}</td>
                    <td>{s.done_tasks}/{s.total_tasks}</td>
                    <td>{s.overdue_tasks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </aside>
        </div>
      </div>

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          assignees={assignees}
          meta={meta}
          onClose={() => setEditingTask(null)}
          onSave={handleTaskEditSave}
          saving={taskSaving}
          error={taskEditError}
        />
      )}

      {(hasPermission("files.view") || hasPermission("files.view_own")) && (
        <DocumentsPanel projectId={Number(id)} />
      )}
    </DashboardLayout>
  );
}

export default ProjectDetail;
