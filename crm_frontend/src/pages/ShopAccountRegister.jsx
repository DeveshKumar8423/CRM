import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ShopShell from "../components/ShopShell";
import { publicShopFetch, setStoreCustomerToken } from "../utils/ecommerce";

function ShopAccountRegister() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await publicShopFetch(companySlug, "/account/register", {
        method: "POST",
        body: JSON.stringify(form),
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
        <h2>Create account</h2>
        <form className="crm-form crm-mt" onSubmit={submit}>
          {["name", "email", "phone", "password"].map((key) => (
            <div className="crm-form-field" key={key}>
              <label>{key === "password" ? "Password" : key[0].toUpperCase() + key.slice(1)}</label>
              <input
                type={key === "email" ? "email" : key === "password" ? "password" : key === "phone" ? "tel" : "text"}
                required={key !== "phone"}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          {error && <p className="crm-error">{error}</p>}
          <button type="submit" className="crm-btn">Register</button>
        </form>
        <p className="crm-mt crm-muted">Already have an account? <Link to={`/s/${companySlug}/account/login`}>Sign in</Link></p>
      </div>
    </ShopShell>
  );
}

export default ShopAccountRegister;
