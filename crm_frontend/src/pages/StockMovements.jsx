import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  directionBadgeClass,
  directionLabel,
  exportCsv,
  formatDate,
  reasonLabel,
} from "../utils/stockMovements";

function StockMovements() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [stats, setStats] = useState(null);
  const [direction, setDirection] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/stock-movements/stats/summary").then(setStats).catch(() => {});
  }, []);

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (direction) params.set("direction", direction);
    if (search.trim()) params.set("search", search.trim());
    apiFetch(`/stock-movements?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, [direction]);

  const handleExport = () => {
    if (!hasPermission("stock_movements.export") && !hasPermission("inventory.export")) return;
    exportCsv(
      `stock-movements-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Movement #", "Date", "Direction", "Product", "Qty", "Reason", "Reference", "Before", "After", "By"],
      data.items.map((m) => [
        m.movement_number,
        formatDate(m.movement_date),
        directionLabel(m.direction),
        m.product_name,
        m.quantity,
        m.reason_label || reasonLabel(m.reason, m.direction),
        m.reference_number || "",
        m.quantity_before,
        m.quantity_after,
        m.recorded_by_name,
      ]),
    );
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Stock In / Out" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total} movement{data.total === 1 ? "" : "s"}</p>
          <div className="crm-inline-actions">
            <Link to="/stock-movements/summary" className="crm-btn crm-btn-sm crm-btn-outline">Summary</Link>
            {(hasPermission("stock_movements.export") || hasPermission("inventory.export")) && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport}>Export CSV</button>
            )}
            {hasPermission("stock_movements.record_in") && (
              <Link to="/stock-movements/in" className="crm-btn crm-btn-sm crm-btn-inline">+ Stock In</Link>
            )}
            {hasPermission("stock_movements.record_out") && (
              <Link to="/stock-movements/out" className="crm-btn crm-btn-sm crm-btn-outline">Stock Out</Link>
            )}
          </div>
        </div>

        {stats && (
          <div className="crm-stats-grid crm-mt">
            <div className="crm-stat-card"><p className="crm-stat-label">In today</p><p className="crm-stat-value">{stats.stock_in_today}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Out today</p><p className="crm-stat-value">{stats.stock_out_today}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Net today</p><p className="crm-stat-value">{stats.net_change_today}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Movements today</p><p className="crm-stat-value">{stats.movement_count_today}</p></div>
          </div>
        )}

        <div className="crm-contacts-toolbar crm-mt">
          <form onSubmit={(e) => { e.preventDefault(); load(1); }} className="crm-search-form">
            <input placeholder="Search product, reference, notes…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="submit" className="crm-btn crm-btn-sm">Search</button>
          </form>
          <div className="crm-filters">
            <select value={direction} onChange={(e) => setDirection(e.target.value)}>
              <option value="">All directions</option>
              <option value="in">Stock In only</option>
              <option value="out">Stock Out only</option>
            </select>
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Movement #</th><th>Date</th><th>Direction</th><th>Product</th><th>Qty</th>
                <th>Reason</th><th>Reference</th><th>Before → After</th><th>By</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={10} className="crm-muted">No movements found.</td></tr>}
              {data.items.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.movement_number}</strong></td>
                  <td>{formatDate(m.movement_date)}</td>
                  <td><span className={directionBadgeClass(m.direction)}>{directionLabel(m.direction)}</span></td>
                  <td><Link to={`/inventory/${m.product_id}`} className="crm-nav-link">{m.product_name}</Link></td>
                  <td>{m.quantity}</td>
                  <td>{m.reason_label || reasonLabel(m.reason, m.direction)}</td>
                  <td>{m.reference_number || "—"}</td>
                  <td>{m.quantity_before} → {m.quantity_after}</td>
                  <td>{m.recorded_by_name}</td>
                  <td><Link to={`/stock-movements/${m.id}`} className="crm-nav-link">View</Link></td>
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

export default StockMovements;
