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

export async function loginRequest(email, password) {
  let response;
  try {
    response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(
      "Cannot reach the server. Make sure the backend is running on port 8000.",
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.detail || "Login failed. Check your email and password.";
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}

export async function apiFetch(path, options = {}) {
  const authHeaders = getAuthHeaders();
  if (options.body instanceof FormData) {
    delete authHeaders["Content-Type"];
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders,
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
