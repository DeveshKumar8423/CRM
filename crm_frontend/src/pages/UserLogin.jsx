import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { API_URL, saveSession } from "../utils/api";

function UserLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.detail || "Login failed");
      return;
    }

    if (data.role !== "User") {
      setError("This account is not a User account");
      return;
    }

    saveSession(data);
    navigate("/user-dashboard");
  };

  return (
    <div className="crm-card">
      <h2>User Sign In</h2>
      <form onSubmit={handleSubmit} className="crm-form">
        <label htmlFor="user-email">Email</label>
        <input
          id="user-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="user-password">Password</label>
        <input
          id="user-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="crm-error">{error}</p>}

        <button type="submit" className="crm-btn">
          Sign In
        </button>
      </form>

      <p className="crm-auth-switch">
        Don&apos;t have an account?{" "}
        <Link to="/user-signup">Sign up</Link>
      </p>

      <Link to="/" className="crm-link">
        Back to home
      </Link>
    </div>
  );
}

export default UserLogin;
