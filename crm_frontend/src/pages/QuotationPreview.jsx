import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import QuotationDocument from "../components/QuotationDocument";
import { apiFetch } from "../utils/api";
import { QUOTE_DOCUMENT_DEFAULTS } from "../utils/quotationBranding";

function QuotationPreview() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [quote, setQuote] = useState(null);
  const [defaults, setDefaults] = useState(QUOTE_DOCUMENT_DEFAULTS);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch(`/quotations/${id}`),
      apiFetch("/quotations/defaults").catch(() => QUOTE_DOCUMENT_DEFAULTS),
    ])
      .then(([q, d]) => {
        setQuote(q);
        setDefaults(d || QUOTE_DOCUMENT_DEFAULTS);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const handlePrint = () => window.print();

  if (!quote && !error) {
    return (
      <DashboardLayout title="Preview" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Preview" roleLabel={role}>
        <div className="crm-panel"><p className="crm-error">{error}</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Quotation Preview" roleLabel={role}>
      <div className="crm-panel crm-no-print">
        <div className="crm-detail-header">
          <Link to={`/quotations/${id}`} className="crm-link crm-link-left">← Back to quote</Link>
          <button type="button" className="crm-btn crm-btn-sm" onClick={handlePrint}>Print / Save PDF</button>
        </div>
      </div>

      <QuotationDocument quote={quote} defaults={defaults} showStatus />
    </DashboardLayout>
  );
}

export default QuotationPreview;
