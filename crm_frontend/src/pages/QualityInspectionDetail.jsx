import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { inspectionStatusClass, INSPECTION_STATUS_LABELS } from "../utils/quality";
import { hasPermission } from "../utils/permissions";

function QualityInspectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [insp, setInsp] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [notes, setNotes] = useState("");
  const [waiverReason, setWaiverReason] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => apiFetch(`/quality/inspections/${id}`).then((data) => {
    setInsp(data);
    setChecklist((data.checklist_json || []).map((item) => ({ ...item })));
    setNotes(data.overall_notes || "");
  }).catch((err) => setError(err.message));

  useEffect(() => { load(); }, [id]);

  const togglePass = (key, passed) => {
    setChecklist((list) => list.map((item) => (item.key === key ? { ...item, passed } : item)));
  };

  const setNumber = (key, value) => {
    setChecklist((list) => list.map((item) => (item.key === key ? { ...item, value } : item)));
  };

  const submit = async (status) => {
    setError("");
    if (status === "failed" && !window.confirm("Mark inspection as failed?")) return;
    try {
      await apiFetch(`/quality/inspections/${id}/submit`, {
        method: "PUT",
        body: JSON.stringify({ checklist_json: checklist, overall_notes: notes, status }),
      });
      setMessage(status === "passed" ? "Inspection passed" : "Inspection failed");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const waive = async () => {
    if (!waiverReason.trim()) {
      setError("Waiver reason required");
      return;
    }
    if (!window.confirm("Waive this inspection?")) return;
    try {
      await apiFetch(`/quality/inspections/${id}/waive`, {
        method: "PUT",
        body: JSON.stringify({ waiver_reason: waiverReason }),
      });
      setMessage("Inspection waived");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const createCapa = () => navigate(`/quality/corrective-actions/new?inspection_id=${id}`);

  if (!insp && !error) {
    return <DashboardLayout title="Inspection" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }

  const canInspect = hasPermission("quality.inspect") && insp?.status === "pending";
  const canWaive = hasPermission("quality.waive") && ["failed", "pending"].includes(insp?.status);
  const canCapa = hasPermission("quality.manage_capa") && ["failed", "waived"].includes(insp?.status);

  return (
    <DashboardLayout title={insp?.inspection_number || "Inspection"} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/quality/inspections" className="crm-muted">← Inspections</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}
        {insp && (
          <>
            <div className="crm-mt">
              <span className={inspectionStatusClass(insp.status)}>{INSPECTION_STATUS_LABELS[insp.status] || insp.status}</span>
              <p className="crm-mt"><strong>{insp.product_name || "—"}</strong> — {insp.inspection_point_name || "Inspection"}</p>
              {insp.reference_label && <p className="crm-muted">Reference: {insp.reference_label}</p>}
            </div>
            <ul className="crm-mt qc-checklist mfg-floor-actions">
              {checklist.map((item) => (
                <li key={item.key} className={item.passed === false ? "qc-item-fail" : ""}>
                  <div>
                    <strong>{item.label}</strong>{item.required ? " *" : ""}
                    {item.input_type === "number" && item.spec && (
                      <span className="crm-muted"> ({item.spec.min}–{item.spec.max} {item.spec.unit || ""})</span>
                    )}
                  </div>
                  {insp.status === "pending" && canInspect && (
                    item.input_type === "number" ? (
                      <input type="number" value={item.value ?? ""} onChange={(e) => setNumber(item.key, e.target.value)} style={{ maxWidth: 120 }} />
                    ) : (
                      <span className="crm-inline-actions">
                        <button type="button" className={`crm-btn crm-btn-sm ${item.passed === true ? "" : "crm-btn-outline"}`} onClick={() => togglePass(item.key, true)}>Pass</button>
                        <button type="button" className={`crm-btn crm-btn-sm ${item.passed === false ? "" : "crm-btn-outline"}`} onClick={() => togglePass(item.key, false)}>Fail</button>
                      </span>
                    )
                  )}
                  {insp.status !== "pending" && item.input_type === "number" && <span>{item.value ?? "—"}</span>}
                </li>
              ))}
            </ul>
            {canInspect && (
              <>
                <div className="crm-form-field crm-mt">
                  <label>Notes</label>
                  <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div className="crm-inline-actions crm-mt mfg-floor-actions">
                  <button type="button" className="crm-btn crm-btn-sm" onClick={() => submit("passed")}>Submit pass</button>
                  <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => submit("failed")}>Submit fail</button>
                </div>
              </>
            )}
            {canWaive && (
              <div className="crm-form crm-mt">
                <div className="crm-form-field">
                  <label>Waiver reason</label>
                  <input value={waiverReason} onChange={(e) => setWaiverReason(e.target.value)} />
                </div>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={waive}>Waive inspection</button>
              </div>
            )}
            {canCapa && (
              <button type="button" className="crm-btn crm-btn-sm crm-mt" onClick={createCapa}>Create CAPA</button>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default QualityInspectionDetail;
