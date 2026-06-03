import { useState } from "react";
import { useNavigate } from "react-router-dom";

function EmployeeLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const response = await fetch(
      "http://127.0.0.1:8000/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {

      if (data.role !== "Employee") {
        alert("You are not an Employee");
        return;
      }

      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);

      navigate("/employee-dashboard");

    } else {
      alert(data.detail);
    }
  };

  return (
    <div className="employee-login">
      <h1>Employee Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login}>
        Login
      </button>
    </div>
  );
}

export default EmployeeLogin;