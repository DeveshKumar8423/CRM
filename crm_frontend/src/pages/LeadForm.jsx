import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  organization_name: "",
  city: "",
  requirement: "",
  exact_requirement: "",
  source: "Omnichannel",
  status: "open",
  notes: "",
  assigned_to_id: "",
};

function LeadForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const canAssign = hasPermission("leads.assign");
  const [form, setForm] = useState(emptyForm);
  const [sources, setSources] = useState(["Omnichannel"]);
  const [statuses, setStatuses] = useState(["open"]);
  const [assignees, setAssignees] = useState([]);
  const [duplicateWarning, setDuplicateWarning] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    Promise.all([
      apiFetch("/leads/sources"),
      apiFetch("/leads/statuses"),
      canAssign ? apiFetch("/leads/assignees") : Promise.resolve([]),
    ])
      .then(([sourceList, statusList, staff]) => {
        setSources(sourceList);
        setStatuses(statusList);
        setAssignees(staff);
      })
      .catch(() => {});
  }, [canAssign]);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/leads/${id}`)
      .then((lead) => setForm({
        name: lead.name || "",
        phone: lead.phone || "",
        email: lead.email || "",
        organization_name: lead.organization_name || "",
        city: lead.city || "",
        requirement: lead.requirement || "",
        exact_requirement: lead.exact_requirement || "",
        source: lead.source || "Omnichannel",
        status: lead.status || "open",
        notes: lead.notes || "",
        assigned_to_id: lead.assigned_to_id ? String(lead.assigned_to_id) : "",
      }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const checkDuplicate = async (phone) => {
    if (!phone || phone.length < 8) {
      setDuplicateWarning("");
      return;
    }
    try {
      const result = await apiFetch(`/leads/check-duplicate?phone=${encodeURIComponent(phone)}`);
      if (!result.has_duplicates) {
        setDuplicateWarning("");
        return;
      }
      const parts = [];
      if (result.leads.length) parts.push(`${result.leads.length} lead(s)`);
      if (result.contacts.length) parts.push(`${result.contacts.length} contact(s)`);
      setDuplicateWarning(`Possible duplicate: ${parts.join(" and ")} with this phone.`);
    } catch {
      setDuplicateWarning("");
    }
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    phone: form.phone || null,
    email: form.email || null,
    organization_name: form.organization_name || null,
    city: form.city || null,
    requirement: form.requirement || null,
    exact_requirement: form.exact_requirement || null,
    source: form.source,
    status: form.status,
    notes: form.notes || null,
    assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = buildPayload();
      if (isEdit) {
        await apiFetch(`/leads/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        navigate(`/leads/${id}`);
      } else {
        const created = await apiFetch("/leads", { method: "POST", body: JSON.stringify(payload) });
        navigate(`/leads/${created.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Lead" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? "Edit Lead" : "New Lead"} roleLabel={role}>
      <div className="crm-panel">
        <Link to={isEdit ? `/leads/${id}` : "/leads"} className="crm-link crm-link-left">← Back</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {duplicateWarning && <p className="crm-alert crm-alert-warn crm-mt">{duplicateWarning}</p>}

        <form onSubmit={handleSubmit} className="crm-form crm-mt">
          <div className="crm-form-grid">
            <div><label>Name *</label><input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required /></div>
            <div>
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} onBlur={(e) => checkDuplicate(e.target.value)} />
            </div>
            <div><label>Email</label><input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} /></div>
            <div><label>Organization</label><input value={form.organization_name} onChange={(e) => handleChange("organization_name", e.target.value)} /></div>
            <div><label>City</label><input value={form.city} onChange={(e) => handleChange("city", e.target.value)} /></div>
            <div><label>Source</label>
              <select value={form.source} onChange={(e) => handleChange("source", e.target.value)}>
                {sources.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label>Status</label>
              <select value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {canAssign && (
              <div><label>Assigned to</label>
                <select value={form.assigned_to_id} onChange={(e) => handleChange("assigned_to_id", e.target.value)}>
                  <option value="">Unassigned</option>
                  {assignees.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="crm-span-2"><label>Requirement</label><input value={form.requirement} onChange={(e) => handleChange("requirement", e.target.value)} /></div>
          </div>
          <label>Exact requirement</label>
          <textarea className="crm-textarea" rows={3} value={form.exact_requirement} onChange={(e) => handleChange("exact_requirement", e.target.value)} />
          <label>Notes</label>
          <textarea className="crm-textarea" rows={3} value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} />
          <button type="submit" className="crm-btn crm-btn-inline">{isEdit ? "Save" : "Create"}</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default LeadForm;
