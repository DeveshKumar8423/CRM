import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import DocumentsPanel from "../components/DocumentsPanel";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { formatCurrency, STATUS_LABELS, statusBadgeClass } from "../utils/inventory";

function ProductDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const canEdit = hasPermission("products.edit");
  const canViewInventory = hasPermission("inventory.view");
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/products/${id}`).then(setProduct).catch((err) => setError(err.message));
    if (canViewInventory) {
      apiFetch(`/inventory/products/${id}`).then(setInventory).catch(() => setInventory(null));
    }
  }, [id, canViewInventory]);

  if (!product && !error) {
    return (
      <DashboardLayout title="Service" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Service" roleLabel={role}>
        <div className="crm-panel"><p className="crm-error">{error}</p></div>
      </DashboardLayout>
    );
  }

  const price = (v) => (v != null ? `₹${v}` : "—");

  return (
    <DashboardLayout title={product.name} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/products" className="crm-link crm-link-left">← All services</Link>
          {canEdit && (
            <Link to={`/products/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>
          )}
          {canViewInventory && (
            <Link to={`/inventory/${id}`} className="crm-btn crm-btn-sm crm-btn-outline">View stock</Link>
          )}
        </div>
        {inventory?.inventory_tracked && (
          <div className="crm-stats-grid crm-mt">
            <div className="crm-stat-card"><p className="crm-stat-label">On hand</p><p className="crm-stat-value">{inventory.on_hand_quantity}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Stock value</p><p className="crm-stat-value">{formatCurrency(inventory.stock_value)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Status</p><p><span className={statusBadgeClass(inventory.inventory_status)}>{STATUS_LABELS[inventory.inventory_status]}</span></p></div>
          </div>
        )}
        <div className="crm-contact-meta crm-mt">
          <p>
            <span className={product.status === "active" ? "crm-badge crm-badge-active" : "crm-badge crm-badge-inactive"}>
              {product.status}
            </span>
          </p>
          {product.service_code && <p><strong>Code:</strong> {product.service_code}</p>}
          {product.entity_type && <p><strong>Entity type:</strong> {product.entity_type}</p>}
          {product.category && <p><strong>Category:</strong> {product.category}</p>}
          {product.sub_category && <p><strong>Sub category:</strong> {product.sub_category}</p>}
          <p><strong>Market:</strong> {price(product.market_price)} · <strong>Offer:</strong> {price(product.offer_price)} · <strong>Last:</strong> {price(product.last_price)}</p>
          <p><strong>Our fees:</strong> {price(product.our_fees)} · <strong>GST:</strong> {price(product.gst_amount)} · <strong>Total:</strong> {price(product.total_price)}</p>
          {product.filing_timeline && <p><strong>Filing:</strong> {product.filing_timeline}</p>}
          {product.completion_timeline && <p><strong>Completion:</strong> {product.completion_timeline}</p>}
        </div>
        {product.description && (
          <div className="crm-mt-lg">
            <h3>Documents & details</h3>
            <pre className="crm-pre">{product.description}</pre>
          </div>
        )}
        <DocumentsPanel productId={parseInt(id, 10)} category="products" title="Product images & files" />
      </div>
    </DashboardLayout>
  );
}

export default ProductDetail;
