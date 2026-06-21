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
} from "../utils/vendorBills";

function VendorBills() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [stats, setStats] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [mine, setMine] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/vendor-bills/statuses").then(setStatuses).catch(() => {});
    apiFetch("/vendor-bills/stats/summary").then(setStats).catch(() => {});
  }, []);

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    if (paymentStatus) params.set("payment_status", paymentStatus);
    if (mine) params.set("mine", "true");
    if (search.trim()) params.set("search", search.trim());
    apiFetch(`/vendor-bills?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, [status, paymentStatus, mine]);

  const handleExport = () => {
    if (!hasPermission("vendor_bills.export")) return;
    exportCsv(
      `vendor-bills-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Bill #", "Supplier Inv #", "Vendor", "PO", "Bill Date", "Due Date", "Total", "Outstanding", "Status"],
      data.items.map((b) => [
        b.bill_number || "Draft",
        b.supplier_invoice_number || "",
        b.vendor_name,
        b.po_number || "",
        formatDate(b.bill_date),
        formatDate(b.due_date),
        b.grand_total,
        b.outstanding_amount,
        STATUS_LABELS[b.status],
      ]),
    );
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Vendor Bills" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total} bill{data.total === 1 ? "" : "s"}</p>
          <div className="crm-inline-actions">
            {hasPermission("vendor_bills.view") && (
              <Link to="/vendor-bills/payables-summary" className="crm-btn crm-btn-sm crm-btn-outline">Payables summary</Link>
            )}
            {hasPermission("vendor_bills.approve") && (
              <Link to="/vendor-bills/approval-queue" className="crm-btn crm-btn-sm crm-btn-outline">Pending approval</Link>
            )}
            {hasPermission("vendor_bills.export") && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport}>Export CSV</button>
            )}
            {hasPermission("vendor_bills.create") && (
              <Link to="/vendor-bills/new" className="crm-btn crm-btn-sm crm-btn-inline">+ New bill</Link>
            )}
          </div>
        </div>

        {stats && (
          <div className="crm-stats-grid crm-mt">
            <div className="crm-stat-card"><p className="crm-stat-label">Outstanding</p><p className="crm-stat-value">{formatCurrency(stats.total_outstanding)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Overdue</p><p className="crm-stat-value">{formatCurrency(stats.overdue_amount)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Due this week</p><p className="crm-stat-value">{formatCurrency(stats.due_this_week_amount)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Pending approval</p><p className="crm-stat-value">{stats.pending_approval_count}</p></div>
          </div>
        )}

        <div className="crm-contacts-toolbar crm-mt">
          <form onSubmit={(e) => { e.preventDefault(); load(1); }} className="crm-search-form">
            <input placeholder="Search bill #, vendor, supplier inv…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="submit" className="crm-btn crm-btn-sm">Search</button>
          </form>
          <div className="crm-filters">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              <option value="">All payment states</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partially paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <label className="crm-consent-check">
              <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} />
              My bills only
            </label>
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Bill #</th><th>Vendor</th><th>PO</th><th>Bill date</th><th>Due</th>
                <th className="crm-num">Total</th><th className="crm-num">Outstanding</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={9} className="crm-muted">No vendor bills found.</td></tr>}
              {data.items.map((bill) => (
                <tr key={bill.id}>
                  <td><strong>{bill.bill_number || "Draft"}</strong></td>
                  <td>{bill.vendor_name}</td>
                  <td>{bill.po_number || "—"}</td>
                  <td>{formatDate(bill.bill_date)}</td>
                  <td>{formatDate(bill.due_date)}</td>
                  <td className="crm-num">{formatCurrency(bill.grand_total, bill.currency)}</td>
                  <td className="crm-num">{formatCurrency(bill.outstanding_amount, bill.currency)}</td>
                  <td><span className={statusBadgeClass(bill.status)}>{STATUS_LABELS[bill.status]}</span></td>
                  <td><Link to={`/vendor-bills/${bill.id}`} className="crm-nav-link">View</Link></td>
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

export default VendorBills;
