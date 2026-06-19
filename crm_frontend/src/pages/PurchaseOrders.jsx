import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  STATUS_LABELS,
  exportCsv,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from "../utils/purchaseOrders";

function PurchaseOrders() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [stats, setStats] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [status, setStatus] = useState("");
  const [fulfillment, setFulfillment] = useState("");
  const [mine, setMine] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/purchase-orders/statuses").then(setStatuses).catch(() => {});
    apiFetch("/purchase-orders/stats/summary").then(setStats).catch(() => {});
  }, []);

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    if (fulfillment) params.set("fulfillment", fulfillment);
    if (mine) params.set("mine", "true");
    if (search.trim()) params.set("search", search.trim());
    apiFetch(`/purchase-orders?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, [status, fulfillment, mine]);

  const handleExport = () => {
    if (!hasPermission("purchase_orders.export")) return;
    exportCsv(
      `purchase-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      ["PO #", "Title", "Vendor", "Ordered", "Received %", "Billed %", "Pending Receipt", "Pending Billing", "Status", "Delivery"],
      data.items.map((po) => [
        po.po_number || "Draft",
        po.title,
        po.vendor_name,
        po.grand_total,
        po.received_percent,
        po.billed_percent,
        po.pending_receipt_value,
        po.pending_billing_value,
        STATUS_LABELS[po.status],
        formatDate(po.expected_delivery_date),
      ]),
    );
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Purchase Orders" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total} purchase order{data.total === 1 ? "" : "s"}</p>
          <div className="crm-inline-actions">
            {hasPermission("purchase_orders.approve") && (
              <Link to="/purchase-orders/approval-queue" className="crm-btn crm-btn-sm crm-btn-outline">Pending approval</Link>
            )}
            {hasPermission("purchase_orders.export") && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport}>Export CSV</button>
            )}
            {hasPermission("purchase_orders.create") && (
              <Link to="/purchase-orders/new" className="crm-btn crm-btn-sm crm-btn-inline">+ New PO</Link>
            )}
          </div>
        </div>

        {stats && (
          <div className="crm-stats-grid crm-mt">
            <div className="crm-stat-card"><p className="crm-stat-label">Open PO value</p><p className="crm-stat-value">{formatCurrency(stats.open_po_value)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Pending approval</p><p className="crm-stat-value">{formatCurrency(stats.pending_approval_amount)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Pending receipt</p><p className="crm-stat-value">{formatCurrency(stats.pending_receipt_value)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Pending billing</p><p className="crm-stat-value">{formatCurrency(stats.pending_billing_value)}</p></div>
          </div>
        )}

        <div className="crm-contacts-toolbar crm-mt">
          <form onSubmit={(e) => { e.preventDefault(); load(1); }} className="crm-search-form">
            <input placeholder="Search PO #, vendor, title…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="submit" className="crm-btn crm-btn-sm">Search</button>
          </form>
          <div className="crm-filters">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={fulfillment} onChange={(e) => setFulfillment(e.target.value)}>
              <option value="">All fulfillment</option>
              <option value="pending_receipt">Pending receipt</option>
              <option value="pending_billing">Pending billing</option>
            </select>
            <label className="crm-consent-check">
              <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} />
              My POs only
            </label>
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>PO #</th><th>Title</th><th>Vendor</th>
                <th className="crm-num">Ordered</th><th>Received</th><th>Billed</th>
                <th className="crm-num">Pending</th><th>Status</th><th>Delivery</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={10} className="crm-muted">No purchase orders found.</td></tr>}
              {data.items.map((po) => (
                <tr key={po.id}>
                  <td><strong>{po.po_number || "Draft"}</strong></td>
                  <td>{po.title}</td>
                  <td>{po.vendor_name}</td>
                  <td className="crm-num">{formatCurrency(po.grand_total, po.currency)}</td>
                  <td>{po.received_percent}%</td>
                  <td>{po.billed_percent}%</td>
                  <td className="crm-num">{formatCurrency(po.pending_receipt_value + po.pending_billing_value, po.currency)}</td>
                  <td><span className={statusBadgeClass(po.status)}>{STATUS_LABELS[po.status]}</span></td>
                  <td>{formatDate(po.expected_delivery_date)}</td>
                  <td><Link to={`/purchase-orders/${po.id}`} className="crm-nav-link">View</Link></td>
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

export default PurchaseOrders;
