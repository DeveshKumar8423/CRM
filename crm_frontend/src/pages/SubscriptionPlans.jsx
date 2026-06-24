import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { BILLING_INTERVAL_LABELS, PLAN_STATUS_LABELS, formatCurrency } from "../utils/subscriptions";

function SubscriptionPlans() {
  const role = localStorage.getItem("role") || "Staff";
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    plan_code: "",
    name: "",
    description: "",
    billing_interval: "monthly",
    interval_days: "",
    price: "",
    gst_rate: 18,
    trial_days: 0,
  });

  const load = () => apiFetch("/subscriptions/plans").then(setPlans).catch((err) => setError(err.message));

  useEffect(() => { load(); }, []);

  const savePlan = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const body = {
        ...form,
        price: Number(form.price),
        interval_days: form.billing_interval === "custom_days" ? Number(form.interval_days) : null,
        trial_days: Number(form.trial_days) || 0,
      };
      await apiFetch("/subscriptions/plans", { method: "POST", body: JSON.stringify(body) });
      setShowForm(false);
      setForm({ plan_code: "", name: "", description: "", billing_interval: "monthly", interval_days: "", price: "", gst_rate: 18, trial_days: 0 });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const archivePlan = async (id) => {
    try {
      await apiFetch(`/subscriptions/plans/${id}`, { method: "PUT", body: JSON.stringify({ status: "archived" }) });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="Subscription plans" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/subscriptions" className="crm-muted">← Subscriptions</Link>
          {hasPermission("subscriptions.manage_plans") && (
            <button type="button" className="crm-btn crm-btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "New plan"}
            </button>
          )}
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {showForm && (
          <form className="crm-form crm-mt" onSubmit={savePlan}>
            <div className="crm-form-row">
              <div className="crm-form-field"><label>Plan code</label><input required value={form.plan_code} onChange={(e) => setForm({ ...form, plan_code: e.target.value })} /></div>
              <div className="crm-form-field"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            </div>
            <div className="crm-form-field"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="crm-form-row">
              <div className="crm-form-field">
                <label>Billing interval</label>
                <select value={form.billing_interval} onChange={(e) => setForm({ ...form, billing_interval: e.target.value })}>
                  {Object.entries(BILLING_INTERVAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {form.billing_interval === "custom_days" && (
                <div className="crm-form-field"><label>Interval days</label><input type="number" min="1" required value={form.interval_days} onChange={(e) => setForm({ ...form, interval_days: e.target.value })} /></div>
              )}
              <div className="crm-form-field"><label>Price (INR)</label><input type="number" min="1" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div className="crm-form-field"><label>GST %</label><input type="number" value={form.gst_rate} onChange={(e) => setForm({ ...form, gst_rate: e.target.value })} /></div>
              <div className="crm-form-field"><label>Trial days</label><input type="number" min="0" value={form.trial_days} onChange={(e) => setForm({ ...form, trial_days: e.target.value })} /></div>
            </div>
            <button type="submit" className="crm-btn">Create plan</button>
          </form>
        )}
        <table className="crm-table crm-mt">
          <thead><tr><th>Code</th><th>Name</th><th>Interval</th><th>Price</th><th>GST</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id}>
                <td>{p.plan_code}</td>
                <td>{p.name}</td>
                <td>{BILLING_INTERVAL_LABELS[p.billing_interval] || p.billing_interval}</td>
                <td>{formatCurrency(p.price)}</td>
                <td>{p.gst_rate}%</td>
                <td>{PLAN_STATUS_LABELS[p.status] || p.status}</td>
                <td>
                  {hasPermission("subscriptions.manage_plans") && p.status === "active" && (
                    <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => archivePlan(p.id)}>Archive</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {plans.length === 0 && !error && <p className="crm-muted crm-mt">No plans yet.</p>}
      </div>
    </DashboardLayout>
  );
}

export default SubscriptionPlans;
