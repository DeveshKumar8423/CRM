import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatINR } from "../utils/pos";
import { hasPermission } from "../utils/permissions";

function PosBills() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/pos/bills").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="POS bills" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/pos" className="crm-muted">← Point of Sale</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>Bill</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Cashier</th><th>Time</th></tr></thead>
          <tbody>
            {(data?.items || []).map((b) => (
              <tr key={b.id}>
                <td><Link to={`/pos/bills/${b.id}`}>{b.bill_number}</Link></td>
                <td>{b.customer_name}</td>
                <td>{formatINR(b.grand_total)}</td>
                <td>{b.payment_method}</td>
                <td>{b.status}</td>
                <td>{b.cashier_name}</td>
                <td>{b.completed_at ? new Date(b.completed_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default PosBills;
