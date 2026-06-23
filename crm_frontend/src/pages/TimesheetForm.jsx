import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { emptyForm } from "../utils/timesheets";

function TimesheetForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [form, setForm] = useState(emptyForm());
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    apiFetch("/projects?limit=100&status=active").then((res) => setProjects(res.items || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.project_id) {
      setTasks([]);
      return;
    }
    apiFetch(`/projects/${form.project_id}`).then((p) => setTasks(p.tasks || [])).catch(() => setTasks([]));
  }, [form.project_id]);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/timesheets/${id}`).then((entry) => {
      setForm({
        work_date: entry.work_date?.slice(0, 10) || "",
        hours: String(entry.hours ?? ""),
        is_billable: entry.is_billable,
        description: entry.description || "",
        project_id: entry.project_id ? String(entry.project_id) : "",
        task_id: entry.task_id ? String(entry.task_id) : "",
        contact_id: entry.contact_id ? String(entry.contact_id) : "",
      });
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id, isEdit]);

  const buildPayload = (submit) => ({
    work_date: new Date(`${form.work_date}T12:00:00`).toISOString(),
    hours: parseFloat(form.hours),
    is_billable: form.is_billable,
    description: form.description.trim(),
    project_id: form.project_id ? parseInt(form.project_id, 10) : null,
    task_id: form.task_id ? parseInt(form.task_id, 10) : null,
    contact_id: form.contact_id ? parseInt(form.contact_id, 10) : null,
    submit,
  });

  const save = async (submit) => {
    setError("");
    if (!form.description.trim() || form.description.trim().length < 5) {
      setError("Description must be at least 5 characters");
      return;
    }
    const hours = parseFloat(form.hours);
    if (Number.isNaN(hours) || hours < 0.25 || hours > 24) {
      setError("Hours must be between 0.25 and 24");
      return;
    }
    try {
      const payload = buildPayload(submit);
      if (isEdit) {
        const { submit: _s, ...updatePayload } = payload;
        await apiFetch(`/timesheets/${id}`, { method: "PUT", body: JSON.stringify(updatePayload) });
        if (submit) {
          await apiFetch(`/timesheets/${id}/submit`, { method: "POST", body: JSON.stringify({}) });
        }
        navigate(`/timesheets/${id}`);
      } else {
        const created = await apiFetch("/timesheets", { method: "POST", body: JSON.stringify(payload) });
        navigate(`/timesheets/${created.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Log time" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? "Edit timesheet entry" : "Log time"} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/timesheets" className="crm-link crm-link-left">← My timesheets</Link>

        <form className="crm-form crm-mt" onSubmit={(e) => e.preventDefault()}>
          <div className="crm-form-grid">
            <div>
              <label>Work date *</label>
              <input type="date" value={form.work_date} onChange={(e) => setForm((f) => ({ ...f, work_date: e.target.value }))} required />
            </div>
            <div>
              <label>Hours *</label>
              <input type="number" min="0.25" max="24" step="0.25" value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))} required />
            </div>
            <div>
              <label>Project</label>
              <select value={form.project_id} onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value, task_id: "" }))}>
                <option value="">No project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.project_number} — {p.name}</option>)}
              </select>
            </div>
            <div>
              <label>Task</label>
              <select value={form.task_id} onChange={(e) => setForm((f) => ({ ...f, task_id: e.target.value }))} disabled={!form.project_id}>
                <option value="">No task</option>
                {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div className="crm-form-full">
              <label>Description *</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What work was performed?" required />
            </div>
            <div>
              <label className="crm-consent-check">
                <input type="checkbox" checked={form.is_billable} onChange={(e) => setForm((f) => ({ ...f, is_billable: e.target.checked }))} />
                Billable to client
              </label>
            </div>
          </div>

          {error && <p className="crm-error crm-mt">{error}</p>}

          <div className="crm-form-actions crm-mt">
            <button type="button" className="crm-btn crm-btn-outline" onClick={() => save(false)}>Save draft</button>
            <button type="button" className="crm-btn" onClick={() => save(true)}>Submit for approval</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default TimesheetForm;
