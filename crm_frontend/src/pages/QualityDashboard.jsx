import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { alertSeverityClass } from "../utils/quality";
import { hasPermission } from "../utils/permissions";

function QualityDashboard() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = () => apiFetch("/quality/dashboard").then(setData).catch((err) => setError(err.message));

  useEffect(() => { load(); }, []);

  const ackAlert = async (id) => {
    await apiFetch(`/quality/alerts/${id}/acknowledge`, { method: "PUT" });
    load();
  };

  return (
    <DashboardLayout title="Quality Control" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">Inspections, alerts, and corrective actions</p>
          <div className="crm-inline-actions">
            {hasPermission("quality.inspect") && (
              <Link to="/quality/inspections/new" className="crm-btn crm-btn-sm">New inspection</Link>
            )}
            {hasPermission("quality.manage_settings") && (
              <Link to="/quality/settings" className="crm-btn crm-btn-sm crm-btn-outline">Settings</Link>
            )}
          </div>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {data && (
          <>
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><span className="crm-stat-value">{data.pending_inspections}</span><span className="crm-stat-label">Pending</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.failed_inspections_7d}</span><span className="crm-stat-label">Failed (7d)</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.pass_rate_30d}%</span><span className="crm-stat-label">Pass rate (30d)</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.open_alerts}</span><span className="crm-stat-label">Open alerts</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.open_capas}</span><span className="crm-stat-label">Open CAPAs</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.overdue_capas}</span><span className="crm-stat-label">Overdue CAPAs</span></div>
            </div>
            <div className="crm-inline-actions crm-mt">
              <Link to="/quality/inspections" className="crm-btn crm-btn-sm crm-btn-outline">Inspections</Link>
              <Link to="/quality/corrective-actions" className="crm-btn crm-btn-sm crm-btn-outline">Corrective actions</Link>
              {hasPermission("quality.manage_templates") && (
                <>
                  <Link to="/quality/templates" className="crm-btn crm-btn-sm crm-btn-outline">Templates</Link>
                  <Link to="/quality/inspection-points" className="crm-btn crm-btn-sm crm-btn-outline">Inspection points</Link>
                </>
              )}
            </div>
            <h3 className="crm-mt">Pending queue</h3>
            {data.pending_queue.length === 0 ? (
              <p className="crm-muted">No pending inspections.</p>
            ) : (
              <table className="crm-table crm-mt">
                <thead><tr><th>QC #</th><th>Point</th><th>Product</th><th>Reference</th><th></th></tr></thead>
                <tbody>
                  {data.pending_queue.map((i) => (
                    <tr key={i.id}>
                      <td><Link to={`/quality/inspections/${i.id}`}>{i.inspection_number}</Link></td>
                      <td>{i.inspection_point_name || "—"}</td>
                      <td>{i.product_name || "—"}</td>
                      <td>{i.reference_label || "—"}</td>
                      <td><Link to={`/quality/inspections/${i.id}`} className="crm-btn crm-btn-sm crm-btn-outline">Inspect</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {data.open_alerts_list.length > 0 && (
              <>
                <h3 className="crm-mt">Open alerts</h3>
                <ul className="qc-alert-list crm-mt">
                  {data.open_alerts_list.map((a) => (
                    <li key={a.id} className={alertSeverityClass(a.severity)}>
                      <strong>{a.title}</strong>
                      <p className="crm-muted">{a.message}</p>
                      <div className="crm-inline-actions">
                        {a.inspection_id && <Link to={`/quality/inspections/${a.inspection_id}`}>View inspection</Link>}
                        {hasPermission("quality.manage_alerts") && (
                          <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => ackAlert(a.id)}>Acknowledge</button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default QualityDashboard;
