import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatScheduleRange, FSO_STATUS_LABELS, FSO_TYPE_LABELS, fsoPriorityClass, fsoStatusClass } from "../utils/fieldService";
import { hasPermission } from "../utils/permissions";

function FieldServiceOrders() {
  const role = localStorage.getItem("role") || "Staff";
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [contactId, setContactId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    if (contactId) params.set("contact_id", contactId);
    const qs = params.toString();
    apiFetch(`/field-service/orders${qs ? `?${qs}` : ""}`)
      .then((d) => setItems(d.items || []))
      .catch((err) => setError(err.message));
  }, [type, status, contactId]);

  return (
    <DashboardLayout title="Field service orders" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/field-service" className="crm-muted">← Field Service</Link>
          {hasPermission("field_service.create") && (
            <Link to="/field-service/orders/new" className="crm-btn crm-btn-sm">New order</Link>
          )}
        </div>
        <div className="crm-inline-actions crm-mt">
          <select value={type} onChange={(e) => setType(e.target.value)} className="crm-select">
            <option value="">All types</option>
            {Object.entries(FSO_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="crm-select">
            <option value="">All statuses</option>
            {Object.entries(FSO_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input placeholder="Contact ID filter" value={contactId} onChange={(e) => setContactId(e.target.value)} style={{ width: 120 }} />
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>FSO #</th><th>Customer</th><th>Type</th><th>Priority</th><th>Status</th><th>Scheduled</th><th>Technician</th></tr></thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className={o.sla_breached ? "fs-sla-breach-row" : ""}>
                <td><Link to={`/field-service/orders/${o.id}`}>{o.order_number}</Link></td>
                <td>{o.contact_name}</td>
                <td>{FSO_TYPE_LABELS[o.type] || o.type}</td>
                <td><span className={fsoPriorityClass(o.priority)}>{o.priority}</span></td>
                <td><span className={fsoStatusClass(o.status)}>{FSO_STATUS_LABELS[o.status] || o.status}</span></td>
                <td>{formatScheduleRange(o.scheduled_start, o.scheduled_end)}</td>
                <td>{o.assigned_to_name || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="crm-muted crm-mt">No service orders found.</p>}
      </div>
    </DashboardLayout>
  );
}

export default FieldServiceOrders;
