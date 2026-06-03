import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import {Link} from "react-router-dom";

function ManagerLogin() {
  const navigate = useNavigate();

  return (
  

    <div className="manager-login">
      <h1>Manager Login</h1>                                                                               

      <input type="email" placeholder="email"></input>
      <input type="password" placeholder="password"></input>
                                          
      <Link to={"/manager-dashboard"}>

        <button>Login</button>

      </Link>

     



    </div>
  );
}

export default ManagerLogin;
