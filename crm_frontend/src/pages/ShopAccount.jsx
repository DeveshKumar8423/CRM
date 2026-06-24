import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ShopShell from "../components/ShopShell";
import { getStoreCustomerToken, publicShopFetch, setStoreCustomerToken } from "../utils/ecommerce";

function ShopAccount() {
  const { companySlug } = useParams();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const loggedIn = Boolean(getStoreCustomerToken(companySlug));

  useEffect(() => {
    if (!loggedIn) return;
    publicShopFetch(companySlug, "/account/orders")
      .then((data) => setOrders(data.items || []))
      .catch((err) => setError(err.message));
  }, [companySlug, loggedIn]);

  const logout = () => {
    setStoreCustomerToken(companySlug, "");
    window.location.href = `/s/${companySlug}/shop`;
  };

  if (!loggedIn) {
    return (
      <ShopShell companySlug={companySlug}>
        <div className="crm-shop-content">
          <h2>My account</h2>
          <p className="crm-mt"><Link to={`/s/${companySlug}/account/login`} className="crm-btn">Sign in</Link></p>
          <p className="crm-mt crm-muted">New customer? <Link to={`/s/${companySlug}/account/register`}>Create an account</Link></p>
        </div>
      </ShopShell>
    );
  }

  return (
    <ShopShell companySlug={companySlug}>
      <div className="crm-shop-content">
        <div className="crm-detail-header">
          <h2>My account</h2>
          <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={logout}>Sign out</button>
        </div>
        {error && <p className="crm-error">{error}</p>}
        <h3 className="crm-mt">Order history</h3>
        {orders.length === 0 ? (
          <p className="crm-muted crm-mt">No orders yet.</p>
        ) : (
          <table className="crm-table crm-mt">
            <thead>
              <tr><th>Order</th><th>Total</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><Link to={`/s/${companySlug}/account/orders/${o.order_number}`}>{o.order_number}</Link></td>
                  <td>₹{o.grand_total}</td>
                  <td>{o.status}</td>
                  <td>{o.placed_at ? new Date(o.placed_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ShopShell>
  );
}

export default ShopAccount;
