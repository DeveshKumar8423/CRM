import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { API_URL, apiFetch, clearSession, getAuthHeaders } from "../utils/api";
import { getPermissions, hasPermission, setPermissions } from "../utils/permissions";

function DashboardLayout({ title, roleLabel, children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (localStorage.getItem("token") && getPermissions().length === 0) {
      apiFetch("/users/me/permissions")
        .then((data) => setPermissions(data.permissions))
        .catch(() => {});
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
    } catch {
      // still clear local session if API is unreachable
    }
    clearSession();
    navigate("/");
  };

  return (
    <div className="crm-dashboard">
      <header className="crm-dashboard-header">
        <div>
          <p className="crm-role-badge">{roleLabel}</p>
          <h1>{title}</h1>
        </div>
        <nav className="crm-dashboard-nav">
          <Link to="/profile" className="crm-nav-link">
            My Profile
          </Link>
          {hasPermission("contacts.view") && (
            <Link to="/contacts" className="crm-nav-link">
              Contacts
            </Link>
          )}
          {hasPermission("products.view") && (
            <Link to="/products" className="crm-nav-link">
              Products
            </Link>
          )}
          {hasPermission("company.view") && (
            <Link to="/admin/company" className="crm-nav-link">
              Company Settings
            </Link>
          )}
          {hasPermission("users.view") && (
            <Link to="/admin/users" className="crm-nav-link">
              User Management
            </Link>
          )}
          {hasPermission("activity.view") && (
            <Link to="/admin/activity-logs" className="crm-nav-link">
              Activity Logs
            </Link>
          )}
          <button
            type="button"
            className="crm-btn crm-btn-outline crm-btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </header>
      <main className="crm-dashboard-main">{children}</main>
    </div>
  );
}

export default DashboardLayout;
