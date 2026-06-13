import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

const emptyForm = {
  title: "",
  stage: "new",
  expected_value: "",
  currency: "INR",
  expected_close_date: "",
  notes: "",
  lost_reason: "",
  lead_id: "",
  contact_id: "",
  product_id: "",
  assigned_to_id: "",
};

function DealForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const canAssign = hasPermission("deals.assign");
  const [form, setForm] = useState({
    ...emptyForm,
    lead_id: searchParams.get("lead_id") || "",
    contact_id: searchParams.get("contact_id") || "",
  });
  const [stages, setStages] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    Promise.all([
      apiFetch("/deals/stages"),
      canAssign ? apiFetch("/deals/assignees") : Promise.resolve([]),
    ])
      .then(([stageList, staff]) => {
        setStages(stageList);
        setAssignees(staff);
      })
      .catch(() => {});
  }, [canAssign]);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/deals/${id}`)
      .then((deal) => setForm({
        title: deal.title || "",
        stage: deal.stage || "new",
        expected_value: deal.expected_value != null ? String(deal.expected_value) : "",
        currency: deal.currency || "INR",
        expected_close_date: deal.expected_close_date
          ? deal.expected_close_date.slice(0, 10)
          : "",
        notes: deal.notes || "",
        lost_reason: deal.lost_reason || "",
        lead_id: deal.lead_id ? String(deal.lead_id) : "",
        contact_id: deal.contact_id ? String(deal.contact_id) : "",
        product_id: deal.product_id ? String(deal.product_id) : "",
        assigned_to_id: deal.assigned_to_id ? String(deal.assigned_to_id) : "",
      }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const buildPayload = () => ({
    title: form.title.trim(),
    stage: form.stage,
    expected_value: form.expected_value ? Number(form.expected_value) : null,
    currency: form.currency || "INR",
    expected_close_date: form.expected_close_date
      ? new Date(`${form.expected_close_date}T00:00:00`).toISOString()
      : null,
    notes: form.notes || null,
    lost_reason: form.stage === "lost" ? (form.lost_reason || null) : null,
    lead_id: form.lead_id ? Number(form.lead_id) : null,
    contact_id: form.contact_id ? Number(form.contact_id) : null,
    product_id: form.product_id ? Number(form.product_id) : null,
    assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = buildPayload();
      if (isEdit) {
        await apiFetch(`/deals/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        navigate(`/deals/${id}`);
      } else {
        const created = await apiFetch("/deals", { method: "POST", body: JSON.stringify(payload) });
        navigate(`/deals/${created.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Deal" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? "Edit Deal" : "New Deal"} roleLabel={role}>
      <div className="crm-panel">
        <Link to={isEdit ? `/deals/${id}` : "/pipeline"} className="crm-link crm-link-left">← Back</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}

        <form onSubmit={handleSubmit} className="crm-form crm-mt">
          <div className="crm-form-grid">
            <div className="crm-span-2">
              <label>Deal title *</label>
              <input value={form.title} onChange={(e) => handleChange("title", e.target.value)} required />
            </div>
            <div>
              <label>Stage</label>
              <select value={form.stage} onChange={(e) => handleChange("stage", e.target.value)}>
                {stages.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Expected value (INR)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.expected_value}
                onChange={(e) => handleChange("expected_value", e.target.value)}
              />
            </div>
            <div>
              <label>Expected close date</label>
              <input
                type="date"
                value={form.expected_close_date}
                onChange={(e) => handleChange("expected_close_date", e.target.value)}
              />
            </div>
            {canAssign && (
              <div>
                <label>Assigned to</label>
                <select value={form.assigned_to_id} onChange={(e) => handleChange("assigned_to_id", e.target.value)}>
                  <option value="">Unassigned</option>
                  {assignees.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label>Lead ID (optional)</label>
              <input value={form.lead_id} onChange={(e) => handleChange("lead_id", e.target.value)} />
            </div>
            <div>
              <label>Contact ID (optional)</label>
              <input value={form.contact_id} onChange={(e) => handleChange("contact_id", e.target.value)} />
            </div>
            <div>
              <label>Product ID (optional)</label>
              <input value={form.product_id} onChange={(e) => handleChange("product_id", e.target.value)} />
            </div>
            {form.stage === "lost" && (
              <div className="crm-span-2">
                <label>Lost reason</label>
                <input value={form.lost_reason} onChange={(e) => handleChange("lost_reason", e.target.value)} />
              </div>
            )}
          </div>
          <label>Notes</label>
          <textarea className="crm-textarea" rows={4} value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} />
          <button type="submit" className="crm-btn crm-btn-inline">{isEdit ? "Save" : "Create"}</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default DealForm;
