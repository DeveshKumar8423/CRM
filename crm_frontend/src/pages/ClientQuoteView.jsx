import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { API_URL } from "../utils/api";
import {
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from "../utils/quotations";

async function publicFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data;
}

function ClientQuoteView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [changeMessage, setChangeMessage] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    publicFetch(`/public/quotes/${token}/view`, { method: "POST" })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  const runAction = async (action, body) => {
    setError("");
    setMessage("");
    try {
      const result = await publicFetch(`/public/quotes/${token}/${action}`, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      setData(result);
      setMessage(`Quotation ${action === "accept" ? "accepted" : action === "reject" ? "rejected" : "updated"} successfully.`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!data && !error) {
    return (
      <div className="crm-client-quote">
        <div className="crm-panel"><p>Loading quotation…</p></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="crm-client-quote">
        <div className="crm-panel"><p className="crm-error">{error}</p></div>
      </div>
    );
  }

  const { quote, company, is_expired, can_accept } = data;
  const companyAddress = [company.address_line1, company.address_line2, company.city, company.state, company.pincode, company.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="crm-client-quote">
      <div className={`crm-quote-document crm-panel ${is_expired ? "crm-quote-expired" : ""}`}>
        <header className="crm-quote-doc-header">
          <div>
            <h1>{company.display_name}</h1>
            {companyAddress && <p className="crm-muted">{companyAddress}</p>}
            {company.gstin && <p className="crm-muted">GSTIN: {company.gstin}</p>}
            {company.email && <p className="crm-muted">{company.email}</p>}
          </div>
          <div className="crm-quote-doc-meta">
            <h2>QUOTATION</h2>
            <p><strong>{quote.quote_number}</strong></p>
            <span className={statusBadgeClass(quote.status)}>{STATUS_LABELS[quote.status]}</span>
            <p>Date: {formatDate(quote.quote_date)}</p>
            <p>Valid until: {formatDate(quote.valid_until)}</p>
          </div>
        </header>

        {is_expired && (
          <div className="crm-quote-watermark">EXPIRED</div>
        )}

        <section className="crm-quote-doc-parties">
          <div>
            <h3>Prepared for</h3>
            <p><strong>{quote.client_name || "Client"}</strong></p>
            {quote.client_org && <p>{quote.client_org}</p>}
            {quote.billing_address && <p className="crm-muted">{quote.billing_address}</p>}
          </div>
        </section>

        <h3>{quote.title}</h3>

        <table className="crm-table crm-quote-doc-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th className="crm-num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quote.line_items.map((li) => (
              <tr key={li.id}>
                <td>
                  <strong>{li.item_name}</strong>
                  {li.description && <div className="crm-muted">{li.description}</div>}
                </td>
                <td>{li.quantity} {li.unit}</td>
                <td className="crm-num">{formatCurrency(li.line_total, quote.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="crm-quote-doc-totals">
          <div className="crm-quote-summary-total">
            <span>Grand total</span>
            <strong>{formatCurrency(quote.grand_total, quote.currency)}</strong>
          </div>
        </div>

        <section className="crm-quote-doc-terms crm-mt-lg">
          {quote.payment_terms && <p><strong>Payment terms:</strong> {quote.payment_terms}</p>}
          {quote.validity_clause && <p><strong>Validity:</strong> {quote.validity_clause}</p>}
          {quote.legal_footer && <p className="crm-muted">{quote.legal_footer}</p>}
        </section>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        {can_accept && (
          <div className="crm-client-quote-actions crm-mt-lg">
            <label className="crm-consent-check">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              I agree to the terms and conditions stated in this quotation.
            </label>
            <div className="crm-inline-actions crm-mt">
              <button
                type="button"
                className="crm-btn crm-btn-inline"
                disabled={!consent}
                onClick={() => runAction("accept")}
              >
                Accept quotation
              </button>
              <button
                type="button"
                className="crm-btn crm-btn-outline"
                onClick={() => {
                  const reason = window.prompt("Reason for rejection (optional):");
                  if (reason !== null) runAction("reject", { reason });
                }}
              >
                Reject
              </button>
            </div>
            <div className="crm-mt">
              <label>Request changes or ask a question</label>
              <textarea
                className="crm-textarea"
                rows={3}
                value={changeMessage}
                onChange={(e) => setChangeMessage(e.target.value)}
                placeholder="Describe the changes you need…"
              />
              <button
                type="button"
                className="crm-btn crm-btn-sm crm-mt"
                onClick={() => runAction("request-changes", { message: changeMessage })}
              >
                Request changes
              </button>
            </div>
          </div>
        )}

        {!can_accept && quote.status === "accepted" && (
          <p className="crm-success crm-mt-lg">Thank you — this quotation has been accepted.</p>
        )}
        {!can_accept && quote.status === "rejected" && (
          <p className="crm-muted crm-mt-lg">This quotation was declined.</p>
        )}

        <p className="crm-muted crm-mt-lg crm-client-help">
          Questions? Contact {company.display_name}
          {company.email && <> at <a href={`mailto:${company.email}`}>{company.email}</a></>}
          {company.phone && <> or {company.phone}</>}.
        </p>
      </div>
    </div>
  );
}

export default ClientQuoteView;
