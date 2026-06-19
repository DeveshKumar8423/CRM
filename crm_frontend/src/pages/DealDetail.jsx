import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import RemindersPanel from "../components/RemindersPanel";
import ClientNotesPanel from "../components/ClientNotesPanel";
import DocumentsPanel from "../components/DocumentsPanel";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";


const STAGE_LABELS = {
  new: "New",
  contacted: "Contacted",
  meeting: "Meeting booked",
  proposal: "Proposal sent",
  won: "Won",
  lost: "Lost",
};

function formatCurrency(value, currency = "INR") {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function DealDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const canEdit = hasPermission("deals.edit");
  const canCreateQuote = hasPermission("quotations.create");
  const canCreateOrder = hasPermission("sales_orders.create");
  const canCreateExpense = hasPermission("expenses.create");
  const canCreatePO = hasPermission("purchase_orders.create");
  const [deal, setDeal] = useState(null);
  const [stages, setStages] = useState([]);
  const [error, setError] = useState("");

  const loadDeal = () => {
    apiFetch(`/deals/${id}`).then(setDeal).catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadDeal();
    apiFetch("/deals/stages").then(setStages).catch(() => {});
  }, [id]);

  const handleStageChange = async (stage) => {
    if (stage === "lost") {
      const reason = window.prompt("Reason for losing this deal?");
      if (!reason || !reason.trim()) return;
      try {
        await apiFetch(`/deals/${id}/stage`, {
          method: "PATCH",
          body: JSON.stringify({ stage, lost_reason: reason.trim() }),
        });
        loadDeal();
      } catch (err) {
        setError(err.message);
      }
      return;
    }
    try {
      await apiFetch(`/deals/${id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stage }),
      });
      loadDeal();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!deal && !error) {
    return (
      <DashboardLayout title="Deal" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  if (error && !deal) {
    return (
      <DashboardLayout title="Deal" roleLabel={role}>
        <div className="crm-panel"><p className="crm-error">{error}</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={deal.title} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/pipeline" className="crm-link crm-link-left">← Pipeline</Link>
          <div className="crm-inline-actions">
            {canEdit && (
              <Link to={`/deals/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>
            )}
            {canCreateQuote && (
              <Link to={`/quotations/new?deal_id=${id}${deal.contact_id ? `&contact_id=${deal.contact_id}` : ""}${deal.lead_id ? `&lead_id=${deal.lead_id}` : ""}`} className="crm-btn crm-btn-sm crm-btn-outline">
                Create quotation
              </Link>
            )}
            {canCreateOrder && (
              <Link to={`/sales-orders/new?deal_id=${id}${deal.contact_id ? `&contact_id=${deal.contact_id}` : ""}`} className="crm-btn crm-btn-sm crm-btn-outline">
                Create sales order
              </Link>
            )}
            {canCreateExpense && (
              <Link to={`/expenses/new?deal_id=${id}${deal.contact_id ? `&contact_id=${deal.contact_id}` : ""}`} className="crm-btn crm-btn-sm crm-btn-outline">
                Create expense
              </Link>
            )}
            {canCreatePO && (
              <Link to={`/purchase-orders/new?deal_id=${id}${deal.contact_id ? `&contact_id=${deal.contact_id}` : ""}`} className="crm-btn crm-btn-sm crm-btn-outline">
                Create purchase order
              </Link>
            )}
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-contact-meta crm-mt">
          <p>
            <span className={`crm-badge crm-deal-${deal.stage}`}>
              {STAGE_LABELS[deal.stage] || deal.stage}
            </span>
            {canEdit && (
              <select
                className="crm-pipeline-stage-select crm-ml"
                value={deal.stage}
                onChange={(e) => handleStageChange(e.target.value)}
              >
                {stages.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            )}
          </p>
          <p><strong>Expected value:</strong> {formatCurrency(deal.expected_value, deal.currency)}</p>
          <p><strong>Assigned to:</strong> {deal.assigned_to_name || "Unassigned"}</p>
          {deal.expected_close_date && (
            <p><strong>Expected close:</strong> {new Date(deal.expected_close_date).toLocaleDateString()}</p>
          )}
          {deal.closed_at && (
            <p><strong>Closed:</strong> {new Date(deal.closed_at).toLocaleDateString()}</p>
          )}
          {deal.lost_reason && <p><strong>Lost reason:</strong> {deal.lost_reason}</p>}
          {deal.lead_id && (
            <p>
              <strong>Lead:</strong>{" "}
              <Link to={`/leads/${deal.lead_id}`} className="crm-nav-link">
                {deal.lead_name || `#${deal.lead_id}`}
              </Link>
            </p>
          )}
          {deal.contact_id && (
            <p>
              <strong>Contact:</strong>{" "}
              <Link to={`/contacts/${deal.contact_id}`} className="crm-nav-link">
                {deal.contact_name || `#${deal.contact_id}`}
              </Link>
            </p>
          )}
          {deal.product_id && (
            <p>
              <strong>Product:</strong>{" "}
              <Link to={`/products/${deal.product_id}`} className="crm-nav-link">
                {deal.product_name || `#${deal.product_id}`}
              </Link>
            </p>
          )}
        </div>

        {deal.notes && (
          <div className="crm-mt-lg">
            <h3>Deal notes</h3>
            <pre className="crm-pre">{deal.notes}</pre>
          </div>
        )}

        {hasPermission("reminders.view") && (
          <RemindersPanel
            dealId={Number(id)}
            leadId={deal.lead_id || undefined}
            contactId={deal.contact_id || undefined}
            compact
          />
        )}

        {hasPermission("client_notes.view") && (
          <div className="crm-mt-lg">
            <ClientNotesPanel
              dealId={Number(id)}
              contactId={deal.contact_id || undefined}
              contactName={deal.contact_name || deal.title}
              compact
            />
          </div>
        )}

        {(hasPermission("files.view") || hasPermission("files.view_own")) && (
          <DocumentsPanel dealId={Number(id)} />
        )}
      </div>
    </DashboardLayout>
  );
}


export default DealDetail;
