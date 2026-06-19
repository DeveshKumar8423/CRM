import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { API_URL } from "../utils/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const validate = () => {
    if (!newPassword || !confirmPassword) {
      setMessage("Both fields are required.");
      setStatus("error");
      return false;
    }
    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters.");
      setStatus("error");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setStatus("error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validate()) return;
    setStatus("loading");
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Unexpected error");
      }
      setMessage(data.message || "Password reset successfully.");
      setStatus("success");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err.message || "Unexpected error");
      setStatus("error");
    }
  };

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      {status === "success" ? (
        <p className="success">{message}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            New Password
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Resetting…" : "Reset Password"}
          </button>
          {status === "error" && <p className="error">{message}</p>}
        </form>
      )}
    </div>
  );
}
