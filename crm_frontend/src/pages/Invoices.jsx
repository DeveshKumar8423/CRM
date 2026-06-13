import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { STATUS_LABELS, formatCurrency, formatDate, statusBadgeClass } from "../utils/invoices";

function Invoices() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [stats, setStats] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [status, setStatus] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/invoices/statuses").then(setStatuses).catch(() => {});
    apiFetch("/invoices/stats/summary").then(setStats).catch(() => {});
  }, []);

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    if (paymentFilter) params.set("payment_filter", paymentFilter);
    if (search.trim()) params.set("search", search.trim());
    apiFetch(`/invoices?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, [status, paymentFilter]);

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Invoices" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total} invoice{data.total === 1 ? "" : "s"}</p>
          <div className="crm-inline-actions">
            {hasPermission("invoices.review") && (
              <Link to="/invoices/review-queue" className="crm-btn crm-btn-sm crm-btn-outline">Pending review</Link>
            )}
            {hasPermission("invoices.create") && (
              <Link to="/invoices/new" className="crm-btn crm-btn-sm crm-btn-inline">+ New invoice</Link>
            )}
          </div>
        </div>

        {stats && (
          <div className="crm-quote-kpi-row crm-mt">
            <div className="crm-quote-kpi"><span className="crm-muted">Billed</span><strong>{formatCurrency(stats.total_billed)}</strong></div>
            <div className="crm-quote-kpi"><span className="crm-muted">Collected</span><strong>{formatCurrency(stats.total_collected)}</strong></div>
            <div className="crm-quote-kpi"><span className="crm-muted">Outstanding</span><strong>{formatCurrency(stats.total_outstanding)}</strong></div>
            <div className="crm-quote-kpi"><span className="crm-muted">Overdue</span><strong>{stats.overdue}</strong></div>
          </div>
        )}

        <div className="crm-contacts-toolbar crm-mt">
          <form onSubmit={(e) => { e.preventDefault(); load(1); }} className="crm-search-form">
            <input placeholder="Search invoice #, customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="submit" className="crm-btn crm-btn-sm">Search</button>
          </form>
          <div className="crm-filters">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="">All payments</option>
              <option value="outstanding">Outstanding</option>
              <option value="partially_paid">Partially paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Invoice #</th><th>Customer</th><th>Source</th><th>Issue</th><th>Due</th>
                <th>Total</th><th>Outstanding</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={9} className="crm-muted">No invoices found.</td></tr>}
              {data.items.map((inv) => (
                <tr key={inv.id} className={inv.status === "overdue" ? "crm-order-row-hold" : ""}>
                  <td><strong>{inv.invoice_number || "Draft"}</strong></td>
                  <td>{inv.client_name || inv.client_org || "—"}</td>
                  <td>{inv.sales_order_number || inv.quotation_number || inv.source_type}</td>
                  <td>{formatDate(inv.issue_date)}</td>
                  <td>{formatDate(inv.due_date)}</td>
                  <td className="crm-num">{formatCurrency(inv.grand_total, inv.currency)}</td>
                  <td className="crm-num">{formatCurrency(inv.outstanding_amount, inv.currency)}</td>
                  <td><span className={statusBadgeClass(inv.status)}>{STATUS_LABELS[inv.status]}</span></td>
                  <td><Link to={`/invoices/${inv.id}`} className="crm-nav-link">View</Link></td>
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

export default Invoices;
