import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { emptyForm } from "../utils/leaves";

function LeaveForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [form, setForm] = useState(emptyForm());
  const [meta, setMeta] = useState({ leave_types: [], half_day_periods: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    apiFetch("/leaves/meta").then(setMeta).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/leaves/${id}`).then((leave) => {
      setForm({
        leave_type: leave.leave_type,
        start_date: leave.start_date?.slice(0, 10) || "",
        end_date: leave.end_date?.slice(0, 10) || "",
        reason: leave.reason || "",
        is_half_day: leave.is_half_day,
        half_day_period: leave.half_day_period || "morning",
      });
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id, isEdit]);

  const buildPayload = (submit) => ({
    leave_type: form.leave_type,
    start_date: new Date(`${form.start_date}T12:00:00`).toISOString(),
    end_date: new Date(`${(form.is_half_day ? form.start_date : form.end_date)}T12:00:00`).toISOString(),
    reason: form.reason.trim(),
    is_half_day: form.is_half_day,
    half_day_period: form.is_half_day ? form.half_day_period : null,
    submit,
  });

  const save = async (submit) => {
    setError("");
    if (!form.reason.trim() || form.reason.trim().length < 10) {
      setError("Reason must be at least 10 characters");
      return;
    }
    try {
      const payload = buildPayload(submit);
      if (isEdit) {
        const { submit: _s, ...updatePayload } = payload;
        await apiFetch(`/leaves/${id}`, { method: "PUT", body: JSON.stringify(updatePayload) });
        if (submit) {
          await apiFetch(`/leaves/${id}/submit`, { method: "POST", body: JSON.stringify({}) });
        }
        navigate(`/leaves/${id}`);
      } else {
        const created = await apiFetch("/leaves", { method: "POST", body: JSON.stringify(payload) });
        navigate(`/leaves/${created.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Request leave" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? "Edit leave request" : "Request leave"} roleLabel={role}>
      <div className="crm-panel">
        <Link to={isEdit ? `/leaves/${id}` : "/leaves"} className="crm-link crm-link-left">← Back</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <form className="crm-form crm-mt" onSubmit={(e) => { e.preventDefault(); save(false); }}>
          <div className="crm-form-grid">
            <label>
              Leave type *
              <select value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value })} required>
                {(meta.leave_types || []).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label className="crm-consent-check crm-mt">
              <input type="checkbox" checked={form.is_half_day} onChange={(e) => setForm({ ...form, is_half_day: e.target.checked, end_date: form.start_date })} />
              Half day only
            </label>
            {form.is_half_day && (
              <label>
                Period
                <select value={form.half_day_period} onChange={(e) => setForm({ ...form, half_day_period: e.target.value })}>
                  {(meta.half_day_periods || []).map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>
            )}
            <label>
              Start date *
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value, end_date: form.is_half_day ? e.target.value : form.end_date })} required />
            </label>
            {!form.is_half_day && (
              <label>
                End date *
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
              </label>
            )}
          </div>
          <label className="crm-mt">
            Reason *
            <textarea rows={4} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Explain the reason for your leave request" required />
          </label>
          <div className="crm-form-actions crm-mt">
            <button type="submit" className="crm-btn crm-btn-outline">Save draft</button>
            <button type="button" className="crm-btn" onClick={() => save(true)}>Submit for approval</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default LeaveForm;
