import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

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

    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);
    localStorage.setItem("email", data.email);

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
