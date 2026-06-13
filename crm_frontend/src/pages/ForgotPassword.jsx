import { useState } from "react";

import { API_URL } from "../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Unexpected error");
      }
      setMessage(data.message || "If the account exists, a reset link has been sent.");
      setStatus("success");
    } catch (err) {
      setMessage(err.message || "Unexpected error");
      setStatus("error");
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>
      {status === "success" ? (
        <p className="success">{message}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Sending…" : "Send Reset Link"}
          </button>
          {status === "error" && <p className="error">{message}</p>}
        </form>
      )}
    </div>
  );
}
