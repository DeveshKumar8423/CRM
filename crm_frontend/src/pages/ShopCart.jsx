import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ShopShell from "../components/ShopShell";
import { formatINR, publicShopFetch } from "../utils/ecommerce";

function ShopCart() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    publicShopFetch(companySlug, "/cart").then(setCart).catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, [companySlug]);

  const updateQty = async (itemId, quantity) => {
    try {
      const data = await publicShopFetch(companySlug, `/cart/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });
      setCart(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const data = await publicShopFetch(companySlug, `/cart/items/${itemId}`, { method: "DELETE" });
      setCart(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <ShopShell companySlug={companySlug}>
      <div className="crm-shop-content">
        <h2>Your cart</h2>
        {error && <p className="crm-error">{error}</p>}
        {!cart && !error && <p>Loading…</p>}
        {cart?.items?.length === 0 && (
          <div className="crm-mt">
            <p className="crm-muted">Your cart is empty.</p>
            <Link to={`/s/${companySlug}/shop`} className="crm-btn crm-btn-sm crm-mt">Continue shopping</Link>
          </div>
        )}
        {cart?.items?.length > 0 && (
          <>
            <table className="crm-table crm-mt">
              <thead>
                <tr><th>Product</th><th>Qty</th><th>Price</th><th></th></tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link to={`/s/${companySlug}/shop/${item.product_slug}`}>{item.product_name}</Link>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={item.quantity}
                        onChange={(e) => updateQty(item.id, Number(e.target.value))}
                        className="crm-input crm-input-sm"
                      />
                    </td>
                    <td>{formatINR(item.line_total)}</td>
                    <td><button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => removeItem(item.id)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="crm-shop-summary crm-mt">
              <strong>Subtotal: {formatINR(cart.subtotal)}</strong>
              <button type="button" className="crm-btn" onClick={() => navigate(`/s/${companySlug}/checkout`)}>Checkout</button>
            </div>
          </>
        )}
      </div>
    </ShopShell>
  );
}

export default ShopCart;
