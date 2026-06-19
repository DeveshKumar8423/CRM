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
} from "../utils/inventory";

function Inventory() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [stats, setStats] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/inventory/statuses").then(setStatuses).catch(() => {});
    apiFetch("/inventory/stats/summary").then(setStats).catch(() => {});
  }, []);

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20", tracked_only: "true" });
    if (inventoryStatus) params.set("inventory_status", inventoryStatus);
    if (search.trim()) params.set("search", search.trim());
    apiFetch(`/inventory?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, [inventoryStatus]);

  const handleExport = () => {
    if (!hasPermission("inventory.export")) return;
    exportCsv(
      `inventory-${new Date().toISOString().slice(0, 10)}.csv`,
      ["SKU", "Product", "Category", "On Hand", "Unit Valuation", "Stock Value", "Reorder", "Status"],
      data.items.map((p) => [
        p.service_code || "",
        p.name,
        p.category || "",
        p.on_hand_quantity,
        p.unit_valuation,
        p.stock_value,
        p.reorder_level ?? "",
        STATUS_LABELS[p.inventory_status],
      ]),
    );
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Inventory" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total} tracked product{data.total === 1 ? "" : "s"}</p>
          <div className="crm-inline-actions">
            <Link to="/inventory/low-stock" className="crm-btn crm-btn-sm crm-btn-outline">Low stock</Link>
            <Link to="/inventory/movements" className="crm-btn crm-btn-sm crm-btn-outline">Movement ledger</Link>
            {hasPermission("inventory.export") && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport}>Export CSV</button>
            )}
            {hasPermission("inventory.record_purchase") && (
              <Link to="/inventory/record-movement" className="crm-btn crm-btn-sm crm-btn-inline">Record movement</Link>
            )}
          </div>
        </div>

        {stats && (
          <div className="crm-stats-grid crm-mt">
            <div className="crm-stat-card"><p className="crm-stat-label">Total stock value</p><p className="crm-stat-value">{formatCurrency(stats.total_stock_value)}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Tracked products</p><p className="crm-stat-value">{stats.tracked_products}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Low stock</p><p className="crm-stat-value">{stats.low_stock_count}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Out of stock</p><p className="crm-stat-value">{stats.out_of_stock_count}</p></div>
          </div>
        )}

        <div className="crm-contacts-toolbar crm-mt">
          <form onSubmit={(e) => { e.preventDefault(); load(1); }} className="crm-search-form">
            <input placeholder="Search product, SKU…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="submit" className="crm-btn crm-btn-sm">Search</button>
          </form>
          <select value={inventoryStatus} onChange={(e) => setInventoryStatus(e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>SKU</th><th>Product</th><th>Category</th>
                <th className="crm-num">On hand</th><th className="crm-num">Unit value</th>
                <th className="crm-num">Stock value</th><th>Status</th><th>Last movement</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={9} className="crm-muted">No inventory-tracked products yet.</td></tr>}
              {data.items.map((p) => (
                <tr key={p.id}>
                  <td>{p.service_code || "—"}</td>
                  <td>{p.name}</td>
                  <td>{p.category || "—"}</td>
                  <td className="crm-num">{p.on_hand_quantity} {p.unit}</td>
                  <td className="crm-num">{formatCurrency(p.unit_valuation)}</td>
                  <td className="crm-num">{formatCurrency(p.stock_value)}</td>
                  <td><span className={statusBadgeClass(p.inventory_status)}>{STATUS_LABELS[p.inventory_status]}</span></td>
                  <td>{formatDate(p.last_movement_at)}</td>
                  <td><Link to={`/inventory/${p.id}`} className="crm-nav-link">View</Link></td>
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

export default Inventory;
