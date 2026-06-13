import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import DashboardStats from "../components/DashboardStats";
import { hasPermission } from "../utils/permissions";

function ManagerDashboard() {
  return (
    <DashboardLayout title="Manager Dashboard" roleLabel="Manager">
      <div className="crm-panel">
        <h2>Welcome, Manager</h2>
        <p>
          Browse <Link to="/contacts">Contacts</Link> and{" "}
          <Link to="/products">Products & Services</Link>.
          {hasPermission("reports.view") && (
            <> View <Link to="/sales-reports">Sales Reports</Link>.</>
          )}
        </p>
        <DashboardStats />
      </div>
    </DashboardLayout>
  );
}

export default ManagerDashboard;
