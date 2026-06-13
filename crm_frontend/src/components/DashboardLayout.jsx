import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { API_URL, apiFetch, clearSession, getAuthHeaders } from "../utils/api";
import { getPermissions, hasPermission, setPermissions } from "../utils/permissions";

function isNavActive(pathname, to) {
  switch (to) {
    case "/profile":
      return pathname === "/profile";
    case "/leads":
      return pathname === "/leads" || pathname.startsWith("/leads/");
    case "/pipeline":
      return pathname === "/pipeline" || pathname === "/deals" || pathname.startsWith("/deals/");
    case "/follow-ups":
      return pathname === "/follow-ups" || pathname.startsWith("/follow-ups/") || pathname === "/client-notes/follow-ups";
    case "/quotations":
      return pathname === "/quotations" || pathname.startsWith("/quotations/");
    case "/sales-orders":
      return pathname === "/sales-orders" || pathname.startsWith("/sales-orders/");
    case "/invoices":
      return pathname === "/invoices" || pathname.startsWith("/invoices/");
    case "/payments":
      return pathname === "/payments";
    case "/client-notes":
      return (pathname === "/client-notes" || pathname.startsWith("/client-notes/")) && pathname !== "/client-notes/follow-ups";
    case "/sales-reports":
      return pathname === "/sales-reports";
    case "/contacts":
      return pathname === "/contacts" || pathname.startsWith("/contacts/");
    case "/products":
      return pathname === "/products" || pathname.startsWith("/products/");
    case "/admin/company":
      return pathname === "/admin/company";
    case "/admin/users":
      return pathname === "/admin/users";
    case "/admin/activity-logs":
      return pathname === "/admin/activity-logs";
    default:
      return pathname === to || pathname.startsWith(`${to}/`);
  }
}

function navLinkClass(pathname, to) {
  return `crm-nav-link${isNavActive(pathname, to) ? " crm-nav-link-active" : ""}`;
}

function DashboardLayout({ title, roleLabel, children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
          <Link to="/profile" className={navLinkClass(pathname, "/profile")}>
            My Profile
          </Link>
          {hasPermission("leads.view") && (
            <Link to="/leads" className={navLinkClass(pathname, "/leads")}>
              Leads
            </Link>
          )}
          {hasPermission("deals.view") && (
            <Link to="/pipeline" className={navLinkClass(pathname, "/pipeline")}>
              Pipeline
            </Link>
          )}
          {hasPermission("reminders.view") && (
            <Link to="/follow-ups" className={navLinkClass(pathname, "/follow-ups")}>
              Follow-ups
            </Link>
          )}
          {hasPermission("quotations.view") && (
            <Link to="/quotations" className={navLinkClass(pathname, "/quotations")}>
              Quotations
            </Link>
          )}
          {hasPermission("sales_orders.view") && (
            <Link to="/sales-orders" className={navLinkClass(pathname, "/sales-orders")}>
              Orders
            </Link>
          )}
          {hasPermission("invoices.view") && (
            <Link to="/invoices" className={navLinkClass(pathname, "/invoices")}>
              Invoices
            </Link>
          )}
          {hasPermission("payments.view") && (
            <Link to="/payments" className={navLinkClass(pathname, "/payments")}>
              Payments
            </Link>
          )}
          {hasPermission("client_notes.view") && (
            <Link to="/client-notes" className={navLinkClass(pathname, "/client-notes")}>
              Notes
            </Link>
          )}
          {hasPermission("reports.view") && (
            <Link to="/sales-reports" className={navLinkClass(pathname, "/sales-reports")}>
              Reports
            </Link>
          )}
          {hasPermission("contacts.view") && (
            <Link to="/contacts" className={navLinkClass(pathname, "/contacts")}>
              Contacts
            </Link>
          )}
          {hasPermission("products.view") && (
            <Link to="/products" className={navLinkClass(pathname, "/products")}>
              Products
            </Link>
          )}
          {hasPermission("company.view") && (
            <Link to="/admin/company" className={navLinkClass(pathname, "/admin/company")}>
              Company Settings
            </Link>
          )}
          {hasPermission("users.view") && (
            <Link to="/admin/users" className={navLinkClass(pathname, "/admin/users")}>
              User Management
            </Link>
          )}
          {hasPermission("activity.view") && (
            <Link to="/admin/activity-logs" className={navLinkClass(pathname, "/admin/activity-logs")}>
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
