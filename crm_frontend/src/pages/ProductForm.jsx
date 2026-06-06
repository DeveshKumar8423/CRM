import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

const emptyForm = {
  name: "", service_code: "", entity_type: "", category: "", sub_category: "",
  unit: "Service", govt_charges: "", our_fees: "", gst_amount: "", total_price: "",
  market_price: "", offer_price: "", last_price: "", gst_rate: "18",
  filing_timeline: "", completion_timeline: "", description: "", status: "active",
};

function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/products/${id}`)
      .then((p) => setForm({
        name: p.name || "",
        service_code: p.service_code || "",
        entity_type: p.entity_type || "",
        category: p.category || "",
        sub_category: p.sub_category || "",
        unit: p.unit || "Service",
        govt_charges: p.govt_charges ?? "",
        our_fees: p.our_fees ?? "",
        gst_amount: p.gst_amount ?? "",
        total_price: p.total_price ?? "",
        market_price: p.market_price ?? "",
        offer_price: p.offer_price ?? "",
        last_price: p.last_price ?? "",
        gst_rate: String(p.gst_rate ?? 18),
        filing_timeline: p.filing_timeline || "",
        completion_timeline: p.completion_timeline || "",
        description: p.description || "",
        status: p.status || "active",
      }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const numOrNull = (v) => (v === "" || v == null ? null : Number(v));

  const buildPayload = () => ({
    name: form.name.trim(),
    service_code: form.service_code || null,
    entity_type: form.entity_type || null,
    category: form.category || null,
    sub_category: form.sub_category || null,
    unit: form.unit || "Service",
    govt_charges: numOrNull(form.govt_charges),
    our_fees: numOrNull(form.our_fees),
    gst_amount: numOrNull(form.gst_amount),
    total_price: numOrNull(form.total_price),
    market_price: numOrNull(form.market_price),
    offer_price: numOrNull(form.offer_price),
    last_price: numOrNull(form.last_price),
    gst_rate: Number(form.gst_rate) || 18,
    filing_timeline: form.filing_timeline || null,
    completion_timeline: form.completion_timeline || null,
    description: form.description || null,
    status: form.status,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = buildPayload();
      if (isEdit) {
        await apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        navigate(`/products/${id}`);
      } else {
        const created = await apiFetch("/products", { method: "POST", body: JSON.stringify(payload) });
        navigate(`/products/${created.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Service" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? "Edit Service" : "New Service"} roleLabel={role}>
      <div className="crm-panel">
        <Link to={isEdit ? `/products/${id}` : "/products"} className="crm-link crm-link-left">← Back</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <form onSubmit={handleSubmit} className="crm-form crm-mt">
          <div className="crm-form-grid">
            <div className="crm-span-2">
              <label>Service name *</label>
              <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
            <div><label>Service code</label><input value={form.service_code} onChange={(e) => handleChange("service_code", e.target.value)} /></div>
            <div><label>Entity type</label><input value={form.entity_type} onChange={(e) => handleChange("entity_type", e.target.value)} /></div>
            <div><label>Category</label><input value={form.category} onChange={(e) => handleChange("category", e.target.value)} /></div>
            <div><label>Sub category</label><input value={form.sub_category} onChange={(e) => handleChange("sub_category", e.target.value)} /></div>
            <div><label>Status</label>
              <select value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div><label>Market price (₹)</label><input type="number" value={form.market_price} onChange={(e) => handleChange("market_price", e.target.value)} /></div>
            <div><label>Offer price (₹)</label><input type="number" value={form.offer_price} onChange={(e) => handleChange("offer_price", e.target.value)} /></div>
            <div><label>Last price (₹)</label><input type="number" value={form.last_price} onChange={(e) => handleChange("last_price", e.target.value)} /></div>
            <div><label>Our fees (₹)</label><input type="number" value={form.our_fees} onChange={(e) => handleChange("our_fees", e.target.value)} /></div>
            <div><label>GST (₹)</label><input type="number" value={form.gst_amount} onChange={(e) => handleChange("gst_amount", e.target.value)} /></div>
            <div><label>Total (₹)</label><input type="number" value={form.total_price} onChange={(e) => handleChange("total_price", e.target.value)} /></div>
            <div><label>Filing timeline</label><input value={form.filing_timeline} onChange={(e) => handleChange("filing_timeline", e.target.value)} /></div>
            <div><label>Completion timeline</label><input value={form.completion_timeline} onChange={(e) => handleChange("completion_timeline", e.target.value)} /></div>
          </div>
          <label>Documents / description</label>
          <textarea className="crm-textarea" rows={5} value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
          <button type="submit" className="crm-btn crm-btn-inline">{isEdit ? "Save" : "Create"}</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default ProductForm;
