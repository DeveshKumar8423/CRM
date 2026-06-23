import { Navigate } from "react-router-dom";

import { hasPermission } from "../utils/permissions";

const LOGIN_PATHS = {
  Admin: "/admin-login",
  Manager: "/manager-login",
  Employee: "/employee-login",
  Sales: "/sales-login",
  Accountant: "/accountant-login",
  User: "/user-login",
};

function ProtectedRoute({ children, allowedRoles, requiredPermission, requiredPermissions }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!token || !roles.includes(role)) {
    const redirect = LOGIN_PATHS[roles[0]] || "/";
    return <Navigate to={redirect} replace />;
  }

  const permissionCodes = requiredPermissions?.length
    ? requiredPermissions
    : requiredPermission
      ? [requiredPermission]
      : [];

  if (permissionCodes.length && !permissionCodes.some((code) => hasPermission(code))) {
    const dashboardPaths = {
      Admin: "/admin-dashboard",
      Manager: "/manager-dashboard",
      Employee: "/employee-dashboard",
      Sales: "/sales-dashboard",
      Accountant: "/accountant-dashboard",
      User: "/user-dashboard",
    };
    return <Navigate to={dashboardPaths[role] || "/"} replace />;
  }

  return children;
}

export default ProtectedRoute;
