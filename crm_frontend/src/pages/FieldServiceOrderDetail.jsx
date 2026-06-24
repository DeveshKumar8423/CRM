import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import {
  formatScheduleRange,
  FSO_STATUS_LABELS,
  FSO_TYPE_LABELS,
  fsoPriorityClass,
  fsoStatusClass,
} from "../utils/fieldService";
import { hasPermission } from "../utils/permissions";

function FieldServiceOrderDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [order, setOrder] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [partProductId, setPartProductId] = useState("");
  const [partQty, setPartQty] = useState("1");
  const [resolution, setResolution] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const load = () => apiFetch(`/field-service/orders/${id}`).then(setOrder).catch((err) => setError(err.message));

  useEffect(() => {
    load();
    if (hasPermission("field_service.dispatch")) {
      apiFetch("/admin/users").then(setUsers).catch(() => {});
    }
    apiFetch("/products?limit=500")
      .then((d) => {
        const list = d.items || d || [];
        setProducts(list.filter((p) => p.is_spare_part || p.inventory_tracked));
      })
      .catch(() => {});
  }, [id]);

  const setStatus = async (status) => {
    setError("");
    try {
      const updated = await apiFetch(`/field-service/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setOrder(updated);
      setMessage(`Status: ${FSO_STATUS_LABELS[status] || status}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const assign = async (e) => {
    e.preventDefault();
    try {
      const updated = await apiFetch(`/field-service/orders/${id}/assign`, {
        method: "PUT",
        body: JSON.stringify({
          assigned_to_id: Number(assignUserId),
          scheduled_start: new Date(scheduledStart).toISOString(),
          scheduled_end: scheduledEnd ? new Date(scheduledEnd).toISOString() : null,
        }),
      });
      setOrder(updated);
      setShowAssign(false);
      setMessage("Technician assigned and scheduled");
    } catch (err) {
      setError(err.message);
    }
  };

  const issuePart = async (e) => {
    e.preventDefault();
    try {
      const updated = await apiFetch(`/field-service/orders/${id}/parts`, {
        method: "POST",
        body: JSON.stringify({ product_id: Number(partProductId), quantity: Number(partQty) }),
      });
      setOrder(updated);
      setPartProductId("");
      setMessage("Parts issued");
    } catch (err) {
      setError(err.message);
    }
  };

  const complete = async (e) => {
    e.preventDefault();
    try {
      const updated = await apiFetch(`/field-service/orders/${id}/complete`, {
        method: "POST",
        body: JSON.stringify({ resolution_notes: resolution, root_cause: rootCause || null }),
      });
      setOrder(updated);
      setShowComplete(false);
      setMessage("Visit completed");
    } catch (err) {
      setError(err.message);
    }
  };

  const cancel = async () => {
    if (!window.confirm("Cancel this service order?")) return;
    try {
      const updated = await apiFetch(`/field-service/orders/${id}/cancel`, { method: "PUT" });
      setOrder(updated);
      setMessage("Order cancelled");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!order && !error) {
    return <DashboardLayout title="Service order" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }

  const isOpen = order && !["completed", "cancelled"].includes(order.status);
  const canDispatch = hasPermission("field_service.dispatch");
  const canExecute = hasPermission("field_service.execute");
  const canIssue = hasPermission("field_service.issue_parts");
  const canCancel = hasPermission("field_service.cancel");

  return (
    <DashboardLayout title={order?.order_number || "Service order"} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/field-service/orders" className="crm-muted">← Orders</Link>
          <div className="crm-inline-actions fs-detail-actions">
            {canDispatch && isOpen && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => setShowAssign((v) => !v)}>Assign</button>
            )}
            {canExecute && isOpen && order.status === "scheduled" && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => setStatus("dispatched")}>Dispatch</button>
            )}
            {canExecute && isOpen && order.status === "dispatched" && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => setStatus("in_progress")}>Start visit</button>
            )}
            {canExecute && isOpen && order.status === "in_progress" && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => setStatus("waiting_parts")}>Waiting parts</button>
            )}
            {canExecute && isOpen && order.status === "waiting_parts" && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => setStatus("in_progress")}>Resume</button>
            )}
            {canExecute && isOpen && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => setShowComplete((v) => !v)}>Complete</button>
            )}
            {canDispatch && isOpen && ["scheduled", "dispatched"].includes(order.status) && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={async () => {
                try {
                  const updated = await apiFetch(`/field-service/orders/${id}/reschedule`, { method: "PUT" });
                  setOrder(updated);
                  setShowAssign(true);
                  setMessage("Rescheduled — set new assignment");
                } catch (err) {
                  setError(err.message);
                }
              }}>Reschedule</button>
            )}
            {canCancel && isOpen && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={cancel}>Cancel</button>
            )}
          </div>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}
        {order && (
          <>
            <div className="crm-mt">
              <span className={fsoStatusClass(order.status)}>{FSO_STATUS_LABELS[order.status]}</span>
              {" "}
              <span className={fsoPriorityClass(order.priority)}>{order.priority}</span>
              {order.sla_breached && <span className="crm-badge crm-badge-danger crm-ml">SLA breached</span>}
              <p className="crm-mt"><strong>{order.title}</strong> — {FSO_TYPE_LABELS[order.type] || order.type}</p>
              <p className="crm-muted">Customer: {order.contact_name}</p>
            </div>
            <div className="fs-site-card crm-mt">
              <h4>Site visit</h4>
              <p>{order.site_address || "—"}</p>
              {order.site_contact_phone && (
                <p><a href={`tel:${order.site_contact_phone}`}>{order.site_contact_name || "Contact"}: {order.site_contact_phone}</a></p>
              )}
              {order.site_notes && <p className="crm-muted">{order.site_notes}</p>}
            </div>
            {order.description && <p className="crm-mt">{order.description}</p>}
            <dl className="crm-dl crm-mt">
              <dt>Scheduled</dt><dd>{formatScheduleRange(order.scheduled_start, order.scheduled_end)}</dd>
              <dt>Technician</dt><dd>{order.assigned_to_name || "Unassigned"}</dd>
              <dt>SLA due</dt><dd>{order.sla_due_at ? new Date(order.sla_due_at).toLocaleString() : "—"}</dd>
            </dl>
            {showAssign && canDispatch && (
              <form className="crm-form crm-mt fs-assign-form" onSubmit={assign}>
                <div className="crm-form-field">
                  <label>Technician *</label>
                  <select required value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)}>
                    <option value="">Select</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="crm-form-field">
                  <label>Start *</label>
                  <input type="datetime-local" required value={scheduledStart} onChange={(e) => setScheduledStart(e.target.value)} />
                </div>
                <div className="crm-form-field">
                  <label>End</label>
                  <input type="datetime-local" value={scheduledEnd} onChange={(e) => setScheduledEnd(e.target.value)} />
                </div>
                <button type="submit" className="crm-btn crm-btn-sm">Save assignment</button>
              </form>
            )}
            {showComplete && canExecute && (
              <form className="crm-form crm-mt fs-complete-form" onSubmit={complete}>
                <div className="crm-form-field"><label>Resolution notes *</label><textarea required value={resolution} onChange={(e) => setResolution(e.target.value)} rows={3} /></div>
                {order.type === "repair" && (
                  <div className="crm-form-field"><label>Root cause</label><input value={rootCause} onChange={(e) => setRootCause(e.target.value)} /></div>
                )}
                <button type="submit" className="crm-btn">Confirm complete</button>
              </form>
            )}
            {isOpen && canIssue && ["scheduled", "dispatched", "in_progress", "waiting_parts"].includes(order.status) && (
              <>
                <h3 className="crm-mt">Issue parts</h3>
                <form className="crm-inline-actions crm-mt" onSubmit={issuePart}>
                  <select required value={partProductId} onChange={(e) => setPartProductId(e.target.value)} className="crm-select">
                    <option value="">Select part</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" min="0.01" step="any" value={partQty} onChange={(e) => setPartQty(e.target.value)} style={{ width: 80 }} />
                  <button type="submit" className="crm-btn crm-btn-sm">Issue</button>
                </form>
              </>
            )}
            <h3 className="crm-mt">Parts used</h3>
            {order.parts?.length === 0 ? (
              <p className="crm-muted">No parts issued.</p>
            ) : (
              <table className="crm-table crm-mt">
                <thead><tr><th>Part</th><th>Qty</th><th>Issued</th></tr></thead>
                <tbody>
                  {order.parts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.product_name}</td>
                      <td>{p.quantity} {p.unit || ""}</td>
                      <td>{p.issued_at ? new Date(p.issued_at).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {order.resolution_notes && (
              <div className="crm-mt">
                <h4>Resolution</h4>
                <p>{order.resolution_notes}</p>
                {order.root_cause && <p className="crm-muted">Root cause: {order.root_cause}</p>}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default FieldServiceOrderDetail;
