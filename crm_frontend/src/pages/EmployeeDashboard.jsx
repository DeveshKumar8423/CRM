import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import DashboardStats from "../components/DashboardStats";

function EmployeeDashboard() {
  return (
    <DashboardLayout title="Employee Dashboard" roleLabel="Employee">
      <div className="crm-panel">
        <h2>Welcome</h2>
        <p>
          View <Link to="/contacts">Contacts</Link> and{" "}
          <Link to="/products">Products & Services</Link>.
        </p>
        <DashboardStats />
      </div>
    </DashboardLayout>
  );
}

export default EmployeeDashboard;
