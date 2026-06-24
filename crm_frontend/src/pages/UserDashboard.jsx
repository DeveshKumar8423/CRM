import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import AppLauncher from "../components/AppLauncher";

function UserDashboard() {
  const name = localStorage.getItem("name");

  return (
    <DashboardLayout title="Portal" roleLabel="User">
      <div className="crm-role-home">
        <header className="crm-role-home-hero">
          <div>
            <p className="crm-role-home-eyebrow">Portal account</p>
            <h1>{name ? `Welcome, ${name}` : "Welcome"}</h1>
            <p className="crm-role-home-sub">
              Your client portal — profile and notifications.
            </p>
          </div>
        </header>
        <div className="crm-role-home-portal-links">
          <Link to="/profile" className="crm-btn crm-btn-primary">
            My profile
          </Link>
        </div>
        <AppLauncher
          title="Your apps"
          groupByCategory={false}
          className="crm-role-home-launcher"
        />
      </div>
    </DashboardLayout>
  );
}

export default UserDashboard;
