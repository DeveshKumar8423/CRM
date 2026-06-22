import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  OPEN_TASK_STATUSES,
  PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  formatDate,
  isTaskOpen,
  priorityBadgeClass,
  taskStatusBadgeClass,
} from "../utils/projects";

function ProjectMyTasks() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0 });
  const [projects, setProjects] = useState([]);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [dueThisWeek, setDueThisWeek] = useState(false);
  const [projectFilter, setProjectFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/projects?limit=100&status=active").then((res) => setProjects(res.items || [])).catch(() => {});
  }, []);

  const load = () => {
    const params = new URLSearchParams();
    if (overdueOnly) params.set("overdue_only", "true");
    if (dueThisWeek) params.set("due_this_week", "true");
    if (projectFilter) params.set("project_id", projectFilter);
    apiFetch(`/projects/my-tasks?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, [overdueOnly, dueThisWeek, projectFilter]);

  const updateTaskStatus = async (projectId, taskId, payload) => {
    await apiFetch(`/projects/${projectId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    load();
  };

  const handleStatus = async (projectId, taskId, status) => {
    if (!hasPermission("projects.manage_tasks")) return;
    try {
      await updateTaskStatus(projectId, taskId, { status });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBlock = async (projectId, taskId) => {
    if (!hasPermission("projects.manage_tasks")) return;
    const reason = window.prompt("Why is this task blocked? (optional)");
    if (reason === null) return;
    try {
      await updateTaskStatus(projectId, taskId, {
        status: "blocked",
        blocked_reason: reason.trim() || null,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="My Tasks" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/projects" className="crm-link crm-link-left">← Projects</Link>
          <p className="crm-muted">{data.total} open task{data.total === 1 ? "" : "s"} assigned to you</p>
        </div>

        <div className="crm-filters crm-mt">
          <label className="crm-consent-check">
            <input type="checkbox" checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} />
            Overdue only
          </label>
          <label className="crm-consent-check">
            <input type="checkbox" checked={dueThisWeek} onChange={(e) => setDueThisWeek(e.target.checked)} />
            Due this week
          </label>
          <label>
            Project
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.project_number ? ` (${p.project_number})` : ""}</option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        {data.items.length === 0 ? (
          <div className="crm-empty-state crm-mt"><p>No assigned tasks.</p></div>
        ) : (
          <div className="crm-table-wrap crm-mt">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Due</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((t) => (
                  <tr key={t.id} className={t.is_overdue ? "crm-row-overdue" : ""}>
                    <td>
                      {t.title}
                      <div className="crm-muted crm-text-sm">{t.stage_label}</div>
                    </td>
                    <td>
                      <Link to={`/projects/${t.project_id}`} className="crm-nav-link">{t.project_name}</Link>
                      {t.project_number && <div className="crm-muted crm-text-sm">{t.project_number}</div>}
                    </td>
                    <td>{t.client_name || "—"}</td>
                    <td>
                      {formatDate(t.due_date)}
                      {t.is_overdue && <span className="crm-badge crm-badge-danger crm-ml">Overdue</span>}
                    </td>
                    <td><span className={priorityBadgeClass(t.priority)}>{PRIORITY_LABELS[t.priority]}</span></td>
                    <td><span className={taskStatusBadgeClass(t.status)}>{TASK_STATUS_LABELS[t.status]}</span></td>
                    <td>
                      {hasPermission("projects.manage_tasks") && isTaskOpen(t.status) && (
                        <div className="crm-inline-actions">
                          {t.status === "todo" && (
                            <button type="button" className="crm-btn crm-btn-xs crm-btn-outline" onClick={() => handleStatus(t.project_id, t.id, "in_progress")}>Start</button>
                          )}
                          <button type="button" className="crm-btn crm-btn-xs crm-btn-outline" onClick={() => handleStatus(t.project_id, t.id, "done")}>Done</button>
                          <button type="button" className="crm-btn crm-btn-xs crm-btn-outline" onClick={() => handleBlock(t.project_id, t.id)}>Block</button>
                          <Link to={`/projects/${t.project_id}`} className="crm-btn crm-btn-xs crm-btn-outline">Open</Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ProjectMyTasks;
