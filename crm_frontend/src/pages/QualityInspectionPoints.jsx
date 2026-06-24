import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

function QualityInspectionPoints() {
  const role = localStorage.getItem("role") || "Staff";
  const [points, setPoints] = useState([]);
  const [error, setError] = useState("");

  const load = () => apiFetch("/quality/inspection-points").then(setPoints).catch((err) => setError(err.message));

  useEffect(() => { load(); }, []);

  const toggle = async (point, field) => {
    await apiFetch(`/quality/inspection-points/${point.id}`, {
      method: "PUT",
      body: JSON.stringify({ [field]: !point[field] }),
    });
    load();
  };

  return (
    <DashboardLayout title="Inspection points" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/quality" className="crm-muted">← Quality Control</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Trigger</th><th>Active</th><th>Block on fail</th></tr></thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td>{p.name}</td>
                <td>{p.point_type}</td>
                <td>{p.trigger}</td>
                <td><button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => toggle(p, "is_active")}>{p.is_active ? "Yes" : "No"}</button></td>
                <td><button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => toggle(p, "block_on_fail")}>{p.block_on_fail ? "Yes" : "No"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default QualityInspectionPoints;
