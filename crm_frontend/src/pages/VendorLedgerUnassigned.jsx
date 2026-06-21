import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatCurrency, formatDate } from "../utils/vendorLedger";

function VendorLedgerUnassigned() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    apiFetch(`/vendor-ledger/unassigned?page=${page}&per_page=50`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [page]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.per_page)) : 1;

  return (
    <DashboardLayout title="Unassigned Payables" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/vendor-ledger" className="crm-link crm-link-left">← Vendor ledger</Link>
        <p className="crm-muted crm-mt">Approved bills without a linked contact. Edit the bill to assign a vendor contact.</p>

        {error && <p className="crm-error crm-mt">{error}</p>}

        {data && (
          <>
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><p className="crm-stat-label">Unassigned outstanding</p><p className="crm-stat-value">{formatCurrency(data.total_outstanding)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Bills</p><p className="crm-stat-value">{data.bill_count}</p></div>
            </div>

            {data.groups.length > 0 && (
              <>
                <h3 className="crm-mt-lg">Grouped by vendor name</h3>
                <div className="crm-table-wrap">
                  <table className="crm-table">
                    <thead>
                      <tr><th>Vendor</th><th className="crm-num">Bills</th><th className="crm-num">Billed</th><th className="crm-num">Outstanding</th></tr>
                    </thead>
                    <tbody>
                      {data.groups.map((g) => (
                        <tr key={g.group_key}>
                          <td>{g.vendor_name || "Unknown"}</td>
                          <td className="crm-num">{g.bill_count}</td>
                          <td className="crm-num">{formatCurrency(g.total_billed)}</td>
                          <td className="crm-num">{formatCurrency(g.outstanding)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <h3 className="crm-mt-lg">Bills</h3>
            <div className="crm-table-wrap">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Bill #</th>
                    <th>Vendor</th>
                    <th>Bill date</th>
                    <th>Due date</th>
                    <th className="crm-num">Outstanding</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.bills.length === 0 && <tr><td colSpan={7} className="crm-muted">No unassigned payables.</td></tr>}
                  {data.bills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.bill_number || "—"}</td>
                      <td>{bill.vendor_name || "—"}</td>
                      <td>{formatDate(bill.bill_date)}</td>
                      <td>{formatDate(bill.due_date)}{bill.is_overdue && <span className="crm-badge crm-vl-overdue">Overdue</span>}</td>
                      <td className="crm-num">{formatCurrency(bill.outstanding_amount)}</td>
                      <td>{bill.status_label}</td>
                      <td><Link to={`/vendor-bills/${bill.id}`} className="crm-nav-link">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="crm-pagination crm-mt">
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                <span className="crm-muted">Page {page} of {totalPages}</span>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default VendorLedgerUnassigned;
