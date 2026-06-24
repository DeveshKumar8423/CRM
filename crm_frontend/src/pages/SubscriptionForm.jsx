import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatCurrency } from "../utils/subscriptions";

function SubscriptionForm() {
  const role = localStorage.getItem("role") || "Staff";
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    contact_id: "",
    plan_id: "",
    start_date: new Date().toISOString().slice(0, 10),
    quantity: 1,
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      apiFetch("/contacts?limit=200"),
      apiFetch("/subscriptions/plans?status=active"),
    ])
      .then(([cData, pData]) => {
        setContacts(cData.items || []);
        setPlans(Array.isArray(pData) ? pData : []);
      })
      .catch((err) => setError(err.message));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const body = {
        contact_id: Number(form.contact_id),
        plan_id: Number(form.plan_id),
        start_date: form.start_date,
        quantity: Number(form.quantity) || 1,
        notes: form.notes || null,
      };
      const data = await apiFetch("/subscriptions", { method: "POST", body: JSON.stringify(body) });
      navigate(`/subscriptions/${data.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const selectedPlan = plans.find((p) => String(p.id) === String(form.plan_id));

  return (
    <DashboardLayout title="New subscription" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/subscriptions/list" className="crm-muted">← Subscriptions</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <form className="crm-form crm-mt" onSubmit={submit}>
          <div className="crm-form-field">
            <label>Contact</label>
            <select required value={form.contact_id} onChange={(e) => setForm({ ...form, contact_id: e.target.value })}>
              <option value="">Select contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="crm-form-field">
            <label>Plan</label>
            <select required value={form.plan_id} onChange={(e) => setForm({ ...form, plan_id: e.target.value })}>
              <option value="">Select plan</option>
              {plans.filter((p) => p.status === "active").map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}</option>
              ))}
            </select>
          </div>
          {selectedPlan && (
            <p className="crm-muted">Billing: {selectedPlan.billing_interval}{selectedPlan.trial_days ? ` · ${selectedPlan.trial_days}d trial` : ""}</p>
          )}
          <div className="crm-form-row">
            <div className="crm-form-field">
              <label>Start date</label>
              <input type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="crm-form-field">
              <label>Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
          </div>
          <div className="crm-form-field">
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" className="crm-btn">Create subscription</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default SubscriptionForm;
