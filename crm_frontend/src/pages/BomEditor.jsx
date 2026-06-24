import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatQty } from "../utils/manufacturing";
import { hasPermission } from "../utils/permissions";

const emptyLine = () => ({ component_product_id: "", quantity: "1", scrap_pct: "0" });

function BomEditor() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_id: "",
    name: "",
    version: "1.0",
    output_qty: "1",
    output_uom: "Unit",
    notes: "",
    lines: [emptyLine()],
  });
  const [explodeQty, setExplodeQty] = useState("100");
  const [explode, setExplode] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/products?limit=100").then((d) => setProducts(d.items || d)).catch((err) => setError(err.message));
    if (!isNew) {
      apiFetch(`/manufacturing/boms/${id}`).then((bom) => {
        setForm({
          product_id: String(bom.product_id),
          name: bom.name,
          version: bom.version,
          output_qty: String(bom.output_qty),
          output_uom: bom.output_uom,
          notes: bom.notes || "",
          lines: bom.lines.map((l) => ({
            component_product_id: String(l.component_product_id),
            quantity: String(l.quantity),
            scrap_pct: String(l.scrap_pct),
          })),
        });
      }).catch((err) => setError(err.message));
    }
  }, [id, isNew]);

  const fgProducts = products.filter((p) => p.is_manufactured);
  const rmProducts = products;

  const setLine = (idx, key, value) => {
    setForm((f) => {
      const lines = [...f.lines];
      lines[idx] = { ...lines[idx], [key]: value };
      return { ...f, lines };
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      product_id: Number(form.product_id),
      name: form.name,
      version: form.version,
      output_qty: Number(form.output_qty),
      output_uom: form.output_uom,
      notes: form.notes || null,
      lines: form.lines
        .filter((l) => l.component_product_id)
        .map((l, i) => ({
          component_product_id: Number(l.component_product_id),
          quantity: Number(l.quantity),
          scrap_pct: Number(l.scrap_pct || 0),
          sort_order: i,
        })),
    };
    try {
      const bom = isNew
        ? await apiFetch("/manufacturing/boms", { method: "POST", body: JSON.stringify(payload) })
        : await apiFetch(`/manufacturing/boms/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      navigate(`/manufacturing/boms/${bom.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const activate = async () => {
    try {
      await apiFetch(`/manufacturing/boms/${id}/activate`, { method: "POST" });
      const bom = await apiFetch(`/manufacturing/boms/${id}`);
      setForm((f) => ({ ...f, status: bom.status }));
      setMessage("BOM activated");
    } catch (err) {
      setError(err.message);
    }
  };

  const runExplode = async () => {
    try {
      const data = await apiFetch(`/manufacturing/boms/${id}/explode?qty=${explodeQty}`);
      setExplode(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title={isNew ? "New BOM" : "Edit BOM"} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/manufacturing/boms" className="crm-muted">← BOMs</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}
        <form className="crm-form crm-mt" onSubmit={save}>
          <div className="crm-form-field">
            <label>Finished product</label>
            <select required value={form.product_id} onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))} disabled={!isNew}>
              <option value="">Select</option>
              {(fgProducts.length ? fgProducts : products).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="crm-form-field"><label>Name</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div className="crm-form-field"><label>Version</label><input value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} /></div>
          <div className="crm-form-field"><label>Output qty (batch)</label><input type="number" min="0.01" value={form.output_qty} onChange={(e) => setForm((f) => ({ ...f, output_qty: e.target.value }))} /></div>
          <div className="crm-form-field"><label>Output UOM</label><input value={form.output_uom} onChange={(e) => setForm((f) => ({ ...f, output_uom: e.target.value }))} /></div>
          <h3>Components</h3>
          {form.lines.map((line, idx) => (
            <div key={idx} className="crm-form crm-mt" style={{ borderBottom: "1px solid var(--crm-border)", paddingBottom: 12 }}>
              <div className="crm-form-field">
                <label>Component</label>
                <select value={line.component_product_id} onChange={(e) => setLine(idx, "component_product_id", e.target.value)}>
                  <option value="">Select</option>
                  {rmProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="crm-form-field">
                <label>Qty per batch</label>
                <input type="number" min="0.0001" step="any" value={line.quantity} onChange={(e) => setLine(idx, "quantity", e.target.value)} />
              </div>
              <div className="crm-form-field">
                <label>Scrap %</label>
                <input type="number" min="0" value={line.scrap_pct} onChange={(e) => setLine(idx, "scrap_pct", e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button" className="crm-btn crm-btn-sm crm-btn-outline crm-mt" onClick={() => setForm((f) => ({ ...f, lines: [...f.lines, emptyLine()] }))}>Add line</button>
          <div className="crm-form-field crm-mt"><label>Notes</label><textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          {hasPermission("manufacturing.manage_bom") && (
            <button type="submit" className="crm-btn crm-mt" disabled={saving}>{saving ? "Saving…" : "Save BOM"}</button>
          )}
        </form>
        {!isNew && hasPermission("manufacturing.manage_bom") && (
          <div className="crm-mt">
            <button type="button" className="crm-btn crm-btn-sm" onClick={activate}>Activate BOM</button>
            <div className="crm-form crm-mt" style={{ maxWidth: 320 }}>
              <div className="crm-form-field">
                <label>Preview explosion qty</label>
                <input type="number" value={explodeQty} onChange={(e) => setExplodeQty(e.target.value)} />
              </div>
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={runExplode}>Explode</button>
            </div>
            {explode && (
              <table className="crm-table crm-mt mfg-shortage-table">
                <thead><tr><th>Component</th><th>Required</th><th>On hand</th><th>Short</th></tr></thead>
                <tbody>
                  {explode.lines.map((l) => (
                    <tr key={l.component_product_id} className={l.shortage > 0 ? "mfg-shortage-row" : ""}>
                      <td>{l.component_product_name}</td>
                      <td>{formatQty(l.required_qty)} {l.unit}</td>
                      <td>{formatQty(l.on_hand)}</td>
                      <td>{l.shortage > 0 ? formatQty(l.shortage) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default BomEditor;
