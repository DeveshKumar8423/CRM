export function getPermissions() {
  try {
    const raw = localStorage.getItem("permissions");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setPermissions(permissions) {
  localStorage.setItem("permissions", JSON.stringify(permissions || []));
}

export function clearPermissions() {
  localStorage.removeItem("permissions");
}

export function hasPermission(code) {
  return getPermissions().includes(code);
}

export function hasAnyPermission(codes) {
  const perms = getPermissions();
  return codes.some((code) => perms.includes(code));
}
