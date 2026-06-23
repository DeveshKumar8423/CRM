import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import SalesKpis from "../components/SalesKpis";
import { hasPermission } from "../utils/permissions";

function AccountantDashboard() {
  return (
    <DashboardLayout title="Finance Dashboard" roleLabel="Accountant">
      <div className="crm-panel">
        <h2>Finance workspace</h2>
        <p className="crm-muted">Invoices, payments, expenses, tax reports, and ledgers.</p>
        <SalesKpis />
        <div className="crm-stats-grid crm-mt">
          {hasPermission("invoices.view") && (
            <Link to="/invoices" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">Invoices</p>
              <p className="crm-stat-value crm-text-sm">Billing & collections</p>
            </Link>
          )}
          {hasPermission("payments.view") && (
            <Link to="/payments" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">Payments</p>
              <p className="crm-stat-value crm-text-sm">Outstanding balances</p>
            </Link>
          )}
          {hasPermission("tax_reports.view") && (
            <Link to="/tax-reports" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">GST / Tax</p>
              <p className="crm-stat-value crm-text-sm">Tax reports</p>
            </Link>
          )}
          {hasPermission("payroll.view") && (
            <Link to="/payroll" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">Payroll</p>
              <p className="crm-stat-value crm-text-sm">Payslips</p>
            </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AccountantDashboard;
