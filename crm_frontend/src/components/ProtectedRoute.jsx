import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const role = localStorage.getItem("role");

  if (role !== allowedRole) {
    const loginPaths = {
      Admin: "/admin-login",
      Manager: "/manager-login",
      Employee: "/employee-login",
      User: "/user-login",
    };
    return <Navigate to={loginPaths[allowedRole] || "/"} replace />;
  }

  return children;
}

export default ProtectedRoute;
