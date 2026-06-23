import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { STATUS_LABELS, formatCurrency, statusBadgeClass } from "../utils/payroll";

function Payroll() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0 });
  const [stats, setStats] = useState(null);
  const [staff, setStaff] = useState([]);
  const [genForm, setGenForm] = useState({ employee_id: "", period_month: new Date().getMonth() || 12, period_year: new Date().getFullYear() });
  const [error, setError] = useState("");
  const canGenerate = hasPermission("payroll.generate");
  const teamPayroll = hasPermission("payroll.view_all");
  const pageTitle = teamPayroll ? "Payroll" : "My Payslips";

  const load = () => {
    apiFetch("/payroll?limit=50").then(setData).catch((err) => setError(err.message));
    apiFetch("/payroll/stats/summary").then(setStats).catch(() => {});
  };

  useEffect(() => {
    load();
    if (canGenerate) {
      apiFetch("/employees?limit=100").then((r) => setStaff(r.items || [])).catch(() => {});
    }
  }, []);

  const generate = async (e) => {
    e.preventDefault();
    if (!genForm.employee_id) return;
    try {
      await apiFetch("/payroll/generate", {
        method: "POST",
        body: JSON.stringify({
          employee_id: parseInt(genForm.employee_id, 10),
          period_month: parseInt(genForm.period_month, 10),
          period_year: parseInt(genForm.period_year, 10),
        }),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title={pageTitle} roleLabel={role}>
      <div className="crm-panel">
        <p className="crm-muted">
          {teamPayroll
            ? `${data.total} payslip${data.total === 1 ? "" : "s"}`
            : "Your salary slips — only your own records are shown."}
        </p>
        {stats && (
          <div className="crm-stats-grid crm-mt">
            <div className="crm-stat-card"><p className="crm-stat-label">Generated (month)</p><p className="crm-stat-value">{stats.generated_this_month ?? "—"}</p></div>
            <div className="crm-stat-card"><p className="crm-stat-label">Paid (month)</p><p className="crm-stat-value">{stats.paid_this_month ?? stats.my_latest_net ?? "—"}</p></div>
            {stats.total_net_this_month != null && (
              <div className="crm-stat-card"><p className="crm-stat-label">Net paid (month)</p><p className="crm-stat-value">{formatCurrency(stats.total_net_this_month)}</p></div>
            )}
          </div>
        )}
        {error && <p className="crm-error crm-mt">{error}</p>}

        {canGenerate && (
          <form className="crm-form crm-mt" onSubmit={generate}>
            <h3 className="crm-section-title">Generate payslip</h3>
            <div className="crm-form-grid">
              <div>
                <label>Employee</label>
                <select value={genForm.employee_id} onChange={(e) => setGenForm((f) => ({ ...f, employee_id: e.target.value }))} required>
                  <option value="">Select</option>
                  {staff.map((s) => <option key={s.user_id} value={s.user_id}>{s.name}</option>)}
                </select>
              </div>
              <div><label>Month</label><input type="number" min="1" max="12" value={genForm.period_month} onChange={(e) => setGenForm((f) => ({ ...f, period_month: e.target.value }))} /></div>
              <div><label>Year</label><input type="number" value={genForm.period_year} onChange={(e) => setGenForm((f) => ({ ...f, period_year: e.target.value }))} /></div>
            </div>
            <button type="submit" className="crm-btn crm-btn-sm crm-mt">Generate</button>
          </form>
        )}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr><th>Number</th><th>Employee</th><th>Period</th><th>Net</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p.id}>
                  <td>{p.payslip_number}</td>
                  <td>{p.employee_name}</td>
                  <td>{p.period_label}</td>
                  <td>{formatCurrency(p.net_salary)}</td>
                  <td><span className={statusBadgeClass(p.status)}>{STATUS_LABELS[p.status]}</span></td>
                  <td><Link to={`/payroll/${p.id}`} className="crm-link">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Payroll;
