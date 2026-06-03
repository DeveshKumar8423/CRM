import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const role = localStorage.getItem("role");

  if (role !== allowedRole) {
    const loginPath =
      allowedRole === "admin"
        ? "/admin-login"
        : allowedRole === "manager"
          ? "/manager-login"
          : "/employee-login";
    return <Navigate to={loginPath} replace />;
  }

  return children;
}

export default ProtectedRoute;
