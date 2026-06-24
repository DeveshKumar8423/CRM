export const ROLE_HOME = {
  Admin: { path: "/admin-dashboard", label: "Admin" },
  Manager: { path: "/manager-dashboard", label: "Manager" },
  Employee: { path: "/employee-dashboard", label: "Employee" },
  Sales: { path: "/sales-dashboard", label: "Sales" },
  Accountant: { path: "/accountant-dashboard", label: "Accountant" },
  User: { path: "/user-dashboard", label: "User" },
};

export function getRoleHomePath(role = localStorage.getItem("role")) {
  return ROLE_HOME[role]?.path || "/";
}

export function getRoleLabel(role = localStorage.getItem("role")) {
  return ROLE_HOME[role]?.label || role || "Staff";
}

export function isRoleHomePath(pathname) {
  return Object.values(ROLE_HOME).some((entry) => entry.path === pathname);
}
