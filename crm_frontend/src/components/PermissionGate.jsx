import { hasPermission } from "../utils/permissions";

function PermissionGate({ permission, children, fallback = null }) {
  if (!hasPermission(permission)) {
    return fallback;
  }
  return children;
}

export default PermissionGate;
