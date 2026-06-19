import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch, API_URL, getAuthHeaders } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  PAYMENT_TERM_LABELS,
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from "../utils/purchaseOrders";

function PurchaseOrderDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [po, setPo] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [receiptForm, setReceiptForm] = useState({ line_item_id: "", quantity: "", grn_reference: "" });
  const [billingForm, setBillingForm] = useState({ line_item_id: "", quantity: "", amount: "", bill_reference: "" });

  const load = () => apiFetch(`/purchase-orders/${id}`).then(setPo).catch((err) => setError(err.message));
  useEffect(() => { load(); }, [id]);

  const run = async (path, body, msg) => {
    setError("");
    setMessage("");
    try {
      const updated = await apiFetch(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
      setPo(updated);
      setMessage(msg);
    } catch (err) {
      setError(err.message);
    }
  };

  const recordReceipt = async (e) => {
    e.preventDefault();
    await run(`/purchase-orders/${id}/record-receipt`, {
      line_item_id: Number(receiptForm.line_item_id),
      quantity: Number(receiptForm.quantity),
      receipt_date: new Date().toISOString(),
      grn_reference: receiptForm.grn_reference || null,
    }, "Receipt recorded");
    setReceiptForm({ line_item_id: "", quantity: "", grn_reference: "" });
  };

  const recordBilling = async (e) => {
    e.preventDefault();
    await run(`/purchase-orders/${id}/record-billing`, {
      line_item_id: Number(billingForm.line_item_id),
      quantity: Number(billingForm.quantity),
      amount: Number(billingForm.amount),
      bill_reference: billingForm.bill_reference || null,
    }, "Billing recorded");
    setBillingForm({ line_item_id: "", quantity: "", amount: "", bill_reference: "" });
  };

  const downloadAttachment = async (attachmentId, filename) => {
    const response = await fetch(`${API_URL}/purchase-orders/${id}/attachments/${attachmentId}/download`, {
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

  if (!po && !error) {
    return <DashboardLayout title="Purchase Order" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }
  if (error && !po) {
    return <DashboardLayout title="Purchase Order" roleLabel={role}><div className="crm-panel"><p className="crm-error">{error}</p></div></DashboardLayout>;
  }

  const canEdit = hasPermission("purchase_orders.edit_own") && ["draft", "rejected"].includes(po.status);
  const canSubmit = hasPermission("purchase_orders.submit") && ["draft", "rejected"].includes(po.status);
  const canApprove = hasPermission("purchase_orders.approve") && ["submitted", "under_review"].includes(po.status);
  const canReject = hasPermission("purchase_orders.reject") && ["submitted", "under_review"].includes(po.status);
  const canSend = hasPermission("purchase_orders.send") && po.status === "approved";
  const canReceipt = hasPermission("purchase_orders.record_receipt") && ["sent_to_vendor", "partially_received", "fully_received", "partially_billed", "fully_billed"].includes(po.status);
  const canBilling = hasPermission("purchase_orders.record_billing") && ["partially_received", "fully_received", "partially_billed", "fully_billed"].includes(po.status);
  const canClose = hasPermission("purchase_orders.close") && ["fully_billed", "partially_billed", "fully_received"].includes(po.status);
  const canCancel = !["closed", "cancelled"].includes(po.status);

  return (
    <DashboardLayout title={po.title} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/purchase-orders" className="crm-link crm-link-left">← All purchase orders</Link>
          <div className="crm-inline-actions">
            {canEdit && <Link to={`/purchase-orders/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>}
            {canSubmit && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => run(`/purchase-orders/${id}/submit`, null, "Submitted for approval")}>Submit</button>
            )}
            {canApprove && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => run(`/purchase-orders/${id}/approve`, { comments: "" }, "Approved")}>Approve</button>
            )}
            {canReject && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => {
                const reason = window.prompt("Rejection reason?");
                if (reason) run(`/purchase-orders/${id}/reject`, { reason, comments: "" }, "Rejected");
              }}>Reject</button>
            )}
            {canSend && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => run(`/purchase-orders/${id}/send`, null, "Sent to vendor")}>Send to vendor</button>
            )}
            {canClose && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => run(`/purchase-orders/${id}/close`, null, "PO closed")}>Close PO</button>
            )}
            {canCancel && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => run(`/purchase-orders/${id}/cancel`, null, "Cancelled")}>Cancel</button>
            )}
          </div>
        </div>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-quote-header-strip crm-mt">
          <div><span className="crm-muted">PO #</span> <strong>{po.po_number || "Draft"}</strong></div>
          <span className={statusBadgeClass(po.status)}>{STATUS_LABELS[po.status]}</span>
          <div className="crm-num"><strong>{formatCurrency(po.grand_total, po.currency)}</strong></div>
          <div><span className="crm-muted">Vendor</span> {po.vendor_name}</div>
          <div><span className="crm-muted">Delivery</span> {formatDate(po.expected_delivery_date)}</div>
        </div>

        <div className="crm-stats-grid crm-mt">
          <div className="crm-stat-card"><p className="crm-stat-label">Ordered</p><p className="crm-stat-value">{formatCurrency(po.grand_total, po.currency)}</p></div>
          <div className="crm-stat-card"><p className="crm-stat-label">Received</p><p className="crm-stat-value">{formatCurrency(po.received_value, po.currency)} ({po.received_percent}%)</p></div>
          <div className="crm-stat-card"><p className="crm-stat-label">Billed</p><p className="crm-stat-value">{formatCurrency(po.billed_value, po.currency)} ({po.billed_percent}%)</p></div>
          <div className="crm-stat-card"><p className="crm-stat-label">Pending</p><p className="crm-stat-value">{formatCurrency(po.pending_receipt_value + po.pending_billing_value, po.currency)}</p></div>
        </div>

        <h3 className="crm-mt-lg">Line items</h3>
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Description</th><th>Ordered</th><th>Received</th><th>Billed</th>
                <th>Pending receipt</th><th>Pending billing</th><th className="crm-num">Total</th>
              </tr>
            </thead>
            <tbody>
              {po.line_items.map((li) => (
                <tr key={li.id}>
                  <td>{li.description}</td>
                  <td>{li.ordered_quantity} {li.unit}</td>
                  <td>{li.received_quantity}</td>
                  <td>{li.billed_quantity}</td>
                  <td>{li.pending_receipt_quantity}</td>
                  <td>{li.pending_billing_quantity}</td>
                  <td className="crm-num">{formatCurrency(li.line_total, po.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canReceipt && (
          <form onSubmit={recordReceipt} className="crm-form crm-mt-lg">
            <h3>Record receipt</h3>
            <div className="crm-form-grid">
              <div>
                <label>Line item</label>
                <select value={receiptForm.line_item_id} onChange={(e) => setReceiptForm((f) => ({ ...f, line_item_id: e.target.value }))} required>
                  <option value="">Select line</option>
                  {po.line_items.filter((li) => li.pending_receipt_quantity > 0).map((li) => (
                    <option key={li.id} value={li.id}>{li.description} (pending {li.pending_receipt_quantity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Quantity received</label>
                <input type="number" min="0.01" step="0.01" value={receiptForm.quantity} onChange={(e) => setReceiptForm((f) => ({ ...f, quantity: e.target.value }))} required />
              </div>
              <div>
                <label>GRN reference</label>
                <input value={receiptForm.grn_reference} onChange={(e) => setReceiptForm((f) => ({ ...f, grn_reference: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="crm-btn crm-btn-sm crm-mt">Record receipt</button>
          </form>
        )}

        {canBilling && (
          <form onSubmit={recordBilling} className="crm-form crm-mt-lg">
            <h3>Record billing</h3>
            <div className="crm-form-grid">
              <div>
                <label>Line item</label>
                <select value={billingForm.line_item_id} onChange={(e) => setBillingForm((f) => ({ ...f, line_item_id: e.target.value }))} required>
                  <option value="">Select line</option>
                  {po.line_items.filter((li) => li.pending_billing_quantity > 0).map((li) => (
                    <option key={li.id} value={li.id}>{li.description} (pending {li.pending_billing_quantity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Quantity billed</label>
                <input type="number" min="0.01" step="0.01" value={billingForm.quantity} onChange={(e) => setBillingForm((f) => ({ ...f, quantity: e.target.value }))} required />
              </div>
              <div>
                <label>Amount</label>
                <input type="number" min="0.01" step="0.01" value={billingForm.amount} onChange={(e) => setBillingForm((f) => ({ ...f, amount: e.target.value }))} required />
              </div>
              <div>
                <label>Bill reference</label>
                <input value={billingForm.bill_reference} onChange={(e) => setBillingForm((f) => ({ ...f, bill_reference: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="crm-btn crm-btn-sm crm-mt">Record billing</button>
          </form>
        )}

        <div className="crm-contact-meta crm-mt-lg">
          <p><strong>Payment terms:</strong> {PAYMENT_TERM_LABELS[po.payment_terms] || po.payment_terms || "—"}</p>
          <p><strong>Created by:</strong> {po.created_by_name}</p>
          {po.deal_id && <p><strong>Deal:</strong> <Link to={`/deals/${po.deal_id}`} className="crm-nav-link">{po.deal_title}</Link></p>}
          {po.contact_id && <p><strong>Contact:</strong> <Link to={`/contacts/${po.contact_id}`} className="crm-nav-link">{po.contact_name}</Link></p>}
          {po.notes && <p><strong>Notes:</strong> {po.notes}</p>}
          {po.rejection_reason && <p className="crm-error"><strong>Rejection:</strong> {po.rejection_reason}</p>}
        </div>

        {po.receipts.length > 0 && (
          <>
            <h3 className="crm-mt-lg">Receipt history</h3>
            <ul className="crm-timeline">
              {po.receipts.map((r) => (
                <li key={r.id}>{r.line_description}: {r.quantity} · {r.recorded_by_name} · {formatDate(r.receipt_date)}{r.grn_reference ? ` · GRN ${r.grn_reference}` : ""}</li>
              ))}
            </ul>
          </>
        )}

        {po.billings.length > 0 && (
          <>
            <h3 className="crm-mt-lg">Billing history</h3>
            <ul className="crm-timeline">
              {po.billings.map((b) => (
                <li key={b.id}>{b.line_description}: {b.quantity} @ {formatCurrency(b.amount, po.currency)} · {b.recorded_by_name}{b.bill_reference ? ` · Bill ${b.bill_reference}` : ""}</li>
              ))}
            </ul>
          </>
        )}

        {po.attachments.length > 0 && (
          <>
            <h3 className="crm-mt-lg">Attachments</h3>
            <ul className="crm-timeline">
              {po.attachments.map((a) => (
                <li key={a.id}>
                  <button type="button" className="crm-nav-link crm-btn-link-style" onClick={() => downloadAttachment(a.id, a.original_filename)}>{a.original_filename}</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default PurchaseOrderDetail;
