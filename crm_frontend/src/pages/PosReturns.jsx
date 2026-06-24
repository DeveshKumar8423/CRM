import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatINR } from "../utils/pos";

function PosReturns() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/pos/returns").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="POS returns" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/pos" className="crm-muted">← Point of Sale</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>Return</th><th>Bill</th><th>Amount</th><th>Reason</th><th>When</th></tr></thead>
          <tbody>
            {(data?.items || []).map((r) => (
              <tr key={r.id}>
                <td>{r.return_number}</td>
                <td>{r.bill_number}</td>
                <td>{formatINR(r.refund_amount)}</td>
                <td>{r.reason}</td>
                <td>{r.processed_at ? new Date(r.processed_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default PosReturns;
