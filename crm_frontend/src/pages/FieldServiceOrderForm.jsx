import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { FSO_PRIORITY_LABELS, FSO_TYPE_LABELS } from "../utils/fieldService";

function FieldServiceOrderForm() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({
    contact_id: "",
    type: "repair",
    priority: "normal",
    title: "",
    description: "",
    site_address: "",
    site_contact_name: "",
    site_contact_phone: "",
    site_notes: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/contacts?limit=200")
      .then((d) => setContacts(d.items || d || []))
      .catch(() => {});
  }, []);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onContactChange = (id) => {
    setField("contact_id", id);
    const c = contacts.find((x) => String(x.id) === String(id));
    if (c) {
      const addr = [c.address_line1, c.address_line2, c.city, c.state, c.pincode].filter(Boolean).join(", ");
      setForm((f) => ({
        ...f,
        contact_id: id,
        site_address: addr || f.site_address,
        site_contact_name: c.name || "",
        site_contact_phone: c.phone || "",
      }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch("/field-service/orders", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          contact_id: Number(form.contact_id),
        }),
      });
      navigate(`/field-service/orders/${data.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="New field service order" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/field-service/orders" className="crm-muted">← Orders</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <form className="crm-form crm-mt" onSubmit={submit}>
          <div className="crm-form-field">
            <label>Customer *</label>
            <select required value={form.contact_id} onChange={(e) => onContactChange(e.target.value)}>
              <option value="">Select contact</option>
              {(Array.isArray(contacts) ? contacts : []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.organization_name ? ` (${c.organization_name})` : ""}</option>
              ))}
            </select>
          </div>
          <div className="crm-form-field">
            <label>Type</label>
            <select value={form.type} onChange={(e) => setField("type", e.target.value)}>
              {Object.entries(FSO_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="crm-form-field">
            <label>Priority</label>
            <select value={form.priority} onChange={(e) => setField("priority", e.target.value)}>
              {Object.entries(FSO_PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="crm-form-field"><label>Title *</label><input required value={form.title} onChange={(e) => setField("title", e.target.value)} /></div>
          <div className="crm-form-field"><label>Description</label><textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3} /></div>
          <div className="crm-form-field"><label>Site address *</label><textarea required value={form.site_address} onChange={(e) => setField("site_address", e.target.value)} rows={2} /></div>
          <div className="crm-form-field"><label>On-site contact</label><input value={form.site_contact_name} onChange={(e) => setField("site_contact_name", e.target.value)} /></div>
          <div className="crm-form-field"><label>On-site phone</label><input value={form.site_contact_phone} onChange={(e) => setField("site_contact_phone", e.target.value)} /></div>
          <div className="crm-form-field"><label>Access / site notes</label><textarea value={form.site_notes} onChange={(e) => setField("site_notes", e.target.value)} rows={2} /></div>
          <button type="submit" className="crm-btn">Create order</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default FieldServiceOrderForm;
