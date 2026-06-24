import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

const emptyItem = () => ({ key: "", label: "", required: true, input_type: "pass_fail", spec: null });

function QualityInspectionForm() {
  const role = localStorage.getItem("role") || "Staff";
  const navigate = useNavigate();
  const [points, setPoints] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ inspection_point_id: "", product_id: "", overall_notes: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([apiFetch("/quality/inspection-points"), apiFetch("/products?limit=100")])
      .then(([pts, prods]) => {
        setPoints(pts);
        setProducts(prods.items || prods);
        if (pts.length) setForm((f) => ({ ...f, inspection_point_id: String(pts[0].id) }));
      })
      .catch((err) => setError(err.message));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const body = {
        inspection_point_id: Number(form.inspection_point_id),
        product_id: form.product_id ? Number(form.product_id) : null,
        reference_type: "manual",
        overall_notes: form.overall_notes || null,
      };
      const insp = await apiFetch("/quality/inspections", { method: "POST", body: JSON.stringify(body) });
      navigate(`/quality/inspections/${insp.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="New inspection" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/quality/inspections" className="crm-muted">← Inspections</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <form className="crm-form crm-mt" onSubmit={submit}>
          <div className="crm-form-field">
            <label>Inspection point</label>
            <select required value={form.inspection_point_id} onChange={(e) => setForm((f) => ({ ...f, inspection_point_id: e.target.value }))}>
              {points.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>
          <div className="crm-form-field">
            <label>Product (optional)</label>
            <select value={form.product_id} onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}>
              <option value="">—</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="crm-form-field">
            <label>Notes</label>
            <textarea rows={2} value={form.overall_notes} onChange={(e) => setForm((f) => ({ ...f, overall_notes: e.target.value }))} />
          </div>
          <button type="submit" className="crm-btn">Create inspection</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default QualityInspectionForm;
