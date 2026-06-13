import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginRequest, saveSession } from "../utils/api";

function EmployeeLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let data;
    try {
      data = await loginRequest(email, password);
    } catch (err) {
      setError(err.message);
      return;
    }

    if (data.role !== "Employee") {
      setError("You are not an Employee");
      return;
    }

    saveSession(data);
    navigate("/employee-dashboard");
  };

  return (
    <div className="crm-card">
      <h2>Employee Login</h2>
      <form onSubmit={handleSubmit} className="crm-form">
        <label htmlFor="employee-email">Email</label>
        <input
          id="employee-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="employee-password">Password</label>
        <input
          id="employee-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="crm-error">{error}</p>}

        <button type="submit" className="crm-btn">
          Login
        </button>
      </form>

      <Link to="/" className="crm-link">
        Back to home
      </Link>
    </div>
  );
}

export default EmployeeLogin;
