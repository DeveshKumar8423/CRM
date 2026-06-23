import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { STATUS_LABELS, formatCurrency, formatDate, statusBadgeClass } from "../utils/payroll";

function PayslipDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [payslip, setPayslip] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => apiFetch(`/payroll/${id}`).then(setPayslip).catch((err) => setError(err.message));
  useEffect(() => { load(); }, [id]);

  const markPaid = async () => {
    try {
      const updated = await apiFetch(`/payroll/${id}/mark-paid`, { method: "POST" });
      setPayslip(updated);
      setMsg("Marked as paid.");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!payslip && !error) {
    return <DashboardLayout title="Payslip" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout title={payslip?.payslip_number || "Payslip"} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/payroll" className="crm-link crm-link-left">← Payroll</Link>
        {msg && <p className="crm-success crm-mt">{msg}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}
        {payslip && (
          <>
            <div className="crm-detail-header crm-mt">
              <p><span className={statusBadgeClass(payslip.status)}>{STATUS_LABELS[payslip.status]}</span></p>
              {hasPermission("payroll.mark_paid") && payslip.status !== "paid" && (
                <button type="button" className="crm-btn crm-btn-sm" onClick={markPaid}>Mark paid</button>
              )}
            </div>
            <div className="crm-contact-meta crm-mt">
              <p><strong>{payslip.employee_name}</strong> · {payslip.period_label}</p>
              <p>Basic: {formatCurrency(payslip.basic_salary)} · HRA: {formatCurrency(payslip.hra)} · Allowances: {formatCurrency(payslip.allowances)}</p>
              <p>Gross: {formatCurrency(payslip.gross_salary)}</p>
              <p>PF: {formatCurrency(payslip.pf_deduction)} · TDS: {formatCurrency(payslip.tds_deduction)} · Other: {formatCurrency(payslip.other_deductions)}</p>
              <p>Reimbursements: {formatCurrency(payslip.reimbursements)}</p>
              <p><strong>Net salary: {formatCurrency(payslip.net_salary)}</strong></p>
              {payslip.payment_date && <p>Paid on: {formatDate(payslip.payment_date)}</p>}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default PayslipDetail;
