import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginRequest, saveSession } from "../utils/api";

function SalesLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginRequest(email, password);
      if (data.role !== "Sales") {
        setError("You are not a Sales user");
        return;
      }
      saveSession(data);
      navigate("/sales-dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="crm-card">
      <h2>Sales Login</h2>
      <form onSubmit={handleSubmit} className="crm-form">
        <label htmlFor="sales-email">Email</label>
        <input id="sales-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="sales-password">Password</label>
        <input id="sales-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="crm-error">{error}</p>}
        <button type="submit" className="crm-btn">Sign in</button>
      </form>
      <Link to="/" className="crm-link">
        Back to home
      </Link>
    </div>
  );
}

export default SalesLogin;
