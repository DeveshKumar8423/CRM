import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  ASSET_CATEGORY_LABELS,
  ASSET_STATUS_LABELS,
  assetStatusClass,
  formatCurrency,
} from "../utils/rental";

function RentalAssets() {
  const role = localStorage.getItem("role") || "Staff";
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    asset_code: "",
    name: "",
    category: "other",
    quantity_available: 1,
    rate_daily: "",
    rate_weekly: "",
    rate_monthly: "",
    gst_rate: 18,
    location_notes: "",
  });

  const load = () => apiFetch("/rental/assets").then(setAssets).catch((err) => setError(err.message));

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const body = {
        ...form,
        quantity_available: Number(form.quantity_available),
        rate_daily: form.rate_daily ? Number(form.rate_daily) : null,
        rate_weekly: form.rate_weekly ? Number(form.rate_weekly) : null,
        rate_monthly: form.rate_monthly ? Number(form.rate_monthly) : null,
        gst_rate: Number(form.gst_rate),
      };
      await apiFetch("/rental/assets", { method: "POST", body: JSON.stringify(body) });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const retire = async (id) => {
    try {
      await apiFetch(`/rental/assets/${id}`, { method: "PUT", body: JSON.stringify({ status: "retired" }) });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="Rentable assets" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/rental" className="crm-muted">← Rental</Link>
          {hasPermission("rental.manage_assets") && (
            <button type="button" className="crm-btn crm-btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "New asset"}
            </button>
          )}
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {showForm && (
          <form className="crm-form crm-mt" onSubmit={save}>
            <div className="crm-form-row">
              <div className="crm-form-field"><label>Code</label><input required value={form.asset_code} onChange={(e) => setForm({ ...form, asset_code: e.target.value })} /></div>
              <div className="crm-form-field"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="crm-form-field">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {Object.entries(ASSET_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="crm-form-row">
              <div className="crm-form-field"><label>Qty available</label><input type="number" min="1" value={form.quantity_available} onChange={(e) => setForm({ ...form, quantity_available: e.target.value })} /></div>
              <div className="crm-form-field"><label>Daily rate</label><input type="number" value={form.rate_daily} onChange={(e) => setForm({ ...form, rate_daily: e.target.value })} /></div>
              <div className="crm-form-field"><label>Weekly rate</label><input type="number" value={form.rate_weekly} onChange={(e) => setForm({ ...form, rate_weekly: e.target.value })} /></div>
              <div className="crm-form-field"><label>Monthly rate</label><input type="number" value={form.rate_monthly} onChange={(e) => setForm({ ...form, rate_monthly: e.target.value })} /></div>
            </div>
            <button type="submit" className="crm-btn">Create asset</button>
          </form>
        )}
        <table className="crm-table crm-mt">
          <thead><tr><th>Code</th><th>Name</th><th>Category</th><th>Qty</th><th>Daily</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id}>
                <td>{a.asset_code}</td>
                <td>{a.name}</td>
                <td>{ASSET_CATEGORY_LABELS[a.category] || a.category}</td>
                <td>{a.quantity_available}</td>
                <td>{formatCurrency(a.rate_daily)}</td>
                <td><span className={assetStatusClass(a.status)}>{ASSET_STATUS_LABELS[a.status] || a.status}</span></td>
                <td>
                  {hasPermission("rental.manage_assets") && a.status === "active" && (
                    <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => retire(a.id)}>Retire</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assets.length === 0 && !error && <p className="crm-muted crm-mt">No rentable assets yet.</p>}
      </div>
    </DashboardLayout>
  );
}

export default RentalAssets;
