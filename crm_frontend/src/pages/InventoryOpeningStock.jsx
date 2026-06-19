import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

function InventoryOpeningStock() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_id: searchParams.get("product_id") || "",
    quantity: "",
    unit_valuation: "",
    movement_date: new Date().toISOString().slice(0, 10),
    reference_number: "",
    notes: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/inventory?limit=200&tracked_only=true").then((data) => {
      setProducts((data.items || []).filter((p) => !p.opening_recorded));
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch(`/inventory/products/${form.product_id}/opening-stock`, {
        method: "POST",
        body: JSON.stringify({
          quantity: Number(form.quantity),
          unit_valuation: Number(form.unit_valuation),
          movement_date: new Date(`${form.movement_date}T12:00:00`).toISOString(),
          reference_number: form.reference_number || null,
          notes: form.notes || null,
        }),
      });
      navigate(`/inventory/${form.product_id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="Opening Stock" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/inventory" className="crm-link crm-link-left">← Inventory</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}

        <form onSubmit={handleSubmit} className="crm-form crm-mt">
          <div className="crm-form-grid">
            <div className="crm-span-2">
              <label>Product *</label>
              <select value={form.product_id} onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))} required>
                <option value="">Select product awaiting opening stock</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label>Opening quantity *</label>
              <input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} required />
            </div>
            <div>
              <label>Unit valuation *</label>
              <input type="number" min="0" step="0.01" value={form.unit_valuation} onChange={(e) => setForm((f) => ({ ...f, unit_valuation: e.target.value }))} required />
            </div>
            <div>
              <label>Effective date *</label>
              <input type="date" value={form.movement_date} onChange={(e) => setForm((f) => ({ ...f, movement_date: e.target.value }))} required />
            </div>
            <div>
              <label>Reference</label>
              <input value={form.reference_number} onChange={(e) => setForm((f) => ({ ...f, reference_number: e.target.value }))} />
            </div>
            <div className="crm-span-2">
              <label>Notes</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="crm-btn crm-btn-inline crm-mt">Save opening stock</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default InventoryOpeningStock;
