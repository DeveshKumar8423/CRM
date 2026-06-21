import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { STATUS_LABELS, formatCurrency, formatDate, statusBadgeClass } from "../utils/vendorBills";

function VendorBillApprovalQueue() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [error, setError] = useState("");

  const load = (page = 1) => {
    apiFetch(`/vendor-bills/approval-queue?page=${page}&limit=20`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, []);

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Vendor Bill Approval Queue" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/vendor-bills" className="crm-link crm-link-left">← All vendor bills</Link>
          <p className="crm-muted">{data.total} pending</p>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Bill #</th><th>Vendor</th><th className="crm-num">Amount</th><th>Due</th><th>Submitted</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={7} className="crm-muted">No bills pending approval.</td></tr>}
              {data.items.map((bill) => (
                <tr key={bill.id}>
                  <td><strong>{bill.bill_number || "Draft"}</strong></td>
                  <td>{bill.vendor_name}</td>
                  <td className="crm-num">{formatCurrency(bill.grand_total, bill.currency)}</td>
                  <td>{formatDate(bill.due_date)}</td>
                  <td>{formatDate(bill.submitted_at)}</td>
                  <td><span className={statusBadgeClass(bill.status)}>{STATUS_LABELS[bill.status]}</span></td>
                  <td><Link to={`/vendor-bills/${bill.id}`} className="crm-nav-link">Review</Link></td>
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

export default VendorBillApprovalQueue;
