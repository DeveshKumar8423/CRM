import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { exportCsv, formatDate } from "../utils/warehouses";

function WarehouseTransferHistory() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search.trim()) params.set("search", search.trim());
    apiFetch(`/warehouses/transfers?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  const handleExport = () => {
    if (!hasPermission("warehouses.export")) return;
    exportCsv(
      `warehouse-transfers-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Reference", "Product", "SKU", "From", "To", "Qty", "By", "Date"],
      data.items.map((t) => [
        t.transfer_reference,
        t.transfer_out.product_name,
        t.transfer_out.product_sku || "",
        t.transfer_out.location_path,
        t.transfer_in.location_path,
        t.transfer_out.quantity,
        t.transfer_out.recorded_by_name,
        formatDate(t.transfer_out.movement_date),
      ]),
    );
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Transfer History" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/warehouses" className="crm-link crm-link-left">← Warehouses</Link>
          <div className="crm-inline-actions">
            {hasPermission("warehouses.transfer") && (
              <Link to="/warehouses/transfer" className="crm-btn crm-btn-sm crm-btn-inline">New transfer</Link>
            )}
            {hasPermission("warehouses.export") && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport}>Export</button>
            )}
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <form onSubmit={handleSearch} className="crm-filter-row crm-mt">
          <input placeholder="Search transfer reference" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="crm-btn crm-btn-sm">Search</button>
        </form>

        <p className="crm-muted crm-mt">{data.total} transfer{data.total === 1 ? "" : "s"}</p>

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Reference</th><th>Product</th><th>From</th><th>To</th><th>Qty</th><th>By</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={7} className="crm-muted">No transfers recorded yet.</td></tr>}
              {data.items.map((t) => (
                <tr key={t.transfer_reference}>
                  <td><strong>{t.transfer_reference}</strong></td>
                  <td>{t.transfer_out.product_name}</td>
                  <td>{t.transfer_out.location_path}</td>
                  <td>{t.transfer_in.location_path}</td>
                  <td>{t.transfer_out.quantity}</td>
                  <td>{t.transfer_out.recorded_by_name}</td>
                  <td>{formatDate(t.transfer_out.movement_date)}</td>
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

export default WarehouseTransferHistory;
