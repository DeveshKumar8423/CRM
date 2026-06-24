import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { ASSET_CRITICALITY_LABELS, ASSET_STATUS_LABELS } from "../utils/maintenance";

function MaintenanceAssetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const role = localStorage.getItem("role") || "Staff";
  const [categories, setCategories] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    status: "operational",
    criticality: "medium",
    location_notes: "",
    manufacturer: "",
    model: "",
    serial_number: "",
    pm_interval_days: "",
    vendor_contact_id: "",
    notes: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/maintenance/categories").then(setCategories).catch(() => {});
    apiFetch("/contacts?limit=200").then((d) => setContacts(d.items || d || [])).catch(() => {});
    if (isEdit) {
      apiFetch(`/maintenance/assets/${id}`).then((a) => {
        setForm({
          name: a.name || "",
          category_id: a.category_id || "",
          status: a.status || "operational",
          criticality: a.criticality || "medium",
          location_notes: a.location_notes || "",
          manufacturer: a.manufacturer || "",
          model: a.model || "",
          serial_number: a.serial_number || "",
          pm_interval_days: a.pm_interval_days || "",
          vendor_contact_id: a.vendor_contact_id || "",
          notes: a.notes || "",
        });
      }).catch((err) => setError(err.message));
    }
  }, [id, isEdit]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const body = {
      ...form,
      category_id: form.category_id ? Number(form.category_id) : null,
      pm_interval_days: form.pm_interval_days ? Number(form.pm_interval_days) : null,
      vendor_contact_id: form.vendor_contact_id ? Number(form.vendor_contact_id) : null,
    };
    try {
      const data = isEdit
        ? await apiFetch(`/maintenance/assets/${id}`, { method: "PUT", body: JSON.stringify(body) })
        : await apiFetch("/maintenance/assets", { method: "POST", body: JSON.stringify(body) });
      navigate(`/maintenance/assets/${data.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title={isEdit ? "Edit asset" : "Register asset"} roleLabel={role}>
      <div className="crm-panel">
        <Link to={isEdit ? `/maintenance/assets/${id}` : "/maintenance/assets"} className="crm-muted">← Back</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <form className="crm-form crm-mt" onSubmit={submit}>
          <div className="crm-form-field"><label>Name *</label><input required value={form.name} onChange={(e) => setField("name", e.target.value)} /></div>
          <div className="crm-form-field">
            <label>Category</label>
            <select value={form.category_id} onChange={(e) => setField("category_id", e.target.value)}>
              <option value="">—</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="crm-form-field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
              {Object.entries(ASSET_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="crm-form-field">
            <label>Criticality</label>
            <select value={form.criticality} onChange={(e) => setField("criticality", e.target.value)}>
              {Object.entries(ASSET_CRITICALITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="crm-form-field"><label>Location</label><input value={form.location_notes} onChange={(e) => setField("location_notes", e.target.value)} /></div>
          <div className="crm-form-field"><label>PM interval (days)</label><input type="number" min="1" value={form.pm_interval_days} onChange={(e) => setField("pm_interval_days", e.target.value)} /></div>
          <div className="crm-form-field"><label>Manufacturer</label><input value={form.manufacturer} onChange={(e) => setField("manufacturer", e.target.value)} /></div>
          <div className="crm-form-field"><label>Model</label><input value={form.model} onChange={(e) => setField("model", e.target.value)} /></div>
          <div className="crm-form-field"><label>Serial number</label><input value={form.serial_number} onChange={(e) => setField("serial_number", e.target.value)} /></div>
          <div className="crm-form-field">
            <label>AMC vendor</label>
            <select value={form.vendor_contact_id} onChange={(e) => setField("vendor_contact_id", e.target.value)}>
              <option value="">—</option>
              {(Array.isArray(contacts) ? contacts : []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="crm-form-field"><label>Notes</label><textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} rows={3} /></div>
          <button type="submit" className="crm-btn">{isEdit ? "Save" : "Register"}</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default MaintenanceAssetForm;
