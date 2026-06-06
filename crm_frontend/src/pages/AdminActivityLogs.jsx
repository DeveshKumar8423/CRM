import { useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

const ACTION_LABELS = {
  login_success: "Login",
  login_failed: "Login failed",
  logout: "Logout",
  signup: "Signup",
  password_change: "Password changed",
  password_reset: "Password reset",
  profile_update: "Profile updated",
  user_created: "User created",
  user_updated: "User updated",
  status_change: "Status changed",
  company_created: "Company created",
  company_updated: "Company updated",
  contact_created: "Contact created",
  contact_updated: "Contact updated",
  contact_note_added: "Contact note",
  contact_activity_added: "Contact activity",
  product_created: "Product created",
  product_updated: "Product updated",
};

function formatAction(action) {
  return ACTION_LABELS[action] || action.replace(/_/g, " ");
}

function AdminActivityLogs() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 50 });
  const [actions, setActions] = useState([]);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/activity-logs/actions")
      .then(setActions)
      .catch(() => {});
  }, []);

  const loadLogs = (page = 1) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(data.limit),
    });
    if (action) params.set("action", action);
    if (search.trim()) params.set("search", search.trim());

    apiFetch(`/admin/activity-logs?${params}`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadLogs(1);
  }, [action]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadLogs(1);
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Activity Logs" roleLabel="Admin">
      <div className="crm-panel">
        <p className="crm-muted">
          Audit trail for logins, profile changes, contacts, products, and admin actions.
        </p>

        <div className="crm-contacts-toolbar crm-mt">
          <form onSubmit={handleSearch} className="crm-search-form">
            <input
              placeholder="Search email, action, details…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="crm-btn crm-btn-sm">Search</button>
          </form>
          <div className="crm-filters">
            <select value={action} onChange={(e) => setAction(e.target.value)}>
              <option value="">All actions</option>
              {actions.map((a) => (
                <option key={a} value={a}>{formatAction(a)}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <p className="crm-muted crm-mt">
          {data.total} log{data.total === 1 ? "" : "s"} total
        </p>

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>User</th>
                <th>Details</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && (
                <tr><td colSpan={5} className="crm-muted">No activity logs found.</td></tr>
              )}
              {data.items.map((log) => (
                <tr key={log.id}>
                  <td className="crm-nowrap">
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td>
                    <span className={`crm-log-action crm-log-${log.action}`}>
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td>{log.email || "—"}</td>
                  <td>{log.details || "—"}</td>
                  <td className="crm-muted">{log.ip_address || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button
              type="button"
              className="crm-btn crm-btn-outline crm-btn-sm"
              disabled={data.page <= 1}
              onClick={() => loadLogs(data.page - 1)}
            >
              Previous
            </button>
            <span className="crm-muted">Page {data.page} of {totalPages}</span>
            <button
              type="button"
              className="crm-btn crm-btn-outline crm-btn-sm"
              disabled={data.page >= totalPages}
              onClick={() => loadLogs(data.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminActivityLogs;
