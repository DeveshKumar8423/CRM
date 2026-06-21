import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatCurrency, formatDate } from "../utils/customerLedger";

function CustomerLedgerUnassigned() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    apiFetch(`/customer-ledger/unassigned?page=${page}&per_page=50`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [page]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.per_page)) : 1;

  return (
    <DashboardLayout title="Unassigned Receivables" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/customer-ledger" className="crm-link crm-link-left">← Customer ledger</Link>
        <p className="crm-muted crm-mt">Issued invoices without a linked contact. Edit the invoice to assign a contact.</p>

        {error && <p className="crm-error crm-mt">{error}</p>}

        {data && (
          <>
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><p className="crm-stat-label">Unassigned outstanding</p><p className="crm-stat-value">{formatCurrency(data.total_outstanding)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Invoices</p><p className="crm-stat-value">{data.invoice_count}</p></div>
            </div>

            {data.groups.length > 0 && (
              <>
                <h3 className="crm-mt-lg">Grouped by client name</h3>
                <div className="crm-table-wrap">
                  <table className="crm-table">
                    <thead>
                      <tr><th>Client</th><th className="crm-num">Invoices</th><th className="crm-num">Billed</th><th className="crm-num">Outstanding</th></tr>
                    </thead>
                    <tbody>
                      {data.groups.map((g) => (
                        <tr key={g.group_key}>
                          <td>{g.client_org || g.client_name || "Unknown"}</td>
                          <td className="crm-num">{g.invoice_count}</td>
                          <td className="crm-num">{formatCurrency(g.total_billed)}</td>
                          <td className="crm-num">{formatCurrency(g.outstanding)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <h3 className="crm-mt-lg">Invoices</h3>
            <div className="crm-table-wrap">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Client</th>
                    <th>Issue date</th>
                    <th>Due date</th>
                    <th className="crm-num">Outstanding</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.invoices.length === 0 && <tr><td colSpan={7} className="crm-muted">No unassigned receivables.</td></tr>}
                  {data.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.invoice_number || "—"}</td>
                      <td>{inv.client_org || inv.client_name || "—"}</td>
                      <td>{formatDate(inv.issue_date)}</td>
                      <td>{formatDate(inv.due_date)}{inv.is_overdue && <span className="crm-badge crm-cl-overdue">Overdue</span>}</td>
                      <td className="crm-num">{formatCurrency(inv.outstanding_amount)}</td>
                      <td>{inv.status_label}</td>
                      <td><Link to={`/invoices/${inv.id}`} className="crm-nav-link">View</Link></td>
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

export default CustomerLedgerUnassigned;
