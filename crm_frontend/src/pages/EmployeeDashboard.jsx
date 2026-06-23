import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { hasPermission } from "../utils/permissions";

function EmployeeDashboard() {
  return (
    <DashboardLayout title="Employee Dashboard" roleLabel="Employee">
      <div className="crm-panel">
        <h2>Welcome</h2>
        <p className="crm-muted">
          Use the menu above for your day-to-day work — attendance, leave, timesheets, and assigned projects.
        </p>

        <div className="crm-stats-grid crm-mt">
          {hasPermission("attendance.view") && (
            <Link to="/attendance" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">My Attendance</p>
              <p className="crm-stat-value crm-text-sm">Check in / out</p>
            </Link>
          )}
          {hasPermission("leaves.view") && (
            <Link to="/leaves" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">Leave</p>
              <p className="crm-stat-value crm-text-sm">Apply & track</p>
            </Link>
          )}
          {hasPermission("timesheets.view") && (
            <Link to="/timesheets" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">Timesheets</p>
              <p className="crm-stat-value crm-text-sm">Log hours</p>
            </Link>
          )}
          {hasPermission("projects.view") && (
            <Link to="/projects" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">Projects</p>
              <p className="crm-stat-value crm-text-sm">Tasks & work</p>
            </Link>
          )}
          {hasPermission("payroll.view") && (
            <Link to="/payroll" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">My Payslips</p>
              <p className="crm-stat-value crm-text-sm">Salary slips</p>
            </Link>
          )}
          {hasPermission("chat.view") && (
            <Link to="/chat" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">Chat</p>
              <p className="crm-stat-value crm-text-sm">Team messages</p>
            </Link>
          )}
          {(hasPermission("files.view_own") || hasPermission("files.view")) && (
            <Link to="/documents" className="crm-stat-card crm-stat-card-link">
              <p className="crm-stat-label">Documents</p>
              <p className="crm-stat-value crm-text-sm">My files</p>
            </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default EmployeeDashboard;
