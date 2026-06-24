import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import {
  ASSET_CRITICALITY_LABELS,
  ASSET_STATUS_LABELS,
  assetStatusClass,
  criticalityClass,
  formatDowntime,
  MWO_TYPE_LABELS,
} from "../utils/maintenance";
import { hasPermission } from "../utils/permissions";

function MaintenanceAssetDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("details");

  useEffect(() => {
    Promise.all([
      apiFetch(`/maintenance/assets/${id}`),
      apiFetch(`/maintenance/assets/${id}/history`),
      apiFetch(`/maintenance/work-orders?asset_id=${id}`),
    ])
      .then(([a, h, wos]) => {
        setAsset(a);
        setHistory(h.items || []);
        setWorkOrders(wos.items || []);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <DashboardLayout title={asset?.name || "Asset"} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/maintenance/assets" className="crm-muted">← Assets</Link>
          <div className="crm-inline-actions">
            {hasPermission("maintenance.create_wo") && asset && asset.status !== "retired" && (
              <>
                <Link to={`/maintenance/work-orders/new?asset_id=${id}&type=breakdown`} className="crm-btn crm-btn-sm">Report breakdown</Link>
                <Link to={`/maintenance/work-orders/new?asset_id=${id}&type=preventive`} className="crm-btn crm-btn-sm crm-btn-outline">Schedule PM</Link>
              </>
            )}
            {hasPermission("maintenance.manage_assets") && (
              <Link to={`/maintenance/assets/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>
            )}
          </div>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {asset && (
          <>
            <div className="crm-mt">
              <span className={assetStatusClass(asset.status)}>{ASSET_STATUS_LABELS[asset.status]}</span>
              {" "}
              <span className={criticalityClass(asset.criticality)}>{ASSET_CRITICALITY_LABELS[asset.criticality]}</span>
              <p className="crm-mt"><strong>{asset.asset_code}</strong> — {asset.name}</p>
              {asset.location_notes && <p className="crm-muted">{asset.location_notes}</p>}
              {asset.vendor_name && <p className="crm-muted">AMC vendor: {asset.vendor_name}</p>}
            </div>
            <div className="crm-inline-actions crm-mt">
              <button type="button" className={`crm-btn crm-btn-sm ${tab === "details" ? "" : "crm-btn-outline"}`} onClick={() => setTab("details")}>Details</button>
              <button type="button" className={`crm-btn crm-btn-sm ${tab === "work_orders" ? "" : "crm-btn-outline"}`} onClick={() => setTab("work_orders")}>Work orders</button>
              <button type="button" className={`crm-btn crm-btn-sm ${tab === "history" ? "" : "crm-btn-outline"}`} onClick={() => setTab("history")}>Repair history</button>
            </div>
            {tab === "details" && (
              <dl className="crm-dl crm-mt">
                <dt>Category</dt><dd>{asset.category_name || "—"}</dd>
                <dt>PM interval</dt><dd>{asset.pm_interval_days ? `${asset.pm_interval_days} days` : "—"}</dd>
                <dt>Next PM</dt><dd>{asset.next_pm_due_date || "—"}</dd>
                <dt>Last service</dt><dd>{asset.last_service_date || "—"}</dd>
                <dt>Manufacturer</dt><dd>{asset.manufacturer || "—"}</dd>
                <dt>Model</dt><dd>{asset.model || "—"}</dd>
                <dt>Serial</dt><dd>{asset.serial_number || "—"}</dd>
                {asset.notes && <><dt>Notes</dt><dd>{asset.notes}</dd></>}
              </dl>
            )}
            {tab === "work_orders" && (
              <table className="crm-table crm-mt">
                <thead><tr><th>MWO #</th><th>Type</th><th>Status</th><th>Reported</th></tr></thead>
                <tbody>
                  {workOrders.map((wo) => (
                    <tr key={wo.id}>
                      <td><Link to={`/maintenance/work-orders/${wo.id}`}>{wo.work_order_number}</Link></td>
                      <td>{MWO_TYPE_LABELS[wo.type] || wo.type}</td>
                      <td>{wo.status}</td>
                      <td>{wo.reported_at ? new Date(wo.reported_at).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === "history" && (
              history.length === 0 ? (
                <p className="crm-muted crm-mt">No completed maintenance history.</p>
              ) : (
                <ul className="crm-timeline crm-mt">
                  {history.map((h) => (
                    <li key={h.work_order_id} className="crm-timeline-item">
                      <Link to={`/maintenance/work-orders/${h.work_order_id}`}>{h.work_order_number}</Link>
                      {" — "}
                      {MWO_TYPE_LABELS[h.type] || h.type}
                      {h.downtime_minutes != null && ` · ${formatDowntime(h.downtime_minutes)} downtime`}
                      {h.resolution_notes && <p className="crm-muted">{h.resolution_notes}</p>}
                      {h.parts?.length > 0 && (
                        <p className="crm-muted">Parts: {h.parts.map((p) => `${p.product_name} × ${p.quantity}`).join(", ")}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MaintenanceAssetDetail;
