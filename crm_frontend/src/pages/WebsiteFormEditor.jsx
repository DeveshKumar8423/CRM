import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { emptyFormBuilder } from "../utils/website";

const FIELD_TYPES = ["text", "email", "phone", "textarea", "select", "hidden"];
const MAP_TO = ["name", "email", "phone", "organization_name", "requirement", "notes"];

function WebsiteFormEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [form, setForm] = useState(emptyFormBuilder());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/website/forms/${id}`)
      .then((data) => setForm({
        name: data.name,
        slug: data.slug,
        fields_json: data.fields_json || [],
        success_message: data.success_message,
        redirect_url: data.redirect_url || "",
        is_active: data.is_active,
      }))
      .catch((err) => setError(err.message));
  }, [id, isEdit]);

  const addField = () => {
    setForm((f) => ({
      ...f,
      fields_json: [...(f.fields_json || []), { key: `field_${Date.now()}`, type: "text", label: "New field", required: false, map_to: "notes" }],
    }));
  };

  const updateField = (index, patch) => {
    const fields = [...(form.fields_json || [])];
    fields[index] = { ...fields[index], ...patch };
    setForm((f) => ({ ...f, fields_json: fields }));
  };

  const removeField = (index) => {
    setForm((f) => ({ ...f, fields_json: f.fields_json.filter((_, i) => i !== index) }));
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await apiFetch(`/website/forms/${id}`, { method: "PUT", body: JSON.stringify(form) });
        navigate("/website/forms");
      } else {
        await apiFetch("/website/forms", { method: "POST", body: JSON.stringify(form) });
        navigate("/website/forms");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title={isEdit ? "Edit form" : "New form"} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/website/forms" className="crm-back-link">← Forms</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <div className="crm-form-grid crm-mt">
          <div className="crm-form-field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="crm-form-field"><label>Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div className="crm-form-field crm-form-field-full"><label>Success message</label><input value={form.success_message} onChange={(e) => setForm({ ...form, success_message: e.target.value })} /></div>
          <label className="crm-checkbox crm-form-field-full"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
        </div>
        <h3 className="crm-mt">Fields</h3>
        <button type="button" className="crm-btn crm-btn-sm crm-btn-outline crm-mt" onClick={addField}>+ Add field</button>
        {(form.fields_json || []).map((field, index) => (
          <div key={field.key || index} className="crm-website-editor-section crm-mt">
            <div className="crm-form-grid">
              <div className="crm-form-field"><label>Key</label><input value={field.key || ""} onChange={(e) => updateField(index, { key: e.target.value })} /></div>
              <div className="crm-form-field"><label>Label</label><input value={field.label || ""} onChange={(e) => updateField(index, { label: e.target.value })} /></div>
              <div className="crm-form-field">
                <label>Type</label>
                <select value={field.type} onChange={(e) => updateField(index, { type: e.target.value })}>
                  {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="crm-form-field">
                <label>Map to lead</label>
                <select value={field.map_to || ""} onChange={(e) => updateField(index, { map_to: e.target.value || null })}>
                  <option value="">—</option>
                  {MAP_TO.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <label className="crm-checkbox"><input type="checkbox" checked={field.required} onChange={(e) => updateField(index, { required: e.target.checked })} /> Required</label>
            </div>
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline crm-mt" onClick={() => removeField(index)}>Remove field</button>
          </div>
        ))}
        <div className="crm-form-actions crm-mt">
          <button type="button" className="crm-btn crm-btn-outline" onClick={() => navigate("/website/forms")}>Cancel</button>
          <button type="button" className="crm-btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default WebsiteFormEditor;
