import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatINR, orderStatusBadgeClass } from "../utils/ecommerce";
import { hasPermission } from "../utils/permissions";

function EcommerceOrderDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState("");
  const [error, setError] = useState("");

  const load = () => apiFetch(`/ecommerce/orders/${id}`).then(setOrder).catch((err) => setError(err.message));

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status) => {
    try {
      const data = await apiFetch(`/ecommerce/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, tracking_number: tracking || undefined }),
      });
      setOrder(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const recordPayment = async () => {
    try {
      const data = await apiFetch(`/ecommerce/orders/${id}/payment`, { method: "POST", body: JSON.stringify({}) });
      setOrder(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="Order detail" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/ecommerce/orders" className="crm-muted">← Orders</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {!order && !error && <p className="crm-mt">Loading…</p>}
        {order && (
          <>
            <div className="crm-detail-header crm-mt">
              <h2>{order.order_number}</h2>
              <span className={orderStatusBadgeClass(order.status)}>{order.status}</span>
            </div>
            <p>Payment: {order.payment_status} · {formatINR(order.grand_total)}</p>
            <p>{order.guest_name} · {order.guest_email} · {order.guest_phone}</p>
            {order.contact_id && <p>Contact: <Link to={`/contacts/${order.contact_id}`}>#{order.contact_id}</Link></p>}
            {order.sales_order_id && <p>Sales order: <Link to={`/sales-orders/${order.sales_order_id}`}>#{order.sales_order_id}</Link></p>}
            <table className="crm-table crm-mt">
              <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Line total</th></tr></thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}><td>{item.product_name_snapshot}</td><td>{item.quantity}</td><td>{formatINR(item.unit_price)}</td><td>{formatINR(item.line_total)}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="crm-mt">Subtotal {formatINR(order.subtotal)} · GST {formatINR(order.tax_total)} · Shipping {formatINR(order.shipping_total)}</p>
            {hasPermission("ecommerce.manage_orders") && (
              <div className="crm-inline-actions crm-mt">
                <input className="crm-input crm-input-sm" placeholder="Tracking #" value={tracking} onChange={(e) => setTracking(e.target.value)} />
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => updateStatus("processing")}>Processing</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => updateStatus("shipped")}>Shipped</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => updateStatus("delivered")}>Delivered</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => updateStatus("cancelled")}>Cancel</button>
              </div>
            )}
            {hasPermission("ecommerce.record_payment") && order.payment_status === "unpaid" && (
              <button type="button" className="crm-btn crm-btn-sm crm-mt" onClick={recordPayment}>Mark paid</button>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default EcommerceOrderDetail;
