import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  MOVEMENT_LABELS,
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  movementBadgeClass,
  statusBadgeClass,
} from "../utils/inventory";
import { formatDate as whFormatDate } from "../utils/warehouses";

function InventoryProductDetail() {
  const { productId } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [product, setProduct] = useState(null);
  const [locationStock, setLocationStock] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => apiFetch(`/inventory/products/${productId}`).then(setProduct).catch((err) => setError(err.message));
  useEffect(() => { load(); }, [productId]);

  useEffect(() => {
    if (!hasPermission("warehouses.view_stock")) return;
    apiFetch(`/warehouses/stock/product/${productId}`)
      .then((data) => setLocationStock(data.items || []))
      .catch(() => setLocationStock([]));
  }, [productId]);

  const enableTracking = async () => {
    setError("");
    try {
      const updated = await apiFetch(`/inventory/products/${productId}/enable-tracking`, {
        method: "POST",
        body: JSON.stringify({ reorder_level: null, unit_valuation: 0 }),
      });
      setProduct(updated);
      setMessage("Inventory tracking enabled.");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!product && !error) {
    return <DashboardLayout title="Stock" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }
  if (error && !product) {
    return <DashboardLayout title="Stock" roleLabel={role}><div className="crm-panel"><p className="crm-error">{error}</p></div></DashboardLayout>;
  }

  const canEnable = hasPermission("inventory.enable_tracking") && !product.inventory_tracked;
  const canOpening = hasPermission("inventory.record_opening") && product.inventory_tracked && !product.opening_recorded;
  const canMove = hasPermission("inventory.record_purchase") && product.opening_recorded;

  return (
    <DashboardLayout title={product.name} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/inventory" className="crm-link crm-link-left">← Inventory</Link>
          <div className="crm-inline-actions">
            {canEnable && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={enableTracking}>Enable tracking</button>
            )}
            {canOpening && (
              <Link to={`/inventory/opening-stock?product_id=${productId}`} className="crm-btn crm-btn-sm crm-btn-outline">Set opening stock</Link>
            )}
            {canMove && (
              <Link to={`/inventory/record-movement?product_id=${productId}`} className="crm-btn crm-btn-sm crm-btn-inline">Record movement</Link>
            )}
            {hasPermission("warehouses.view_stock") && product.opening_recorded && (
              <Link to={`/warehouses/stock?product_id=${productId}`} className="crm-btn crm-btn-sm crm-btn-outline">By location</Link>
            )}
            <Link to={`/products/${productId}`} className="crm-btn crm-btn-sm crm-btn-outline">Product</Link>
          </div>
        </div>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-quote-header-strip crm-mt">
          <div><span className="crm-muted">SKU</span> <strong>{product.service_code || "—"}</strong></div>
          <span className={statusBadgeClass(product.inventory_status)}>{STATUS_LABELS[product.inventory_status]}</span>
          <div><span className="crm-muted">On hand</span> <strong>{product.on_hand_quantity} {product.unit}</strong></div>
          <div className="crm-num"><strong>{formatCurrency(product.stock_value)}</strong></div>
        </div>

        <div className="crm-stats-grid crm-mt">
          <div className="crm-stat-card"><p className="crm-stat-label">Purchased in</p><p className="crm-stat-value">{product.total_purchased}</p></div>
          <div className="crm-stat-card"><p className="crm-stat-label">Sold out</p><p className="crm-stat-value">{product.total_sold}</p></div>
          <div className="crm-stat-card"><p className="crm-stat-label">Damaged</p><p className="crm-stat-value">{product.total_damaged}</p></div>
          <div className="crm-stat-card"><p className="crm-stat-label">Net adjustments</p><p className="crm-stat-value">{product.net_adjustments}</p></div>
        </div>

        {hasPermission("warehouses.view_stock") && locationStock.length > 0 && (
          <>
            <h3 className="crm-mt-lg">Stock by location</h3>
            <div className="crm-table-wrap">
              <table className="crm-table">
                <thead>
                  <tr><th>Location</th><th className="crm-num">On hand</th><th className="crm-num">Value</th><th>Last movement</th></tr>
                </thead>
                <tbody>
                  {locationStock.map((s) => (
                    <tr key={s.id}>
                      <td><Link to={`/warehouses/locations/${s.location_id}`} className="crm-nav-link">{s.location_path || s.location_name}</Link></td>
                      <td className="crm-num">{s.on_hand_quantity}</td>
                      <td className="crm-num">{formatCurrency(s.stock_value)}</td>
                      <td>{whFormatDate(s.last_movement_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <h3 className="crm-mt-lg">Movement ledger</h3>
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Date</th><th>Type</th><th>In/Out</th><th>Qty</th>
                <th className="crm-num">Value</th><th>Before</th><th>After</th><th>By</th><th>Ref</th>
              </tr>
            </thead>
            <tbody>
              {product.movements.length === 0 && <tr><td colSpan={9} className="crm-muted">No movements yet.</td></tr>}
              {product.movements.map((m) => (
                <tr key={m.id}>
                  <td>{formatDate(m.movement_date)}</td>
                  <td><span className={movementBadgeClass(m.movement_type)}>{MOVEMENT_LABELS[m.movement_type]}</span></td>
                  <td>{m.direction}</td>
                  <td>{m.quantity}</td>
                  <td className="crm-num">{formatCurrency(m.total_value)}</td>
                  <td>{m.quantity_before}</td>
                  <td>{m.quantity_after}</td>
                  <td>{m.recorded_by_name}</td>
                  <td>{m.reference_number || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default InventoryProductDetail;
