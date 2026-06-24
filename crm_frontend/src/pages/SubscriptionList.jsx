import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { SUBSCRIPTION_STATUS_LABELS, formatCurrency, formatDate, subscriptionStatusClass } from "../utils/subscriptions";

function SubscriptionList() {
  const role = localStorage.getItem("role") || "Staff";
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const qs = params.toString();
    apiFetch(`/subscriptions${qs ? `?${qs}` : ""}`)
      .then((data) => { setItems(data.items || []); setTotal(data.total || 0); })
      .catch((err) => setError(err.message));
  }, [status]);

  return (
    <DashboardLayout title="Subscriptions" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/subscriptions" className="crm-muted">← Dashboard</Link>
          {hasPermission("subscriptions.create") && (
            <Link to="/subscriptions/new" className="crm-btn crm-btn-sm">New subscription</Link>
          )}
        </div>
        <div className="crm-inline-actions crm-mt">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="crm-select">
            <option value="">All statuses</option>
            {Object.entries(SUBSCRIPTION_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <span className="crm-muted">{total} total</span>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead>
            <tr><th>SUB #</th><th>Contact</th><th>Plan</th><th>Status</th><th>Next billing</th><th>MRR</th></tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td><Link to={`/subscriptions/${s.id}`}>{s.subscription_number}</Link></td>
                <td>{s.contact_name}</td>
                <td>{s.plan_name}</td>
                <td><span className={subscriptionStatusClass(s.status)}>{SUBSCRIPTION_STATUS_LABELS[s.status] || s.status}</span></td>
                <td>{formatDate(s.next_billing_date)}</td>
                <td>{formatCurrency(s.mrr_contribution)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="crm-muted crm-mt">No subscriptions found.</p>}
      </div>
    </DashboardLayout>
  );
}

export default SubscriptionList;
