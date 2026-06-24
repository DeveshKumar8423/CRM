import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatScheduleRange, FSO_STATUS_LABELS, fsoStatusClass } from "../utils/fieldService";

function FieldServiceSchedule() {
  const role = localStorage.getItem("role") || "Staff";
  const [view, setView] = useState("today");
  const [unassigned, setUnassigned] = useState(false);
  const [technicianId, setTechnicianId] = useState("");
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    const params = new URLSearchParams();
    if (unassigned) {
      params.set("unassigned", "true");
    } else {
      params.set("view", view);
    }
    if (technicianId) params.set("assigned_to_id", technicianId);
    apiFetch(`/field-service/schedule?${params}`)
      .then((d) => setItems(d.items || []))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    apiFetch("/admin/users").then(setUsers).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [view, unassigned, technicianId]);

  return (
    <DashboardLayout title="Dispatch schedule" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/field-service" className="crm-muted">← Field Service</Link>
        </div>
        <div className="crm-inline-actions crm-mt">
          <button type="button" className={`crm-btn crm-btn-sm ${view === "today" && !unassigned ? "" : "crm-btn-outline"}`} onClick={() => { setUnassigned(false); setView("today"); }}>Today</button>
          <button type="button" className={`crm-btn crm-btn-sm ${view === "week" && !unassigned ? "" : "crm-btn-outline"}`} onClick={() => { setUnassigned(false); setView("week"); }}>This week</button>
          <button type="button" className={`crm-btn crm-btn-sm ${unassigned ? "" : "crm-btn-outline"}`} onClick={() => setUnassigned(true)}>Unassigned</button>
          <select value={technicianId} onChange={(e) => setTechnicianId(e.target.value)} className="crm-select">
            <option value="">All technicians</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead>
            <tr>
              <th>FSO #</th><th>Customer</th><th>Title</th><th>Scheduled</th><th>Technician</th><th>Status</th><th>Site</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className={o.sla_breached ? "fs-sla-breach-row" : ""}>
                <td><Link to={`/field-service/orders/${o.id}`}>{o.order_number}</Link></td>
                <td>{o.contact_name}</td>
                <td>{o.title}</td>
                <td>{formatScheduleRange(o.scheduled_start, o.scheduled_end)}</td>
                <td>{o.assigned_to_name || "—"}</td>
                <td><span className={fsoStatusClass(o.status)}>{FSO_STATUS_LABELS[o.status] || o.status}</span></td>
                <td className="crm-muted">{o.site_address ? o.site_address.slice(0, 40) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="crm-muted crm-mt">No jobs in this view.</p>}
      </div>
    </DashboardLayout>
  );
}

export default FieldServiceSchedule;
