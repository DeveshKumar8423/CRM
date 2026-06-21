import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { buildIndexParams, formatCurrency, formatDate } from "../utils/vendorLedger";

function VendorLedger() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [outstandingOnly, setOutstandingOnly] = useState(false);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sort, setSort] = useState("outstanding");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    const params = buildIndexParams({ search, outstandingOnly, overdueOnly, sort, page });
    apiFetch(`/vendor-ledger?${params}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, outstandingOnly, overdueOnly, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.per_page)) : 1;

  return (
    <DashboardLayout title="Vendor Ledger" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">Per-vendor bills, payments, and outstanding payables</p>
          <Link to="/vendor-ledger/unassigned" className="crm-btn crm-btn-sm crm-btn-outline">
            Unassigned payables
          </Link>
        </div>

        {data?.kpis && (
          <div className="crm-stats-grid crm-mt">
            <div className="crm-stat-card">
              <p className="crm-stat-label">Total outstanding</p>
              <p className="crm-stat-value">{formatCurrency(data.kpis.total_outstanding)}</p>
            </div>
            <div className="crm-stat-card">
              <p className="crm-stat-label">Overdue</p>
              <p className="crm-stat-value">{formatCurrency(data.kpis.overdue_outstanding)}</p>
            </div>
            <div className="crm-stat-card">
              <p className="crm-stat-label">Vendors with balance</p>
              <p className="crm-stat-value">{data.kpis.vendors_with_balance}</p>
            </div>
            <div className="crm-stat-card">
              <p className="crm-stat-label">Paid this month</p>
              <p className="crm-stat-value">{formatCurrency(data.kpis.paid_this_month)}</p>
            </div>
            {data.kpis.unassigned_outstanding > 0 && (
              <div className="crm-stat-card">
                <p className="crm-stat-label">Unassigned outstanding</p>
                <p className="crm-stat-value">{formatCurrency(data.kpis.unassigned_outstanding)}</p>
              </div>
            )}
          </div>
        )}

        <div className="crm-filters crm-mt">
          <input
            type="search"
            placeholder="Search vendor, GSTIN, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
          />
          <label className="crm-checkbox-label">
            <input type="checkbox" checked={outstandingOnly} onChange={(e) => { setOutstandingOnly(e.target.checked); setPage(1); }} />
            Outstanding only
          </label>
          <label className="crm-checkbox-label">
            <input type="checkbox" checked={overdueOnly} onChange={(e) => { setOverdueOnly(e.target.checked); setPage(1); }} />
            Overdue only
          </label>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <option value="outstanding">Sort: Outstanding</option>
            <option value="name">Sort: Name</option>
            <option value="activity">Sort: Last activity</option>
          </select>
          <button type="button" className="crm-btn crm-btn-sm" onClick={() => { setPage(1); load(); }}>Search</button>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}
        {loading && <p className="crm-muted crm-mt">Loading…</p>}

        {!loading && data && (
          <>
            <div className="crm-table-wrap crm-mt">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>GSTIN</th>
                    <th className="crm-num">Billed</th>
                    <th className="crm-num">Paid</th>
                    <th className="crm-num">Outstanding</th>
                    <th className="crm-num">Overdue</th>
                    <th>Last activity</th>
                    <th className="crm-num">Open bills</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.length === 0 && (
                    <tr><td colSpan={9} className="crm-muted">No vendors with ledger activity match your filters.</td></tr>
                  )}
                  {data.items.map((row) => (
                    <tr key={row.contact_id}>
                      <td>
                        <strong>{row.name}</strong>
                        {row.organization_name && <div className="crm-muted">{row.organization_name}</div>}
                      </td>
                      <td>{row.gstin || "—"}</td>
                      <td className="crm-num">{formatCurrency(row.total_billed, row.currency)}</td>
                      <td className="crm-num">{formatCurrency(row.total_paid, row.currency)}</td>
                      <td className="crm-num">{formatCurrency(row.outstanding, row.currency)}</td>
                      <td className="crm-num">{formatCurrency(row.overdue_outstanding, row.currency)}</td>
                      <td>{formatDate(row.last_activity_date)}</td>
                      <td className="crm-num">{row.open_bill_count}</td>
                      <td>
                        <Link to={`/vendor-ledger/${row.contact_id}`} className="crm-nav-link">View ledger</Link>
                      </td>
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

export default VendorLedger;
