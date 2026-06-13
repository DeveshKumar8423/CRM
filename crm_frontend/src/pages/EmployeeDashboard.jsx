import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import SalesKpis from "../components/SalesKpis";

function EmployeeDashboard() {
  return (
    <DashboardLayout title="Employee Dashboard" roleLabel="Employee">
      <div className="crm-panel">
        <h2>Welcome</h2>
        <p>
          View <Link to="/contacts">Contacts</Link> and{" "}
          <Link to="/products">Products & Services</Link>.
        </p>
        <SalesKpis />
      </div>
    </DashboardLayout>
  );
}

export default EmployeeDashboard;
