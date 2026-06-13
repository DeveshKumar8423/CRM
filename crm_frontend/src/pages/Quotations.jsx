import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from "../utils/quotations";

function Quotations() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [stats, setStats] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [expiring, setExpiring] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/quotations/statuses").then(setStatuses).catch(() => {});
    apiFetch("/quotations/stats/summary").then(setStats).catch(() => {});
  }, []);

  const loadQuotations = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    if (search.trim()) params.set("search", search.trim());
    if (expiring) params.set("expiring_in_days", expiring);

    apiFetch(`/quotations?${params}`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadQuotations(1);
  }, [status, expiring]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadQuotations(1);
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Quotations" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">
            {data.total.toLocaleString()} quotation{data.total === 1 ? "" : "s"} total
          </p>
          <div className="crm-inline-actions">
            {hasPermission("quotations.approve") && (
              <Link to="/quotations/approval-queue" className="crm-btn crm-btn-sm crm-btn-outline">
                Awaiting approval
              </Link>
            )}
            {hasPermission("quotations.create") && (
              <Link to="/quotations/new" className="crm-btn crm-btn-sm crm-btn-inline">
                + New quotation
              </Link>
            )}
          </div>
        </div>

        {stats && (
          <div className="crm-quote-kpi-row crm-mt">
            <div className="crm-quote-kpi">
              <span className="crm-muted">Sent / active</span>
              <strong>{(stats.sent || 0) + (stats.viewed || 0) + (stats.negotiation || 0)}</strong>
            </div>
            <div className="crm-quote-kpi">
              <span className="crm-muted">Accepted value</span>
              <strong>{formatCurrency(stats.accepted_value)}</strong>
            </div>
            <div className="crm-quote-kpi">
              <span className="crm-muted">Expiring soon</span>
              <strong>{stats.expiring_soon}</strong>
            </div>
            <div className="crm-quote-kpi">
              <span className="crm-muted">Awaiting approval</span>
              <strong>{stats.pending_approval}</strong>
            </div>
          </div>
        )}

        <div className="crm-contacts-toolbar crm-mt">
          <form onSubmit={handleSearch} className="crm-search-form">
            <input
              placeholder="Search quote #, client, title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="crm-btn crm-btn-sm">Search</button>
          </form>
          <div className="crm-filters">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select value={expiring} onChange={(e) => setExpiring(e.target.value)}>
              <option value="">Any expiry</option>
              <option value="0">Expiring today</option>
              <option value="7">Expiring in 7 days</option>
              <option value="30">Expiring in 30 days</option>
            </select>
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Title</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Expiry</th>
                <th>Owner</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={9} className="crm-muted">
                    No quotations found.
                    {hasPermission("quotations.create") && (
                      <> <Link to="/quotations/new">Create your first quotation</Link></>
                    )}
                  </td>
                </tr>
              )}
              {data.items.map((quote) => (
                <tr key={quote.id}>
                  <td><strong>{quote.quote_number}</strong></td>
                  <td>{quote.title}</td>
                  <td>{quote.client_name || quote.client_org || "—"}</td>
                  <td className="crm-num">{formatCurrency(quote.grand_total, quote.currency)}</td>
                  <td>
                    <span className={statusBadgeClass(quote.status)}>
                      {STATUS_LABELS[quote.status] || quote.status}
                    </span>
                  </td>
                  <td>{formatDate(quote.valid_until)}</td>
                  <td>{quote.assigned_to_name || "—"}</td>
                  <td>{formatDate(quote.updated_at)}</td>
                  <td>
                    <Link to={`/quotations/${quote.id}`} className="crm-nav-link">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page <= 1} onClick={() => loadQuotations(data.page - 1)}>Previous</button>
            <span className="crm-muted">Page {data.page} of {totalPages}</span>
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page >= totalPages} onClick={() => loadQuotations(data.page + 1)}>Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Quotations;
