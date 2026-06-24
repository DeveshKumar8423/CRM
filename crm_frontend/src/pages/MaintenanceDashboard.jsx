import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { assetStatusClass, formatDowntime } from "../utils/maintenance";
import { hasPermission } from "../utils/permissions";

function MaintenanceDashboard() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/maintenance/dashboard").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="Maintenance" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">Equipment servicing, breakdowns, and spare parts</p>
          <div className="crm-inline-actions">
            {hasPermission("maintenance.create_wo") && (
              <Link to="/maintenance/work-orders/new?type=breakdown" className="crm-btn crm-btn-sm">Report breakdown</Link>
            )}
            {hasPermission("maintenance.manage_assets") && (
              <Link to="/maintenance/assets/new" className="crm-btn crm-btn-sm crm-btn-outline">Register asset</Link>
            )}
            {hasPermission("maintenance.manage_settings") && (
              <Link to="/maintenance/settings" className="crm-btn crm-btn-sm crm-btn-outline">Settings</Link>
            )}
          </div>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {data && (
          <>
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><span className="crm-stat-value">{data.operational_assets}</span><span className="crm-stat-label">Operational</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.breakdown_assets}</span><span className="crm-stat-label">Breakdown</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.open_work_orders}</span><span className="crm-stat-label">Open WOs</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.overdue_pm_count}</span><span className="crm-stat-label">Overdue PM</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.downtime_hours_7d}h</span><span className="crm-stat-label">Downtime (7d)</span></div>
            </div>
            <div className="crm-inline-actions crm-mt">
              <Link to="/maintenance/work-orders" className="crm-btn crm-btn-sm crm-btn-outline">Work orders</Link>
              <Link to="/maintenance/assets" className="crm-btn crm-btn-sm crm-btn-outline">Assets</Link>
              <Link to="/maintenance/pm-schedule" className="crm-btn crm-btn-sm crm-btn-outline">PM schedule</Link>
            </div>
            <h3 className="crm-mt">Overdue PM</h3>
            {data.overdue_pm.length === 0 ? (
              <p className="crm-muted">No overdue preventive maintenance.</p>
            ) : (
              <table className="crm-table crm-mt">
                <thead><tr><th>Code</th><th>Asset</th><th>Due</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {data.overdue_pm.map((a) => (
                    <tr key={a.id}>
                      <td><Link to={`/maintenance/assets/${a.id}`}>{a.asset_code}</Link></td>
                      <td>{a.name}</td>
                      <td>{a.next_pm_due_date}</td>
                      <td><span className={assetStatusClass(a.status)}>{a.status}</span></td>
                      <td><Link to={`/maintenance/assets/${a.id}`} className="crm-btn crm-btn-sm crm-btn-outline">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <h3 className="crm-mt">Open breakdowns</h3>
            {data.open_breakdowns.length === 0 ? (
              <p className="crm-muted">No open breakdown work orders.</p>
            ) : (
              <table className="crm-table crm-mt">
                <thead><tr><th>MWO #</th><th>Asset</th><th>Priority</th><th>Title</th><th></th></tr></thead>
                <tbody>
                  {data.open_breakdowns.map((wo) => (
                    <tr key={wo.id}>
                      <td><Link to={`/maintenance/work-orders/${wo.id}`}>{wo.work_order_number}</Link></td>
                      <td>{wo.asset_name}</td>
                      <td>{wo.priority}</td>
                      <td>{wo.title}</td>
                      <td><Link to={`/maintenance/work-orders/${wo.id}`} className="crm-btn crm-btn-sm crm-btn-outline">Open</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <h3 className="crm-mt">Recent completions</h3>
            {data.recent_completions.length === 0 ? (
              <p className="crm-muted">No completed jobs yet.</p>
            ) : (
              <table className="crm-table crm-mt">
                <thead><tr><th>MWO #</th><th>Asset</th><th>Type</th><th>Downtime</th></tr></thead>
                <tbody>
                  {data.recent_completions.map((wo) => (
                    <tr key={wo.id}>
                      <td><Link to={`/maintenance/work-orders/${wo.id}`}>{wo.work_order_number}</Link></td>
                      <td>{wo.asset_name}</td>
                      <td>{wo.type}</td>
                      <td>{formatDowntime(wo.downtime_minutes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MaintenanceDashboard;
