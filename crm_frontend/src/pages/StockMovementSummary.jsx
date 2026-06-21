import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import {
  directionBadgeClass,
  directionLabel,
  formatDate,
  reasonLabel,
} from "../utils/stockMovements";

function StockMovementSummary() {
  const role = localStorage.getItem("role") || "Staff";
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/stock-movements/stats/summary").then(setStats).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="Stock In / Out Summary" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/stock-movements" className="crm-link crm-link-left">← Stock ledger</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {stats && (
          <>
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><p className="crm-stat-label">Stock in today</p><p className="crm-stat-value">{stats.stock_in_today}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Stock out today</p><p className="crm-stat-value">{stats.stock_out_today}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Net change today</p><p className="crm-stat-value">{stats.net_change_today}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Movements today</p><p className="crm-stat-value">{stats.movement_count_today}</p></div>
            </div>
            {stats.top_out_product_name && (
              <p className="crm-mt"><strong>Top outward product this week:</strong> {stats.top_out_product_name} ({stats.top_out_product_qty} units)</p>
            )}
            <h3 className="crm-mt-lg">Recent movements</h3>
            <div className="crm-table-wrap">
              <table className="crm-table">
                <thead>
                  <tr><th>#</th><th>Date</th><th>Dir</th><th>Product</th><th>Qty</th><th>Reason</th><th></th></tr>
                </thead>
                <tbody>
                  {stats.recent_movements.length === 0 && <tr><td colSpan={7} className="crm-muted">No recent movements.</td></tr>}
                  {stats.recent_movements.map((m) => (
                    <tr key={m.id}>
                      <td>{m.movement_number}</td>
                      <td>{formatDate(m.movement_date)}</td>
                      <td><span className={directionBadgeClass(m.direction)}>{directionLabel(m.direction)}</span></td>
                      <td>{m.product_name}</td>
                      <td>{m.quantity}</td>
                      <td>{m.reason_label || reasonLabel(m.reason, m.direction)}</td>
                      <td><Link to={`/stock-movements/${m.id}`} className="crm-nav-link">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default StockMovementSummary;
