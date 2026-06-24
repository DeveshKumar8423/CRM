import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { inspectionStatusClass, INSPECTION_STATUS_LABELS } from "../utils/quality";
import { hasPermission } from "../utils/permissions";

function QualityInspections() {
  const role = localStorage.getItem("role") || "Staff";
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [pointCode, setPointCode] = useState(searchParams.get("point") || "");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (pointCode) params.set("point_code", pointCode);
    const qs = params.toString();
    apiFetch(`/quality/inspections${qs ? `?${qs}` : ""}`).then((d) => setItems(d.items)).catch((err) => setError(err.message));
  }, [status, pointCode]);

  return (
    <DashboardLayout title="Quality inspections" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/quality" className="crm-muted">← Quality Control</Link>
          {hasPermission("quality.inspect") && (
            <Link to="/quality/inspections/new" className="crm-btn crm-btn-sm">New inspection</Link>
          )}
        </div>
        <div className="crm-form crm-mt" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div className="crm-form-field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              {Object.entries(INSPECTION_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="crm-form-field">
            <label>Point code</label>
            <input value={pointCode} onChange={(e) => setPointCode(e.target.value)} placeholder="WO_FINAL" />
          </div>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>QC #</th><th>Point</th><th>Product</th><th>Reference</th><th>Status</th><th>Inspected</th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td><Link to={`/quality/inspections/${i.id}`}>{i.inspection_number}</Link></td>
                <td>{i.inspection_point_name || "—"}</td>
                <td>{i.product_name || "—"}</td>
                <td>{i.reference_label || "—"}</td>
                <td><span className={inspectionStatusClass(i.status)}>{INSPECTION_STATUS_LABELS[i.status] || i.status}</span></td>
                <td>{i.inspected_at ? new Date(i.inspected_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default QualityInspections;
