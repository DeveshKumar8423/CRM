import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatQty, woStatusClass, WO_STATUS_LABELS } from "../utils/manufacturing";
import { hasPermission } from "../utils/permissions";

function WorkOrders() {
  const role = localStorage.getItem("role") || "Staff";
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    const qs = status ? `?status=${status}` : "";
    apiFetch(`/manufacturing/work-orders${qs}`).then((d) => setItems(d.items)).catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, [status]);

  return (
    <DashboardLayout title="Work orders" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/manufacturing" className="crm-muted">← Manufacturing</Link>
          {hasPermission("manufacturing.create_wo") && (
            <Link to="/manufacturing/work-orders/new" className="crm-btn crm-btn-sm">New work order</Link>
          )}
        </div>
        <div className="crm-form-field crm-mt">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            {Object.entries(WO_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>WO #</th><th>Product</th><th>Planned</th><th>Completed</th><th>Status</th><th>Due</th></tr></thead>
          <tbody>
            {items.map((wo) => (
              <tr key={wo.id}>
                <td><Link to={`/manufacturing/work-orders/${wo.id}`}>{wo.work_order_number}</Link></td>
                <td>{wo.product_name}</td>
                <td>{formatQty(wo.planned_qty)}</td>
                <td>{formatQty(wo.completed_qty)}</td>
                <td><span className={woStatusClass(wo.status)}>{WO_STATUS_LABELS[wo.status] || wo.status}</span></td>
                <td>{wo.planned_end || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default WorkOrders;
