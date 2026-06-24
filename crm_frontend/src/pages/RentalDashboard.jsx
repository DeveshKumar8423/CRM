import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { contractStatusClass, formatCurrency, formatDateTime } from "../utils/rental";

function RentalDashboard() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/rental/dashboard").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="Rental" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">Rentable assets, bookings, deposits, delivery & returns</p>
          <div className="crm-inline-actions">
            {hasPermission("rental.create") && (
              <Link to="/rental/contracts/new" className="crm-btn crm-btn-sm">New contract</Link>
            )}
            <Link to="/rental/calendar" className="crm-btn crm-btn-sm crm-btn-outline">Calendar</Link>
            <Link to="/rental/contracts" className="crm-btn crm-btn-sm crm-btn-outline">Contracts</Link>
            <Link to="/rental/assets" className="crm-btn crm-btn-sm crm-btn-outline">Assets</Link>
            {hasPermission("rental.manage_settings") && (
              <Link to="/rental/settings" className="crm-btn crm-btn-sm crm-btn-outline">Settings</Link>
            )}
          </div>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {data && (
          <>
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><span className="crm-stat-value">{data.active_contracts}</span><span className="crm-stat-label">Active</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.units_on_rent}</span><span className="crm-stat-label">Units on rent</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.returns_due_7d}</span><span className="crm-stat-label">Returns (7d)</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.overdue_returns}</span><span className="crm-stat-label">Overdue</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{formatCurrency(data.deposits_held)}</span><span className="crm-stat-label">Deposits held</span></div>
              <div className="crm-stat-card"><span className="crm-stat-value">{data.utilization_pct}%</span><span className="crm-stat-label">Utilization</span></div>
            </div>
            <h3 className="crm-mt">Deliveries today</h3>
            {data.deliveries_today.length === 0 ? (
              <p className="crm-muted">No deliveries scheduled today.</p>
            ) : (
              <table className="crm-table crm-mt">
                <thead><tr><th>RNT #</th><th>Contact</th><th>Period</th><th>Status</th></tr></thead>
                <tbody>
                  {data.deliveries_today.map((c) => (
                    <tr key={c.id}>
                      <td><Link to={`/rental/contracts/${c.id}`}>{c.contract_number}</Link></td>
                      <td>{c.contact_name}</td>
                      <td>{formatDateTime(c.rental_start)} – {formatDateTime(c.rental_end)}</td>
                      <td><span className={contractStatusClass(c.status)}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <h3 className="crm-mt">Returns due</h3>
            {data.returns_due.length === 0 ? (
              <p className="crm-muted">No returns due this week.</p>
            ) : (
              <table className="crm-table crm-mt">
                <thead><tr><th>RNT #</th><th>Contact</th><th>Due</th><th>Deposit</th></tr></thead>
                <tbody>
                  {data.returns_due.map((c) => (
                    <tr key={c.id}>
                      <td><Link to={`/rental/contracts/${c.id}`}>{c.contract_number}</Link></td>
                      <td>{c.contact_name}</td>
                      <td>{formatDateTime(c.rental_end)}</td>
                      <td>{formatCurrency(c.deposit_received)} / {formatCurrency(c.deposit_required)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {data.overdue.length > 0 && (
              <>
                <h3 className="crm-mt">Overdue returns</h3>
                <table className="crm-table crm-mt">
                  <thead><tr><th>RNT #</th><th>Contact</th><th>Was due</th></tr></thead>
                  <tbody>
                    {data.overdue.map((c) => (
                      <tr key={c.id} className="rental-overdue-row">
                        <td><Link to={`/rental/contracts/${c.id}`}>{c.contract_number}</Link></td>
                        <td>{c.contact_name}</td>
                        <td>{formatDateTime(c.rental_end)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default RentalDashboard;
