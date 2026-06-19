import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import {
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from "../utils/purchaseOrders";

function PurchaseOrderApprovalQueue() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = (page = 1) => {
    apiFetch(`/purchase-orders/approval-queue?page=${page}&limit=20`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, []);

  const approve = async (poId) => {
    setError("");
    try {
      await apiFetch(`/purchase-orders/${poId}/approve`, { method: "POST", body: JSON.stringify({ comments: "" }) });
      setMessage("Purchase order approved.");
      load(data.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const reject = async (poId) => {
    const reason = window.prompt("Rejection reason?");
    if (!reason) return;
    setError("");
    try {
      await apiFetch(`/purchase-orders/${poId}/reject`, { method: "POST", body: JSON.stringify({ reason, comments: "" }) });
      setMessage("Purchase order rejected.");
      load(data.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="PO Approval Queue" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/purchase-orders" className="crm-link crm-link-left">← All purchase orders</Link>
        <p className="crm-muted crm-mt">{data.total} PO{data.total === 1 ? "" : "s"} awaiting approval</p>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        {data.items.length === 0 && <p className="crm-muted crm-mt">No purchase orders pending approval.</p>}

        <div className="crm-quote-approval-list crm-mt">
          {data.items.map((po) => (
            <div key={po.id} className="crm-quote-approval-card">
              <div className="crm-quote-approval-header">
                <div>
                  <strong>{po.po_number || "Draft"}</strong> — {po.title}
                  <div className="crm-muted">{po.vendor_name} · {po.line_items.length} line{po.line_items.length === 1 ? "" : "s"}</div>
                </div>
                <strong className="crm-num">{formatCurrency(po.grand_total, po.currency)}</strong>
              </div>
              <div className="crm-quote-approval-flags">
                <span className={statusBadgeClass(po.status)}>{STATUS_LABELS[po.status]}</span>
                <span className="crm-muted">{po.created_by_name} · Delivery {formatDate(po.expected_delivery_date)}</span>
              </div>
              <div className="crm-inline-actions crm-mt">
                <Link to={`/purchase-orders/${po.id}`} className="crm-btn crm-btn-sm crm-btn-outline">Review</Link>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => approve(po.id)}>Approve</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => reject(po.id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page <= 1} onClick={() => load(data.page - 1)}>Previous</button>
            <span className="crm-muted">Page {data.page} of {totalPages}</span>
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page >= totalPages} onClick={() => load(data.page + 1)}>Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default PurchaseOrderApprovalQueue;
