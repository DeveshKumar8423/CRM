import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import SalesKpis from "../components/SalesKpis";
import { apiFetch } from "../utils/api";

function AdminDashboard() {
  const [companyName, setCompanyName] = useState(null);
  const [companyMissing, setCompanyMissing] = useState(false);

  useEffect(() => {
    apiFetch("/admin/company")
      .then((data) => setCompanyName(data.display_name))
      .catch(() => setCompanyMissing(true));
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard" roleLabel="Admin">
      {companyMissing && (
        <div className="crm-alert crm-alert-warn">
          <p>
            <strong>Company setup required.</strong> Complete your business
            profile before adding more modules.
          </p>
          <Link to="/admin/company" className="crm-btn crm-btn-inline">
            Set up company
          </Link>
        </div>
      )}

      <div className="crm-panel">
        <h2>Welcome, Admin</h2>
        {companyName && (
          <p>
            Managing <strong>{companyName}</strong>
          </p>
        )}
        <p>
          Use <Link to="/contacts">Contacts</Link> for clients,{" "}
          <Link to="/products">Products & Services</Link> for your service
          catalogue, and <Link to="/admin/users">User Management</Link> for
          staff.
        </p>
        <SalesKpis />
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
