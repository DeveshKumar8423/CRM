import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { ASSET_STATUS_LABELS, assetStatusClass } from "../utils/maintenance";
import { hasPermission } from "../utils/permissions";

function MaintenanceAssets() {
  const role = localStorage.getItem("role") || "Staff";
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [pmOverdue, setPmOverdue] = useState(false);

  const load = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (pmOverdue) params.set("pm_overdue", "true");
    const qs = params.toString();
    apiFetch(`/maintenance/assets${qs ? `?${qs}` : ""}`)
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, [status, pmOverdue]);

  return (
    <DashboardLayout title="Assets" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/maintenance" className="crm-muted">← Maintenance</Link>
          {hasPermission("maintenance.manage_assets") && (
            <Link to="/maintenance/assets/new" className="crm-btn crm-btn-sm">Register asset</Link>
          )}
        </div>
        <div className="crm-inline-actions crm-mt">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="crm-select">
            <option value="">All statuses</option>
            {Object.entries(ASSET_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <label className="crm-muted">
            <input type="checkbox" checked={pmOverdue} onChange={(e) => setPmOverdue(e.target.checked)} /> PM overdue
          </label>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead>
            <tr><th>Code</th><th>Name</th><th>Status</th><th>Location</th><th>Next PM</th><th>Last service</th></tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className={a.pm_overdue ? "mnt-pm-overdue-row" : ""}>
                <td><Link to={`/maintenance/assets/${a.id}`}>{a.asset_code}</Link></td>
                <td>{a.name}</td>
                <td><span className={assetStatusClass(a.status)}>{ASSET_STATUS_LABELS[a.status] || a.status}</span></td>
                <td>{a.location_notes || "—"}</td>
                <td>{a.next_pm_due_date || "—"}</td>
                <td>{a.last_service_date || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="crm-muted crm-mt">No assets found.</p>}
      </div>
    </DashboardLayout>
  );
}

export default MaintenanceAssets;
