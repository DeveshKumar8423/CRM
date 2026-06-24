import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ShopShell from "../components/ShopShell";
import { formatINR, getStoreCustomerToken, orderStatusBadgeClass, publicShopFetch } from "../utils/ecommerce";

function ShopAccountOrderDetail() {
  const { companySlug, orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const loggedIn = Boolean(getStoreCustomerToken(companySlug));

  useEffect(() => {
    if (!loggedIn) return;
    publicShopFetch(companySlug, `/account/orders/${orderNumber}`)
      .then(setOrder)
      .catch((err) => setError(err.message));
  }, [companySlug, orderNumber, loggedIn]);

  const requestReturn = async (e) => {
    e.preventDefault();
    if (!order?.items?.length) return;
    setError("");
    try {
      await publicShopFetch(companySlug, `/account/orders/${orderNumber}/returns`, {
        method: "POST",
        body: JSON.stringify({
          reason,
          items: order.items.map((item) => ({ order_item_id: item.id, quantity: item.quantity })),
        }),
      });
      setMessage("Return request submitted.");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!loggedIn) {
    return (
      <ShopShell companySlug={companySlug}>
        <p className="crm-shop-content"><Link to={`/s/${companySlug}/account/login`}>Sign in</Link> to view this order.</p>
      </ShopShell>
    );
  }

  return (
    <ShopShell companySlug={companySlug}>
      <div className="crm-shop-content">
        <Link to={`/s/${companySlug}/account`} className="crm-muted">← My orders</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}
        {!order && !error && <p className="crm-mt">Loading…</p>}
        {order && (
          <>
            <h2 className="crm-mt">{order.order_number}</h2>
            <span className={orderStatusBadgeClass(order.status)}>{order.status}</span>
            <p className="crm-mt">Total: {formatINR(order.grand_total)}</p>
            {order.tracking_number && <p>Tracking: {order.tracking_number}</p>}
            <table className="crm-table crm-mt">
              <thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}><td>{item.product_name_snapshot}</td><td>{item.quantity}</td><td>{formatINR(item.line_total)}</td></tr>
                ))}
              </tbody>
            </table>
            {order.status === "delivered" && (
              <form className="crm-form crm-mt" onSubmit={requestReturn}>
                <h3>Request return</h3>
                <div className="crm-form-field">
                  <label>Reason</label>
                  <textarea required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>
                <button type="submit" className="crm-btn crm-btn-sm">Submit return request</button>
              </form>
            )}
          </>
        )}
      </div>
    </ShopShell>
  );
}

export default ShopAccountOrderDetail;
