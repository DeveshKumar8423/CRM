import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { CONTRACT_STATUS_LABELS, contractStatusClass, formatCurrency, formatDateTime } from "../utils/rental";

function RentalContracts() {
  const role = localStorage.getItem("role") || "Staff";
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const qs = params.toString();
    apiFetch(`/rental/contracts${qs ? `?${qs}` : ""}`)
      .then((data) => { setItems(data.items || []); setTotal(data.total || 0); })
      .catch((err) => setError(err.message));
  }, [status]);

  return (
    <DashboardLayout title="Rental contracts" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/rental" className="crm-muted">← Rental</Link>
          {hasPermission("rental.create") && (
            <Link to="/rental/contracts/new" className="crm-btn crm-btn-sm">New contract</Link>
          )}
        </div>
        <div className="crm-inline-actions crm-mt">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="crm-select">
            <option value="">All statuses</option>
            {Object.entries(CONTRACT_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <span className="crm-muted">{total} total</span>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead>
            <tr><th>RNT #</th><th>Contact</th><th>Period</th><th>Status</th><th>Total</th><th>Deposit</th></tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td><Link to={`/rental/contracts/${c.id}`}>{c.contract_number}</Link></td>
                <td>{c.contact_name}</td>
                <td>{formatDateTime(c.rental_start)} – {formatDateTime(c.rental_end)}</td>
                <td><span className={contractStatusClass(c.status)}>{CONTRACT_STATUS_LABELS[c.status] || c.status}</span></td>
                <td>{formatCurrency(c.grand_total)}</td>
                <td>{formatCurrency(c.deposit_received)} / {formatCurrency(c.deposit_required)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="crm-muted crm-mt">No contracts found.</p>}
      </div>
    </DashboardLayout>
  );
}

export default RentalContracts;
