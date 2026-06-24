import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatScheduleRange, fsoPriorityClass, fsoStatusClass } from "../utils/fieldService";
import { hasPermission } from "../utils/permissions";

function FieldServiceDashboard() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/field-service/dashboard").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="Field Service" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">Site visits, installations, and customer repairs</p>
          <div className="crm-inline-actions">
            {hasPermission("field_service.create") && (
              <Link to="/field-service/orders/new" className="crm-btn crm-btn-sm">New service order</Link>
            )}
            <Link to="/field-service/schedule" className="crm-btn crm-btn-sm crm-btn-outline">Schedule</Link>
            {hasPermission("field_service.manage_settings") && (
              <Link to="/field-service/settings" className="crm-btn crm-btn-sm crm-btn-outline">Settings</Link>
            )}
          </div>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {data && (
          <>
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><span className="crm-stat-value">{data.open_orders}</span><span className="crm-stat-label">Open orders</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.unassigned}</span><span className="crm-stat-label">Unassigned</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.todays_visits}</span><span className="crm-stat-label">Today&apos;s visits</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.sla_breached}</span><span className="crm-stat-label">SLA breached</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.completions_7d}</span><span className="crm-stat-label">Completed (7d)</span></div>
            </div>
            <div className="crm-inline-actions crm-mt">
              <Link to="/field-service/orders" className="crm-btn crm-btn-sm crm-btn-outline">All orders</Link>
            </div>
            <h3 className="crm-mt">Unassigned queue</h3>
            {data.unassigned_queue.length === 0 ? (
              <p className="crm-muted">No unassigned jobs.</p>
            ) : (
              <table className="crm-table crm-mt">
                <thead><tr><th>FSO #</th><th>Customer</th><th>Priority</th><th>Title</th><th></th></tr></thead>
                <tbody>
                  {data.unassigned_queue.map((o) => (
                    <tr key={o.id} className={o.sla_breached ? "fs-sla-breach-row" : ""}>
                      <td><Link to={`/field-service/orders/${o.id}`}>{o.order_number}</Link></td>
                      <td>{o.contact_name}</td>
                      <td><span className={fsoPriorityClass(o.priority)}>{o.priority}</span></td>
                      <td>{o.title}</td>
                      <td><Link to={`/field-service/orders/${o.id}`} className="crm-btn crm-btn-sm crm-btn-outline">Open</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <h3 className="crm-mt">Today&apos;s schedule</h3>
            {data.todays_schedule.length === 0 ? (
              <p className="crm-muted">No visits scheduled today.</p>
            ) : (
              <table className="crm-table crm-mt">
                <thead><tr><th>Time</th><th>FSO #</th><th>Customer</th><th>Technician</th><th>Status</th></tr></thead>
                <tbody>
                  {data.todays_schedule.map((o) => (
                    <tr key={o.id}>
                      <td>{formatScheduleRange(o.scheduled_start, o.scheduled_end)}</td>
                      <td><Link to={`/field-service/orders/${o.id}`}>{o.order_number}</Link></td>
                      <td>{o.contact_name}</td>
                      <td>{o.assigned_to_name || "—"}</td>
                      <td><span className={fsoStatusClass(o.status)}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {data.recent_completions.length > 0 && (
              <>
                <h3 className="crm-mt">Recent completions</h3>
                <table className="crm-table crm-mt">
                  <thead><tr><th>FSO #</th><th>Customer</th><th>Type</th><th>Title</th></tr></thead>
                  <tbody>
                    {data.recent_completions.map((o) => (
                      <tr key={o.id}>
                        <td><Link to={`/field-service/orders/${o.id}`}>{o.order_number}</Link></td>
                        <td>{o.contact_name}</td>
                        <td>{o.type}</td>
                        <td>{o.title}</td>
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

export default FieldServiceDashboard;
