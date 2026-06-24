import { Link, useLocation, useParams } from "react-router-dom";

import ShopShell from "../components/ShopShell";

function ShopConfirmation() {
  const { companySlug, orderNumber } = useParams();
  const location = useLocation();
  const message = location.state?.message || "Thank you for your order.";

  return (
    <ShopShell companySlug={companySlug}>
      <div className="crm-shop-content crm-shop-confirmation">
        <h2>Order confirmed</h2>
        <p className="crm-success">{message}</p>
        <p>Order number: <strong>{orderNumber}</strong></p>
        <div className="crm-inline-actions crm-mt">
          <Link to={`/s/${companySlug}/shop`} className="crm-btn crm-btn-outline">Continue shopping</Link>
          <Link to={`/s/${companySlug}/account/register`} className="crm-btn">Create account</Link>
        </div>
      </div>
    </ShopShell>
  );
}

export default ShopConfirmation;
