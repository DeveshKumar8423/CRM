import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import InvoiceDocument from "../components/InvoiceDocument";
import { API_URL } from "../utils/api";

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

function ClientInvoiceView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    publicFetch(`/public/invoices/${token}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  if (!data && !error) {
    return (
      <div className="crm-client-quote">
        <div className="crm-panel"><p>Loading invoice…</p></div>
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

  const { invoice: inv, company, is_overdue: isOverdue } = data;
  const handlePrint = () => window.print();

  return (
    <div className="crm-client-quote">
      <InvoiceDocument
        inv={inv}
        company={company}
        branding={company}
        clientMode
        isOverdue={isOverdue}
      />
      <div className="crm-client-quote-actions crm-mt crm-no-print">
        <button type="button" className="crm-btn crm-btn-inline" onClick={handlePrint}>Download / Print PDF</button>
      </div>
    </div>
  );
}

export default ClientInvoiceView;
