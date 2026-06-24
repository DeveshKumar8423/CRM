import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatINR } from "../utils/ecommerce";

function EcommerceCatalog() {
  const role = localStorage.getItem("role") || "Staff";
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const load = () => apiFetch("/ecommerce/catalog").then(setItems).catch((err) => setError(err.message));

  useEffect(() => { load(); }, []);

  const toggle = async (productId, sellOnline) => {
    try {
      await apiFetch(`/ecommerce/catalog/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ sell_online: sellOnline }),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="Online catalog" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/ecommerce" className="crm-muted">← Online Store</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>Product</th><th>Price</th><th>Sell online</th><th>Slug</th><th></th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{formatINR(p.price)}</td>
                <td>
                  <input type="checkbox" checked={p.sell_online} onChange={(e) => toggle(p.id, e.target.checked)} />
                </td>
                <td>{p.online_slug || "—"}</td>
                <td>{p.public_url && <a href={p.public_url} target="_blank" rel="noreferrer">Preview</a>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default EcommerceCatalog;
