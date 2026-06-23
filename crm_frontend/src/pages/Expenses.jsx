import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  CATEGORY_LABELS,
  PAYMENT_MODE_LABELS,
  STATUS_LABELS,
  exportCsv,
  exportFilename,
  formatCurrency,
  formatDate,
  standardHeaderRows,
  statusBadgeClass,
} from "../utils/expenses";

function Expenses() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [stats, setStats] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [status, setStatus] = useState("");
  const [mine, setMine] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/expenses/statuses").then(setStatuses).catch(() => {});
    apiFetch("/expenses/stats/summary").then(setStats).catch(() => {});
  }, []);

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    if (mine) params.set("mine", "true");
    if (search.trim()) params.set("search", search.trim());
    apiFetch(`/expenses?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, [status, mine]);

  const handleExport = async () => {
    if (!hasPermission("expenses.export")) return;
    const params = new URLSearchParams({ page: "1", limit: "500" });
    if (status) params.set("status", status);
    if (mine) params.set("mine", "true");
    if (search.trim()) params.set("search", search.trim());
    const exportData = await apiFetch(`/expenses?${params}`);
    const items = exportData.items || [];
    exportCsv(
      exportFilename("expenses", status || "all"),
      ["Number", "Title", "Category", "Vendor", "Amount (INR)", "Tax (INR)", "Total (INR)", "Status", "Date", "Payment Mode", "Submitted By"],
      items.map((e) => [
        e.expense_number || "Draft",
        e.title,
        CATEGORY_LABELS[e.category] || e.category,
        e.vendor_name,
        e.amount,
        e.tax_amount,
        e.total_amount,
        STATUS_LABELS[e.status],
        formatDate(e.expense_date),
        PAYMENT_MODE_LABELS[e.payment_mode] || e.payment_mode,
        e.submitted_by_name || "",
      ]),
      standardHeaderRows("Expense Register", [`Records: ${items.length}`, status ? `Filter: ${STATUS_LABELS[status] || status}` : "Filter: All"]),
    );
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Expenses" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total} expense{data.total === 1 ? "" : "s"}</p>
          <div className="crm-inline-actions">
            {hasPermission("expenses.approve") && (
              <Link to="/expenses/approval-queue" className="crm-btn crm-btn-sm crm-btn-outline">Pending approval</Link>
            )}
            {hasPermission("expenses.export") && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport}>Export CSV</button>
            )}
            {hasPermission("expenses.create") && (
              <Link to="/expenses/new" className="crm-btn crm-btn-sm crm-btn-inline">+ New expense</Link>
            )}
          </div>
        </div>

        {stats && (
          <div className="crm-stats-grid crm-mt">
            <div className="crm-stat-card"><p className="crm-stat-label">Spend this month</p><p className="crm-stat-value">{formatCurrency(stats.total_spend_month)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Pending approval</p><p className="crm-stat-value">{formatCurrency(stats.pending_approval_amount)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Approved unpaid</p><p className="crm-stat-value">{formatCurrency(stats.approved_unpaid_amount)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Rejected</p><p className="crm-stat-value">{stats.rejected_count}</p></div>
          </div>
        )}

        <div className="crm-contacts-toolbar crm-mt">
          <form onSubmit={(e) => { e.preventDefault(); load(1); }} className="crm-search-form">
            <input placeholder="Search title, vendor, #…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="submit" className="crm-btn crm-btn-sm">Search</button>
          </form>
          <div className="crm-filters">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <label className="crm-consent-check">
              <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} />
              My expenses only
            </label>
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Expense #</th><th>Title</th><th>Category</th><th>Vendor</th>
                <th className="crm-num">Amount</th><th>Date</th><th>Payment</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={9} className="crm-muted">No expenses found.</td></tr>}
              {data.items.map((exp) => (
                <tr key={exp.id}>
                  <td><strong>{exp.expense_number || "Draft"}</strong></td>
                  <td>{exp.title}</td>
                  <td>{CATEGORY_LABELS[exp.category] || exp.category}</td>
                  <td>{exp.vendor_name}</td>
                  <td className="crm-num">{formatCurrency(exp.total_amount, exp.currency)}</td>
                  <td>{formatDate(exp.expense_date)}</td>
                  <td>{PAYMENT_MODE_LABELS[exp.payment_mode] || exp.payment_mode}</td>
                  <td><span className={statusBadgeClass(exp.status)}>{STATUS_LABELS[exp.status]}</span></td>
                  <td><Link to={`/expenses/${exp.id}`} className="crm-nav-link">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page <= 1} onClick={() => load(data.page - 1)}>Previous</button>
            <span className="crm-muted">Page {data.page} of {totalPages}</span>
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page >= totalPages} onClick={() => load(data.page + 1)}>Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Expenses;
