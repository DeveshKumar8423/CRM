import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import BankDetailsList from "../components/BankDetailsList";
import DocumentsPanel from "../components/DocumentsPanel";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

import { STATUS_LABELS, formatCurrency, formatDate, statusBadgeClass } from "../utils/invoices";

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [inv, setInv] = useState(null);
  const [tab, setTab] = useState("overview");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState("");
  const [paymentForm, setPaymentForm] = useState({ amount: "", payment_date: new Date().toISOString().slice(0, 10), payment_method: "bank_transfer", reference: "", note: "" });

  const load = () => apiFetch(`/invoices/${id}`).then(setInv).catch((err) => setError(err.message));
  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (inv?.client_email) setSendEmail(inv.client_email); }, [inv]);

  const run = async (path, body, msg, onSuccess) => {
    setError(""); setMessage("");
    try {
      const updated = await apiFetch(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
      setInv(updated); setMessage(msg);
      if (onSuccess) onSuccess(updated); else load();
    } catch (err) { setError(err.message); }
  };

  if (!inv && !error) return <DashboardLayout title="Invoice" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  if (error && !inv) return <DashboardLayout title="Invoice" roleLabel={role}><div className="crm-panel"><p className="crm-error">{error}</p></div></DashboardLayout>;

  const canEdit = hasPermission("invoices.edit_draft") && ["draft", "awaiting_review"].includes(inv.status);
  const canReview = hasPermission("invoices.review");
  const canIssue = hasPermission("invoices.issue");
  const canSend = hasPermission("invoices.send");
  const canPay = hasPermission("invoices.record_payment");
  const canAdjust = hasPermission("invoices.create_adjustment");
  const canCancel = hasPermission("invoices.cancel");
  const canWriteOff = hasPermission("invoices.write_off");

  const tabs = [{ key: "overview", label: "Overview" }, { key: "items", label: "Line items" }, { key: "payments", label: "Payments" }, { key: "tax", label: "Tax" }];

  return (
    <DashboardLayout title={inv.title} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/invoices" className="crm-link crm-link-left">← All invoices</Link>
          <div className="crm-inline-actions">
            <Link to={`/invoices/${id}/preview`} className="crm-btn crm-btn-sm crm-btn-outline">Preview</Link>
            {inv.contact_id && (hasPermission("customer_ledger.view") || hasPermission("invoices.view") || hasPermission("payments.view")) && (
              <Link to={`/customer-ledger/${inv.contact_id}`} className="crm-btn crm-btn-sm crm-btn-outline">Customer ledger</Link>
            )}
            {canEdit && <Link to={`/invoices/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>}
            {canEdit && inv.status === "draft" && <button type="button" className="crm-btn crm-btn-sm" onClick={() => run(`/invoices/${id}/submit-review`, null, "Submitted for review")}>Submit for review</button>}
            {canReview && inv.status === "awaiting_review" && (
              <>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => run(`/invoices/${id}/approve`, { comments: "" }, "Approved")}>Approve</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => { const c = window.prompt("Reason?"); if (c !== null) run(`/invoices/${id}/reject-review`, { comments: c }, "Returned to draft"); }}>Reject</button>
              </>
            )}
            {canIssue && ["approved", "draft"].includes(inv.status) && <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => run(`/invoices/${id}/issue`, null, "Invoice issued")}>Issue</button>}
            {canSend && ["issued", "sent", "viewed", "partially_paid", "overdue"].includes(inv.status) && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => run(`/invoices/${id}/send`, { recipient_email: sendEmail }, "Invoice sent")}>Send</button>
            )}
            {canAdjust && ["issued", "sent", "viewed", "partially_paid", "paid", "overdue"].includes(inv.status) && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => { const r = window.prompt("Credit note reason?"); if (r) run(`/invoices/${id}/credit-note`, { reason: r }, "Credit note created", (cn) => navigate(`/invoices/${cn.id}`)); }}>Credit note</button>
            )}
            {canWriteOff && inv.outstanding_amount > 0 && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => { const r = window.prompt("Write-off reason?"); if (r) run(`/invoices/${id}/write-off`, { reason: r }, "Written off"); }}>Write off</button>
            )}
            {canCancel && !["paid", "cancelled", "closed"].includes(inv.status) && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => { const r = window.prompt("Cancel reason?"); if (r) run(`/invoices/${id}/cancel`, { reason: r }, "Cancelled"); }}>Cancel</button>
            )}
          </div>
        </div>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-quote-header-strip crm-mt">
          <div><span className="crm-muted">Invoice #</span> <strong>{inv.invoice_number || "Draft"}</strong></div>
          <span className={statusBadgeClass(inv.status)}>{STATUS_LABELS[inv.status]}</span>
          <div className="crm-num"><strong>{formatCurrency(inv.grand_total, inv.currency)}</strong></div>
          <div><span className="crm-muted">Outstanding</span> <strong className="crm-num">{formatCurrency(inv.outstanding_amount, inv.currency)}</strong></div>
          <div><span className="crm-muted">Due</span> {formatDate(inv.due_date)}</div>
        </div>

        {inv.share_url && <p className="crm-mt"><strong>Client link:</strong> <a href={inv.share_url} target="_blank" rel="noreferrer" className="crm-nav-link">{inv.share_url}</a></p>}

        <div className="crm-tabs crm-mt-lg">
          {tabs.map((t) => <button key={t.key} type="button" className={`crm-tab ${tab === t.key ? "crm-tab-active" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
        </div>

        {tab === "overview" && (
          <div className="crm-contact-meta crm-mt">
            <p><strong>Customer:</strong> {inv.client_name} {inv.client_gstin && `(GSTIN: ${inv.client_gstin})`}</p>
            {inv.sales_order_number && <p><strong>Order:</strong> <Link to={`/sales-orders/${inv.sales_order_id}`} className="crm-nav-link">{inv.sales_order_number}</Link></p>}
            {inv.quotation_number && <p><strong>Quote:</strong> <Link to={`/quotations/${inv.quotation_id}`} className="crm-nav-link">{inv.quotation_number}</Link></p>}
            <p><strong>Paid:</strong> {formatCurrency(inv.amount_paid, inv.currency)}</p>
            {inv.payment_terms && <p><strong>Terms:</strong> {inv.payment_terms}</p>}
            {inv.bank_instructions && (
              <>
                <p><strong>Bank</strong></p>
                <BankDetailsList text={inv.bank_instructions} className="crm-bank-details-overview" />
              </>
            )}
          </div>
        )}

        {tab === "items" && (
          <div className="crm-table-wrap crm-mt">
            <table className="crm-table">
              <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th className="crm-num">Total</th></tr></thead>
              <tbody>
                {inv.line_items.map((li) => (
                  <tr key={li.id}><td><strong>{li.item_name}</strong></td><td>{li.quantity}</td><td className="crm-num">{formatCurrency(li.unit_price, inv.currency)}</td><td className="crm-num">{formatCurrency(li.line_total, inv.currency)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "payments" && (
          <div className="crm-mt">
            {inv.payments.length === 0 && <p className="crm-muted">No payments recorded.</p>}
            {inv.payments.map((p) => (
              <div key={p.id} className="crm-quote-approval-card crm-mb">
                <strong>{formatCurrency(p.amount, inv.currency)}</strong> — {formatDate(p.payment_date)} via {p.payment_method}
                {p.reference && <span className="crm-muted"> · Ref: {p.reference}</span>}
                {p.note && <div className="crm-muted">{p.note}</div>}
              </div>
            ))}
            {canPay && inv.outstanding_amount > 0 && inv.status !== "cancelled" && (
              <div className="crm-form crm-mt">
                <h3>Record payment</h3>
                <div className="crm-form-grid">
                  <div><label>Amount</label><input type="number" min="0" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} /></div>
                  <div><label>Date</label><input type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} /></div>
                  <div><label>Reference</label><input value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} /></div>
                </div>
                <button type="button" className="crm-btn crm-btn-sm crm-mt" onClick={() => run(`/invoices/${id}/record-payment`, {
                  amount: Number(paymentForm.amount), payment_date: new Date(`${paymentForm.payment_date}T12:00:00`).toISOString(),
                  payment_method: paymentForm.payment_method, reference: paymentForm.reference || null, note: paymentForm.note || null,
                }, "Payment recorded")}>Record payment</button>
              </div>
            )}
          </div>
        )}

        {tab === "tax" && (
          <div className="crm-contact-meta crm-mt">
            <p><strong>Subtotal:</strong> {formatCurrency(inv.subtotal, inv.currency)}</p>
            <p><strong>Discounts:</strong> {formatCurrency(inv.line_discount_total + inv.header_discount_amount, inv.currency)}</p>
            <p><strong>Tax:</strong> {formatCurrency(inv.total_tax, inv.currency)}</p>
            {inv.round_off !== 0 && <p><strong>Round-off:</strong> {formatCurrency(inv.round_off, inv.currency)}</p>}
            <p><strong>Grand total:</strong> {formatCurrency(inv.grand_total, inv.currency)}</p>
          </div>
        )}
      </div>

      {(hasPermission("files.view") || hasPermission("files.view_own")) && (
        <div className="crm-panel crm-mt">
          <DocumentsPanel invoiceId={Number(id)} />
        </div>
      )}
    </DashboardLayout>
  );
}


export default InvoiceDetail;
