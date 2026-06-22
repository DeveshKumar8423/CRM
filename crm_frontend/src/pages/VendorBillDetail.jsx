import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import DocumentsPanel from "../components/DocumentsPanel";
import { apiFetch, API_URL, getAuthHeaders } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  PAYMENT_METHOD_LABELS,
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from "../utils/vendorBills";
import { canViewVendorLedger } from "../utils/vendorLedger";

function VendorBillDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: "bank_transfer",
    reference: "",
    note: "",
  });
  const [showPayment, setShowPayment] = useState(false);

  const load = () => apiFetch(`/vendor-bills/${id}`).then(setBill).catch((err) => setError(err.message));
  useEffect(() => { load(); }, [id]);

  const run = async (path, body, msg) => {
    setError("");
    setMessage("");
    try {
      const updated = await apiFetch(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
      setBill(updated);
      setMessage(msg);
      setShowPayment(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const recordPayment = () => {
    run(`/vendor-bills/${id}/record-payment`, {
      amount: Number(paymentForm.amount),
      payment_date: new Date(`${paymentForm.payment_date}T12:00:00`).toISOString(),
      payment_method: paymentForm.payment_method,
      reference: paymentForm.reference || null,
      note: paymentForm.note || null,
    }, "Payment recorded");
  };

  const downloadAttachment = async (attachmentId, filename) => {
    const response = await fetch(`${API_URL}/vendor-bills/${id}/attachments/${attachmentId}/download`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      setError("Could not download attachment");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!bill && !error) {
    return <DashboardLayout title="Vendor Bill" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }
  if (error && !bill) {
    return <DashboardLayout title="Vendor Bill" roleLabel={role}><div className="crm-panel"><p className="crm-error">{error}</p></div></DashboardLayout>;
  }

  const canEdit = hasPermission("vendor_bills.edit_own") && ["draft", "rejected"].includes(bill.status);
  const canSubmit = hasPermission("vendor_bills.submit") && ["draft", "rejected"].includes(bill.status);
  const canApprove = hasPermission("vendor_bills.approve") && ["submitted", "under_review"].includes(bill.status);
  const canReject = hasPermission("vendor_bills.reject") && ["submitted", "under_review"].includes(bill.status);
  const canPay = hasPermission("vendor_bills.record_payment") && ["approved", "partially_paid", "overdue"].includes(bill.status);
  const canClose = hasPermission("vendor_bills.record_payment") && bill.status === "paid";
  const canCancel = hasPermission("vendor_bills.cancel") && !["paid", "closed", "cancelled"].includes(bill.status);
  const hasPoMatch = bill.purchase_order_id && bill.line_items.some((li) => li.po_received_quantity != null);

  return (
    <DashboardLayout title={bill.title} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/vendor-bills" className="crm-link crm-link-left">← All vendor bills</Link>
          <div className="crm-inline-actions">
            {canViewVendorLedger(hasPermission) && bill.contact_id && (
              <Link to={`/vendor-ledger/${bill.contact_id}`} className="crm-btn crm-btn-sm crm-btn-outline">
                Vendor ledger
              </Link>
            )}
            {canEdit && <Link to={`/vendor-bills/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>}
            {canSubmit && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => run(`/vendor-bills/${id}/submit`, null, "Submitted for approval")}>
                Submit for approval
              </button>
            )}
            {canApprove && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => run(`/vendor-bills/${id}/approve`, { comments: "" }, "Approved")}>
                Approve
              </button>
            )}
            {canReject && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => {
                const reason = window.prompt("Rejection reason?");
                if (reason) run(`/vendor-bills/${id}/reject`, { reason, comments: "" }, "Rejected");
              }}>
                Reject
              </button>
            )}
            {canPay && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => {
                setPaymentForm({ ...paymentForm, amount: String(bill.outstanding_amount) });
                setShowPayment(true);
              }}>
                Record payment
              </button>
            )}
            {canClose && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => run(`/vendor-bills/${id}/close`, null, "Closed")}>
                Close
              </button>
            )}
            {canCancel && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => {
                const reason = window.prompt("Cancellation reason?");
                if (reason) run(`/vendor-bills/${id}/cancel`, { reason }, "Cancelled");
              }}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-quote-header-strip crm-mt">
          <div><span className="crm-muted">Bill #</span> <strong>{bill.bill_number || "Draft"}</strong></div>
          <span className={statusBadgeClass(bill.status)}>{STATUS_LABELS[bill.status]}</span>
          <div className="crm-num"><strong>{formatCurrency(bill.grand_total, bill.currency)}</strong></div>
          <div><span className="crm-muted">Outstanding</span> {formatCurrency(bill.outstanding_amount, bill.currency)}</div>
          <div><span className="crm-muted">Due</span> {formatDate(bill.due_date)}</div>
        </div>

        <div className="crm-contact-meta crm-mt">
          <p><strong>Vendor:</strong> {bill.vendor_name}</p>
          {bill.supplier_invoice_number && <p><strong>Supplier invoice #:</strong> {bill.supplier_invoice_number}</p>}
          {bill.vendor_gstin && <p><strong>GSTIN:</strong> {bill.vendor_gstin}</p>}
          {bill.po_number && (
            <p><strong>Purchase order:</strong> <Link to={`/purchase-orders/${bill.purchase_order_id}`} className="crm-nav-link">{bill.po_number}</Link></p>
          )}
          {bill.deal_id && <p><strong>Deal:</strong> <Link to={`/deals/${bill.deal_id}`} className="crm-nav-link">{bill.deal_title}</Link></p>}
          {bill.internal_notes && <p><strong>Notes:</strong> {bill.internal_notes}</p>}
          {bill.rejection_reason && <p className="crm-error"><strong>Rejection:</strong> {bill.rejection_reason}</p>}
        </div>

        <h3 className="crm-mt-lg">Line items</h3>
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Description</th><th className="crm-num">Qty</th><th className="crm-num">Rate</th>
                <th className="crm-num">Tax %</th><th className="crm-num">Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.line_items.map((li) => (
                <tr key={li.id}>
                  <td>{li.description}</td>
                  <td className="crm-num">{li.quantity}</td>
                  <td className="crm-num">{formatCurrency(li.unit_price, bill.currency)}</td>
                  <td className="crm-num">{li.tax_rate}%</td>
                  <td className="crm-num">{formatCurrency(li.line_total, bill.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasPoMatch && (
          <>
            <h3 className="crm-mt-lg">Three-way match</h3>
            <div className="crm-table-wrap">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Line</th><th className="crm-num">Ordered</th><th className="crm-num">Received</th>
                    <th className="crm-num">Billed (PO)</th><th className="crm-num">This bill</th><th className="crm-num">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.line_items.filter((li) => li.po_received_quantity != null).map((li) => (
                    <tr key={li.id}>
                      <td>{li.description}</td>
                      <td className="crm-num">{li.po_ordered_quantity}</td>
                      <td className="crm-num">{li.po_received_quantity}</td>
                      <td className="crm-num">{li.po_billed_quantity}</td>
                      <td className="crm-num">{li.quantity}</td>
                      <td className="crm-num">{li.po_pending_billing_quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <h3 className="crm-mt-lg">Payments</h3>
        {bill.payments.length === 0 && <p className="crm-muted">No payments recorded.</p>}
        {bill.payments.length > 0 && (
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr><th>Date</th><th className="crm-num">Amount</th><th>Method</th><th>Reference</th><th>By</th></tr>
              </thead>
              <tbody>
                {bill.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.payment_date)}</td>
                    <td className="crm-num">{formatCurrency(p.amount, bill.currency)}</td>
                    <td>{PAYMENT_METHOD_LABELS[p.payment_method] || p.payment_method}</td>
                    <td>{p.reference || "—"}</td>
                    <td>{p.recorded_by_name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showPayment && (
          <div className="crm-panel crm-mt crm-form">
            <h3>Record payment</h3>
            <div className="crm-form-grid">
              <div><label>Amount</label><input type="number" min="0" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} /></div>
              <div><label>Date</label><input type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} /></div>
              <div><label>Method</label>
                <select value={paymentForm.payment_method} onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label>Reference</label><input value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} /></div>
            </div>
            <div className="crm-inline-actions crm-mt">
              <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={recordPayment}>Save payment</button>
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => setShowPayment(false)}>Cancel</button>
            </div>
          </div>
        )}

        <h3 className="crm-mt-lg">Bill attachments</h3>
        {bill.attachments.length === 0 && <p className="crm-muted">No legacy bill attachments.</p>}
        <ul className="crm-timeline">
          {bill.attachments.map((a) => (
            <li key={a.id}>
              <button type="button" className="crm-nav-link crm-btn-link-style" onClick={() => downloadAttachment(a.id, a.original_filename)}>
                {a.original_filename}
              </button>
            </li>
          ))}
        </ul>

        {(hasPermission("files.view") || hasPermission("files.view_own")) && (
          <DocumentsPanel vendorBillId={Number(id)} />
        )}
      </div>
    </DashboardLayout>
  );
}

export default VendorBillDetail;
