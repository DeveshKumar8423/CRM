import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

function QualityQueue() {
  const role = localStorage.getItem("role") || "Staff";
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("id");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => apiFetch("/manufacturing/quality?status=pending").then((d) => setItems(d.items)).catch((err) => setError(err.message));

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (focusId) openInspection(Number(focusId));
  }, [focusId, items]);

  const openInspection = async (inspectionId) => {
    try {
      const insp = await apiFetch(`/manufacturing/quality/${inspectionId}`);
      setSelected(insp);
      setChecklist((insp.checklist_json || []).map((item) => ({ ...item, passed: item.passed ?? null })));
      setNotes(insp.notes || "");
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleItem = (key, passed) => {
    setChecklist((list) => list.map((item) => (item.key === key ? { ...item, passed } : item)));
  };

  const submit = async (status) => {
    if (status === "failed" && !window.confirm("Mark inspection as failed? FG receipt will be blocked.")) return;
    try {
      await apiFetch(`/manufacturing/quality/${selected.id}`, {
        method: "PUT",
        body: JSON.stringify({ status, checklist_json: checklist, notes }),
      });
      setMessage(status === "passed" ? "QC passed" : "QC failed");
      setSelected(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="Quality inspections" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/manufacturing" className="crm-muted">← Manufacturing</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}
        <div className="crm-mt">
          {items.length === 0 ? (
            <p className="crm-muted">No pending inspections.</p>
          ) : (
            <table className="crm-table">
              <thead><tr><th>QC #</th><th>WO</th><th>Product</th><th></th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.inspection_number}</td>
                    <td><Link to={`/manufacturing/work-orders/${item.work_order_id}`}>{item.work_order_number}</Link></td>
                    <td>{item.product_name}</td>
                    <td><button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => openInspection(item.id)}>Inspect</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {selected && (
          <div className="crm-panel crm-mt">
            <h3>{selected.inspection_number} — {selected.product_name}</h3>
            <ul className="crm-mt">
              {checklist.map((item) => (
                <li key={item.key} style={{ marginBottom: 8 }}>
                  {item.label}{item.required ? " *" : ""}
                  <span className="crm-inline-actions" style={{ marginLeft: 12 }}>
                    <button type="button" className={`crm-btn crm-btn-sm ${item.passed === true ? "" : "crm-btn-outline"}`} onClick={() => toggleItem(item.key, true)}>Pass</button>
                    <button type="button" className={`crm-btn crm-btn-sm ${item.passed === false ? "" : "crm-btn-outline"}`} onClick={() => toggleItem(item.key, false)}>Fail</button>
                  </span>
                </li>
              ))}
            </ul>
            <div className="crm-form-field crm-mt">
              <label>Notes</label>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {hasPermission("manufacturing.quality") && (
              <div className="crm-inline-actions crm-mt mfg-floor-actions">
                <button type="button" className="crm-btn crm-btn-sm" onClick={() => submit("passed")}>Pass inspection</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => submit("failed")}>Fail inspection</button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default QualityQueue;
