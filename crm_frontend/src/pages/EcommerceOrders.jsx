import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatINR, orderStatusBadgeClass } from "../utils/ecommerce";

function EcommerceOrders() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const qs = status ? `?status=${status}` : "";
    apiFetch(`/ecommerce/orders${qs}`).then(setData).catch((err) => setError(err.message));
  }, [status]);

  return (
    <DashboardLayout title="Online orders" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/ecommerce" className="crm-muted">← Online Store</Link>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="crm-input crm-input-sm">
            <option value="">All statuses</option>
            <option value="pending_payment">Pending payment</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {error && <p className="crm-error">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th>Placed</th></tr></thead>
          <tbody>
            {(data?.items || []).map((o) => (
              <tr key={o.id}>
                <td><Link to={`/ecommerce/orders/${o.id}`}>{o.order_number}</Link></td>
                <td>{o.customer_name}</td>
                <td>{o.item_count}</td>
                <td>{formatINR(o.grand_total)}</td>
                <td><span className={orderStatusBadgeClass(o.status)}>{o.status}</span></td>
                <td>{o.payment_status}</td>
                <td>{o.placed_at ? new Date(o.placed_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default EcommerceOrders;
