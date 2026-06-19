import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { ADJUSTMENT_REASON_LABELS, DAMAGE_REASON_LABELS } from "../utils/inventory";

function WarehouseRecordMovement() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [movementTypes, setMovementTypes] = useState([]);
  const [damageReasons, setDamageReasons] = useState([]);
  const [adjustmentReasons, setAdjustmentReasons] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationStock, setLocationStock] = useState(null);
  const [form, setForm] = useState({
    product_id: searchParams.get("product_id") || "",
    location_id: searchParams.get("location_id") || "",
    movement_type: "receipt",
    quantity: "",
    unit_valuation: "",
    movement_date: new Date().toISOString().slice(0, 10),
    adjustment_direction: "in",
    reason: "",
    notes: "",
    reference_number: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/warehouses/movement-types"),
      apiFetch("/inventory/damage-reasons"),
      apiFetch("/inventory/adjustment-reasons"),
      apiFetch("/inventory?limit=200&tracked_only=true"),
      apiFetch("/warehouses/locations"),
    ]).then(([types, dmg, adj, inv, locs]) => {
      setMovementTypes(types);
      setDamageReasons(dmg);
      setAdjustmentReasons(adj);
      setProducts((inv.items || []).filter((p) => p.opening_recorded));
      setLocations((locs.items || []).filter((l) => l.status === "active"));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.product_id || !form.location_id) { setLocationStock(null); return; }
    apiFetch(`/warehouses/stock/product/${form.product_id}`)
      .then((data) => {
        const row = (data.items || []).find((s) => String(s.location_id) === String(form.location_id));
        setLocationStock(row || { on_hand_quantity: 0, unit_valuation: 0 });
      })
      .catch(() => setLocationStock({ on_hand_quantity: 0, unit_valuation: 0 }));
  }, [form.product_id, form.location_id]);

  const projectedAfter = () => {
    if (!locationStock || !form.quantity) return null;
    const qty = Number(form.quantity) || 0;
    const before = locationStock.on_hand_quantity;
    if (form.movement_type === "adjustment") {
      return form.adjustment_direction === "in" ? before + qty : before - qty;
    }
    if (["issue", "damage"].includes(form.movement_type)) return before - qty;
    return before + qty;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/warehouses/movements", {
        method: "POST",
        body: JSON.stringify({
          product_id: Number(form.product_id),
          location_id: Number(form.location_id),
          movement_type: form.movement_type,
          quantity: Number(form.quantity),
          unit_valuation: Number(form.unit_valuation) || locationStock?.unit_valuation || 0,
          movement_date: new Date(`${form.movement_date}T12:00:00`).toISOString(),
          adjustment_direction: form.movement_type === "adjustment" ? form.adjustment_direction : null,
          reason: form.reason || null,
          notes: form.notes || null,
          reference_number: form.reference_number || null,
        }),
      });
      navigate(`/warehouses/locations/${form.location_id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const after = projectedAfter();

  return (
    <DashboardLayout title="Record Location Movement" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/warehouses" className="crm-link crm-link-left">← Warehouses</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}

        <form onSubmit={handleSubmit} className="crm-form crm-mt">
          <div className="crm-form-grid">
            <div className="crm-span-2">
              <label>Product *</label>
              <select value={form.product_id} onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))} required>
                <option value="">Select product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="crm-span-2">
              <label>Location *</label>
              <select value={form.location_id} onChange={(e) => setForm((f) => ({ ...f, location_id: e.target.value }))} required>
                <option value="">Select location</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.path || l.name}</option>)}
              </select>
            </div>
            <div>
              <label>Movement type *</label>
              <select value={form.movement_type} onChange={(e) => setForm((f) => ({ ...f, movement_type: e.target.value, reason: "" }))}>
                {movementTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label>Date *</label>
              <input type="date" value={form.movement_date} onChange={(e) => setForm((f) => ({ ...f, movement_date: e.target.value }))} required />
            </div>
            <div>
              <label>Quantity *</label>
              <input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} required />
            </div>
            <div>
              <label>Unit valuation</label>
              <input type="number" min="0" step="0.01" value={form.unit_valuation} placeholder={locationStock?.unit_valuation ?? ""} onChange={(e) => setForm((f) => ({ ...f, unit_valuation: e.target.value }))} />
            </div>
            {form.movement_type === "adjustment" && (
              <div>
                <label>Direction *</label>
                <select value={form.adjustment_direction} onChange={(e) => setForm((f) => ({ ...f, adjustment_direction: e.target.value }))}>
                  <option value="in">Increase</option>
                  <option value="out">Decrease</option>
                </select>
              </div>
            )}
            {(form.movement_type === "damage" || form.movement_type === "adjustment") && (
              <div className="crm-span-2">
                <label>Reason *</label>
                <select value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} required>
                  <option value="">Select reason</option>
                  {(form.movement_type === "damage" ? damageReasons : adjustmentReasons).map((r) => (
                    <option key={r.value} value={r.value}>{ADJUSTMENT_REASON_LABELS[r.value] || DAMAGE_REASON_LABELS[r.value] || r.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label>Reference</label>
              <input value={form.reference_number} onChange={(e) => setForm((f) => ({ ...f, reference_number: e.target.value }))} />
            </div>
            <div className="crm-span-2">
              <label>Notes</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          {locationStock && form.quantity && (
            <p className="crm-muted crm-mt">
              Location quantity before: <strong>{locationStock.on_hand_quantity}</strong>
              {" → "}
              after: <strong>{after}</strong>
              {after < 0 && <span className="crm-error"> (negative — override permission required)</span>}
            </p>
          )}

          <button type="submit" className="crm-btn crm-btn-inline crm-mt">Save movement</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default WarehouseRecordMovement;
