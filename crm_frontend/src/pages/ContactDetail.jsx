import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import ClientNotesPanel from "../components/ClientNotesPanel";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

const ACTIVITY_TYPES = [
  { value: "note", label: "Note" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
];

function ContactDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const canEdit = hasPermission("contacts.edit");
  const canCreateQuote = hasPermission("quotations.create");
  const canCreateOrder = hasPermission("sales_orders.create");
  const canCreateInvoice = hasPermission("invoices.create");

  const [contact, setContact] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activityForm, setActivityForm] = useState({
    activity_type: "call",
    subject: "",
    body: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAll = () => {
    Promise.all([
      apiFetch(`/contacts/${id}`),
      apiFetch(`/contacts/${id}/activities`),
    ])
      .then(([c, a]) => {
        setContact(c);
        setActivities(a);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const handleDeactivate = async () => {
    if (!contact) return;
    const next = contact.status === "active" ? "inactive" : "active";
    const label = next === "inactive" ? "deactivate" : "reactivate";
    if (!window.confirm(`Are you sure you want to ${label} this contact?`)) return;

    try {
      await apiFetch(`/contacts/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: contact.name,
          organization_name: contact.organization_name,
          email: contact.email,
          phone: contact.phone,
          alt_phone: contact.alt_phone,
          contact_type: contact.contact_type,
          status: next,
          designation: contact.designation,
          website: contact.website,
          address_line1: contact.address_line1,
          address_line2: contact.address_line2,
          city: contact.city,
          state: contact.state,
          pincode: contact.pincode,
          country: contact.country,
          gstin: contact.gstin,
          pan: contact.pan,
          assigned_to_id: contact.assigned_to_id,
        }),
      });
      setMessage(`Contact ${label}d.`);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch(`/contacts/${id}/activities`, {
        method: "POST",
        body: JSON.stringify({
          activity_type: activityForm.activity_type,
          subject: activityForm.subject || null,
          body: activityForm.body,
        }),
      });
      setActivityForm({ activity_type: "call", subject: "", body: "" });
      setMessage("Activity logged.");
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!contact && !error) {
    return (
      <DashboardLayout title="Contact" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  if (error && !contact) {
    return (
      <DashboardLayout title="Contact" roleLabel={role}>
        <div className="crm-panel">
          <p className="crm-error">{error}</p>
          <Link to="/contacts" className="crm-link">Back to contacts</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={contact.name} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/contacts" className="crm-link crm-link-left">← All contacts</Link>
          {canEdit && (
            <div className="crm-inline-actions">
              <Link to={`/contacts/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">
                Edit
              </Link>
              {canCreateQuote && (
                <Link to={`/quotations/new?contact_id=${id}`} className="crm-btn crm-btn-sm crm-btn-outline">
                  Create quotation
                </Link>
              )}
              {canCreateOrder && (
                <Link to={`/sales-orders/new?contact_id=${id}`} className="crm-btn crm-btn-sm crm-btn-outline">
                  Create sales order
                </Link>
              )}
              {canCreateInvoice && (
                <Link to={`/invoices/new?contact_id=${id}`} className="crm-btn crm-btn-sm crm-btn-outline">
                  Create invoice
                </Link>
              )}
              <button
                type="button"
                className="crm-btn crm-btn-sm"
                onClick={handleDeactivate}
              >
                {contact.status === "active" ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          )}
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}

        <div className="crm-contact-meta crm-mt">
          <p>
            <span className={`crm-badge crm-badge-type-${contact.contact_type.toLowerCase()}`}>
              {contact.contact_type}
            </span>{" "}
            <span
              className={
                contact.status === "active"
                  ? "crm-badge crm-badge-active"
                  : "crm-badge crm-badge-inactive"
              }
            >
              {contact.status}
            </span>
          </p>
          {contact.organization_name && (
            <p><strong>Organization:</strong> {contact.organization_name}</p>
          )}
          {contact.designation && (
            <p><strong>Designation:</strong> {contact.designation}</p>
          )}
          {contact.email && <p><strong>Email:</strong> {contact.email}</p>}
          {contact.phone && <p><strong>Phone:</strong> {contact.phone}</p>}
          {contact.alt_phone && <p><strong>Alt phone:</strong> {contact.alt_phone}</p>}
          {contact.assigned_to_name && (
            <p><strong>Assigned to:</strong> {contact.assigned_to_name}</p>
          )}
          {(contact.city || contact.state) && (
            <p>
              <strong>Location:</strong>{" "}
              {[contact.city, contact.state, contact.pincode].filter(Boolean).join(", ")}
            </p>
          )}
          {contact.gstin && <p><strong>GSTIN:</strong> {contact.gstin}</p>}
          {contact.pan && <p><strong>PAN:</strong> {contact.pan}</p>}
        </div>

        <div className="crm-detail-grid crm-mt-lg">
          {hasPermission("client_notes.view") && (
            <section className="crm-span-2">
              <ClientNotesPanel
                contactId={Number(id)}
                contactName={contact.name}
                title="Relationship notes"
              />
            </section>
          )}

          <section>
            <h3>Activity log</h3>
            {canEdit && (
              <form onSubmit={handleAddActivity} className="crm-form">
                <select
                  value={activityForm.activity_type}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, activity_type: e.target.value })
                  }
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <input
                  placeholder="Subject (optional)"
                  value={activityForm.subject}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, subject: e.target.value })
                  }
                />
                <textarea
                  className="crm-textarea"
                  rows={3}
                  placeholder="Details…"
                  value={activityForm.body}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, body: e.target.value })
                  }
                  required
                />
                <button type="submit" className="crm-btn crm-btn-sm crm-btn-inline">
                  Log activity
                </button>
              </form>
            )}
            <ul className="crm-timeline crm-mt">
              {activities.length === 0 && <li className="crm-muted">No activities yet.</li>}
              {activities.map((a) => (
                <li key={a.id}>
                  <p>
                    <strong className="crm-activity-type">{a.activity_type}</strong>
                    {a.subject && <> — {a.subject}</>}
                  </p>
                  <p>{a.body}</p>
                  <span className="crm-muted">
                    {a.author_name} · {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ContactDetail;
