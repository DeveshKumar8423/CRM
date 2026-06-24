import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { MWO_PRIORITY_LABELS, MWO_TYPE_LABELS } from "../utils/maintenance";

function MaintenanceWorkOrderForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    asset_id: searchParams.get("asset_id") || "",
    type: searchParams.get("type") || "breakdown",
    priority: "normal",
    title: "",
    description: "",
    status: "open",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/maintenance/assets")
      .then((d) => setAssets((d.items || []).filter((a) => a.status !== "retired")))
      .catch(() => {});
    const type = searchParams.get("type");
    if (type === "breakdown") {
      setForm((f) => ({ ...f, title: f.title || "Breakdown reported", priority: "high" }));
    } else if (type === "preventive") {
      setForm((f) => ({ ...f, title: f.title || "Preventive maintenance", type: "preventive" }));
    }
  }, [searchParams]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch("/maintenance/work-orders", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          asset_id: Number(form.asset_id),
        }),
      });
      navigate(`/maintenance/work-orders/${data.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="New maintenance work order" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/maintenance/work-orders" className="crm-muted">← Work orders</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <form className="crm-form crm-mt" onSubmit={submit}>
          <div className="crm-form-field">
            <label>Asset *</label>
            <select required value={form.asset_id} onChange={(e) => setField("asset_id", e.target.value)}>
              <option value="">Select asset</option>
              {assets.map((a) => <option key={a.id} value={a.id}>{a.asset_code} — {a.name}</option>)}
            </select>
          </div>
          <div className="crm-form-field">
            <label>Type</label>
            <select value={form.type} onChange={(e) => setField("type", e.target.value)}>
              {Object.entries(MWO_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="crm-form-field">
            <label>Priority</label>
            <select value={form.priority} onChange={(e) => setField("priority", e.target.value)}>
              {Object.entries(MWO_PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="crm-form-field"><label>Title *</label><input required value={form.title} onChange={(e) => setField("title", e.target.value)} /></div>
          <div className="crm-form-field"><label>Description</label><textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3} /></div>
          <button type="submit" className="crm-btn">Create work order</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default MaintenanceWorkOrderForm;
