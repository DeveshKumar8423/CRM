import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { API_URL } from "../utils/api";
import {
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from "../utils/salesOrders";

async function publicFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Request failed");
  return data;
}

function ClientOrderView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    publicFetch(`/public/orders/${token}`).then(setData).catch((err) => setError(err.message));
  }, [token]);

  const runAction = async (action, body) => {
    setError("");
    setMessage("");
    try {
      const result = await publicFetch(`/public/orders/${token}/${action}`, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      setData(result);
      setMessage(`Order ${action === "confirm" ? "confirmed" : action === "reject" ? "rejected" : "updated"} successfully.`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!data && !error) {
    return <div className="crm-client-quote"><div className="crm-panel"><p>Loading order…</p></div></div>;
  }
  if (error && !data) {
    return <div className="crm-client-quote"><div className="crm-panel"><p className="crm-error">{error}</p></div></div>;
  }

  const { order, company, can_confirm } = data;
  const companyAddress = [company.address_line1, company.city, company.state, company.pincode].filter(Boolean).join(", ");

  return (
    <div className="crm-client-quote">
      <div className="crm-quote-document crm-panel">
        <header className="crm-quote-doc-header">
          <div>
            <h1>{company.display_name}</h1>
            {companyAddress && <p className="crm-muted">{companyAddress}</p>}
          </div>
          <div className="crm-quote-doc-meta">
            <h2>SALES ORDER</h2>
            <p><strong>{order.order_number}</strong></p>
            <span className={statusBadgeClass(order.status)}>{STATUS_LABELS[order.status]}</span>
            <p>Date: {formatDate(order.order_date)}</p>
            <p>Due: {formatDate(order.due_date)}</p>
          </div>
        </header>

        <section className="crm-quote-doc-parties crm-mt">
          <div>
            <h3>Prepared for</h3>
            <p><strong>{order.client_name}</strong></p>
            {order.client_org && <p>{order.client_org}</p>}
            {order.delivery_address && <p className="crm-muted">{order.delivery_address}</p>}
          </div>
          {order.quotation_number && (
            <div>
              <h3>Source quotation</h3>
              <p>{order.quotation_number}</p>
            </div>
          )}
        </section>

        <h3>{order.title}</h3>

        <table className="crm-table crm-quote-doc-table">
          <thead><tr><th>Description</th><th>Qty</th><th className="crm-num">Amount</th></tr></thead>
          <tbody>
            {order.line_items.map((li) => (
              <tr key={li.id}>
                <td><strong>{li.item_name}</strong></td>
                <td>{li.quantity} {li.unit}</td>
                <td className="crm-num">{formatCurrency(li.line_total, order.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="crm-quote-doc-totals">
          <div className="crm-quote-summary-total">
            <span>Grand total</span>
            <strong>{formatCurrency(order.grand_total, order.currency)}</strong>
          </div>
        </div>

        {order.billing_notes && <p className="crm-mt"><strong>Billing:</strong> {order.billing_notes}</p>}
        {order.delivery_instructions && <p><strong>Delivery:</strong> {order.delivery_instructions}</p>}

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        {can_confirm && (
          <div className="crm-client-quote-actions crm-mt-lg">
            <label className="crm-consent-check">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              I confirm this sales order and agree to the stated terms.
            </label>
            <div className="crm-inline-actions crm-mt">
              <button type="button" className="crm-btn crm-btn-inline" disabled={!consent} onClick={() => runAction("confirm")}>Confirm order</button>
              <button type="button" className="crm-btn crm-btn-outline" onClick={() => {
                const reason = window.prompt("Reason for rejection (optional):");
                if (reason !== null) runAction("reject", { reason });
              }}>Reject</button>
            </div>
            <div className="crm-mt">
              <label>Request changes</label>
              <textarea className="crm-textarea" rows={3} id="change-msg" placeholder="Describe required changes…" />
              <button type="button" className="crm-btn crm-btn-sm crm-mt" onClick={() => {
                const msg = document.getElementById("change-msg")?.value;
                runAction("request-changes", { message: msg });
              }}>Request changes</button>
            </div>
          </div>
        )}

        {order.status === "confirmed" && <p className="crm-success crm-mt-lg">Thank you — this order is confirmed.</p>}
      </div>
    </div>
  );
}

export default ClientOrderView;
