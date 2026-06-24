import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ShopShell from "../components/ShopShell";
import { emptyCheckoutForm, formatINR, getStoreCustomerToken, publicShopFetch } from "../utils/ecommerce";

function ShopCheckout() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyCheckoutForm());
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const loggedIn = Boolean(getStoreCustomerToken(companySlug));

  useEffect(() => {
    publicShopFetch(companySlug, "/cart")
      .then((data) => {
        if (!data.items?.length) navigate(`/s/${companySlug}/cart`);
        setCart(data);
      })
      .catch((err) => setError(err.message));
  }, [companySlug, navigate]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setAddress = (prefix, key, value) => setForm((f) => ({ ...f, [prefix]: { ...f[prefix], [key]: value } }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        guest_name: form.guest_name || undefined,
        guest_email: form.guest_email || undefined,
        guest_phone: form.guest_phone || undefined,
        gstin: form.gstin || undefined,
        shipping_address: form.shipping_address,
        billing_address: form.billing_same ? undefined : form.billing_address,
        shipping_method: form.shipping_method,
        payment_method: form.payment_method,
        customer_note: form.customer_note || undefined,
      };
      const result = await publicShopFetch(companySlug, "/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      navigate(`/s/${companySlug}/checkout/confirmation/${result.order_number}`, { state: { message: result.message } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ShopShell companySlug={companySlug}>
      <div className="crm-shop-content crm-shop-checkout">
        <h2>Checkout</h2>
        {!loggedIn && (
          <p className="crm-muted">
            <Link to={`/s/${companySlug}/account/login`}>Sign in</Link> for faster checkout or continue as guest.
          </p>
        )}
        {error && <p className="crm-error">{error}</p>}
        <form className="crm-form crm-mt" onSubmit={submit}>
          {!loggedIn && (
            <>
              <h3>Contact</h3>
              <div className="crm-form-field"><label>Name *</label><input required value={form.guest_name} onChange={(e) => setField("guest_name", e.target.value)} /></div>
              <div className="crm-form-field"><label>Email *</label><input type="email" required value={form.guest_email} onChange={(e) => setField("guest_email", e.target.value)} /></div>
              <div className="crm-form-field"><label>Phone *</label><input required value={form.guest_phone} onChange={(e) => setField("guest_phone", e.target.value)} /></div>
            </>
          )}
          <h3>Shipping address</h3>
          {["line1", "line2", "city", "state", "pincode"].map((key) => (
            <div className="crm-form-field" key={key}>
              <label>{key === "line1" ? "Address line 1 *" : key === "line2" ? "Address line 2" : key === "pincode" ? "PIN code *" : `${key[0].toUpperCase()}${key.slice(1)} *`}</label>
              <input
                required={key !== "line2"}
                pattern={key === "pincode" ? "\\d{6}" : undefined}
                value={form.shipping_address[key]}
                onChange={(e) => setAddress("shipping_address", key, e.target.value)}
              />
            </div>
          ))}
          <div className="crm-form-field">
            <label>GSTIN (optional)</label>
            <input value={form.gstin} onChange={(e) => setField("gstin", e.target.value)} />
          </div>
          <h3>Delivery & payment</h3>
          <div className="crm-form-field">
            <label>Shipping method</label>
            <select value={form.shipping_method} onChange={(e) => setField("shipping_method", e.target.value)}>
              <option value="standard">Standard delivery</option>
              <option value="pickup">Pickup from office</option>
            </select>
          </div>
          <div className="crm-form-field">
            <label>Payment method</label>
            <select value={form.payment_method} onChange={(e) => setField("payment_method", e.target.value)}>
              <option value="cod">Cash on delivery</option>
              <option value="bank_transfer">Bank transfer / UPI</option>
            </select>
          </div>
          <div className="crm-form-field">
            <label>Order note</label>
            <textarea rows={2} value={form.customer_note} onChange={(e) => setField("customer_note", e.target.value)} />
          </div>
          {cart && (
            <div className="crm-shop-summary crm-mt">
              <p>Subtotal: {formatINR(cart.subtotal)}</p>
              <p className="crm-muted">GST and shipping calculated on place order.</p>
            </div>
          )}
          <button type="submit" className="crm-btn crm-mt" disabled={submitting}>{submitting ? "Placing order…" : "Place order"}</button>
        </form>
      </div>
    </ShopShell>
  );
}

export default ShopCheckout;
