import { clearPermissions, setPermissions } from "./permissions";

export const API_URL = "http://127.0.0.1:8000";

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function saveSession(data) {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("name", data.name);
  localStorage.setItem("email", data.email);
  setPermissions(data.permissions || []);
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
  clearPermissions();
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.detail || "Request failed";
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}
