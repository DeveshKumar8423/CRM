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
} from "../utils/salesOrders";

function SalesOrders() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [stats, setStats] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [dueFilter, setDueFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/sales-orders/statuses").then(setStatuses).catch(() => {});
    apiFetch("/sales-orders/stats/summary").then(setStats).catch(() => {});
  }, []);

  const loadOrders = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    if (search.trim()) params.set("search", search.trim());
    if (dueFilter) params.set("due_in_days", dueFilter);
    apiFetch(`/sales-orders?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadOrders(1);
  }, [status, dueFilter]);

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Sales Orders" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total.toLocaleString()} order{data.total === 1 ? "" : "s"} total</p>
          <div className="crm-inline-actions">
            {hasPermission("sales_orders.create") && (
              <Link to="/sales-orders/new" className="crm-btn crm-btn-sm crm-btn-inline">+ New order</Link>
            )}
          </div>
        </div>

        {stats && (
          <div className="crm-quote-kpi-row crm-mt">
            <div className="crm-quote-kpi"><span className="crm-muted">Confirmed</span><strong>{stats.confirmed}</strong></div>
            <div className="crm-quote-kpi"><span className="crm-muted">In progress</span><strong>{(stats.in_preparation || 0) + (stats.in_execution || 0)}</strong></div>
            <div className="crm-quote-kpi"><span className="crm-muted">Due soon</span><strong>{stats.due_soon}</strong></div>
            <div className="crm-quote-kpi"><span className="crm-muted">Overdue</span><strong>{stats.overdue}</strong></div>
          </div>
        )}

        <div className="crm-contacts-toolbar crm-mt">
          <form onSubmit={(e) => { e.preventDefault(); loadOrders(1); }} className="crm-search-form">
            <input placeholder="Search order #, customer, title…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="submit" className="crm-btn crm-btn-sm">Search</button>
          </form>
          <div className="crm-filters">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={dueFilter} onChange={(e) => setDueFilter(e.target.value)}>
              <option value="">Any due date</option>
              <option value="7">Due in 7 days</option>
              <option value="30">Due in 30 days</option>
            </select>
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due</th>
                <th>Progress</th>
                <th>Owner</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && (
                <tr><td colSpan={9} className="crm-muted">No sales orders found. {hasPermission("sales_orders.create") && <Link to="/sales-orders/new">Create one</Link>}</td></tr>
              )}
              {data.items.map((order) => (
                <tr key={order.id} className={order.status === "on_hold" ? "crm-order-row-hold" : ""}>
                  <td><strong>{order.order_number}</strong></td>
                  <td>{order.client_name || order.client_org || "—"}</td>
                  <td>{order.quotation_number || order.deal_title || order.source_type}</td>
                  <td className="crm-num">{formatCurrency(order.grand_total, order.currency)}</td>
                  <td><span className={statusBadgeClass(order.status)}>{STATUS_LABELS[order.status]}</span></td>
                  <td>{formatDate(order.due_date)}</td>
                  <td>{order.fulfillment_progress}%</td>
                  <td>{order.assigned_to_name || "—"}</td>
                  <td><Link to={`/sales-orders/${order.id}`} className="crm-nav-link">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page <= 1} onClick={() => loadOrders(data.page - 1)}>Previous</button>
            <span className="crm-muted">Page {data.page} of {totalPages}</span>
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page >= totalPages} onClick={() => loadOrders(data.page + 1)}>Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default SalesOrders;
