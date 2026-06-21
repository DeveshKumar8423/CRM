import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { IN_REASON_LABELS, OUT_REASON_LABELS, REFERENCE_REQUIRED, emptyForm } from "../utils/stockMovements";

function StockMovementForm({ direction }) {
  const isIn = direction === "in";
  const title = isIn ? "Record Stock In" : "Record Stock Out";
  const endpoint = isIn ? "/stock-movements/in" : "/stock-movements/out";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [form, setForm] = useState(emptyForm(searchParams.get("product_id") || ""));
  const [reasons, setReasons] = useState([]);
  const [products, setProducts] = useState([]);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch(isIn ? "/stock-movements/reasons/in" : "/stock-movements/reasons/out"),
      apiFetch("/inventory?limit=200&tracked_only=true"),
    ]).then(([r, inv]) => {
      setReasons(r);
      setProducts(inv.items || []);
      if (!form.reason && r.length) setForm((f) => ({ ...f, reason: r[0].value }));
    }).catch(() => {});
  }, [isIn]);

  useEffect(() => {
    if (!form.product_id) { setPreview(null); return; }
    apiFetch(`/inventory/products/${form.product_id}`).then(setPreview).catch(() => setPreview(null));
  }, [form.product_id]);

  const projectedAfter = useMemo(() => {
    if (!preview || !form.quantity) return null;
    const qty = Number(form.quantity) || 0;
    const before = preview.on_hand_quantity;
    return isIn ? before + qty : before - qty;
  }, [preview, form.quantity, isIn]);

  const referenceRequired = REFERENCE_REQUIRED.has(form.reason);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const created = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          product_id: Number(form.product_id),
          quantity: Number(form.quantity),
          reason: form.reason,
          movement_date: new Date(`${form.movement_date}T12:00:00`).toISOString(),
          reference_number: form.reference_number || null,
          reference_type: form.reference_type || "manual",
          notes: form.notes || null,
          unit_valuation: form.unit_valuation ? Number(form.unit_valuation) : null,
        }),
      });
      navigate(`/stock-movements/${created.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const reasonLabels = isIn ? IN_REASON_LABELS : OUT_REASON_LABELS;

  return (
    <DashboardLayout title={title} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/stock-movements" className="crm-link crm-link-left">← Stock ledger</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <form onSubmit={handleSubmit} className="crm-form crm-mt">
          <div className="crm-form-grid">
            <div className="crm-span-2">
              <label>Product *</label>
              <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required>
                <option value="">Select product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.on_hand_quantity} {p.unit})</option>
                ))}
              </select>
            </div>
            <div>
              <label>Quantity *</label>
              <input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            </div>
            <div>
              <label>Movement date *</label>
              <input type="date" value={form.movement_date} onChange={(e) => setForm({ ...form, movement_date: e.target.value })} required />
            </div>
            <div>
              <label>Reason *</label>
              <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required>
                {reasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label>Reference {referenceRequired ? "*" : ""}</label>
              <input value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} required={referenceRequired} placeholder="PO / SO / GRN / transfer ref" />
            </div>
            <div className="crm-span-2">
              <label>Notes {form.reason === "other" ? "*" : ""}</label>
              <textarea className="crm-textarea" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} required={form.reason === "other"} />
            </div>
          </div>

          {preview && (
            <div className="crm-contact-meta crm-mt">
              <p><strong>On hand:</strong> {preview.on_hand_quantity} {preview.unit}</p>
              {projectedAfter != null && (
                <p><strong>After this movement:</strong> {projectedAfter} {preview.unit}</p>
              )}
              {!isIn && projectedAfter != null && projectedAfter < 0 && (
                <p className="crm-error">This would result in negative stock unless you have override permission.</p>
              )}
            </div>
          )}

          <p className="crm-muted crm-mt">Reason: {reasonLabels[form.reason] || form.reason}</p>

          <div className="crm-quote-sticky-footer crm-mt-lg">
            <button type="submit" className="crm-btn crm-btn-inline">Post {isIn ? "Stock In" : "Stock Out"}</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export function StockMovementRecordIn() {
  return <StockMovementForm direction="in" />;
}

export function StockMovementRecordOut() {
  return <StockMovementForm direction="out" />;
}

export default StockMovementRecordIn;
