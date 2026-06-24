import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatINR } from "../utils/ecommerce";
import { hasPermission } from "../utils/permissions";

function EcommerceDashboard() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/ecommerce/dashboard").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="Online Store" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">Web orders, catalog, and fulfillment</p>
          <div className="crm-inline-actions">
            {data?.public_shop_url && (
              <a href={data.public_shop_url} target="_blank" rel="noreferrer" className="crm-btn crm-btn-sm crm-btn-outline">View shop</a>
            )}
            {hasPermission("ecommerce.manage_settings") && (
              <Link to="/ecommerce/settings" className="crm-btn crm-btn-sm crm-btn-outline">Settings</Link>
            )}
          </div>
        </div>
        {error && <p className="crm-error">{error}</p>}
        {data && (
          <>
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><span className="crm-stat-value">{data.orders_today}</span><span className="crm-stat-label">Orders today</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{formatINR(data.revenue_7d)}</span><span className="crm-stat-label">Revenue (7d)</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.pending_shipment}</span><span className="crm-stat-label">Pending shipment</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.open_returns}</span><span className="crm-stat-label">Open returns</span></div>
            </div>
            <div className="crm-inline-actions crm-mt">
              <Link to="/ecommerce/orders" className="crm-btn crm-btn-sm crm-btn-outline">Orders</Link>
              <Link to="/ecommerce/returns" className="crm-btn crm-btn-sm crm-btn-outline">Returns</Link>
              {hasPermission("ecommerce.manage_catalog") && (
                <Link to="/ecommerce/catalog" className="crm-btn crm-btn-sm crm-btn-outline">Catalog</Link>
              )}
            </div>
            <h3 className="crm-mt">Recent orders</h3>
            {data.recent_orders.length === 0 ? (
              <p className="crm-muted crm-mt">No online orders yet.</p>
            ) : (
              <table className="crm-table crm-mt">
                <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Placed</th></tr></thead>
                <tbody>
                  {data.recent_orders.map((o) => (
                    <tr key={o.id}>
                      <td><Link to={`/ecommerce/orders/${o.id}`}>{o.order_number}</Link></td>
                      <td>{o.customer_name}</td>
                      <td>{formatINR(o.grand_total)}</td>
                      <td>{o.status}</td>
                      <td>{o.placed_at ? new Date(o.placed_at).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default EcommerceDashboard;
