import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import RoleHomePage from "../components/RoleHomePage";
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
    <DashboardLayout title="Admin" roleLabel="Admin">
      {companyMissing && (
        <div className="crm-alert crm-alert-warn crm-role-home-alert">
          <p>
            <strong>Company setup required.</strong> Complete your business
            profile before adding more modules.
          </p>
          <Link to="/admin/company" className="crm-btn crm-btn-inline">
            Set up company
          </Link>
        </div>
      )}

      <RoleHomePage
        greeting={companyName ? `Managing ${companyName}` : "Admin workspace"}
        subtitle="Open any module below — CRM, billing, HR, inventory, and settings."
        launcherSubtitle="Everything your team needs, organised by category."
      />
    </DashboardLayout>
  );
}

export default AdminDashboard;
