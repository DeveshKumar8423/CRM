import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

function WarehouseTransfer() {
  const [searchParams] = useSearchParams();
  const role = localStorage.getItem("role") || "Staff";
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sourceStock, setSourceStock] = useState(null);
  const [form, setForm] = useState({
    product_id: searchParams.get("product_id") || "",
    source_location_id: searchParams.get("source_location_id") || "",
    destination_location_id: "",
    quantity: "",
    movement_date: new Date().toISOString().slice(0, 10),
    notes: "",
    reference_number: "",
  });
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    Promise.all([
      apiFetch("/inventory?limit=200&tracked_only=true"),
      apiFetch("/warehouses/locations"),
    ]).then(([inv, locs]) => {
      setProducts((inv.items || []).filter((p) => p.opening_recorded));
      setLocations((locs.items || []).filter((l) => l.status === "active"));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.product_id || !form.source_location_id) { setSourceStock(null); return; }
    apiFetch(`/warehouses/stock/product/${form.product_id}`)
      .then((data) => {
        const row = (data.items || []).find((s) => String(s.location_id) === String(form.source_location_id));
        setSourceStock(row || { on_hand_quantity: 0 });
      })
      .catch(() => setSourceStock({ on_hand_quantity: 0 }));
  }, [form.product_id, form.source_location_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const res = await apiFetch("/warehouses/transfers", {
        method: "POST",
        body: JSON.stringify({
          product_id: Number(form.product_id),
          source_location_id: Number(form.source_location_id),
          destination_location_id: Number(form.destination_location_id),
          quantity: Number(form.quantity),
          movement_date: new Date(`${form.movement_date}T12:00:00`).toISOString(),
          notes: form.notes || null,
          reference_number: form.reference_number || null,
        }),
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    }
  };

  const destOptions = locations.filter((l) => String(l.id) !== String(form.source_location_id));

  return (
    <DashboardLayout title="Transfer Stock" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/warehouses" className="crm-link crm-link-left">← Warehouses</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}

        {result ? (
          <div className="crm-mt">
            <p className="crm-success">Transfer {result.transfer_reference} completed.</p>
            <div className="crm-stats-grid crm-mt">
              <div className="crm-stat-card">
                <p className="crm-stat-label">From</p>
                <p className="crm-stat-value crm-stat-value-sm">{result.transfer_out.location_path}</p>
                <p className="crm-muted">{result.transfer_out.quantity_before} → {result.transfer_out.quantity_after}</p>
              </div>
              <div className="crm-stat-card">
                <p className="crm-stat-label">To</p>
                <p className="crm-stat-value crm-stat-value-sm">{result.transfer_in.location_path}</p>
                <p className="crm-muted">{result.transfer_in.quantity_before} → {result.transfer_in.quantity_after}</p>
              </div>
            </div>
            <div className="crm-inline-actions crm-mt">
              <button type="button" className="crm-btn crm-btn-outline" onClick={() => { setResult(null); setForm((f) => ({ ...f, quantity: "" })); }}>Another transfer</button>
              <Link to="/warehouses/transfers" className="crm-btn crm-btn-inline">View history</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="crm-form crm-mt">
            <div className="crm-form-grid">
              <div className="crm-span-2">
                <label>Product *</label>
                <select value={form.product_id} onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))} required>
                  <option value="">Select product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label>Source location *</label>
                <select value={form.source_location_id} onChange={(e) => setForm((f) => ({ ...f, source_location_id: e.target.value }))} required>
                  <option value="">Select source</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.path || l.name}</option>)}
                </select>
              </div>
              <div>
                <label>Destination location *</label>
                <select value={form.destination_location_id} onChange={(e) => setForm((f) => ({ ...f, destination_location_id: e.target.value }))} required>
                  <option value="">Select destination</option>
                  {destOptions.map((l) => <option key={l.id} value={l.id}>{l.path || l.name}</option>)}
                </select>
              </div>
              <div>
                <label>Quantity *</label>
                <input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} required />
              </div>
              <div>
                <label>Transfer date *</label>
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

            {sourceStock && form.quantity && (
              <p className="crm-muted crm-mt">
                Available at source: <strong>{sourceStock.on_hand_quantity}</strong>
                {" → "}
                after transfer: <strong>{sourceStock.on_hand_quantity - Number(form.quantity)}</strong>
              </p>
            )}

            <button type="submit" className="crm-btn crm-btn-inline crm-mt">Confirm transfer</button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default WarehouseTransfer;
