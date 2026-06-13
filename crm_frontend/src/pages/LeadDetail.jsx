import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

const STATUS_LABELS = {
  open: "Open",
  hot: "Hot",
  follow_up: "Follow up",
  cold: "Cold",
  lost: "Lost",
  qualified: "Qualified",
  converted: "Converted",
};

function LeadDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const canEdit = hasPermission("leads.edit");
  const canCreateDeal = hasPermission("deals.create");
  const [lead, setLead] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadLead = () => {
    apiFetch(`/leads/${id}`).then(setLead).catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadLead();
  }, [id]);

  const handleCreateDeal = async () => {
    setMessage("");
    setError("");
    try {
      const deal = await apiFetch(`/deals/from-lead/${id}`, { method: "POST" });
      window.location.href = `/deals/${deal.id}`;
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConvert = async () => {
    if (!window.confirm("Convert this lead to a client contact?")) return;
    setMessage("");
    setError("");
    try {
      const result = await apiFetch(`/leads/${id}/convert-to-contact`, { method: "POST" });
      setMessage(result.message);
      setLead(result.lead);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!lead && !error) {
    return (
      <DashboardLayout title="Lead" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  if (error && !lead) {
    return (
      <DashboardLayout title="Lead" roleLabel={role}>
        <div className="crm-panel"><p className="crm-error">{error}</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={lead.name} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/leads" className="crm-link crm-link-left">← All leads</Link>
          <div className="crm-inline-actions">
            {canEdit && lead.status !== "converted" && (
              <Link to={`/leads/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>
            )}
            {canCreateDeal && lead.status !== "converted" && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleCreateDeal}>
                Create deal
              </button>
            )}
            {canEdit && !lead.contact_id && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={handleConvert}>
                Convert to contact
              </button>
            )}
          </div>
        </div>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-contact-meta crm-mt">
          <p>
            <span className={`crm-badge crm-lead-${lead.status}`}>
              {STATUS_LABELS[lead.status] || lead.status}
            </span>
            {lead.csv_status && (
              <span className="crm-muted"> · Original: {lead.csv_status}</span>
            )}
          </p>
          <p><strong>Phone:</strong> {lead.phone || "—"}</p>
          <p><strong>Email:</strong> {lead.email || "—"}</p>
          <p><strong>Organization:</strong> {lead.organization_name || "—"}</p>
          <p><strong>City:</strong> {lead.city || "—"}</p>
          <p><strong>Source:</strong> {lead.source}</p>
          <p><strong>Assigned to:</strong> {lead.assigned_to_name || "Unassigned"}</p>
          {lead.requirement && <p><strong>Requirement:</strong> {lead.requirement}</p>}
          {lead.exact_requirement && <p><strong>Exact requirement:</strong> {lead.exact_requirement}</p>}
          {lead.registered_at && (
            <p><strong>Registered:</strong> {new Date(lead.registered_at).toLocaleDateString()}</p>
          )}
          {lead.contact_id && (
            <p>
              <strong>Contact:</strong>{" "}
              <Link to={`/contacts/${lead.contact_id}`} className="crm-nav-link">
                View client #{lead.contact_id}
              </Link>
            </p>
          )}
        </div>

        {lead.notes && (
          <div className="crm-mt-lg">
            <h3>Notes</h3>
            <pre className="crm-pre">{lead.notes}</pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default LeadDetail;
