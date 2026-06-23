import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import QuotationDocument from "../components/QuotationDocument";
import { API_URL } from "../utils/api";
import { QUOTE_DOCUMENT_DEFAULTS } from "../utils/quotationBranding";
import { STATUS_LABELS, statusBadgeClass } from "../utils/quotations";

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

  const handlePrint = () => window.print();

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

  const { quote, is_expired: isExpired, can_accept: canAccept } = data;

  return (
    <div className="crm-client-quote">
      {isExpired && (
        <div className="crm-panel crm-no-print crm-mb">
          <span className={statusBadgeClass("expired")}>{STATUS_LABELS.expired}</span>
        </div>
      )}

      <QuotationDocument quote={quote} defaults={QUOTE_DOCUMENT_DEFAULTS} isExpired={isExpired} />

      <div className="crm-panel crm-no-print crm-mt">
        <button type="button" className="crm-btn crm-btn-sm" onClick={handlePrint}>Print / Save PDF</button>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        {canAccept && (
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

        {!canAccept && quote.status === "accepted" && (
          <p className="crm-success crm-mt-lg">Thank you — this quotation has been accepted.</p>
        )}
        {!canAccept && quote.status === "rejected" && (
          <p className="crm-muted crm-mt-lg">This quotation was declined.</p>
        )}
      </div>
    </div>
  );
}

export default ClientQuoteView;
