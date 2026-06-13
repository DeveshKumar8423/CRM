import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { STATUS_LABELS, formatCurrency, formatDate, statusBadgeClass } from "../utils/invoices";

function InvoiceReviewQueue() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadQueue = (page = 1) => {
    apiFetch(`/invoices/review-queue?page=${page}&limit=20`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadQueue(1);
  }, []);

  const handleApprove = async (id) => {
    setError("");
    try {
      await apiFetch(`/invoices/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ comments: "" }),
      });
      setMessage("Invoice approved.");
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
      await apiFetch(`/invoices/${id}/reject-review`, {
        method: "POST",
        body: JSON.stringify({ comments }),
      });
      setMessage("Invoice returned to draft.");
      loadQueue(data.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Invoice Review Queue" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/invoices" className="crm-link crm-link-left">← All invoices</Link>
        <p className="crm-muted crm-mt">{data.total} invoice{data.total === 1 ? "" : "s"} awaiting review</p>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        {data.items.length === 0 && (
          <p className="crm-muted crm-mt">No invoices pending review.</p>
        )}

        <div className="crm-quote-approval-list crm-mt">
          {data.items.map((inv) => (
            <div key={inv.id} className="crm-quote-approval-card">
              <div className="crm-quote-approval-header">
                <div>
                  <strong>{inv.invoice_number || "Draft"}</strong> — {inv.title}
                  <div className="crm-muted">{inv.client_name || inv.client_org || "No client"}</div>
                </div>
                <strong className="crm-num">{formatCurrency(inv.grand_total, inv.currency)}</strong>
              </div>
              <div className="crm-quote-approval-flags">
                {inv.grand_total > 500000 && (
                  <span className="crm-badge crm-invoice-awaiting_review">High value invoice</span>
                )}
                {inv.source_type === "manual" && (
                  <span className="crm-badge crm-invoice-awaiting_review">Manual invoice</span>
                )}
                <span className={statusBadgeClass(inv.status)}>{STATUS_LABELS[inv.status]}</span>
                <span className="crm-muted">Due {formatDate(inv.due_date)}</span>
              </div>
              <div className="crm-inline-actions crm-mt">
                <Link to={`/invoices/${inv.id}`} className="crm-btn crm-btn-sm crm-btn-outline">Review</Link>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => handleApprove(inv.id)}>Approve</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => handleReject(inv.id)}>Reject</button>
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

export default InvoiceReviewQueue;
