import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

function QualityTemplates() {
  const role = localStorage.getItem("role") || "Staff";
  const [items, setItems] = useState([]);
  const [points, setPoints] = useState([]);
  const [form, setForm] = useState({ name: "", inspection_point_id: "", items: [{ key: "visual", label: "Visual inspection", required: true, input_type: "pass_fail" }] });
  const [error, setError] = useState("");

  const load = () => apiFetch("/quality/templates").then((d) => setItems(d.items)).catch((err) => setError(err.message));

  useEffect(() => {
    load();
    apiFetch("/quality/inspection-points").then(setPoints).catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/quality/templates", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          inspection_point_id: form.inspection_point_id ? Number(form.inspection_point_id) : null,
          items_json: form.items,
        }),
      });
      setForm({ name: "", inspection_point_id: "", items: [{ key: "visual", label: "Visual inspection", required: true, input_type: "pass_fail" }] });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const activate = async (id) => {
    await apiFetch(`/quality/templates/${id}/activate`, { method: "POST" });
    load();
  };

  return (
    <DashboardLayout title="QC templates" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/quality" className="crm-muted">← Quality Control</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {hasPermission("quality.manage_templates") && (
          <form className="crm-form crm-mt" onSubmit={save}>
            <div className="crm-form-field"><label>Name</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="crm-form-field">
              <label>Inspection point</label>
              <select value={form.inspection_point_id} onChange={(e) => setForm((f) => ({ ...f, inspection_point_id: e.target.value }))}>
                <option value="">Any</option>
                {points.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button type="submit" className="crm-btn crm-btn-sm">Add template</button>
          </form>
        )}
        <table className="crm-table crm-mt">
          <thead><tr><th>Name</th><th>Point</th><th>Status</th><th>Items</th><th></th></tr></thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.inspection_point_name || "—"}</td>
                <td>{t.status}</td>
                <td>{t.item_count}</td>
                <td>
                  {hasPermission("quality.manage_templates") && t.status !== "active" && (
                    <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => activate(t.id)}>Activate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default QualityTemplates;
