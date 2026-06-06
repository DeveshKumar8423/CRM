import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

function ProductDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const canEdit = hasPermission("products.edit");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/products/${id}`).then(setProduct).catch((err) => setError(err.message));
  }, [id]);

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
        </div>
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
      </div>
    </DashboardLayout>
  );
}

export default ProductDetail;
