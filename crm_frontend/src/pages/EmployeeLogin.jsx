import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import {Link} from "react-router-dom";

function EmployeeLogin() {
  const navigate = useNavigate();

  return (
 
    
    <div className="employee-login">
      <h1>Employee Login</h1>
    
      <input type="email" placeholder="email"></input>
      <input type="password" placeholder="password"></input>

      <Link to={"/employee-dashboard"}>

        <button>Login</button>

      </Link>

     



    </div>

  );
}

export default EmployeeLogin;
