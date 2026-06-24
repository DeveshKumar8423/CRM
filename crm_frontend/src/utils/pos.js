import { apiFetch } from "./api";

const SESSION_KEY = "pos_session_id";

export function getPosSessionId() {
  return localStorage.getItem(SESSION_KEY) || "";
}

export function setPosSessionId(id) {
  if (id) localStorage.setItem(SESSION_KEY, String(id));
  else localStorage.removeItem(SESSION_KEY);
}

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);
}

export async function posFetch(path, options = {}) {
  const sessionId = getPosSessionId();
  const headers = { ...(options.headers || {}) };
  if (sessionId && path.startsWith("/pos/terminal")) {
    headers["X-Pos-Session-Id"] = sessionId;
  }
  return apiFetch(path, { ...options, headers });
}
