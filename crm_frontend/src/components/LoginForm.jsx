import { useState } from "react";
import { Link } from "react-router-dom";

function LoginForm({ title, credentials, onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (
      username === credentials.username &&
      password === credentials.password
    ) {
      onSuccess();
      return;
    }

    setError("Invalid username or password.");
  };

  return (
    <div className="crm-card">
      <h2>{title}</h2>
      <form onSubmit={handleSubmit} className="crm-form">
        <label htmlFor={`${title}-username`}>Username</label>
        <input
          id={`${title}-username`}
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor={`${title}-password`}>Password</label>
        <input
          id={`${title}-password`}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
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

export default LoginForm;
