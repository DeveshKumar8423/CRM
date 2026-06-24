import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

function MaintenancePmSchedule() {
  const role = localStorage.getItem("role") || "Staff";
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => apiFetch("/maintenance/pm-schedule").then((d) => setItems(d.items || [])).catch((err) => setError(err.message));

  useEffect(() => { load(); }, []);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const generate = async () => {
    if (selected.length === 0) {
      setError("Select at least one asset");
      return;
    }
    setError("");
    try {
      const data = await apiFetch("/maintenance/pm-schedule/generate", {
        method: "POST",
        body: JSON.stringify({ asset_ids: selected }),
      });
      setMessage(`Created ${data.created?.length || 0} preventive work order(s)`);
      setSelected([]);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const dueItems = items.filter((i) => i.days_overdue > 0 || (i.next_pm_due_date && new Date(i.next_pm_due_date) <= new Date(Date.now() + 7 * 86400000)));

  return (
    <DashboardLayout title="PM schedule" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/maintenance" className="crm-muted">← Maintenance</Link>
          {hasPermission("maintenance.create_wo") && (
            <button type="button" className="crm-btn crm-btn-sm" onClick={generate} disabled={selected.length === 0}>
              Generate WOs ({selected.length})
            </button>
          )}
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}
        <table className="crm-table crm-mt">
          <thead>
            <tr>
              {hasPermission("maintenance.create_wo") && <th></th>}
              <th>Asset</th><th>Category</th><th>Next PM</th><th>Last service</th><th>Overdue</th><th>Open PM WO</th>
            </tr>
          </thead>
          <tbody>
            {dueItems.map((i) => (
              <tr key={i.asset_id} className={i.days_overdue > 0 ? "mnt-pm-overdue-row" : ""}>
                {hasPermission("maintenance.create_wo") && (
                  <td>
                    {!i.has_open_preventive_mwo && (
                      <input
                        type="checkbox"
                        checked={selected.includes(i.asset_id)}
                        onChange={() => toggle(i.asset_id)}
                      />
                    )}
                  </td>
                )}
                <td><Link to={`/maintenance/assets/${i.asset_id}`}>{i.asset_code} — {i.asset_name}</Link></td>
                <td>{i.category_name || "—"}</td>
                <td>{i.next_pm_due_date || "—"}</td>
                <td>{i.last_service_date || "—"}</td>
                <td>{i.days_overdue > 0 ? `${i.days_overdue}d` : "—"}</td>
                <td>{i.has_open_preventive_mwo ? "Yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {dueItems.length === 0 && !error && <p className="crm-muted crm-mt">No PM due in the next 7 days.</p>}
      </div>
    </DashboardLayout>
  );
}

export default MaintenancePmSchedule;
