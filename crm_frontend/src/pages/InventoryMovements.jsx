import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  MOVEMENT_LABELS,
  exportCsv,
  formatCurrency,
  formatDate,
  movementBadgeClass,
} from "../utils/inventory";

function InventoryMovements() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [movementTypes, setMovementTypes] = useState([]);
  const [movementType, setMovementType] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/inventory/movement-types").then((types) => {
      setMovementTypes([{ value: "opening", label: "Opening" }, ...types]);
    }).catch(() => {});
  }, []);

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (movementType) params.set("movement_type", movementType);
    apiFetch(`/inventory/movements?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, [movementType]);

  const handleExport = () => {
    if (!hasPermission("inventory.export")) return;
    exportCsv(
      `stock-movements-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Date", "Product", "Type", "Direction", "Qty", "Value", "Before", "After", "By", "Ref"],
      data.items.map((m) => [
        formatDate(m.movement_date),
        m.product_name,
        MOVEMENT_LABELS[m.movement_type],
        m.direction,
        m.quantity,
        m.total_value,
        m.quantity_before,
        m.quantity_after,
        m.recorded_by_name,
        m.reference_number || "",
      ]),
    );
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Movement Ledger" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/inventory" className="crm-link crm-link-left">← Inventory</Link>
          {hasPermission("inventory.export") && (
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleExport}>Export CSV</button>
          )}
        </div>

        <div className="crm-filters crm-mt">
          <select value={movementType} onChange={(e) => setMovementType(e.target.value)}>
            <option value="">All movement types</option>
            {movementTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Date</th><th>Product</th><th>Type</th><th>Dir</th><th>Qty</th>
                <th className="crm-num">Value</th><th>Before</th><th>After</th><th>By</th><th>Ref</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={10} className="crm-muted">No movements found.</td></tr>}
              {data.items.map((m) => (
                <tr key={m.id}>
                  <td>{formatDate(m.movement_date)}</td>
                  <td><Link to={`/inventory/${m.product_id}`} className="crm-nav-link">{m.product_name}</Link></td>
                  <td><span className={movementBadgeClass(m.movement_type)}>{MOVEMENT_LABELS[m.movement_type]}</span></td>
                  <td>{m.direction}</td>
                  <td>{m.quantity}</td>
                  <td className="crm-num">{formatCurrency(m.total_value)}</td>
                  <td>{m.quantity_before}</td>
                  <td>{m.quantity_after}</td>
                  <td>{m.recorded_by_name}</td>
                  <td>{m.reference_number || "—"}</td>
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

export default InventoryMovements;
