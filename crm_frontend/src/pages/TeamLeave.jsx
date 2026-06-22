import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import {
  TYPE_LABELS,
  formatDateRange,
  statusBadgeClass,
} from "../utils/leaves";

function TeamLeave() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 50 });
  const [meta, setMeta] = useState({ leave_types: [] });
  const [staff, setStaff] = useState([]);
  const [leaveType, setLeaveType] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/leaves/meta"),
      apiFetch("/leaves/assignees").catch(() => []),
    ]).then(([m, users]) => {
      setMeta(m);
      setStaff(users || []);
    }).catch(() => {});
  }, []);

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (leaveType) params.set("leave_type", leaveType);
    if (employeeId) params.set("employee_id", employeeId);
    apiFetch(`/leaves/team?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, [leaveType, employeeId]);

  return (
    <DashboardLayout title="Team Leave" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/leaves" className="crm-link crm-link-left">← My leave</Link>
        <p className="crm-muted crm-mt">{data.total} approved leave record{data.total === 1 ? "" : "s"} in range</p>

        <div className="crm-filters crm-mt">
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">All employees</option>
            {staff.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
            <option value="">All types</option>
            {(meta.leave_types || []).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        {data.items.length === 0 ? (
          <p className="crm-muted crm-mt">No approved team leave in this period.</p>
        ) : (
          <div className="crm-table-wrap crm-mt">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((l) => (
                  <tr key={l.id}>
                    <td>{l.employee_name}</td>
                    <td>{TYPE_LABELS[l.leave_type]}</td>
                    <td>{formatDateRange(l.start_date, l.end_date, l.total_days, l.is_half_day)}</td>
                    <td><span className={statusBadgeClass(l.status)}>Approved</span></td>
                    <td><Link to={`/leaves/${l.id}`} className="crm-btn crm-btn-sm crm-btn-outline">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default TeamLeave;
