import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  LOCATION_STATUS_LABELS,
  LOCATION_TYPE_LABELS,
  MOVEMENT_LABELS,
  STOCK_STATUS_LABELS,
  formatCurrency,
  formatDate,
  locationStatusBadgeClass,
  locationTypeBadgeClass,
  movementBadgeClass,
  stockStatusBadgeClass,
} from "../utils/warehouses";

function WarehouseLocationDetail() {
  const { locationId } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");

  const load = () => apiFetch(`/warehouses/locations/${locationId}`).then(setLocation).catch((err) => setError(err.message));
  useEffect(() => { load(); }, [locationId]);

  const deactivate = async () => {
    if (!window.confirm("Deactivate this location?")) return;
    setError("");
    try {
      await apiFetch(`/warehouses/locations/${locationId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "inactive" }),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!location && !error) {
    return <DashboardLayout title="Location" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }
  if (error && !location) {
    return <DashboardLayout title="Location" roleLabel={role}><div className="crm-panel"><p className="crm-error">{error}</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout title={location.name} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/warehouses" className="crm-link crm-link-left">← Warehouses</Link>
          <div className="crm-inline-actions">
            {hasPermission("warehouses.record_receipt") && (
              <Link to={`/warehouses/record-movement?location_id=${locationId}`} className="crm-btn crm-btn-sm crm-btn-inline">Record movement</Link>
            )}
            {hasPermission("warehouses.transfer") && (
              <Link to={`/warehouses/transfer?source_location_id=${locationId}`} className="crm-btn crm-btn-sm crm-btn-outline">Transfer out</Link>
            )}
            {hasPermission("warehouses.manage_locations") && location.status === "active" && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={deactivate}>Deactivate</button>
            )}
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-quote-header-strip crm-mt">
          <div><span className="crm-muted">Code</span> <strong>{location.location_code}</strong></div>
          <span className={locationTypeBadgeClass(location.location_type)}>{LOCATION_TYPE_LABELS[location.location_type]}</span>
          <span className={locationStatusBadgeClass(location.status)}>{LOCATION_STATUS_LABELS[location.status]}</span>
          <div><span className="crm-muted">Path</span> <strong>{location.path}</strong></div>
        </div>

        <div className="crm-stats-grid crm-mt">
          <div className="crm-stat-card"><p className="crm-stat-label">SKUs</p><p className="crm-stat-value">{location.sku_count}</p></div>
          <div className="crm-stat-card"><p className="crm-stat-label">On hand</p><p className="crm-stat-value">{location.total_on_hand}</p></div>
          <div className="crm-stat-card"><p className="crm-stat-label">Stock value</p><p className="crm-stat-value">{formatCurrency(location.total_stock_value)}</p></div>
          <div className="crm-stat-card"><p className="crm-stat-label">Low-stock SKUs</p><p className="crm-stat-value">{location.low_stock_count}</p></div>
        </div>

        {location.children.length > 0 && (
          <>
            <h3 className="crm-mt-lg">Child locations</h3>
            <div className="crm-table-wrap">
              <table className="crm-table">
                <thead><tr><th>Name</th><th>Type</th><th>Status</th><th className="crm-num">On hand</th><th></th></tr></thead>
                <tbody>
                  {location.children.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td><span className={locationTypeBadgeClass(c.location_type)}>{LOCATION_TYPE_LABELS[c.location_type]}</span></td>
                      <td><span className={locationStatusBadgeClass(c.status)}>{LOCATION_STATUS_LABELS[c.status]}</span></td>
                      <td className="crm-num">{c.total_on_hand}</td>
                      <td><Link to={`/warehouses/locations/${c.id}`} className="crm-nav-link">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <h3 className="crm-mt-lg">Stock at this location</h3>
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Product</th><th>SKU</th><th className="crm-num">On hand</th>
                <th className="crm-num">Value</th><th>Status</th><th>Last movement</th>
              </tr>
            </thead>
            <tbody>
              {location.stock.length === 0 && <tr><td colSpan={6} className="crm-muted">No stock at this location.</td></tr>}
              {location.stock.map((s) => (
                <tr key={s.id}>
                  <td>{s.product_name}</td>
                  <td>{s.product_sku || "—"}</td>
                  <td className="crm-num">{s.on_hand_quantity}</td>
                  <td className="crm-num">{formatCurrency(s.stock_value)}</td>
                  <td><span className={stockStatusBadgeClass(s.stock_status)}>{STOCK_STATUS_LABELS[s.stock_status]}</span></td>
                  <td>{formatDate(s.last_movement_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="crm-mt-lg">Recent movements</h3>
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Date</th><th>Product</th><th>Type</th><th>Qty</th>
                <th>Before</th><th>After</th><th>By</th><th>Ref</th>
              </tr>
            </thead>
            <tbody>
              {location.recent_movements.length === 0 && <tr><td colSpan={8} className="crm-muted">No movements yet.</td></tr>}
              {location.recent_movements.map((m) => (
                <tr key={m.id}>
                  <td>{formatDate(m.movement_date)}</td>
                  <td>{m.product_name}</td>
                  <td><span className={movementBadgeClass(m.movement_type)}>{MOVEMENT_LABELS[m.movement_type]}</span></td>
                  <td>{m.quantity}</td>
                  <td>{m.quantity_before}</td>
                  <td>{m.quantity_after}</td>
                  <td>{m.recorded_by_name}</td>
                  <td>{m.transfer_reference || m.reference_number || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default WarehouseLocationDetail;
