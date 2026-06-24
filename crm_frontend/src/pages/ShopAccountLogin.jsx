import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ShopShell from "../components/ShopShell";
import { publicShopFetch, setStoreCustomerToken } from "../utils/ecommerce";

function ShopAccountLogin() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await publicShopFetch(companySlug, "/account/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setStoreCustomerToken(companySlug, data.access_token);
      navigate(`/s/${companySlug}/account`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <ShopShell companySlug={companySlug}>
      <div className="crm-shop-content crm-shop-auth">
        <h2>Sign in</h2>
        <form className="crm-form crm-mt" onSubmit={submit}>
          <div className="crm-form-field"><label>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="crm-form-field"><label>Password</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p className="crm-error">{error}</p>}
          <button type="submit" className="crm-btn">Sign in</button>
        </form>
        <p className="crm-mt crm-muted">No account? <Link to={`/s/${companySlug}/account/register`}>Register</Link></p>
      </div>
    </ShopShell>
  );
}

export default ShopAccountLogin;
