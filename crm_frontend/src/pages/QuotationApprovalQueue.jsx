import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import {
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from "../utils/quotations";

function QuotationApprovalQueue() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadQueue = (page = 1) => {
    apiFetch(`/quotations/approval-queue?page=${page}&limit=20`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadQueue(1);
  }, []);

  const handleApprove = async (id) => {
    setError("");
    try {
      await apiFetch(`/quotations/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ comments: "" }),
      });
      setMessage("Quotation approved.");
      loadQueue(data.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (id) => {
    const comments = window.prompt("Reason for rejection?");
    if (comments === null) return;
    setError("");
    try {
      await apiFetch(`/quotations/${id}/reject-approval`, {
        method: "POST",
        body: JSON.stringify({ comments }),
      });
      setMessage("Quotation returned to draft.");
      loadQueue(data.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Awaiting My Approval" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/quotations" className="crm-link crm-link-left">← All quotations</Link>
        <p className="crm-muted crm-mt">{data.total} quotation{data.total === 1 ? "" : "s"} awaiting approval</p>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        {data.items.length === 0 && (
          <p className="crm-muted crm-mt">No quotations pending approval.</p>
        )}

        <div className="crm-quote-approval-list crm-mt">
          {data.items.map((quote) => (
            <div key={quote.id} className="crm-quote-approval-card">
              <div className="crm-quote-approval-header">
                <div>
                  <strong>{quote.quote_number}</strong> — {quote.title}
                  <div className="crm-muted">{quote.client_name || quote.client_org || "No client"}</div>
                </div>
                <strong className="crm-num">{formatCurrency(quote.grand_total, quote.currency)}</strong>
              </div>
              <div className="crm-quote-approval-flags">
                {quote.header_discount_percent > 15 && (
                  <span className="crm-badge crm-quote-pending_approval">High discount: {quote.header_discount_percent}%</span>
                )}
                {quote.grand_total > 500000 && (
                  <span className="crm-badge crm-quote-pending_approval">High value quote</span>
                )}
                <span className="crm-muted">Owner: {quote.assigned_to_name || "—"} · Expires {formatDate(quote.valid_until)}</span>
              </div>
              <div className="crm-inline-actions crm-mt">
                <Link to={`/quotations/${quote.id}`} className="crm-btn crm-btn-sm crm-btn-outline">Review</Link>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => handleApprove(quote.id)}>Approve</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => handleReject(quote.id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page <= 1} onClick={() => loadQueue(data.page - 1)}>Previous</button>
            <span className="crm-muted">Page {data.page} of {totalPages}</span>
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page >= totalPages} onClick={() => loadQueue(data.page + 1)}>Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default QuotationApprovalQueue;
