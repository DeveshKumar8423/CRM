import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import {
  formatDowntime,
  MWO_STATUS_LABELS,
  MWO_TYPE_LABELS,
  mwoStatusClass,
} from "../utils/maintenance";
import { hasPermission } from "../utils/permissions";

const NEXT_STATUS = {
  open: "in_progress",
  in_progress: "waiting_parts",
  waiting_parts: "in_progress",
};

function MaintenanceWorkOrderDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [wo, setWo] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [partProductId, setPartProductId] = useState("");
  const [partQty, setPartQty] = useState("1");
  const [resolution, setResolution] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [downtime, setDowntime] = useState("");
  const [showComplete, setShowComplete] = useState(false);

  const load = () => apiFetch(`/maintenance/work-orders/${id}`).then(setWo).catch((err) => setError(err.message));

  useEffect(() => {
    load();
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
      const updated = await apiFetch(`/maintenance/work-orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setWo(updated);
      setMessage(`Status: ${MWO_STATUS_LABELS[status] || status}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const issuePart = async (e) => {
    e.preventDefault();
    try {
      const updated = await apiFetch(`/maintenance/work-orders/${id}/parts`, {
        method: "POST",
        body: JSON.stringify({ product_id: Number(partProductId), quantity: Number(partQty) }),
      });
      setWo(updated);
      setPartProductId("");
      setPartQty("1");
      setMessage("Spare parts issued");
    } catch (err) {
      setError(err.message);
    }
  };

  const complete = async (e) => {
    e.preventDefault();
    try {
      const body = { resolution_notes: resolution, root_cause: rootCause || null };
      if (downtime !== "") body.downtime_minutes = Number(downtime);
      const updated = await apiFetch(`/maintenance/work-orders/${id}/complete`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setWo(updated);
      setShowComplete(false);
      setMessage("Work order completed");
    } catch (err) {
      setError(err.message);
    }
  };

  const cancel = async () => {
    if (!window.confirm("Cancel this work order?")) return;
    try {
      const updated = await apiFetch(`/maintenance/work-orders/${id}/cancel`, { method: "PUT" });
      setWo(updated);
      setMessage("Work order cancelled");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!wo && !error) {
    return <DashboardLayout title="Work order" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }

  const canExecute = hasPermission("maintenance.execute_wo");
  const canIssue = hasPermission("maintenance.issue_parts");
  const canCancel = hasPermission("maintenance.cancel_wo");
  const isOpen = wo && !["completed", "cancelled"].includes(wo.status);
  const altStatus = wo && NEXT_STATUS[wo.status];

  return (
    <DashboardLayout title={wo?.work_order_number || "Work order"} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/maintenance/work-orders" className="crm-muted">← Work orders</Link>
          <div className="crm-inline-actions">
            {canExecute && isOpen && wo.status === "open" && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => setStatus("in_progress")}>Start</button>
            )}
            {canExecute && isOpen && altStatus && wo.status !== "open" && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => setStatus(altStatus)}>
                {wo.status === "in_progress" ? "Waiting parts" : "Resume work"}
              </button>
            )}
            {canExecute && isOpen && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => setShowComplete((v) => !v)}>Complete</button>
            )}
            {canCancel && isOpen && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={cancel}>Cancel</button>
            )}
          </div>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}
        {wo && (
          <>
            <div className="crm-mt">
              <span className={mwoStatusClass(wo.status)}>{MWO_STATUS_LABELS[wo.status]}</span>
              <p className="crm-mt">
                <Link to={`/maintenance/assets/${wo.asset_id}`}>{wo.asset_name}</Link>
                {" — "}
                {MWO_TYPE_LABELS[wo.type] || wo.type} · {wo.priority}
              </p>
              <p><strong>{wo.title}</strong></p>
              {wo.description && <p className="crm-muted">{wo.description}</p>}
              {wo.assigned_to_name && <p className="crm-muted">Assigned: {wo.assigned_to_name}</p>}
              {wo.downtime_minutes != null && <p>Downtime: {formatDowntime(wo.downtime_minutes)}</p>}
              {wo.resolution_notes && <p className="crm-mt">Resolution: {wo.resolution_notes}</p>}
              {wo.root_cause && <p className="crm-muted">Root cause: {wo.root_cause}</p>}
            </div>
            {showComplete && canExecute && (
              <form className="crm-form crm-mt mnt-complete-form" onSubmit={complete}>
                <div className="crm-form-field"><label>Resolution notes *</label><textarea required value={resolution} onChange={(e) => setResolution(e.target.value)} rows={3} /></div>
                {wo.type === "breakdown" && (
                  <div className="crm-form-field"><label>Root cause</label><input value={rootCause} onChange={(e) => setRootCause(e.target.value)} /></div>
                )}
                <div className="crm-form-field"><label>Downtime (minutes)</label><input type="number" min="0" value={downtime} onChange={(e) => setDowntime(e.target.value)} placeholder="Auto from reported time if blank" /></div>
                <button type="submit" className="crm-btn">Confirm complete</button>
              </form>
            )}
            {isOpen && canIssue && (
              <>
                <h3 className="crm-mt">Issue spare parts</h3>
                <form className="crm-inline-actions crm-mt" onSubmit={issuePart}>
                  <select required value={partProductId} onChange={(e) => setPartProductId(e.target.value)} className="crm-select">
                    <option value="">Select part</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} (on hand: {p.on_hand_quantity ?? 0})</option>)}
                  </select>
                  <input type="number" min="0.01" step="any" value={partQty} onChange={(e) => setPartQty(e.target.value)} style={{ width: 80 }} />
                  <button type="submit" className="crm-btn crm-btn-sm">Issue</button>
                </form>
              </>
            )}
            <h3 className="crm-mt">Parts issued</h3>
            {wo.parts?.length === 0 ? (
              <p className="crm-muted">No parts issued.</p>
            ) : (
              <table className="crm-table crm-mt">
                <thead><tr><th>Part</th><th>Qty</th><th>Issued</th></tr></thead>
                <tbody>
                  {wo.parts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.product_name}</td>
                      <td>{p.quantity} {p.unit || ""}</td>
                      <td>{p.issued_at ? new Date(p.issued_at).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MaintenanceWorkOrderDetail;
