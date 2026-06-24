import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatINR, RETURN_STATUS_LABELS } from "../utils/ecommerce";
import { hasPermission } from "../utils/permissions";

function EcommerceReturns() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = () => apiFetch("/ecommerce/returns").then(setData).catch((err) => setError(err.message));

  useEffect(() => { load(); }, []);

  const updateReturn = async (returnId, status) => {
    try {
      await apiFetch(`/ecommerce/returns/${returnId}`, {
        method: "PUT",
        body: JSON.stringify({ status, refund_amount: status === "refunded" ? undefined : undefined }),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="Returns" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/ecommerce" className="crm-muted">← Online Store</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>Return</th><th>Order</th><th>Status</th><th>Reason</th><th>Requested</th><th></th></tr></thead>
          <tbody>
            {(data?.items || []).map((r) => (
              <tr key={r.id}>
                <td>{r.return_number}</td>
                <td>{r.order_number}</td>
                <td>{RETURN_STATUS_LABELS[r.status] || r.status}</td>
                <td>{r.reason}</td>
                <td>{new Date(r.requested_at).toLocaleString()}</td>
                <td>
                  {hasPermission("ecommerce.manage_returns") && r.status === "requested" && (
                    <>
                      <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => updateReturn(r.id, "approved")}>Approve</button>{" "}
                      <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => updateReturn(r.id, "rejected")}>Reject</button>
                    </>
                  )}
                  {hasPermission("ecommerce.manage_returns") && r.status === "approved" && (
                    <button type="button" className="crm-btn crm-btn-sm" onClick={() => updateReturn(r.id, "refunded")}>Mark refunded</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.items?.length === 0 && <p className="crm-muted crm-mt">No return requests.</p>}
      </div>
    </DashboardLayout>
  );
}

export default EcommerceReturns;
