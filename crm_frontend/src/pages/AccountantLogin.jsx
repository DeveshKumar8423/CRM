import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginRequest, saveSession } from "../utils/api";

function AccountantLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginRequest(email, password);
      if (data.role !== "Accountant") {
        setError("You are not an Accountant");
        return;
      }
      saveSession(data);
      navigate("/accountant-dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="crm-card">
      <h2>Accountant Login</h2>
      <form onSubmit={handleSubmit} className="crm-form">
        <label htmlFor="acct-email">Email</label>
        <input id="acct-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="acct-password">Password</label>
        <input id="acct-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="crm-error">{error}</p>}
        <button type="submit" className="crm-btn">Sign in</button>
      </form>
      <Link to="/" className="crm-link">
        Back to home
      </Link>
    </div>
  );
}

export default AccountantLogin;
