import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import ClientNotesPanel from "../components/ClientNotesPanel";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from "../utils/quotations";

function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [quote, setQuote] = useState(null);
  const [versions, setVersions] = useState([]);
  const [tab, setTab] = useState("overview");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState("");

  const loadQuote = () => {
    apiFetch(`/quotations/${id}`).then(setQuote).catch((err) => setError(err.message));
    apiFetch(`/quotations/${id}/versions`).then(setVersions).catch(() => {});
  };

  useEffect(() => {
    loadQuote();
  }, [id]);

  useEffect(() => {
    if (quote?.client_email) setSendEmail(quote.client_email);
  }, [quote]);

  const runAction = async (path, body, successMsg, onSuccess) => {
    setError("");
    setMessage("");
    try {
      const updated = await apiFetch(path, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      setQuote(updated);
      setMessage(successMsg);
      if (onSuccess) {
        onSuccess(updated);
      } else {
        loadQuote();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this draft quotation?")) return;
    try {
      await apiFetch(`/quotations/${id}`, { method: "DELETE" });
      navigate("/quotations");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!quote && !error) {
    return (
      <DashboardLayout title="Quotation" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  if (error && !quote) {
    return (
      <DashboardLayout title="Quotation" roleLabel={role}>
        <div className="crm-panel"><p className="crm-error">{error}</p></div>
      </DashboardLayout>
    );
  }

  const canEdit = hasPermission("quotations.edit_draft")
    && ["draft", "pending_approval", "approved"].includes(quote.status);
  const canSubmit = hasPermission("quotations.submit_approval") && quote.status === "draft";
  const canApprove = hasPermission("quotations.approve") && quote.status === "pending_approval";
  const canSend = hasPermission("quotations.send")
    && ["approved", "sent", "viewed", "negotiation"].includes(quote.status);
  const canCancel = hasPermission("quotations.cancel") && !["accepted", "rejected", "expired", "cancelled"].includes(quote.status);
  const canRevision = hasPermission("quotations.create") && !["draft", "pending_approval"].includes(quote.status);
  const canConvert = hasPermission("sales_orders.convert_from_quote") && ["accepted", "approved"].includes(quote.status);
  const canInvoice = hasPermission("invoices.generate_from_order") && ["accepted", "approved"].includes(quote.status);
  const canOverride = hasPermission("quotations.accept_override")
    && ["sent", "viewed", "negotiation"].includes(quote.status);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "lines", label: "Line items" },
    { key: "terms", label: "Terms" },
    { key: "versions", label: "Versions" },
  ];

  return (
    <DashboardLayout title={quote.title} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/quotations" className="crm-link crm-link-left">← All quotations</Link>
          <div className="crm-inline-actions">
            <Link to={`/quotations/${id}/preview`} className="crm-btn crm-btn-sm crm-btn-outline">Preview</Link>
            {canEdit && (
              <Link to={`/quotations/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>
            )}
            {canSubmit && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => runAction(`/quotations/${id}/submit-approval`, null, "Submitted for approval")}>
                Submit for approval
              </button>
            )}
            {canApprove && (
              <>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => runAction(`/quotations/${id}/approve`, { comments: "" }, "Approved")}>
                  Approve
                </button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => {
                  const comments = window.prompt("Reason for rejection?");
                  if (comments !== null) runAction(`/quotations/${id}/reject-approval`, { comments }, "Returned to draft");
                }}>
                  Reject
                </button>
              </>
            )}
            {canSend && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => runAction(`/quotations/${id}/send`, { recipient_email: sendEmail }, "Quote sent")}>
                Send to client
              </button>
            )}
            {canRevision && (
              <button
                type="button"
                className="crm-btn crm-btn-sm crm-btn-outline"
                onClick={() => runAction(
                  `/quotations/${id}/revision`,
                  null,
                  "Revision created",
                  (revision) => navigate(`/quotations/${revision.id}`),
                )}
              >
                Create revision
              </button>
            )}
            {canConvert && (
              <button
                type="button"
                className="crm-btn crm-btn-sm crm-btn-inline"
                onClick={() => runAction(
                  `/sales-orders/from-quotation/${id}`,
                  null,
                  "Sales order created",
                  (order) => navigate(`/sales-orders/${order.id}`),
                )}
              >
                Convert to sales order
              </button>
            )}
            {canInvoice && (
              <button
                type="button"
                className="crm-btn crm-btn-sm crm-btn-outline"
                onClick={() => runAction(
                  `/invoices/from-quotation/${id}`,
                  null,
                  "Invoice created",
                  (invoice) => navigate(`/invoices/${invoice.id}`),
                )}
              >
                Generate invoice
              </button>
            )}
            {canCancel && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => {
                if (window.confirm("Cancel this quotation?")) runAction(`/quotations/${id}/cancel`, null, "Cancelled");
              }}>
                Cancel
              </button>
            )}
            {quote.status === "draft" && hasPermission("quotations.edit_draft") && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleDelete}>Delete</button>
            )}
          </div>
        </div>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-quote-header-strip crm-mt">
          <div>
            <span className="crm-muted">Quote #</span>
            <strong>{quote.quote_number}</strong>
            {quote.version > 1 && <span className="crm-muted"> · V{quote.version}</span>}
          </div>
          <span className={statusBadgeClass(quote.status)}>
            {STATUS_LABELS[quote.status] || quote.status}
          </span>
          <div className="crm-num"><strong>{formatCurrency(quote.grand_total, quote.currency)}</strong></div>
          <div><span className="crm-muted">Valid until</span> {formatDate(quote.valid_until)}</div>
          <div><span className="crm-muted">Owner</span> {quote.assigned_to_name || "—"}</div>
        </div>

        {canSend && (
          <div className="crm-form crm-mt">
            <label>Send to email</label>
            <input value={sendEmail} onChange={(e) => setSendEmail(e.target.value)} />
          </div>
        )}

        {quote.share_url && (
          <p className="crm-mt">
            <strong>Client link:</strong>{" "}
            <a href={quote.share_url} target="_blank" rel="noreferrer" className="crm-nav-link">{quote.share_url}</a>
          </p>
        )}

        {canOverride && (
          <div className="crm-inline-actions crm-mt">
            <button type="button" className="crm-btn crm-btn-sm" onClick={() => {
              if (window.confirm("Mark as accepted?")) runAction(`/quotations/${id}/accept-override`, null, "Marked accepted");
            }}>Mark accepted</button>
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => {
              const reason = window.prompt("Rejection reason?");
              if (reason !== null) runAction(`/quotations/${id}/reject-override`, { comments: reason }, "Marked rejected");
            }}>Mark rejected</button>
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => runAction(`/quotations/${id}/reminder`, null, "Reminder sent")}>
              Send reminder
            </button>
          </div>
        )}

        <div className="crm-tabs crm-mt-lg">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`crm-tab ${tab === t.key ? "crm-tab-active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="crm-contact-meta crm-mt">
            <p><strong>Client:</strong> {quote.client_name || "—"} {quote.client_org && `(${quote.client_org})`}</p>
            <p><strong>Email:</strong> {quote.client_email || "—"}</p>
            <p><strong>Quote date:</strong> {formatDate(quote.quote_date)}</p>
            {quote.deal_id && (
              <p><strong>Deal:</strong> <Link to={`/deals/${quote.deal_id}`} className="crm-nav-link">{quote.deal_title || `#${quote.deal_id}`}</Link></p>
            )}
            {quote.lead_id && (
              <p><strong>Lead:</strong> <Link to={`/leads/${quote.lead_id}`} className="crm-nav-link">{quote.lead_name || `#${quote.lead_id}`}</Link></p>
            )}
            {quote.contact_id && (
              <p><strong>Contact:</strong> <Link to={`/contacts/${quote.contact_id}`} className="crm-nav-link">{quote.contact_name || `#${quote.contact_id}`}</Link></p>
            )}
            {quote.requires_approval && <p className="crm-muted">Requires manager approval before send</p>}
            {quote.sent_at && <p><strong>Sent:</strong> {formatDate(quote.sent_at)}</p>}
            {quote.viewed_at && <p><strong>Viewed:</strong> {formatDate(quote.viewed_at)}</p>}
            {quote.accepted_at && <p><strong>Accepted:</strong> {formatDate(quote.accepted_at)}</p>}
            {quote.rejected_at && <p><strong>Rejected:</strong> {formatDate(quote.rejected_at)}</p>}
            {quote.approval_comments && <p><strong>Approval notes:</strong> {quote.approval_comments}</p>}
            {quote.internal_notes && (
              <div className="crm-mt">
                <strong>Internal notes</strong>
                <pre className="crm-pre">{quote.internal_notes}</pre>
              </div>
            )}
          </div>
        )}

        {tab === "lines" && (
          <div className="crm-table-wrap crm-mt">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit price</th>
                  <th>Tax %</th>
                  <th className="crm-num">Total</th>
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
                    <td className="crm-num">{formatCurrency(li.unit_price, quote.currency)}</td>
                    <td>{li.tax_rate}%</td>
                    <td className="crm-num">{formatCurrency(li.line_total, quote.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="crm-num"><strong>Grand total</strong></td>
                  <td className="crm-num"><strong>{formatCurrency(quote.grand_total, quote.currency)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {tab === "terms" && (
          <div className="crm-contact-meta crm-mt">
            {quote.scope_notes && <p><strong>Scope:</strong> {quote.scope_notes}</p>}
            {quote.deliverables && <p><strong>Deliverables:</strong> {quote.deliverables}</p>}
            {quote.timeline_notes && <p><strong>Timeline:</strong> {quote.timeline_notes}</p>}
            {quote.payment_terms && <p><strong>Payment terms:</strong> {quote.payment_terms}</p>}
            {quote.validity_clause && <p><strong>Validity:</strong> {quote.validity_clause}</p>}
            {quote.cancellation_clause && <p><strong>Cancellation:</strong> {quote.cancellation_clause}</p>}
            {quote.legal_footer && <p className="crm-muted">{quote.legal_footer}</p>}
          </div>
        )}

        {tab === "versions" && (
          <div className="crm-table-wrap crm-mt">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Quote #</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v) => (
                  <tr key={v.id}>
                    <td>V{v.version}</td>
                    <td>{v.quote_number}</td>
                    <td><span className={statusBadgeClass(v.status)}>{STATUS_LABELS[v.status]}</span></td>
                    <td className="crm-num">{formatCurrency(v.grand_total, quote.currency)}</td>
                    <td>{formatDate(v.updated_at)}</td>
                    <td>
                      {v.id !== quote.id && (
                        <Link to={`/quotations/${v.id}`} className="crm-nav-link">View</Link>
                      )}
                      {v.id === quote.id && <span className="crm-muted">Current</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasPermission("client_notes.view") && (
        <div className="crm-panel crm-mt">
          <ClientNotesPanel
            quotationId={Number(id)}
            dealId={quote.deal_id || undefined}
            contactId={quote.contact_id || undefined}
            contactName={quote.client_name || quote.client_org}
            compact
          />
        </div>
      )}
    </DashboardLayout>
  );
}

export default QuotationDetail;
