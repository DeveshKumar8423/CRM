import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { API_URL, apiFetch, getAuthHeaders } from "../utils/api";

function AdminBranding() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    quote_prefix: "Quote-",
    invoice_prefix: "Inv-",
    quote_date_format: "DD/MM/YYYY",
    invoice_date_format: "DD/MM/YYYY",
    default_lead_source: "Omnichannel",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    apiFetch("/admin/settings").then((data) => {
      setSettings(data);
      setForm({
        quote_prefix: data.quote_prefix,
        invoice_prefix: data.invoice_prefix,
        quote_date_format: data.quote_date_format,
        invoice_date_format: data.invoice_date_format,
        default_lead_source: data.default_lead_source,
      });
    }).catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const updated = await apiFetch("/admin/settings", { method: "PUT", body: JSON.stringify(form) });
      setSettings(updated);
      setMessage("Document branding saved.");
    } catch (err) {
      setError(err.message);
    }
  };

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch(`${API_URL}/admin/settings/logo`, {
        method: "POST",
        headers: getAuthHeaders(),
        body,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Upload failed");
      }
      const updated = await res.json();
      setSettings(updated);
      setMessage("Company logo uploaded.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="Document Branding" roleLabel="Admin">
      <div className="crm-panel">
        <Link to="/admin-dashboard" className="crm-link crm-link-left">← Back to dashboard</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}

        <div className="crm-mt">
          <h3 className="crm-section-title">Company logo</h3>
          <p className="crm-muted crm-text-sm">Used on quotations and invoices (PNG/JPG, max 2 MB).</p>
          {settings?.logo_filename && (
            <p className="crm-muted crm-mt-sm">Current: {settings.logo_filename}</p>
          )}
          <input type="file" accept="image/*" className="crm-mt-sm" onChange={uploadLogo} />
        </div>

        <form className="crm-form crm-mt" onSubmit={save}>
          <h3 className="crm-section-title">Prefixes & formats</h3>
          <div className="crm-form-grid">
            <div><label>Quote prefix</label><input value={form.quote_prefix} onChange={(e) => setForm((f) => ({ ...f, quote_prefix: e.target.value }))} required /></div>
            <div><label>Invoice prefix</label><input value={form.invoice_prefix} onChange={(e) => setForm((f) => ({ ...f, invoice_prefix: e.target.value }))} required /></div>
            <div><label>Quote date format</label><input value={form.quote_date_format} onChange={(e) => setForm((f) => ({ ...f, quote_date_format: e.target.value }))} required /></div>
            <div><label>Invoice date format</label><input value={form.invoice_date_format} onChange={(e) => setForm((f) => ({ ...f, invoice_date_format: e.target.value }))} required /></div>
            <div><label>Default lead source</label><input value={form.default_lead_source} onChange={(e) => setForm((f) => ({ ...f, default_lead_source: e.target.value }))} required /></div>
          </div>
          <button type="submit" className="crm-btn crm-mt">Save branding</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default AdminBranding;
