import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import SalesKpis from "../components/SalesKpis";
import { hasPermission } from "../utils/permissions";

function SalesDashboard() {
  return (
    <DashboardLayout title="Sales Dashboard" roleLabel="Sales">
      <div className="crm-panel">
        <h2>Sales workspace</h2>
        <p className="crm-muted">Leads, pipeline, quotations, orders, and client follow-ups.</p>
        <SalesKpis />
        <div className="crm-stats-grid crm-mt">
          {hasPermission("leads.view") && (
            <Link to="/leads" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">Leads</p>
              <p className="crm-stat-value crm-text-sm">Prospects & outreach</p>
            </Link>
          )}
          {hasPermission("deals.view") && (
            <Link to="/pipeline" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">Pipeline</p>
              <p className="crm-stat-value crm-text-sm">Deals by stage</p>
            </Link>
          )}
          {hasPermission("reminders.view") && (
            <Link to="/follow-ups" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">Follow-ups</p>
              <p className="crm-stat-value crm-text-sm">Calls & reminders</p>
            </Link>
          )}
          {hasPermission("quotations.view") && (
            <Link to="/quotations" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">Quotations</p>
              <p className="crm-stat-value crm-text-sm">Quotes & proposals</p>
            </Link>
          )}
          {hasPermission("sales_orders.view") && (
            <Link to="/sales-orders" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">Orders</p>
              <p className="crm-stat-value crm-text-sm">Confirmed work</p>
            </Link>
          )}
          {hasPermission("projects.view") && (
            <Link to="/projects/my-tasks" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">My tasks</p>
              <p className="crm-stat-value crm-text-sm">Delivery work</p>
            </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SalesDashboard;
