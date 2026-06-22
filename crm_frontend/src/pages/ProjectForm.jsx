import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { emptyProjectForm } from "../utils/projects";

function ProjectForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";

  const [form, setForm] = useState({
    ...emptyProjectForm(),
    contact_id: searchParams.get("contact_id") || "",
    deal_id: searchParams.get("deal_id") || "",
    sales_order_id: searchParams.get("sales_order_id") || "",
  });
  const [meta, setMeta] = useState({ statuses: [], priorities: [], project_types: [] });
  const [assignees, setAssignees] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    Promise.all([
      apiFetch("/projects/meta"),
      apiFetch("/projects/assignees"),
      apiFetch("/contacts?limit=200&status=active"),
    ]).then(([m, staff, contactData]) => {
      setMeta(m);
      setAssignees(staff);
      setContacts(contactData.items || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/projects/${id}`).then((p) => {
      setForm({
        name: p.name,
        description: p.description || "",
        project_type: p.project_type,
        status: p.status,
        priority: p.priority,
        contact_id: p.contact_id ? String(p.contact_id) : "",
        deal_id: p.deal_id ? String(p.deal_id) : "",
        sales_order_id: p.sales_order_id ? String(p.sales_order_id) : "",
        project_manager_id: String(p.project_manager_id),
        start_date: p.start_date ? p.start_date.slice(0, 10) : "",
        deadline: p.deadline ? p.deadline.slice(0, 10) : "",
      });
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id, isEdit]);

  const buildPayload = () => ({
    name: form.name.trim(),
    description: form.description || null,
    project_type: form.project_type,
    status: form.status,
    priority: form.priority,
    contact_id: form.contact_id ? Number(form.contact_id) : null,
    deal_id: form.deal_id ? Number(form.deal_id) : null,
    sales_order_id: form.sales_order_id ? Number(form.sales_order_id) : null,
    project_manager_id: Number(form.project_manager_id),
    start_date: form.start_date ? new Date(`${form.start_date}T00:00:00`).toISOString() : null,
    deadline: form.deadline ? new Date(`${form.deadline}T23:59:59`).toISOString() : null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.project_manager_id) {
      setError("Project manager is required");
      return;
    }
    try {
      const payload = buildPayload();
      if (isEdit) {
        await apiFetch(`/projects/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        navigate(`/projects/${id}`);
      } else {
        const created = await apiFetch("/projects", { method: "POST", body: JSON.stringify(payload) });
        navigate(`/projects/${created.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title={isEdit ? "Edit project" : "New project"} roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? "Edit project" : "New project"} roleLabel={role}>
      <div className="crm-panel">
        <Link to={isEdit ? `/projects/${id}` : "/projects"} className="crm-link crm-link-left">← Back</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <form onSubmit={handleSubmit} className="crm-form crm-mt">
          <div className="crm-form-grid">
            <label>
              Project name *
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Type
              <select value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })}>
                {(meta.project_types || []).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {(meta.statuses || []).map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <label>
              Priority
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {(meta.priorities || []).map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>
            <label>
              Project manager *
              <select value={form.project_manager_id} onChange={(e) => setForm({ ...form, project_manager_id: e.target.value })} required>
                <option value="">Select manager</option>
                {assignees.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
            {form.project_type === "client" && (
              <label>
                Client contact *
                <select value={form.contact_id} onChange={(e) => setForm({ ...form, contact_id: e.target.value })} required={form.project_type === "client"}>
                  <option value="">Select contact</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            )}
            <label>
              Start date
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </label>
            <label>
              Deadline
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </label>
            <label>
              Deal ID (optional)
              <input value={form.deal_id} onChange={(e) => setForm({ ...form, deal_id: e.target.value })} placeholder="Link to deal" />
            </label>
            <label>
              Sales order ID (optional)
              <input value={form.sales_order_id} onChange={(e) => setForm({ ...form, sales_order_id: e.target.value })} placeholder="Link to order" />
            </label>
          </div>
          <label className="crm-mt">
            Description
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <div className="crm-form-actions crm-mt">
            <button type="submit" className="crm-btn">{isEdit ? "Save changes" : "Create project"}</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default ProjectForm;
