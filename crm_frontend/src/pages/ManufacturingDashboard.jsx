import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatQty } from "../utils/manufacturing";
import { hasPermission } from "../utils/permissions";

function ManufacturingDashboard() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/manufacturing/dashboard").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="Manufacturing" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">Production planning, BOMs, and work orders</p>
          <div className="crm-inline-actions">
            {hasPermission("manufacturing.create_wo") && (
              <Link to="/manufacturing/work-orders/new" className="crm-btn crm-btn-sm">New work order</Link>
            )}
            {hasPermission("manufacturing.manage_bom") && (
              <Link to="/manufacturing/boms/new" className="crm-btn crm-btn-sm crm-btn-outline">New BOM</Link>
            )}
            {hasPermission("manufacturing.manage_settings") && (
              <Link to="/manufacturing/settings" className="crm-btn crm-btn-sm crm-btn-outline">Settings</Link>
            )}
          </div>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {data && (
          <>
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><span className="crm-stat-value">{data.open_work_orders}</span><span className="crm-stat-label">Open work orders</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.overdue_work_orders}</span><span className="crm-stat-label">Overdue</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.shortages_count}</span><span className="crm-stat-label">Material shortages</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{formatQty(data.fg_produced_7d)}</span><span className="crm-stat-label">FG produced (7d)</span></div>
            </div>
            <div className="crm-inline-actions crm-mt">
              <Link to="/manufacturing/work-orders" className="crm-btn crm-btn-sm crm-btn-outline">Work orders</Link>
              <Link to="/manufacturing/boms" className="crm-btn crm-btn-sm crm-btn-outline">BOMs</Link>
              <Link to="/quality/inspections?status=pending&point=WO_FINAL" className="crm-btn crm-btn-sm crm-btn-outline">QC queue</Link>
            </div>
            <h3 className="crm-mt">Recent work orders</h3>
            {data.recent_work_orders.length === 0 ? (
              <p className="crm-muted crm-mt">No work orders yet.</p>
            ) : (
              <table className="crm-table crm-mt">
                <thead><tr><th>WO #</th><th>Product</th><th>Planned</th><th>Status</th><th>Due</th></tr></thead>
                <tbody>
                  {data.recent_work_orders.map((wo) => (
                    <tr key={wo.id}>
                      <td><Link to={`/manufacturing/work-orders/${wo.id}`}>{wo.work_order_number}</Link></td>
                      <td>{wo.product_name}</td>
                      <td>{formatQty(wo.planned_qty)}</td>
                      <td>{wo.status}</td>
                      <td>{wo.planned_end || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {data.critical_shortages.length > 0 && (
              <>
                <h3 className="crm-mt">Critical shortages</h3>
                <table className="crm-table crm-mt mfg-shortage-table">
                  <thead><tr><th>Component</th><th>Required</th><th>On hand</th><th>Short</th></tr></thead>
                  <tbody>
                    {data.critical_shortages.map((s) => (
                      <tr key={s.product_id} className="mfg-shortage-row">
                        <td>{s.product_name}</td>
                        <td>{formatQty(s.required_qty)} {s.unit}</td>
                        <td>{formatQty(s.on_hand)}</td>
                        <td>{formatQty(s.shortage)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ManufacturingDashboard;
