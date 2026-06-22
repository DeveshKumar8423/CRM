import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  STATUS_LABELS,
  TYPE_LABELS,
  exportCsv,
  formatDateRange,
  statusBadgeClass,
} from "../utils/leaves";

function Leaves() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState({ statuses: [], leave_types: [] });
  const [status, setStatus] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/leaves/meta").then(setMeta).catch(() => {});
    apiFetch("/leaves/stats/summary").then(setStats).catch(() => {});
  }, []);

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20", mine: "true" });
    if (status) params.set("status", status);
    if (leaveType) params.set("leave_type", leaveType);
    apiFetch(`/leaves?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, [status, leaveType]);

  const handleExport = () => {
    if (!hasPermission("leaves.export")) return;
    exportCsv(
      `leaves-${new Date().toISOString().slice(0, 7)}.csv`,
      [
        ["Number", "Employee", "Type", "Start", "End", "Days", "Status", "Submitted", "Reviewed By", "Note"],
        ...data.items.map((l) => [
          l.leave_number || "",
          l.employee_name || "",
          TYPE_LABELS[l.leave_type] || l.leave_type,
          l.start_date?.slice(0, 10) || "",
          l.end_date?.slice(0, 10) || "",
          l.total_days,
          STATUS_LABELS[l.status],
          l.submitted_at?.slice(0, 10) || "",
          l.reviewed_by_name || "",
          l.reviewer_note || "",
        ]),
      ],
    );
    apiFetch("/leaves/export-log", {
      method: "POST",
      body: JSON.stringify({ row_count: data.items.length }),
    }).catch(() => {});
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="My Leave" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total} request{data.total === 1 ? "" : "s"}</p>
          <div className="crm-inline-actions">
            {hasPermission("leaves.approve") && (
              <Link to="/leaves/approval-queue" className="crm-btn crm-btn-sm crm-btn-outline">Approval queue</Link>
            )}
            {hasPermission("leaves.view_all") && (
              <Link to="/leaves/team" className="crm-btn crm-btn-sm crm-btn-outline">Team leave</Link>
            )}
            {hasPermission("leaves.export") && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport}>Export CSV</button>
            )}
            {hasPermission("leaves.create") && (
              <Link to="/leaves/new" className="crm-btn crm-btn-sm crm-btn-inline">+ Request leave</Link>
            )}
          </div>
        </div>

        {stats && (
          <div className="crm-stats-grid crm-mt">
            <div className="crm-stat-card"><p className="crm-stat-label">My pending</p><p className="crm-stat-value">{stats.my_pending_count}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Approved days (month)</p><p className="crm-stat-value">{stats.approved_days_this_month}</p></div>
            {hasPermission("leaves.approve") && (
              <div className="crm-stat-card crm-leave-pending-card"><p className="crm-stat-label">Pending approval</p><p className="crm-stat-value">{stats.pending_count}</p></div>
            )}
            {hasPermission("leaves.view_all") && (
              <div className="crm-stat-card"><p className="crm-stat-label">Team on leave (30d)</p><p className="crm-stat-value">{stats.team_on_leave_count}</p></div>
            )}
          </div>
        )}

        <div className="crm-filters crm-mt">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {(meta.statuses || []).map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
            <option value="">All types</option>
            {(meta.leave_types || []).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        {data.items.length === 0 ? (
          <div className="crm-empty-state crm-mt">
            <p>No leave requests yet.</p>
            {hasPermission("leaves.create") && (
              <Link to="/leaves/new" className="crm-btn crm-btn-sm crm-mt">Request leave</Link>
            )}
          </div>
        ) : (
          <div className="crm-table-wrap crm-mt">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((l) => (
                  <tr key={l.id}>
                    <td><Link to={`/leaves/${l.id}`} className="crm-nav-link">{l.leave_number || `Draft #${l.id}`}</Link></td>
                    <td>{TYPE_LABELS[l.leave_type] || l.leave_type}</td>
                    <td>{formatDateRange(l.start_date, l.end_date, l.total_days, l.is_half_day)}</td>
                    <td><span className={statusBadgeClass(l.status)}>{STATUS_LABELS[l.status]}</span></td>
                    <td>{l.submitted_at ? new Date(l.submitted_at).toLocaleDateString("en-IN") : "—"}</td>
                    <td><Link to={`/leaves/${l.id}`} className="crm-btn crm-btn-sm crm-btn-outline">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" disabled={data.page <= 1} onClick={() => load(data.page - 1)}>Previous</button>
            <span className="crm-muted">Page {data.page} of {totalPages}</span>
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" disabled={data.page >= totalPages} onClick={() => load(data.page + 1)}>Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Leaves;
