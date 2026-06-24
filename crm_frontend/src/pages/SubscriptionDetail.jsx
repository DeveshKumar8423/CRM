import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  SUBSCRIPTION_STATUS_LABELS,
  formatCurrency,
  formatDate,
  subscriptionStatusClass,
} from "../utils/subscriptions";

function SubscriptionDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [sub, setSub] = useState(null);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [cancelReason, setCancelReason] = useState("");
  const [changePlanId, setChangePlanId] = useState("");

  const load = () => apiFetch(`/subscriptions/${id}`).then(setSub).catch((err) => setError(err.message));

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (hasPermission("subscriptions.change_plan")) {
      apiFetch("/subscriptions/plans?status=active").then((data) => setPlans(Array.isArray(data) ? data : [])).catch(() => {});
    }
  }, []);

  const cancel = async (immediate) => {
    setError("");
    try {
      const data = await apiFetch(`/subscriptions/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ immediate, cancellation_reason: cancelReason || null }),
      });
      setSub(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const changePlan = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch(`/subscriptions/${id}/change-plan`, {
        method: "POST",
        body: JSON.stringify({ new_plan_id: Number(changePlanId) }),
      });
      setSub(data);
      setChangePlanId("");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!sub && !error) {
    return (
      <DashboardLayout title="Subscription" roleLabel={role}>
        <div className="crm-panel"><p className="crm-muted">Loading…</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={sub?.subscription_number || "Subscription"} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/subscriptions/list" className="crm-muted">← Subscriptions</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {sub && (
          <>
            <div className="crm-detail-header crm-mt">
              <div>
                <h2>{sub.subscription_number}</h2>
                <p>{sub.contact_name} · {sub.plan_name}</p>
                <span className={subscriptionStatusClass(sub.status)}>{SUBSCRIPTION_STATUS_LABELS[sub.status] || sub.status}</span>
                {sub.cancel_at_period_end && <span className="crm-badge crm-sub-status-cancelled crm-ml">Cancels at period end</span>}
              </div>
              <div className="crm-inline-actions">
                {hasPermission("subscriptions.cancel") && !["cancelled", "expired"].includes(sub.status) && (
                  <>
                    <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => cancel(false)}>Cancel at period end</button>
                    <button type="button" className="crm-btn crm-btn-sm" onClick={() => cancel(true)}>Cancel now</button>
                  </>
                )}
              </div>
            </div>
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><span className="crm-stat-value">{formatCurrency(sub.mrr_contribution)}</span><span className="crm-stat-label">MRR</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{formatDate(sub.start_date)}</span><span className="crm-stat-label">Start</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{formatDate(sub.next_billing_date)}</span><span className="crm-stat-label">Next billing</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{formatDate(sub.current_period_end)}</span><span className="crm-stat-label">Period end</span></div>
            </div>
            {hasPermission("subscriptions.cancel") && !["cancelled", "expired"].includes(sub.status) && (
              <div className="crm-form-field crm-mt">
                <label>Cancellation reason (optional)</label>
                <input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
              </div>
            )}
            <div className="crm-tabs crm-mt">
              <button type="button" className={tab === "overview" ? "crm-tab-active" : ""} onClick={() => setTab("overview")}>Overview</button>
              <button type="button" className={tab === "invoices" ? "crm-tab-active" : ""} onClick={() => setTab("invoices")}>Invoices</button>
              <button type="button" className={tab === "history" ? "crm-tab-active" : ""} onClick={() => setTab("history")}>History</button>
            </div>
            {tab === "overview" && (
              <div className="crm-mt">
                {sub.notes && <p><strong>Notes:</strong> {sub.notes}</p>}
                {sub.trial_end_date && <p className="crm-muted">Trial ends: {formatDate(sub.trial_end_date)}</p>}
                {hasPermission("subscriptions.change_plan") && !["cancelled", "expired"].includes(sub.status) && (
                  <form className="crm-form crm-mt" onSubmit={changePlan}>
                    <h4>Change plan</h4>
                    <div className="crm-form-row">
                      <select required value={changePlanId} onChange={(e) => setChangePlanId(e.target.value)}>
                        <option value="">Select new plan</option>
                        {plans.filter((p) => p.id !== sub.plan_id).map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <button type="submit" className="crm-btn crm-btn-sm">Apply</button>
                    </div>
                  </form>
                )}
              </div>
            )}
            {tab === "invoices" && (
              <table className="crm-table crm-mt">
                <thead><tr><th>Invoice</th><th>Status</th><th>Period</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {(sub.invoices || []).map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.invoice_number || `#${inv.invoice_id}`}</td>
                      <td>{inv.invoice_status}</td>
                      <td>{formatDate(inv.billing_period_start)} – {formatDate(inv.billing_period_end)}</td>
                      <td>{formatCurrency(inv.grand_total)}</td>
                      <td><Link to={`/invoices/${inv.invoice_id}`} className="crm-btn crm-btn-sm crm-btn-outline">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === "history" && (
              <table className="crm-table crm-mt">
                <thead><tr><th>Date</th><th>From</th><th>To</th><th>Type</th><th>Notes</th></tr></thead>
                <tbody>
                  {(sub.plan_changes || []).map((c) => (
                    <tr key={c.id}>
                      <td>{formatDate(c.effective_date)}</td>
                      <td>{c.from_plan_name}</td>
                      <td>{c.to_plan_name}</td>
                      <td>{c.change_type}</td>
                      <td>{c.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {(tab === "invoices" && (sub.invoices || []).length === 0) && <p className="crm-muted crm-mt">No invoices yet.</p>}
            {(tab === "history" && (sub.plan_changes || []).length === 0) && <p className="crm-muted crm-mt">No plan changes.</p>}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default SubscriptionDetail;
