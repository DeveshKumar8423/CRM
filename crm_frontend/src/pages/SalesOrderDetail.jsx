import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import ClientNotesPanel from "../components/ClientNotesPanel";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  ORDER_TYPES,
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from "../utils/salesOrders";

function SalesOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [order, setOrder] = useState(null);
  const [versions, setVersions] = useState([]);
  const [tab, setTab] = useState("overview");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState("");

  const loadOrder = () => {
    apiFetch(`/sales-orders/${id}`).then(setOrder).catch((err) => setError(err.message));
    apiFetch(`/sales-orders/${id}/versions`).then(setVersions).catch(() => {});
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  useEffect(() => {
    if (order?.client_email) setSendEmail(order.client_email);
  }, [order]);

  const runAction = async (path, body, successMsg, onSuccess) => {
    setError("");
    setMessage("");
    try {
      const updated = await apiFetch(path, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      setOrder(updated);
      setMessage(successMsg);
      if (onSuccess) onSuccess(updated);
      else loadOrder();
    } catch (err) {
      setError(err.message);
    }
  };

  const askReason = (actionLabel, callback) => {
    const reason = window.prompt(`${actionLabel} — please provide a reason:`);
    if (reason && reason.trim()) callback(reason.trim());
  };

  if (!order && !error) {
    return <DashboardLayout title="Sales Order" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }
  if (error && !order) {
    return <DashboardLayout title="Sales Order" roleLabel={role}><div className="crm-panel"><p className="crm-error">{error}</p></div></DashboardLayout>;
  }

  const canEdit = hasPermission("sales_orders.edit_draft") && ["draft", "awaiting_confirmation"].includes(order.status);
  const canConfirm = hasPermission("sales_orders.confirm");
  const canProgress = hasPermission("sales_orders.update_progress");
  const canHold = hasPermission("sales_orders.hold") && !["completed", "cancelled", "closed"].includes(order.status);
  const canCancel = hasPermission("sales_orders.cancel") && !["completed", "cancelled", "closed"].includes(order.status);
  const canAmend = hasPermission("sales_orders.amend") && !["draft", "awaiting_confirmation", "cancelled", "closed"].includes(order.status);
  const canInvoice = hasPermission("invoices.generate_from_order") && [
    "confirmed", "in_preparation", "in_execution", "partially_delivered", "delivered", "in_billing", "completed",
  ].includes(order.status);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "items", label: "Line items" },
    { key: "fulfillment", label: "Fulfillment" },
    { key: "billing", label: "Billing" },
    { key: "versions", label: "Versions" },
  ];

  return (
    <DashboardLayout title={order.title} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/sales-orders" className="crm-link crm-link-left">← All orders</Link>
          <div className="crm-inline-actions">
            {canEdit && <Link to={`/sales-orders/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>}
            {canConfirm && order.status === "draft" && (
              <>
                <button type="button" className="crm-btn crm-btn-sm" onClick={() => runAction(`/sales-orders/${id}/send-confirmation`, { recipient_email: sendEmail }, "Sent for confirmation")}>Send for confirmation</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => runAction(`/sales-orders/${id}/confirm-internal`, null, "Order confirmed")}>Confirm internally</button>
              </>
            )}
            {canConfirm && order.status === "awaiting_confirmation" && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => runAction(`/sales-orders/${id}/confirm-internal`, null, "Order confirmed")}>Confirm</button>
            )}
            {canProgress && order.status === "confirmed" && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => runAction(`/sales-orders/${id}/begin-preparation`, null, "Preparation started")}>Begin preparation</button>
            )}
            {canProgress && ["in_preparation", "confirmed"].includes(order.status) && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => runAction(`/sales-orders/${id}/start-execution`, null, "Execution started")}>Start execution</button>
            )}
            {canProgress && ["in_preparation", "in_execution", "partially_delivered"].includes(order.status) && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => runAction(`/sales-orders/${id}/partial-delivery`, null, "Marked partially delivered")}>Partial delivery</button>
            )}
            {canProgress && ["partially_delivered", "in_execution", "in_preparation"].includes(order.status) && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => runAction(`/sales-orders/${id}/mark-delivered`, null, "Marked delivered")}>Mark delivered</button>
            )}
            {canProgress && ["delivered", "partially_delivered", "in_execution"].includes(order.status) && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => runAction(`/sales-orders/${id}/billing-handoff`, null, "Billing handoff")}>Billing handoff</button>
            )}
            {canProgress && ["delivered", "in_billing", "in_execution"].includes(order.status) && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => runAction(`/sales-orders/${id}/complete`, { fulfillment_progress: 100 }, "Order completed")}>Complete</button>
            )}
            {canAmend && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => runAction(`/sales-orders/${id}/amendment`, null, "Amendment created", (a) => navigate(`/sales-orders/${a.id}`))}>Create amendment</button>
            )}
            {canInvoice && (
              <button
                type="button"
                className="crm-btn crm-btn-sm crm-btn-inline"
                onClick={() => runAction(
                  `/invoices/from-order/${id}`,
                  null,
                  "Invoice created",
                  (invoice) => navigate(`/invoices/${invoice.id}`),
                )}
              >
                Generate invoice
              </button>
            )}
            {canHold && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => askReason("Place on hold", (reason) => runAction(`/sales-orders/${id}/hold`, { reason }, "Order on hold"))}>On hold</button>
            )}
            {canCancel && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => askReason("Cancel order", (reason) => runAction(`/sales-orders/${id}/cancel`, { reason }, "Order cancelled"))}>Cancel</button>
            )}
          </div>
        </div>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-quote-header-strip crm-mt">
          <div><span className="crm-muted">Order #</span> <strong>{order.order_number}</strong></div>
          <span className={statusBadgeClass(order.status)}>{STATUS_LABELS[order.status]}</span>
          <div className="crm-num"><strong>{formatCurrency(order.grand_total, order.currency)}</strong></div>
          <div><span className="crm-muted">Due</span> {formatDate(order.due_date)}</div>
          <div><span className="crm-muted">Progress</span> {order.fulfillment_progress}%</div>
        </div>

        {order.hold_reason && <p className="crm-mt crm-muted"><strong>On hold:</strong> {order.hold_reason}</p>}
        {order.cancellation_reason && <p className="crm-mt crm-muted"><strong>Cancelled:</strong> {order.cancellation_reason}</p>}
        {order.share_url && (
          <p className="crm-mt"><strong>Customer link:</strong> <a href={order.share_url} target="_blank" rel="noreferrer" className="crm-nav-link">{order.share_url}</a></p>
        )}

        {canConfirm && order.status === "draft" && (
          <div className="crm-form crm-mt">
            <label>Send confirmation to</label>
            <input value={sendEmail} onChange={(e) => setSendEmail(e.target.value)} />
          </div>
        )}

        <div className="crm-tabs crm-mt-lg">
          {tabs.map((t) => (
            <button key={t.key} type="button" className={`crm-tab ${tab === t.key ? "crm-tab-active" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="crm-contact-meta crm-mt">
            <p><strong>Customer:</strong> {order.client_name} {order.client_org && `(${order.client_org})`}</p>
            <p><strong>Type:</strong> {ORDER_TYPES[order.order_type] || order.order_type}</p>
            <p><strong>Source:</strong> {order.source_type}{order.quotation_number && <> · Quote <Link to={`/quotations/${order.quotation_id}`} className="crm-nav-link">{order.quotation_number}</Link></>}</p>
            {order.deal_id && <p><strong>Deal:</strong> <Link to={`/deals/${order.deal_id}`} className="crm-nav-link">{order.deal_title}</Link></p>}
            <p><strong>Owner:</strong> {order.assigned_to_name || "—"}</p>
            {order.confirmed_at && <p><strong>Confirmed:</strong> {formatDate(order.confirmed_at)}</p>}
            {order.delivery_instructions && <p><strong>Delivery:</strong> {order.delivery_instructions}</p>}
            {order.internal_notes && <pre className="crm-pre crm-mt">{order.internal_notes}</pre>}
          </div>
        )}

        {tab === "items" && (
          <div className="crm-table-wrap crm-mt">
            <table className="crm-table">
              <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th className="crm-num">Total</th></tr></thead>
              <tbody>
                {order.line_items.map((li) => (
                  <tr key={li.id}>
                    <td><strong>{li.item_name}</strong>{li.description && <div className="crm-muted">{li.description}</div>}</td>
                    <td>{li.quantity} {li.unit}</td>
                    <td className="crm-num">{formatCurrency(li.unit_price, order.currency)}</td>
                    <td className="crm-num">{formatCurrency(li.line_total, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "fulfillment" && (
          <div className="crm-mt">
            <div className="crm-progress-bar crm-mb">
              <div className="crm-progress-fill" style={{ width: `${order.fulfillment_progress}%` }} />
            </div>
            <p className="crm-muted">{order.fulfillment_progress}% complete · Preparation: {order.preparation_status}</p>
            {order.milestones.length === 0 && <p className="crm-muted">No milestones defined.</p>}
            {order.milestones.map((ms) => (
              <div key={ms.id} className="crm-quote-approval-card crm-mb">
                <div className="crm-quote-approval-header">
                  <div>
                    <strong>{ms.title}</strong>
                    <div className="crm-muted">{ms.description || "—"}</div>
                  </div>
                  <span className={`crm-badge ${ms.status === "completed" ? "crm-order-completed" : "crm-order-draft"}`}>{ms.status}</span>
                </div>
                <p className="crm-muted">Due {formatDate(ms.due_date)} · {ms.owner_name || "Unassigned"}</p>
                {canProgress && ms.status !== "completed" && (
                  <button type="button" className="crm-btn crm-btn-sm crm-mt" onClick={() => runAction(`/sales-orders/${id}/milestones/${ms.id}/complete`, null, "Milestone completed")}>Mark complete</button>
                )}
              </div>
            ))}
            {canProgress && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline crm-mt" onClick={() => {
                const progress = window.prompt("Update progress % (0-100):", String(order.fulfillment_progress));
                if (progress !== null) runAction(`/sales-orders/${id}/update-progress`, { fulfillment_progress: Number(progress) }, "Progress updated");
              }}>Update progress</button>
            )}
          </div>
        )}

        {tab === "billing" && (
          <div className="crm-contact-meta crm-mt">
            <p><strong>Billing status:</strong> {order.billing_status}</p>
            {order.billing_notes && <p><strong>Notes:</strong> {order.billing_notes}</p>}
            {order.payment_milestone_notes && <p><strong>Payment milestones:</strong> {order.payment_milestone_notes}</p>}
          </div>
        )}

        {tab === "versions" && (
          <div className="crm-table-wrap crm-mt">
            <table className="crm-table">
              <thead><tr><th>Version</th><th>Order #</th><th>Status</th><th>Amount</th><th></th></tr></thead>
              <tbody>
                {versions.map((v) => (
                  <tr key={v.id}>
                    <td>V{v.version}</td>
                    <td>{v.order_number}</td>
                    <td><span className={statusBadgeClass(v.status)}>{STATUS_LABELS[v.status]}</span></td>
                    <td className="crm-num">{formatCurrency(v.grand_total, order.currency)}</td>
                    <td>{v.id !== order.id ? <Link to={`/sales-orders/${v.id}`} className="crm-nav-link">View</Link> : <span className="crm-muted">Current</span>}</td>
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
            salesOrderId={Number(id)}
            quotationId={order.quotation_id || undefined}
            contactId={order.contact_id || undefined}
            contactName={order.client_name || order.client_org}
            compact
          />
        </div>
      )}
    </DashboardLayout>
  );
}

export default SalesOrderDetail;
