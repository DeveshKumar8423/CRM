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
} from "../utils/inventory";

function InventoryLowStock() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [error, setError] = useState("");

  const load = (page = 1) => {
    apiFetch(`/inventory/low-stock?page=${page}&limit=20`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, []);

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Low Stock" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/inventory" className="crm-link crm-link-left">← Inventory</Link>
        <p className="crm-muted crm-mt">{data.total} item{data.total === 1 ? "" : "s"} at or below reorder level</p>
        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Product</th><th>On hand</th><th>Reorder</th><th className="crm-num">Stock value</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={6} className="crm-muted">No low-stock items.</td></tr>}
              {data.items.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.on_hand_quantity} {p.unit}</td>
                  <td>{p.reorder_level ?? "—"}</td>
                  <td className="crm-num">{formatCurrency(p.stock_value)}</td>
                  <td><span className={statusBadgeClass(p.inventory_status)}>{STATUS_LABELS[p.inventory_status]}</span></td>
                  <td>
                    <Link to={`/inventory/${p.id}`} className="crm-nav-link">View</Link>
                    {hasPermission("purchase_orders.create") && (
                      <> · <Link to="/purchase-orders/new" className="crm-nav-link">Create PO</Link></>
                    )}
                  </td>
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

export default InventoryLowStock;
