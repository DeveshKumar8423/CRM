import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatQty, woStatusClass, WO_STATUS_LABELS } from "../utils/manufacturing";
import { hasPermission } from "../utils/permissions";

const NEXT_STATUS = {
  draft: "planned",
  planned: "released",
  released: "in_progress",
  in_progress: "qc_pending",
};

function WorkOrderDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [wo, setWo] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [receiveQty, setReceiveQty] = useState("");
  const [scrapQty, setScrapQty] = useState("0");
  const [tab, setTab] = useState("materials");

  const load = () => apiFetch(`/manufacturing/work-orders/${id}`).then(setWo).catch((err) => setError(err.message));
  useEffect(() => { load(); }, [id]);

  const setStatus = async (status) => {
    setError("");
    setMessage("");
    try {
      const updated = await apiFetch(`/manufacturing/work-orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setWo(updated);
      setMessage(`Status updated to ${WO_STATUS_LABELS[status] || status}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const issueAll = async () => {
    if (!window.confirm("Issue all planned materials from stock?")) return;
    try {
      const updated = await apiFetch(`/manufacturing/work-orders/${id}/issue`, {
        method: "POST",
        body: JSON.stringify({ issue_all: true }),
      });
      setWo(updated);
      setMessage("Materials issued");
    } catch (err) {
      setError(err.message);
    }
  };

  const receiveFg = async (e) => {
    e.preventDefault();
    try {
      const updated = await apiFetch(`/manufacturing/work-orders/${id}/receive`, {
        method: "POST",
        body: JSON.stringify({ quantity: Number(receiveQty), scrap_qty: Number(scrapQty || 0) }),
      });
      setWo(updated);
      setReceiveQty("");
      setMessage("Finished goods received");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!wo && !error) {
    return <DashboardLayout title="Work order" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }

  const canRelease = hasPermission("manufacturing.release_wo");
  const canIssue = hasPermission("manufacturing.issue_materials");
  const canReceive = hasPermission("manufacturing.receive_fg");
  const canCancel = hasPermission("manufacturing.cancel_wo");
  const next = NEXT_STATUS[wo?.status];

  return (
    <DashboardLayout title={wo?.work_order_number || "Work order"} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/manufacturing/work-orders" className="crm-muted">← Work orders</Link>
          <div className="crm-inline-actions mfg-floor-actions">
            {canRelease && next && wo.status !== "qc_pending" && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => setStatus(next)}>
                {wo.status === "draft" ? "Plan" : wo.status === "planned" ? "Release" : wo.status === "released" ? "Start" : "Send to QC"}
              </button>
            )}
            {canIssue && ["released", "in_progress"].includes(wo.status) && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={issueAll}>Issue all planned</button>
            )}
            {canCancel && !["completed", "cancelled"].includes(wo.status) && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => {
                if (window.confirm("Cancel this work order?")) setStatus("cancelled");
              }}>Cancel</button>
            )}
          </div>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}
        {wo && (
          <>
            <div className="crm-mt">
              <span className={woStatusClass(wo.status)}>{WO_STATUS_LABELS[wo.status] || wo.status}</span>
              <p className="crm-mt"><strong>{wo.product_name}</strong> — plan {formatQty(wo.planned_qty)}, completed {formatQty(wo.completed_qty)}</p>
              {wo.sales_order_number && <p className="crm-muted">Sales order: {wo.sales_order_number}</p>}
              {wo.bom_name && <p className="crm-muted">BOM: {wo.bom_name}</p>}
            </div>
            <div className="crm-inline-actions crm-mt">
              <button type="button" className={`crm-btn crm-btn-sm ${tab === "materials" ? "" : "crm-btn-outline"}`} onClick={() => setTab("materials")}>Materials</button>
              <button type="button" className={`crm-btn crm-btn-sm ${tab === "output" ? "" : "crm-btn-outline"}`} onClick={() => setTab("output")}>Output</button>
              <button type="button" className={`crm-btn crm-btn-sm ${tab === "quality" ? "" : "crm-btn-outline"}`} onClick={() => setTab("quality")}>Quality</button>
            </div>
            {tab === "materials" && (
              <table className="crm-table crm-mt mfg-shortage-table">
                <thead><tr><th>Component</th><th>Required</th><th>Issued</th><th>Shortage</th></tr></thead>
                <tbody>
                  {wo.material_plans.map((line) => (
                    <tr key={line.id} className={line.shortage > 0 ? "mfg-shortage-row" : ""}>
                      <td>{line.component_product_name}</td>
                      <td>{formatQty(line.required_qty)} {line.unit}</td>
                      <td>{formatQty(line.issued_qty)}</td>
                      <td>{line.shortage > 0 ? formatQty(line.shortage) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === "output" && (
              <div className="crm-mt">
                {wo.receipts.length > 0 && (
                  <table className="crm-table">
                    <thead><tr><th>Qty</th><th>Received by</th><th>At</th></tr></thead>
                    <tbody>
                      {wo.receipts.map((r) => (
                        <tr key={r.id}>
                          <td>{formatQty(r.quantity)}</td>
                          <td>{r.received_by_name}</td>
                          <td>{new Date(r.received_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {canReceive && !["cancelled", "completed"].includes(wo.status) && (
                  <form className="crm-form crm-mt" onSubmit={receiveFg} style={{ maxWidth: 360 }}>
                    <div className="crm-form-field">
                      <label>Good quantity</label>
                      <input type="number" min="0.01" step="any" required value={receiveQty} onChange={(e) => setReceiveQty(e.target.value)} />
                    </div>
                    <div className="crm-form-field">
                      <label>Scrap quantity</label>
                      <input type="number" min="0" step="any" value={scrapQty} onChange={(e) => setScrapQty(e.target.value)} />
                    </div>
                    <button type="submit" className="crm-btn crm-btn-sm">Receive FG</button>
                  </form>
                )}
              </div>
            )}
            {tab === "quality" && (
              <div className="crm-mt">
                {wo.quality_inspections.length === 0 ? (
                  <p className="crm-muted">No inspections yet. Move work order to QC pending.</p>
                ) : (
                  <ul>
                    {wo.quality_inspections.map((q) => (
                      <li key={q.id}>
                        <Link to={`/quality/inspections/${q.id}`}>{q.inspection_number}</Link> — {q.status}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default WorkOrderDetail;
