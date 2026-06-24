import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { formatINR, getPosSessionId, posFetch, setPosSessionId } from "../utils/pos";

function PosTerminal() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(null);
  const [cart, setCart] = useState(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [tendered, setTendered] = useState("");
  const [lastSale, setLastSale] = useState(null);

  const sessionId = getPosSessionId();

  const loadCatalog = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const qs = params.toString();
    posFetch(`/pos/terminal/catalog${qs ? `?${qs}` : ""}`).then(setCatalog).catch((err) => setError(err.message));
  };

  const loadCart = () => posFetch("/pos/terminal/cart").then(setCart).catch((err) => setError(err.message));

  useEffect(() => {
    if (!sessionId) {
      navigate("/pos");
      return;
    }
    loadCatalog();
    loadCart();
  }, [sessionId, navigate, q, category]);

  const addProduct = async (productId) => {
    try {
      const data = await posFetch("/pos/terminal/cart/items", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      setCart(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const updateQty = async (itemId, quantity) => {
    const data = await posFetch(`/pos/terminal/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
    setCart(data);
  };

  const removeItem = async (itemId) => {
    const data = await posFetch(`/pos/terminal/cart/items/${itemId}`, { method: "DELETE" });
    setCart(data);
  };

  const checkout = async () => {
    try {
      const result = await posFetch("/pos/terminal/checkout", {
        method: "POST",
        body: JSON.stringify({
          payment_method: paymentMethod,
          amount_tendered: paymentMethod === "cash" ? Number(tendered || cart.grand_total) : undefined,
        }),
      });
      setLastSale(result);
      setPayOpen(false);
      setTendered("");
      loadCart();
      loadCatalog();
    } catch (err) {
      setError(err.message);
    }
  };

  const printReceipt = async () => {
    if (!lastSale) return;
    const data = await posFetch(`/pos/bills/${lastSale.bill_id}/receipt`);
    const w = window.open("", "_blank");
    w.document.write(data.html);
    w.document.close();
    w.print();
  };

  return (
    <div className="crm-pos-terminal">
      <header className="crm-pos-terminal-header">
        <Link to="/pos" className="crm-muted">← POS</Link>
        <strong>Terminal</strong>
        <span className="crm-muted">Session #{sessionId}</span>
      </header>
      <div className="crm-pos-terminal-body">
        <div className="crm-pos-products">
          <input className="crm-input" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="crm-pos-categories">
            <button type="button" className={`crm-btn crm-btn-sm ${!category ? "crm-btn-inline" : "crm-btn-outline"}`} onClick={() => setCategory("")}>All</button>
            {catalog?.categories?.map((c) => (
              <button key={c} type="button" className={`crm-btn crm-btn-sm ${category === c ? "crm-btn-inline" : "crm-btn-outline"}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
          <div className="crm-pos-product-grid">
            {catalog?.items?.map((p) => (
              <button key={p.id} type="button" className="crm-pos-product-tile" onClick={() => addProduct(p.id)} disabled={!p.in_stock}>
                <span className="crm-pos-product-name">{p.name}</span>
                <span className="crm-pos-product-price">{formatINR(p.price)}</span>
                {!p.in_stock && <span className="crm-badge crm-badge-warning">Out</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="crm-pos-cart-panel">
          <h3>Cart ({cart?.item_count || 0})</h3>
          {error && <p className="crm-error">{error}</p>}
          {lastSale && (
            <div className="crm-success crm-mb">
              Sale {lastSale.bill_number} — {formatINR(lastSale.grand_total)}
              {lastSale.change_due > 0 && ` · Change ${formatINR(lastSale.change_due)}`}
              <div className="crm-inline-actions crm-mt">
                <button type="button" className="crm-btn crm-btn-sm" onClick={printReceipt}>Print</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => setLastSale(null)}>New sale</button>
              </div>
            </div>
          )}
          <ul className="crm-pos-cart-lines">
            {cart?.items?.map((item) => (
              <li key={item.id}>
                <span>{item.product_name}</span>
                <input type="number" min={1} value={item.quantity} onChange={(e) => updateQty(item.id, Number(e.target.value))} className="crm-input crm-input-sm" />
                <span>{formatINR(item.line_total)}</span>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => removeItem(item.id)}>×</button>
              </li>
            ))}
          </ul>
          <div className="crm-pos-cart-totals">
            <p>Subtotal: {formatINR(cart?.subtotal)}</p>
            <p>GST: {formatINR(cart?.tax_total)}</p>
            <p><strong>Total: {formatINR(cart?.grand_total)}</strong></p>
          </div>
          <button type="button" className="crm-btn crm-btn-block" disabled={!cart?.items?.length} onClick={() => setPayOpen(true)}>Pay</button>
        </div>
      </div>
      {payOpen && (
        <div className="crm-pos-modal-backdrop">
          <div className="crm-pos-modal">
            <h3>Payment</h3>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="crm-input">
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>
            {paymentMethod === "cash" && (
              <input className="crm-input crm-mt" type="number" placeholder="Amount tendered" value={tendered} onChange={(e) => setTendered(e.target.value)} />
            )}
            <div className="crm-inline-actions crm-mt">
              <button type="button" className="crm-btn" onClick={checkout}>Complete sale</button>
              <button type="button" className="crm-btn crm-btn-outline" onClick={() => setPayOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PosTerminal;
