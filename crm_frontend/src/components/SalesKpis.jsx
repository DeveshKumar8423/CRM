import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function SalesKpis() {
  const [kpis, setKpis] = useState(null);
  const [contactStats, setContactStats] = useState(null);

  useEffect(() => {
    if (hasPermission("dashboard.view")) {
      apiFetch("/dashboard/kpis").then(setKpis).catch(() => {});
    }
    if (hasPermission("contacts.view")) {
      apiFetch("/contacts/stats/summary").then(setContactStats).catch(() => {});
    }
  }, []);

  if (!kpis && !contactStats) return null;

  return (
    <div className="crm-mt">
      {kpis && hasPermission("dashboard.view") && (
        <>
          <h3 className="crm-section-title">Business snapshot</h3>
          <div className="crm-stats-grid crm-mt-sm">
            {hasPermission("leads.view") && (
              <div className="crm-stat-card">
                <p className="crm-stat-label">Leads</p>
                <p className="crm-stat-value">{kpis.total_leads}</p>
                <p className="crm-muted">{kpis.open_leads} open</p>
                <Link to="/leads" className="crm-nav-link">View leads</Link>
              </div>
            )}
            {hasPermission("invoices.view") && (
              <>
                <div className="crm-stat-card">
                  <p className="crm-stat-label">Invoices</p>
                  <p className="crm-stat-value">{kpis.open_invoices}</p>
                  <p className="crm-muted">{kpis.overdue_invoices} overdue · {kpis.total_invoices} total</p>
                  <Link to="/invoices" className="crm-nav-link">View invoices</Link>
                </div>
                <div className="crm-stat-card">
                  <p className="crm-stat-label">Revenue collected</p>
                  <p className="crm-stat-value">{formatCurrency(kpis.revenue_collected)}</p>
                  <p className="crm-muted">Billed {formatCurrency(kpis.revenue_billed)}</p>
                </div>
              </>
            )}
            {hasPermission("payments.view") && (
              <div className="crm-stat-card">
                <p className="crm-stat-label">Pending payments</p>
                <p className="crm-stat-value">{formatCurrency(kpis.pending_payments)}</p>
                <Link to="/payments" className="crm-nav-link">Collections</Link>
              </div>
            )}
            {hasPermission("projects.view") && (
              <div className="crm-stat-card">
                <p className="crm-stat-label">Tasks</p>
                <p className="crm-stat-value">{kpis.tasks_due}</p>
                <p className="crm-muted">{kpis.tasks_overdue} overdue this week</p>
                <Link to="/projects/my-tasks" className="crm-nav-link">My tasks</Link>
              </div>
            )}
            {hasPermission("deals.view") && (
              <div className="crm-stat-card">
                <p className="crm-stat-label">Pipeline value</p>
                <p className="crm-stat-value">{formatCurrency(kpis.pipeline_value)}</p>
                <p className="crm-muted">{kpis.open_deals} open deals</p>
              </div>
            )}
            {hasPermission("quotations.view") && (
              <div className="crm-stat-card">
                <p className="crm-stat-label">Pending quotes</p>
                <p className="crm-stat-value">{kpis.pending_quotes}</p>
                <Link to="/quotations" className="crm-nav-link">View quotations</Link>
              </div>
            )}
            {hasPermission("reminders.view") && (
              <div className="crm-stat-card">
                <p className="crm-stat-label">Follow-ups due</p>
                <p className="crm-stat-value">{kpis.follow_ups_due_today}</p>
                <p className="crm-muted">{kpis.follow_ups_overdue} overdue</p>
                <Link to="/follow-ups" className="crm-nav-link">Open queue</Link>
              </div>
            )}
          </div>
        </>
      )}

      {contactStats && contactStats.total > 0 && (
        <>
          <h3 className="crm-section-title crm-mt-lg">Clients</h3>
          <div className="crm-stats-grid crm-mt-sm">
            <div className="crm-stat-card">
              <p className="crm-stat-label">Total clients</p>
              <p className="crm-stat-value">{contactStats.total}</p>
            </div>
            <div className="crm-stat-card">
              <p className="crm-stat-label">Active</p>
              <p className="crm-stat-value">{contactStats.active}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SalesKpis;
