import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import {
  PAYMENT_TERM_LABELS,
  computePoTotals,
  emptyForm,
  emptyLineItem,
  formatCurrency,
} from "../utils/purchaseOrders";

function PurchaseOrderForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [form, setForm] = useState({
    ...emptyForm(),
    deal_id: searchParams.get("deal_id") || "",
    contact_id: searchParams.get("contact_id") || "",
  });
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    Promise.all([
      apiFetch("/purchase-orders/payment-terms"),
      apiFetch("/products?limit=200"),
    ]).then(([terms, productData]) => {
      setPaymentTerms(terms);
      setProducts(productData.items || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/purchase-orders/${id}`).then((po) => {
      setForm({
        title: po.title || "",
        vendor_name: po.vendor_name || "",
        vendor_contact: po.vendor_contact || "",
        vendor_email: po.vendor_email || "",
        vendor_phone: po.vendor_phone || "",
        currency: po.currency || "INR",
        payment_terms: po.payment_terms || "net_30",
        po_date: po.po_date ? po.po_date.slice(0, 10) : "",
        expected_delivery_date: po.expected_delivery_date ? po.expected_delivery_date.slice(0, 10) : "",
        delivery_location: po.delivery_location || "",
        notes: po.notes || "",
        internal_reference: po.internal_reference || "",
        vendor_quote_reference: po.vendor_quote_reference || "",
        cost_center: po.cost_center || "",
        deal_id: po.deal_id ? String(po.deal_id) : "",
        contact_id: po.contact_id ? String(po.contact_id) : "",
        line_items: po.line_items.length > 0
          ? po.line_items.map((li) => ({
              product_id: li.product_id ? String(li.product_id) : "",
              description: li.description || "",
              sku: li.sku || "",
              unit: li.unit || "Unit",
              ordered_quantity: String(li.ordered_quantity),
              unit_price: String(li.unit_price),
              tax_rate: String(li.tax_rate),
            }))
          : [emptyLineItem()],
      });
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id, isEdit]);

  const totals = useMemo(() => computePoTotals(form.line_items), [form.line_items]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleLineChange = (index, field, value) => {
    setForm((prev) => {
      const lineItems = [...prev.line_items];
      lineItems[index] = { ...lineItems[index], [field]: value };
      return { ...prev, line_items: lineItems };
    });
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    vendor_name: form.vendor_name.trim(),
    vendor_contact: form.vendor_contact || null,
    vendor_email: form.vendor_email || null,
    vendor_phone: form.vendor_phone || null,
    currency: form.currency || "INR",
    payment_terms: form.payment_terms || null,
    po_date: new Date(`${form.po_date}T12:00:00`).toISOString(),
    expected_delivery_date: form.expected_delivery_date
      ? new Date(`${form.expected_delivery_date}T12:00:00`).toISOString()
      : null,
    delivery_location: form.delivery_location || null,
    notes: form.notes || null,
    internal_reference: form.internal_reference || null,
    vendor_quote_reference: form.vendor_quote_reference || null,
    cost_center: form.cost_center || null,
    deal_id: form.deal_id ? Number(form.deal_id) : null,
    contact_id: form.contact_id ? Number(form.contact_id) : null,
    line_items: form.line_items.filter((li) => li.description.trim()).map((li, idx) => ({
      product_id: li.product_id ? Number(li.product_id) : null,
      sort_order: idx,
      description: li.description.trim(),
      sku: li.sku || null,
      unit: li.unit || "Unit",
      ordered_quantity: Number(li.ordered_quantity) || 0,
      unit_price: Number(li.unit_price) || 0,
      tax_rate: Number(li.tax_rate) || 0,
    })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = buildPayload();
      if (isEdit) {
        await apiFetch(`/purchase-orders/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        navigate(`/purchase-orders/${id}`);
      } else {
        const created = await apiFetch("/purchase-orders", { method: "POST", body: JSON.stringify(payload) });
        navigate(`/purchase-orders/${created.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <DashboardLayout title="Purchase Order" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout title={isEdit ? "Edit Purchase Order" : "New Purchase Order"} roleLabel={role}>
      <div className="crm-quote-builder">
        <div className="crm-panel crm-quote-builder-main">
          <Link to={isEdit ? `/purchase-orders/${id}` : "/purchase-orders"} className="crm-link crm-link-left">← Back</Link>
          {error && <p className="crm-error crm-mt">{error}</p>}

          <form onSubmit={handleSubmit} className="crm-form crm-mt">
            <h3>Vendor & header</h3>
            <div className="crm-form-grid">
              <div className="crm-span-2">
                <label>PO title *</label>
                <input value={form.title} onChange={(e) => handleChange("title", e.target.value)} required />
              </div>
              <div>
                <label>Vendor name *</label>
                <input value={form.vendor_name} onChange={(e) => handleChange("vendor_name", e.target.value)} required />
              </div>
              <div>
                <label>Vendor contact</label>
                <input value={form.vendor_contact} onChange={(e) => handleChange("vendor_contact", e.target.value)} />
              </div>
              <div>
                <label>PO date *</label>
                <input type="date" value={form.po_date} onChange={(e) => handleChange("po_date", e.target.value)} required />
              </div>
              <div>
                <label>Expected delivery</label>
                <input type="date" value={form.expected_delivery_date} onChange={(e) => handleChange("expected_delivery_date", e.target.value)} />
              </div>
              <div>
                <label>Payment terms</label>
                <select value={form.payment_terms} onChange={(e) => handleChange("payment_terms", e.target.value)}>
                  {paymentTerms.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  {paymentTerms.length === 0 && Object.entries(PAYMENT_TERM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="crm-span-2">
                <label>Delivery location</label>
                <input value={form.delivery_location} onChange={(e) => handleChange("delivery_location", e.target.value)} />
              </div>
            </div>

            <h3 className="crm-mt-lg">Line items</h3>
            {form.line_items.map((li, idx) => (
              <div key={idx} className="crm-quote-line-item crm-mt">
                <div className="crm-form-grid">
                  <div className="crm-span-2">
                    <label>Description *</label>
                    <input value={li.description} onChange={(e) => handleLineChange(idx, "description", e.target.value)} required />
                  </div>
                  <div>
                    <label>Product</label>
                    <select value={li.product_id} onChange={(e) => handleLineChange(idx, "product_id", e.target.value)}>
                      <option value="">Manual</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Qty *</label>
                    <input type="number" min="0.01" step="0.01" value={li.ordered_quantity} onChange={(e) => handleLineChange(idx, "ordered_quantity", e.target.value)} />
                  </div>
                  <div>
                    <label>Unit</label>
                    <input value={li.unit} onChange={(e) => handleLineChange(idx, "unit", e.target.value)} />
                  </div>
                  <div>
                    <label>Unit price</label>
                    <input type="number" min="0" step="0.01" value={li.unit_price} onChange={(e) => handleLineChange(idx, "unit_price", e.target.value)} />
                  </div>
                  <div>
                    <label>Tax %</label>
                    <input type="number" min="0" step="0.01" value={li.tax_rate} onChange={(e) => handleLineChange(idx, "tax_rate", e.target.value)} />
                  </div>
                </div>
                {form.line_items.length > 1 && (
                  <button type="button" className="crm-btn crm-btn-sm crm-btn-outline crm-mt" onClick={() => setForm((prev) => ({ ...prev, line_items: prev.line_items.filter((_, i) => i !== idx) }))}>Remove line</button>
                )}
              </div>
            ))}
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline crm-mt" onClick={() => setForm((prev) => ({ ...prev, line_items: [...prev.line_items, emptyLineItem()] }))}>+ Add line</button>

            <div className="crm-quote-summary-panel crm-mt-lg">
              <div className="crm-quote-summary-row"><span>Subtotal</span><span className="crm-num">{formatCurrency(totals.subtotal, form.currency)}</span></div>
              <div className="crm-quote-summary-row"><span>Tax</span><span className="crm-num">{formatCurrency(totals.totalTax, form.currency)}</span></div>
              <div className="crm-quote-summary-total"><span>Total</span><span className="crm-num">{formatCurrency(totals.grandTotal, form.currency)}</span></div>
            </div>

            <div className="crm-form-grid crm-mt">
              <div className="crm-span-2">
                <label>Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} />
              </div>
            </div>

            <div className="crm-inline-actions crm-mt-lg">
              <button type="submit" className="crm-btn crm-btn-inline">Save draft</button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PurchaseOrderForm;
