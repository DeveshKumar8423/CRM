import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { Link } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  return (

  <div className="admin-login">
  <h1>Admin Login</h1>

  

  <input type="email" placeholder="Email" />
  <input type="password" placeholder="Password" />

  <Link to="/admin-dashboard">
    <button>Login</button>
  </Link>
</div>
    
  );
}

export default AdminLogin;
