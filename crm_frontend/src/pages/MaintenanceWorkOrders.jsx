import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { MWO_STATUS_LABELS, MWO_TYPE_LABELS, mwoStatusClass } from "../utils/maintenance";
import { hasPermission } from "../utils/permissions";

function MaintenanceWorkOrders() {
  const role = localStorage.getItem("role") || "Staff";
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    const qs = params.toString();
    apiFetch(`/maintenance/work-orders${qs ? `?${qs}` : ""}`)
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message));
  }, [type, status]);

  return (
    <DashboardLayout title="Maintenance work orders" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/maintenance" className="crm-muted">← Maintenance</Link>
          {hasPermission("maintenance.create_wo") && (
            <Link to="/maintenance/work-orders/new" className="crm-btn crm-btn-sm">New work order</Link>
          )}
        </div>
        <div className="crm-inline-actions crm-mt">
          <select value={type} onChange={(e) => setType(e.target.value)} className="crm-select">
            <option value="">All types</option>
            {Object.entries(MWO_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="crm-select">
            <option value="">All statuses</option>
            {Object.entries(MWO_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>MWO #</th><th>Asset</th><th>Type</th><th>Priority</th><th>Status</th><th>Reported</th></tr></thead>
          <tbody>
            {items.map((wo) => (
              <tr key={wo.id}>
                <td><Link to={`/maintenance/work-orders/${wo.id}`}>{wo.work_order_number}</Link></td>
                <td>{wo.asset_name}</td>
                <td>{MWO_TYPE_LABELS[wo.type] || wo.type}</td>
                <td>{wo.priority}</td>
                <td><span className={mwoStatusClass(wo.status)}>{MWO_STATUS_LABELS[wo.status] || wo.status}</span></td>
                <td>{wo.reported_at ? new Date(wo.reported_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="crm-muted crm-mt">No work orders found.</p>}
      </div>
    </DashboardLayout>
  );
}

export default MaintenanceWorkOrders;
