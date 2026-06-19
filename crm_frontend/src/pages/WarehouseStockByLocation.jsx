import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  STOCK_STATUS_LABELS,
  exportCsv,
  formatCurrency,
  formatDate,
  stockStatusBadgeClass,
} from "../utils/warehouses";

function WarehouseStockByLocation() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [locationId, setLocationId] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/warehouses/locations").then((res) => setLocations(res.items || [])).catch(() => {});
  }, []);

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search.trim()) params.set("search", search.trim());
    if (locationId) params.set("location_id", locationId);
    if (lowStock) params.set("low_stock", "true");
    apiFetch(`/warehouses/stock?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, [locationId, lowStock]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  const handleExport = () => {
    if (!hasPermission("warehouses.export")) return;
    exportCsv(
      `stock-by-location-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Product", "SKU", "Branch", "Warehouse", "Location", "On Hand", "Value", "Status", "Last Movement"],
      data.items.map((s) => [
        s.product_name,
        s.product_sku || "",
        s.branch_name || "",
        s.warehouse_name || "",
        s.location_path || s.location_name,
        s.on_hand_quantity,
        s.stock_value,
        STOCK_STATUS_LABELS[s.stock_status],
        s.last_movement_at ? formatDate(s.last_movement_at) : "",
      ]),
    );
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Stock by Location" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/warehouses" className="crm-link crm-link-left">← Warehouses</Link>
          <div className="crm-inline-actions">
            {hasPermission("warehouses.transfer") && (
              <Link to="/warehouses/transfer" className="crm-btn crm-btn-sm crm-btn-outline">Transfer stock</Link>
            )}
            {hasPermission("warehouses.export") && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport}>Export</button>
            )}
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <form onSubmit={handleSearch} className="crm-filter-row crm-mt">
          <input placeholder="Search product or SKU" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
            <option value="">All locations</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.path || l.name}</option>)}
          </select>
          <label className="crm-checkbox-label">
            <input type="checkbox" checked={lowStock} onChange={(e) => setLowStock(e.target.checked)} /> Low stock only
          </label>
          <button type="submit" className="crm-btn crm-btn-sm">Search</button>
        </form>

        <p className="crm-muted crm-mt">{data.total} record{data.total === 1 ? "" : "s"}</p>

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Product</th><th>Branch</th><th>Warehouse</th><th>Location</th>
                <th className="crm-num">On hand</th><th className="crm-num">Value</th><th>Status</th><th>Last movement</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={8} className="crm-muted">No stock records found.</td></tr>}
              {data.items.map((s) => (
                <tr key={s.id}>
                  <td><div><strong>{s.product_name}</strong></div><span className="crm-muted">{s.product_sku}</span></td>
                  <td>{s.branch_name || "—"}</td>
                  <td>{s.warehouse_name || "—"}</td>
                  <td><Link to={`/warehouses/locations/${s.location_id}`} className="crm-nav-link">{s.location_path || s.location_name}</Link></td>
                  <td className="crm-num">{s.on_hand_quantity}</td>
                  <td className="crm-num">{formatCurrency(s.stock_value)}</td>
                  <td><span className={stockStatusBadgeClass(s.stock_status)}>{STOCK_STATUS_LABELS[s.stock_status]}</span></td>
                  <td>{formatDate(s.last_movement_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

export default WarehouseStockByLocation;
