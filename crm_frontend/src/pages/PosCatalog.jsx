import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatINR } from "../utils/pos";

function PosCatalog() {
  const role = localStorage.getItem("role") || "Staff";
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const load = () => apiFetch("/pos/catalog").then(setItems).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);

  const toggle = async (productId, sellAtPos) => {
    await apiFetch(`/pos/catalog/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ sell_at_pos: sellAtPos }),
    });
    load();
  };

  return (
    <DashboardLayout title="POS catalog" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/pos" className="crm-muted">← Point of Sale</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead><tr><th>Product</th><th>Price</th><th>Category</th><th>Sell at POS</th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{formatINR(p.price)}</td>
                <td>{p.pos_category || "—"}</td>
                <td><input type="checkbox" checked={p.sell_at_pos} onChange={(e) => toggle(p.id, e.target.checked)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default PosCatalog;
