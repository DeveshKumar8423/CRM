import { useNavigate } from "react-router-dom";

function DashboardLayout({ title, roleLabel, children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="crm-dashboard">
      <header className="crm-dashboard-header">
        <div>
          <p className="crm-role-badge">{roleLabel}</p>
          <h1>{title}</h1>
        </div>
        <button type="button" className="crm-btn crm-btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className="crm-dashboard-main">{children}</main>
    </div>
  );
}

export default DashboardLayout;
