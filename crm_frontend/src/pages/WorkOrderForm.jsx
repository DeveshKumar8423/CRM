import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

function WorkOrderForm() {
  const role = localStorage.getItem("role") || "Staff";
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_id: "",
    planned_qty: "100",
    planned_start: "",
    planned_end: "",
    priority: "normal",
    notes: "",
    status: "draft",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/products?limit=100").then((d) => {
      const list = (d.items || d).filter((p) => p.is_manufactured || p.status === "active");
      setProducts(list);
    }).catch((err) => setError(err.message));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        product_id: Number(form.product_id),
        planned_qty: Number(form.planned_qty),
        priority: form.priority,
        notes: form.notes || null,
        status: form.status,
        planned_start: form.planned_start || null,
        planned_end: form.planned_end || null,
      };
      const wo = await apiFetch("/manufacturing/work-orders", { method: "POST", body: JSON.stringify(body) });
      navigate(`/manufacturing/work-orders/${wo.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="New work order" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/manufacturing/work-orders" className="crm-muted">← Work orders</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <form className="crm-form crm-mt" onSubmit={submit}>
          <div className="crm-form-field">
            <label>Finished product</label>
            <select required value={form.product_id} onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}>
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.is_manufactured ? "" : " (mark as manufactured)"}</option>
              ))}
            </select>
          </div>
          <div className="crm-form-field">
            <label>Planned quantity</label>
            <input type="number" min="0.01" step="any" required value={form.planned_qty} onChange={(e) => setForm((f) => ({ ...f, planned_qty: e.target.value }))} />
          </div>
          <div className="crm-form-field">
            <label>Planned start</label>
            <input type="date" value={form.planned_start} onChange={(e) => setForm((f) => ({ ...f, planned_start: e.target.value }))} />
          </div>
          <div className="crm-form-field">
            <label>Planned end</label>
            <input type="date" value={form.planned_end} onChange={(e) => setForm((f) => ({ ...f, planned_end: e.target.value }))} />
          </div>
          <div className="crm-form-field">
            <label>Priority</label>
            <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="crm-form-field">
            <label>Initial status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="planned">Planned</option>
            </select>
          </div>
          <div className="crm-form-field">
            <label>Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <button type="submit" className="crm-btn" disabled={saving}>{saving ? "Creating…" : "Create work order"}</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default WorkOrderForm;
