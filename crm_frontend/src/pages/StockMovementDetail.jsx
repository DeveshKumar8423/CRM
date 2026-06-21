import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { formatCurrency } from "../utils/inventory";
import {
  directionBadgeClass,
  directionLabel,
  formatDate,
  reasonLabel,
} from "../utils/stockMovements";
import { apiFetch } from "../utils/api";

function StockMovementDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [movement, setMovement] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/stock-movements/${id}`).then(setMovement).catch((err) => setError(err.message));
  }, [id]);

  if (!movement && !error) {
    return <DashboardLayout title="Stock Movement" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }
  if (error && !movement) {
    return <DashboardLayout title="Stock Movement" roleLabel={role}><div className="crm-panel"><p className="crm-error">{error}</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout title={movement.movement_number} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/stock-movements" className="crm-link crm-link-left">← Stock ledger</Link>

        <div className="crm-quote-header-strip crm-mt">
          <div><span className="crm-muted">Movement</span> <strong>{movement.movement_number}</strong></div>
          <span className={directionBadgeClass(movement.direction)}>{directionLabel(movement.direction)}</span>
          <div><span className="crm-muted">Date</span> {formatDate(movement.movement_date)}</div>
          <div><span className="crm-muted">By</span> {movement.recorded_by_name}</div>
        </div>

        <div className="crm-contact-meta crm-mt">
          <p><strong>Product:</strong> <Link to={`/inventory/${movement.product_id}`} className="crm-nav-link">{movement.product_name}</Link></p>
          {movement.product_sku && <p><strong>SKU:</strong> {movement.product_sku}</p>}
          <p><strong>Quantity:</strong> {movement.quantity}</p>
          <p><strong>Reason:</strong> {movement.reason_label || reasonLabel(movement.reason, movement.direction)}</p>
          {movement.reference_number && <p><strong>Reference:</strong> {movement.reference_number}</p>}
          {movement.notes && <p><strong>Notes:</strong> {movement.notes}</p>}
          <p><strong>Quantity impact:</strong> {movement.quantity_before} → {movement.quantity_after}</p>
          <p><strong>Value:</strong> {formatCurrency(movement.total_value)}</p>
          {movement.negative_override && <p><span className="crm-badge crm-sm-override">Override Used</span></p>}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default StockMovementDetail;
