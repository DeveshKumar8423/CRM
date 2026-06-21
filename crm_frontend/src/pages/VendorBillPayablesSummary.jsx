import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatCurrency } from "../utils/vendorBills";

function VendorBillPayablesSummary() {
  const role = localStorage.getItem("role") || "Staff";
  const [stats, setStats] = useState(null);
  const [overdue, setOverdue] = useState({ items: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/vendor-bills/stats/summary"),
      apiFetch("/vendor-bills?payment_status=overdue&limit=10"),
    ]).then(([s, list]) => { setStats(s); setOverdue(list); }).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="Payables Summary" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/vendor-bills" className="crm-link crm-link-left">← All vendor bills</Link>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {stats && (
          <>
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card"><p className="crm-stat-label">Total outstanding</p><p className="crm-stat-value">{formatCurrency(stats.total_outstanding)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Overdue</p><p className="crm-stat-value">{formatCurrency(stats.overdue_amount)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Due this week</p><p className="crm-stat-value">{formatCurrency(stats.due_this_week_amount)}</p></div>
              <div className="crm-stat-card"><p className="crm-stat-label">Paid this month</p><p className="crm-stat-value">{formatCurrency(stats.paid_this_month)}</p></div>
            </div>

            <h3 className="crm-mt-lg">Aging buckets</h3>
            <div className="crm-table-wrap">
              <table className="crm-table">
                <thead><tr><th>Bucket</th><th className="crm-num">Amount</th></tr></thead>
                <tbody>
                  {stats.aging_buckets.map((b) => (
                    <tr key={b.name}><td>{b.name}</td><td className="crm-num">{formatCurrency(b.value)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="crm-mt-lg">Top vendors by outstanding</h3>
            <div className="crm-table-wrap">
              <table className="crm-table">
                <thead><tr><th>Vendor</th><th className="crm-num">Outstanding</th></tr></thead>
                <tbody>
                  {stats.by_vendor.length === 0 && <tr><td colSpan={2} className="crm-muted">No outstanding payables.</td></tr>}
                  {stats.by_vendor.map((v) => (
                    <tr key={v.name}>
                      <td>
                        {v.contact_id ? (
                          <Link to={`/vendor-ledger/${v.contact_id}`} className="crm-nav-link">{v.name}</Link>
                        ) : v.name}
                      </td>
                      <td className="crm-num">{formatCurrency(v.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="crm-mt-lg">Overdue bills</h3>
            <div className="crm-table-wrap">
              <table className="crm-table">
                <thead><tr><th>Bill #</th><th>Vendor</th><th className="crm-num">Outstanding</th><th></th></tr></thead>
                <tbody>
                  {overdue.items.length === 0 && <tr><td colSpan={4} className="crm-muted">No overdue bills.</td></tr>}
                  {overdue.items.map((b) => (
                    <tr key={b.id}>
                      <td>{b.bill_number}</td>
                      <td>{b.vendor_name}</td>
                      <td className="crm-num">{formatCurrency(b.outstanding_amount, b.currency)}</td>
                      <td><Link to={`/vendor-bills/${b.id}`} className="crm-nav-link">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default VendorBillPayablesSummary;
