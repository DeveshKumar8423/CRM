import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  STATUS_LABELS,
  exportCsv,
  formatDate,
  formatHours,
  statusBadgeClass,
} from "../utils/timesheets";

function Timesheets() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState({ statuses: [] });
  const [status, setStatus] = useState("");
  const [billableOnly, setBillableOnly] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/timesheets/meta").then(setMeta).catch(() => {});
    apiFetch("/timesheets/stats/summary").then(setStats).catch(() => {});
  }, []);

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20", mine: "true" });
    if (status) params.set("status", status);
    if (billableOnly) params.set("billable_only", "true");
    apiFetch(`/timesheets?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, [status, billableOnly]);

  const handleExport = () => {
    if (!hasPermission("timesheets.export")) return;
    exportCsv(
      `timesheets-${new Date().toISOString().slice(0, 7)}.csv`,
      [
        ["Number", "Date", "Hours", "Billable", "Project", "Task", "Description", "Status", "Reviewed By"],
        ...data.items.map((e) => [
          e.entry_number || "Draft",
          e.work_date?.slice(0, 10) || "",
          e.hours,
          e.is_billable ? "Yes" : "No",
          e.project_name || "",
          e.task_title || "",
          e.description,
          STATUS_LABELS[e.status],
          e.reviewed_by_name || "",
        ]),
      ],
    );
    apiFetch("/timesheets/export-log", {
      method: "POST",
      body: JSON.stringify({ row_count: data.items.length }),
    }).catch(() => {});
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="My Timesheets" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total} entr{data.total === 1 ? "y" : "ies"}</p>
          <div className="crm-inline-actions">
            {hasPermission("timesheets.approve") && (
              <Link to="/timesheets/approval-queue" className="crm-btn crm-btn-sm crm-btn-outline">Approval queue</Link>
            )}
            {hasPermission("timesheets.export") && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport}>Export CSV</button>
            )}
            {hasPermission("timesheets.create") && (
              <Link to="/timesheets/new" className="crm-btn crm-btn-sm crm-btn-inline">+ Log time</Link>
            )}
          </div>
        </div>

        {stats && (
          <div className="crm-stats-grid crm-mt">
            <div className="crm-stat-card"><p className="crm-stat-label">My hours (week)</p><p className="crm-stat-value">{formatHours(stats.my_hours_this_week)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Billable (week)</p><p className="crm-stat-value">{formatHours(stats.my_billable_hours_this_week)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Awaiting approval</p><p className="crm-stat-value">{stats.my_pending_count}</p></div>
            {hasPermission("timesheets.approve") && (
              <div className="crm-stat-card crm-leave-pending-card"><p className="crm-stat-label">Team pending</p><p className="crm-stat-value">{stats.pending_approval_count}</p></div>
            )}
          </div>
        )}

        <div className="crm-filters crm-mt">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {(meta.statuses || []).map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <label className="crm-consent-check">
            <input type="checkbox" checked={billableOnly} onChange={(e) => setBillableOnly(e.target.checked)} />
            Billable only
          </label>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        {data.items.length === 0 ? (
          <div className="crm-empty-state crm-mt">
            <p>No timesheet entries yet.</p>
            {hasPermission("timesheets.create") && (
              <Link to="/timesheets/new" className="crm-btn crm-btn-sm crm-mt">Log your first entry</Link>
            )}
          </div>
        ) : (
          <div className="crm-table-wrap crm-mt">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Project</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.work_date)}</td>
                    <td>{formatHours(entry.hours)}{entry.is_billable ? " · Billable" : ""}</td>
                    <td>{entry.project_name || "—"}{entry.task_title ? ` / ${entry.task_title}` : ""}</td>
                    <td className="crm-table-truncate">{entry.description}</td>
                    <td><span className={statusBadgeClass(entry.status)}>{STATUS_LABELS[entry.status]}</span></td>
                    <td><Link to={`/timesheets/${entry.id}`} className="crm-link">View</Link></td>
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

export default Timesheets;
