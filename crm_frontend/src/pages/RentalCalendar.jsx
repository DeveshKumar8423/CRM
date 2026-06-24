import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { contractStatusClass, formatDateTime } from "../utils/rental";

function RentalCalendar() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/rental/calendar").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="Booking calendar" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/rental" className="crm-muted">← Rental</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {data && (
          <>
            <p className="crm-muted crm-mt">
              Week of {formatDateTime(data.week_start)} – {formatDateTime(data.week_end)}
            </p>
            {data.events.length === 0 ? (
              <p className="crm-muted crm-mt">No bookings this week.</p>
            ) : (
              <table className="crm-table crm-mt">
                <thead>
                  <tr><th>Asset</th><th>RNT #</th><th>Contact</th><th>Qty</th><th>Period</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {data.events.map((e) => (
                    <tr key={`${e.contract_id}-${e.rental_asset_id}`}>
                      <td>{e.asset_code} — {e.asset_name}</td>
                      <td><Link to={`/rental/contracts/${e.contract_id}`}>{e.contract_number}</Link></td>
                      <td>{e.contact_name}</td>
                      <td>{e.quantity}</td>
                      <td>{formatDateTime(e.rental_start)} – {formatDateTime(e.rental_end)}</td>
                      <td><span className={contractStatusClass(e.status)}>{e.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default RentalCalendar;
