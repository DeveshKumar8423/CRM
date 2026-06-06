import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { API_URL, saveSession } from "../utils/api";

function UserSignup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: phone || null,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.detail || "Signup failed");
      return;
    }

    saveSession(data);
    navigate("/user-dashboard");
  };

  return (
    <div className="crm-card">
      <h2>User Sign Up</h2>
      <form onSubmit={handleSubmit} className="crm-form">
        <label htmlFor="user-name">Name</label>
        <input
          id="user-name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />

        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="signup-phone">Phone (optional)</label>
        <input
          id="signup-phone"
          type="tel"
          placeholder="Enter your phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />

        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />

        {error && <p className="crm-error">{error}</p>}

        <button type="submit" className="crm-btn">
          Sign Up
        </button>
      </form>

      <p className="crm-auth-switch">
        Already have an account?{" "}
        <Link to="/user-login">Sign in</Link>
      </p>

      <Link to="/" className="crm-link">
        Back to home
      </Link>
    </div>
  );
}

export default UserSignup;
