import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { BOM_STATUS_LABELS } from "../utils/manufacturing";
import { hasPermission } from "../utils/permissions";

function BomList() {
  const role = localStorage.getItem("role") || "Staff";
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/manufacturing/boms").then((d) => setItems(d.items)).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="Bills of materials" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/manufacturing" className="crm-muted">← Manufacturing</Link>
          {hasPermission("manufacturing.manage_bom") && (
            <Link to="/manufacturing/boms/new" className="crm-btn crm-btn-sm">New BOM</Link>
          )}
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>Name</th><th>Product</th><th>Version</th><th>Status</th><th>Lines</th><th>Batch</th></tr></thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td><Link to={`/manufacturing/boms/${b.id}`}>{b.name}</Link></td>
                <td>{b.product_name}</td>
                <td>{b.version}</td>
                <td>{BOM_STATUS_LABELS[b.status] || b.status}</td>
                <td>{b.line_count}</td>
                <td>{b.output_qty} {b.output_uom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default BomList;
