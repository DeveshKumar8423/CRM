import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  computeQuoteTotals,
  emptyForm,
  emptyLineItem,
  formatCurrency,
} from "../utils/quotations";
import { productLineSummary } from "../utils/lineItemText";

function QuotationForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const canAssign = hasPermission("quotations.edit_draft");

  const [form, setForm] = useState({
    ...emptyForm(),
    deal_id: searchParams.get("deal_id") || "",
    lead_id: searchParams.get("lead_id") || "",
    contact_id: searchParams.get("contact_id") || "",
  });
  const [assignees, setAssignees] = useState([]);
  const [products, setProducts] = useState([]);
  const [saveState, setSaveState] = useState("saved");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    Promise.all([
      apiFetch("/quotations/assignees"),
      apiFetch("/products?limit=200"),
      ...(isEdit ? [] : [apiFetch("/quotations/defaults")]),
    ])
      .then((results) => {
        const [staff, productData, defaults] = results;
        setAssignees(staff);
        setProducts(productData.items || []);
        if (!isEdit && defaults) {
          setForm((prev) => ({
            ...prev,
            scope_notes: defaults.scope_notes || "",
            deliverables: defaults.deliverables || "",
            timeline_notes: defaults.timeline_notes || "",
            payment_terms: defaults.payment_terms || "",
            validity_clause: defaults.validity_clause || "",
            cancellation_clause: defaults.documents_checklist || "",
            legal_footer: defaults.legal_footer || "",
          }));
        }
      })
      .catch(() => {});
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/quotations/${id}`)
      .then((quote) => {
        setForm({
          title: quote.title || "",
          currency: quote.currency || "INR",
          quote_date: quote.quote_date ? quote.quote_date.slice(0, 10) : "",
          valid_until: quote.valid_until ? quote.valid_until.slice(0, 10) : "",
          deal_id: quote.deal_id ? String(quote.deal_id) : "",
          lead_id: quote.lead_id ? String(quote.lead_id) : "",
          contact_id: quote.contact_id ? String(quote.contact_id) : "",
          assigned_to_id: quote.assigned_to_id ? String(quote.assigned_to_id) : "",
          client_name: quote.client_name || "",
          client_email: quote.client_email || "",
          client_org: quote.client_org || "",
          attention_to: quote.attention_to || "",
          billing_address: quote.billing_address || "",
          shipping_address: quote.shipping_address || "",
          header_discount_amount: String(quote.header_discount_amount || 0),
          header_discount_percent: String(quote.header_discount_percent || 0),
          scope_notes: quote.scope_notes || "",
          deliverables: quote.deliverables || "",
          timeline_notes: quote.timeline_notes || "",
          payment_terms: quote.payment_terms || "",
          validity_clause: quote.validity_clause || "",
          cancellation_clause: quote.cancellation_clause || "",
          legal_footer: quote.legal_footer || "",
          internal_notes: quote.internal_notes || "",
          line_items: quote.line_items.length > 0
            ? quote.line_items.map((li) => ({
                product_id: li.product_id ? String(li.product_id) : "",
                sort_order: li.sort_order,
                section: li.section || "",
                item_name: li.item_name || "",
                description: li.description || "",
                quantity: String(li.quantity),
                unit: li.unit || "Service",
                unit_price: String(li.unit_price),
                discount_percent: String(li.discount_percent),
                discount_amount: String(li.discount_amount),
                tax_rate: String(li.tax_rate),
              }))
            : [emptyLineItem()],
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const totals = useMemo(
    () => computeQuoteTotals(
      form.line_items,
      Number(form.header_discount_amount) || 0,
      Number(form.header_discount_percent) || 0,
    ),
    [form.line_items, form.header_discount_amount, form.header_discount_percent],
  );

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleLineChange = (index, field, value) => {
    setForm((prev) => {
      const lineItems = [...prev.line_items];
      lineItems[index] = { ...lineItems[index], [field]: value };
      return { ...prev, line_items: lineItems };
    });
  };

  const addLineItem = () => {
    setForm((prev) => ({
      ...prev,
      line_items: [...prev.line_items, emptyLineItem()],
    }));
  };

  const removeLineItem = (index) => {
    setForm((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  };

  const addProductLine = (productId) => {
    const product = products.find((p) => String(p.id) === String(productId));
    if (!product) return;
    setForm((prev) => ({
      ...prev,
      line_items: [
        ...prev.line_items,
        {
          ...emptyLineItem(),
          product_id: String(product.id),
          item_name: product.name,
          description: productLineSummary(product),
          unit: product.unit || "Service",
          unit_price: String(product.offer_price || product.total_price || product.our_fees || 0),
          tax_rate: String(product.gst_rate || 18),
        },
      ],
    }));
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    currency: form.currency || "INR",
    quote_date: form.quote_date
      ? new Date(`${form.quote_date}T00:00:00`).toISOString()
      : new Date().toISOString(),
    valid_until: form.valid_until
      ? new Date(`${form.valid_until}T23:59:59`).toISOString()
      : null,
    deal_id: form.deal_id ? Number(form.deal_id) : null,
    lead_id: form.lead_id ? Number(form.lead_id) : null,
    contact_id: form.contact_id ? Number(form.contact_id) : null,
    assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
    client_name: form.client_name || null,
    client_email: form.client_email || null,
    client_org: form.client_org || null,
    attention_to: form.attention_to || null,
    billing_address: form.billing_address || null,
    shipping_address: form.shipping_address || null,
    header_discount_amount: Number(form.header_discount_amount) || 0,
    header_discount_percent: Number(form.header_discount_percent) || 0,
    scope_notes: form.scope_notes || null,
    deliverables: form.deliverables || null,
    timeline_notes: form.timeline_notes || null,
    payment_terms: form.payment_terms || null,
    validity_clause: form.validity_clause || null,
    cancellation_clause: form.cancellation_clause || null,
    legal_footer: form.legal_footer || null,
    internal_notes: form.internal_notes || null,
    line_items: form.line_items
      .filter((li) => li.item_name.trim())
      .map((li, idx) => ({
        product_id: li.product_id ? Number(li.product_id) : null,
        sort_order: idx,
        section: li.section || null,
        item_name: li.item_name.trim(),
        description: li.description || null,
        quantity: Number(li.quantity) || 0,
        unit: li.unit || "Service",
        unit_price: Number(li.unit_price) || 0,
        discount_percent: Number(li.discount_percent) || 0,
        discount_amount: Number(li.discount_amount) || 0,
        tax_rate: Number(li.tax_rate) || 0,
      })),
  });

  const saveQuote = async () => {
    setSaveState("saving");
    setError("");
    try {
      const payload = buildPayload();
      if (isEdit) {
        await apiFetch(`/quotations/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        setSaveState("saved");
        return id;
      }
      const created = await apiFetch("/quotations", { method: "POST", body: JSON.stringify(payload) });
      setSaveState("saved");
      return created.id;
    } catch (err) {
      setSaveState("error");
      setError(err.message);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const quoteId = await saveQuote();
      navigate(`/quotations/${quoteId}`);
    } catch {
      // error already set
    }
  };

  const handlePreview = async () => {
    try {
      const quoteId = await saveQuote();
      navigate(`/quotations/${quoteId}/preview`);
    } catch {
      // error already set
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Quotation" roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? "Edit Quotation" : "New Quotation"} roleLabel={role}>
      <div className="crm-quote-builder">
        <div className="crm-panel crm-quote-builder-main">
          <div className="crm-detail-header">
            <Link to={isEdit ? `/quotations/${id}` : "/quotations"} className="crm-link crm-link-left">← Back</Link>
            <span className={`crm-save-indicator crm-save-${saveState}`}>
              {saveState === "saving" ? "Saving…" : saveState === "error" ? "Save failed" : "Saved"}
            </span>
          </div>
          {error && <p className="crm-error crm-mt">{error}</p>}

          <form onSubmit={handleSubmit} className="crm-form crm-mt">
            <h3>Header</h3>
            <div className="crm-form-grid">
              <div className="crm-span-2">
                <label>Quote title *</label>
                <input value={form.title} onChange={(e) => handleChange("title", e.target.value)} required />
              </div>
              <div>
                <label>Quote date</label>
                <input type="date" value={form.quote_date} onChange={(e) => handleChange("quote_date", e.target.value)} />
              </div>
              <div>
                <label>Valid until</label>
                <input type="date" value={form.valid_until} onChange={(e) => handleChange("valid_until", e.target.value)} />
              </div>
              <div>
                <label>Currency</label>
                <input value={form.currency} onChange={(e) => handleChange("currency", e.target.value)} />
              </div>
              {canAssign && (
                <div>
                  <label>Owner</label>
                  <select value={form.assigned_to_id} onChange={(e) => handleChange("assigned_to_id", e.target.value)}>
                    <option value="">Unassigned</option>
                    {assignees.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <h3 className="crm-mt-lg">Client details</h3>
            <div className="crm-form-grid">
              <div>
                <label>Client name</label>
                <input value={form.client_name} onChange={(e) => handleChange("client_name", e.target.value)} />
              </div>
              <div>
                <label>Client email</label>
                <input type="email" value={form.client_email} onChange={(e) => handleChange("client_email", e.target.value)} />
              </div>
              <div>
                <label>Organization</label>
                <input value={form.client_org} onChange={(e) => handleChange("client_org", e.target.value)} />
              </div>
              <div>
                <label>Attention to</label>
                <input value={form.attention_to} onChange={(e) => handleChange("attention_to", e.target.value)} />
              </div>
              <div className="crm-span-2">
                <label>Billing address</label>
                <textarea className="crm-textarea" rows={2} value={form.billing_address} onChange={(e) => handleChange("billing_address", e.target.value)} />
              </div>
              <div className="crm-span-2">
                <label>Shipping / service address</label>
                <textarea className="crm-textarea" rows={2} value={form.shipping_address} onChange={(e) => handleChange("shipping_address", e.target.value)} />
              </div>
            </div>

            <h3 className="crm-mt-lg">Source context</h3>
            <div className="crm-form-grid">
              <div>
                <label>Deal ID</label>
                <input value={form.deal_id} onChange={(e) => handleChange("deal_id", e.target.value)} />
              </div>
              <div>
                <label>Lead ID</label>
                <input value={form.lead_id} onChange={(e) => handleChange("lead_id", e.target.value)} />
              </div>
              <div>
                <label>Contact ID</label>
                <input value={form.contact_id} onChange={(e) => handleChange("contact_id", e.target.value)} />
              </div>
            </div>

            <h3 className="crm-mt-lg">Line items</h3>
            <div className="crm-quote-product-picker crm-mb">
              <label>Add from product catalog</label>
              <select defaultValue="" onChange={(e) => { addProductLine(e.target.value); e.target.value = ""; }}>
                <option value="">Select product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {form.line_items.map((line, index) => (
              <div key={index} className="crm-quote-line-item crm-mb">
                <div className="crm-form-grid">
                  <div className="crm-span-2">
                    <label>Item name *</label>
                    <input value={line.item_name} onChange={(e) => handleLineChange(index, "item_name", e.target.value)} required />
                  </div>
                  <div>
                    <label>Qty</label>
                    <input type="number" min="0" step="0.01" value={line.quantity} onChange={(e) => handleLineChange(index, "quantity", e.target.value)} />
                  </div>
                  <div>
                    <label>Unit</label>
                    <input value={line.unit} onChange={(e) => handleLineChange(index, "unit", e.target.value)} />
                  </div>
                  <div>
                    <label>Unit price</label>
                    <input type="number" min="0" step="0.01" value={line.unit_price} onChange={(e) => handleLineChange(index, "unit_price", e.target.value)} />
                  </div>
                  <div>
                    <label>Discount %</label>
                    <input type="number" min="0" max="100" step="0.01" value={line.discount_percent} onChange={(e) => handleLineChange(index, "discount_percent", e.target.value)} />
                  </div>
                  <div>
                    <label>Tax rate %</label>
                    <input type="number" min="0" max="100" step="0.01" value={line.tax_rate} onChange={(e) => handleLineChange(index, "tax_rate", e.target.value)} />
                  </div>
                  <div className="crm-span-2">
                    <label>Description</label>
                    <textarea className="crm-textarea" rows={2} value={line.description} onChange={(e) => handleLineChange(index, "description", e.target.value)} />
                  </div>
                </div>
                {form.line_items.length > 1 && (
                  <button type="button" className="crm-btn crm-btn-sm crm-btn-outline crm-mt" onClick={() => removeLineItem(index)}>
                    Remove line
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={addLineItem}>+ Add line item</button>

            <h3 className="crm-mt-lg">Terms &amp; commercials</h3>
            <label>Scope notes</label>
            <textarea className="crm-textarea" rows={2} value={form.scope_notes} onChange={(e) => handleChange("scope_notes", e.target.value)} />
            <label>Deliverables</label>
            <textarea className="crm-textarea" rows={2} value={form.deliverables} onChange={(e) => handleChange("deliverables", e.target.value)} />
            <label>Timeline / SLA</label>
            <textarea className="crm-textarea" rows={2} value={form.timeline_notes} onChange={(e) => handleChange("timeline_notes", e.target.value)} />
            <label>Payment terms</label>
            <textarea className="crm-textarea" rows={2} value={form.payment_terms} onChange={(e) => handleChange("payment_terms", e.target.value)} />
            <label>Validity clause</label>
            <textarea className="crm-textarea" rows={2} value={form.validity_clause} onChange={(e) => handleChange("validity_clause", e.target.value)} />
            <label>Documents checklist</label>
            <textarea className="crm-textarea" rows={2} value={form.cancellation_clause} onChange={(e) => handleChange("cancellation_clause", e.target.value)} />
            <label>Legal footer</label>
            <textarea className="crm-textarea" rows={2} value={form.legal_footer} onChange={(e) => handleChange("legal_footer", e.target.value)} />

            <h3 className="crm-mt-lg">Internal notes</h3>
            <textarea className="crm-textarea" rows={3} value={form.internal_notes} onChange={(e) => handleChange("internal_notes", e.target.value)} />

            <div className="crm-quote-sticky-footer crm-mt-lg">
              <button type="button" className="crm-btn crm-btn-outline" onClick={handlePreview}>Preview</button>
              <button type="submit" className="crm-btn crm-btn-inline">Save draft</button>
            </div>
          </form>
        </div>

        <aside className="crm-panel crm-quote-summary-panel">
          <h3>Summary</h3>
          <div className="crm-quote-summary-row">
            <span>Subtotal</span>
            <span className="crm-num">{formatCurrency(totals.subtotal, form.currency)}</span>
          </div>
          <div className="crm-quote-summary-row">
            <span>Line discounts</span>
            <span className="crm-num">−{formatCurrency(totals.lineDiscountTotal, form.currency)}</span>
          </div>
          <div className="crm-form-grid crm-mt">
            <div>
              <label>Header discount %</label>
              <input type="number" min="0" max="100" value={form.header_discount_percent} onChange={(e) => handleChange("header_discount_percent", e.target.value)} />
            </div>
            <div>
              <label>Header discount ₹</label>
              <input type="number" min="0" value={form.header_discount_amount} onChange={(e) => handleChange("header_discount_amount", e.target.value)} />
            </div>
          </div>
          <div className="crm-quote-summary-row">
            <span>Tax</span>
            <span className="crm-num">{formatCurrency(totals.totalTax, form.currency)}</span>
          </div>
          <div className="crm-quote-summary-total">
            <span>Grand total</span>
            <strong className="crm-num">{formatCurrency(totals.grandTotal, form.currency)}</strong>
          </div>
          {Number(form.header_discount_percent) > 15 && (
            <p className="crm-muted crm-mt">Approval required: discount exceeds 15%</p>
          )}
        </aside>
      </div>
    </DashboardLayout>
  );
}

export default QuotationForm;
