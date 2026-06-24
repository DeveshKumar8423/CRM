import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatINR } from "../utils/pos";
import { hasPermission } from "../utils/permissions";

function PosSessions() {
  const role = localStorage.getItem("role") || "Staff";
  const [sessions, setSessions] = useState([]);
  const [zReport, setZReport] = useState(null);
  const [error, setError] = useState("");
  const [closeId, setCloseId] = useState("");
  const [counted, setCounted] = useState("");

  const load = () => apiFetch("/pos/sessions").then(setSessions).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);

  const viewZ = async (id) => {
    const data = await apiFetch(`/pos/sessions/${id}/z-report`);
    setZReport(data);
  };

  const closeSession = async () => {
    await apiFetch(`/pos/sessions/${closeId}/close`, {
      method: "POST",
      body: JSON.stringify({ closing_cash_counted: Number(counted) }),
    });
    setCloseId("");
    setCounted("");
    load();
  };

  return (
    <DashboardLayout title="POS sessions" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/pos" className="crm-muted">← Point of Sale</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>Register</th><th>Status</th><th>Opened</th><th>Float</th><th></th></tr></thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.register_name}</td>
                <td>{s.status}</td>
                <td>{new Date(s.opened_at).toLocaleString()}</td>
                <td>{formatINR(s.opening_float)}</td>
                <td>
                  <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => viewZ(s.id)}>Z-report</button>
                  {hasPermission("pos.manage_sessions") && s.status === "open" && (
                    <button type="button" className="crm-btn crm-btn-sm crm-mt" onClick={() => setCloseId(String(s.id))}>Close</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {closeId && (
          <div className="crm-form crm-mt">
            <input type="number" placeholder="Cash counted" value={counted} onChange={(e) => setCounted(e.target.value)} />
            <button type="button" className="crm-btn crm-btn-sm crm-mt" onClick={closeSession}>Confirm close</button>
          </div>
        )}
        {zReport && (
          <div className="crm-panel crm-mt">
            <h3>Z-report — Session #{zReport.session.id}</h3>
            <p>Bills: {zReport.bill_count} · Net: {formatINR(zReport.net_sales)}</p>
            <p>Cash expected: {formatINR(zReport.cash_expected)} · Variance: {formatINR(zReport.cash_variance)}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default PosSessions;
