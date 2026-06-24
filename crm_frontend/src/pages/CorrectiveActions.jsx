import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { CAPA_STATUS_LABELS } from "../utils/quality";
import { hasPermission } from "../utils/permissions";

function CorrectiveActions() {
  const role = localStorage.getItem("role") || "Staff";
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/quality/corrective-actions").then((d) => setItems(d.items)).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="Corrective actions" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/quality" className="crm-muted">← Quality Control</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>CAPA #</th><th>Title</th><th>Inspection</th><th>Status</th><th>Due</th><th>Assignee</th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className={c.is_overdue ? "mfg-shortage-row" : ""}>
                <td><Link to={`/quality/corrective-actions/${c.id}`}>{c.capa_number}</Link></td>
                <td>{c.title}</td>
                <td>{c.inspection_number || "—"}</td>
                <td>{CAPA_STATUS_LABELS[c.status] || c.status}</td>
                <td>{c.due_date || "—"}</td>
                <td>{c.assigned_to_name || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export function CorrectiveActionForm() {
  const role = localStorage.getItem("role") || "Staff";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inspectionId = searchParams.get("inspection_id");
  const [form, setForm] = useState({
    inspection_id: inspectionId || "",
    title: "",
    description: "",
    action_type: "rework",
    corrective_steps: "",
    due_date: "",
  });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const capa = await apiFetch("/quality/corrective-actions", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          inspection_id: Number(form.inspection_id),
          due_date: form.due_date || null,
        }),
      });
      navigate(`/quality/corrective-actions/${capa.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="New CAPA" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/quality/corrective-actions" className="crm-muted">← Corrective actions</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <form className="crm-form crm-mt" onSubmit={submit}>
          <div className="crm-form-field"><label>Inspection ID</label><input required type="number" value={form.inspection_id} onChange={(e) => setForm((f) => ({ ...f, inspection_id: e.target.value }))} /></div>
          <div className="crm-form-field"><label>Title</label><input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
          <div className="crm-form-field"><label>Description</label><textarea required rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <div className="crm-form-field">
            <label>Action type</label>
            <select value={form.action_type} onChange={(e) => setForm((f) => ({ ...f, action_type: e.target.value }))}>
              <option value="rework">Rework</option>
              <option value="scrap">Scrap</option>
              <option value="vendor_return">Vendor return</option>
              <option value="process_change">Process change</option>
              <option value="training">Training</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="crm-form-field"><label>Corrective steps</label><textarea rows={3} value={form.corrective_steps} onChange={(e) => setForm((f) => ({ ...f, corrective_steps: e.target.value }))} /></div>
          <div className="crm-form-field"><label>Due date</label><input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} /></div>
          <button type="submit" className="crm-btn">Create CAPA</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export function CorrectiveActionDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [capa, setCapa] = useState(null);
  const [verification, setVerification] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [error, setError] = useState("");

  const load = () => apiFetch(`/quality/corrective-actions/${id}`).then((data) => {
    setCapa(data);
    setVerification(data.verification_notes || "");
    setRootCause(data.root_cause || "");
  }).catch((err) => setError(err.message));

  useEffect(() => { load(); }, [id]);

  const update = async (status) => {
    try {
      await apiFetch(`/quality/corrective-actions/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status, root_cause: rootCause, verification_notes: verification }),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!capa) {
    return <DashboardLayout title="CAPA" roleLabel={role}><div className="crm-panel"><p>{error || "Loading…"}</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout title={capa.capa_number} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/quality/corrective-actions" className="crm-muted">← Corrective actions</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <p className="crm-mt"><strong>{capa.title}</strong></p>
        <p className="crm-muted">{capa.description}</p>
        <p>Inspection: {capa.inspection_number} · Status: {CAPA_STATUS_LABELS[capa.status] || capa.status}</p>
        {hasPermission("quality.manage_capa") && capa.status !== "closed" && (
          <div className="crm-form crm-mt">
            <div className="crm-form-field"><label>Root cause</label><textarea rows={2} value={rootCause} onChange={(e) => setRootCause(e.target.value)} /></div>
            <div className="crm-form-field"><label>Verification notes</label><textarea rows={2} value={verification} onChange={(e) => setVerification(e.target.value)} /></div>
            <div className="crm-inline-actions">
              {capa.status === "open" && <button type="button" className="crm-btn crm-btn-sm" onClick={() => update("in_progress")}>Start</button>}
              {capa.status === "in_progress" && <button type="button" className="crm-btn crm-btn-sm" onClick={() => update("verified")}>Mark verified</button>}
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => update("closed")}>Close CAPA</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CorrectiveActions;
