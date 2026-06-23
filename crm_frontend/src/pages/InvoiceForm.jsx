import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { INVOICE_TYPES, computeInvoiceTotals, emptyForm, emptyLineItem, formatCurrency } from "../utils/invoices";

function InvoiceForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [form, setForm] = useState({
    ...emptyForm(),
    contact_id: searchParams.get("contact_id") || "",
    sales_order_id: searchParams.get("sales_order_id") || "",
    quotation_id: searchParams.get("quotation_id") || "",
  });
  const [assignees, setAssignees] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    Promise.all([
      apiFetch("/invoices/assignees"),
      apiFetch("/products?limit=200"),
      ...(isEdit ? [] : [apiFetch("/invoices/defaults")]),
    ])
      .then(([staff, pd, defaults]) => {
        setAssignees(staff);
        setProducts(pd.items || []);
        if (!isEdit && defaults) {
          setForm((prev) => ({
            ...prev,
            payment_terms: defaults.payment_terms || prev.payment_terms,
            bank_instructions: defaults.bank_instructions || prev.bank_instructions,
            billing_notes: defaults.billing_notes || prev.billing_notes,
          }));
        }
      })
      .catch(() => {});
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/invoices/${id}`).then((inv) => {
      setForm({
        title: inv.title, invoice_type: inv.invoice_type, currency: inv.currency,
        issue_date: inv.issue_date?.slice(0, 10) || "", due_date: inv.due_date?.slice(0, 10) || "",
        sales_order_id: inv.sales_order_id ? String(inv.sales_order_id) : "",
        quotation_id: inv.quotation_id ? String(inv.quotation_id) : "",
        contact_id: inv.contact_id ? String(inv.contact_id) : "",
        assigned_to_id: inv.assigned_to_id ? String(inv.assigned_to_id) : "",
        client_name: inv.client_name || "", client_email: inv.client_email || "",
        client_phone: inv.client_phone || "", client_org: inv.client_org || "",
        client_gstin: inv.client_gstin || "", billing_address: inv.billing_address || "",
        header_discount_amount: String(inv.header_discount_amount || 0),
        header_discount_percent: String(inv.header_discount_percent || 0),
        round_off: String(inv.round_off || 0),
        payment_terms: inv.payment_terms || "", bank_instructions: inv.bank_instructions || "",
        billing_notes: inv.billing_notes || "", internal_notes: inv.internal_notes || "",
        line_items: inv.line_items.length ? inv.line_items.map((li) => ({
          product_id: li.product_id ? String(li.product_id) : "", sort_order: li.sort_order,
          section: li.section || "", item_name: li.item_name, description: li.description || "",
          quantity: String(li.quantity), unit: li.unit, unit_price: String(li.unit_price),
          discount_percent: String(li.discount_percent), discount_amount: String(li.discount_amount),
          tax_rate: String(li.tax_rate),
        })) : [emptyLineItem()],
      });
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id, isEdit]);

  const totals = useMemo(() => computeInvoiceTotals(form.line_items, Number(form.header_discount_amount) || 0, Number(form.header_discount_percent) || 0, Number(form.round_off) || 0), [form]);

  const buildPayload = () => ({
    title: form.title.trim(), invoice_type: form.invoice_type, currency: form.currency,
    issue_date: form.issue_date ? new Date(`${form.issue_date}T00:00:00`).toISOString() : new Date().toISOString(),
    due_date: form.due_date ? new Date(`${form.due_date}T23:59:59`).toISOString() : null,
    sales_order_id: form.sales_order_id ? Number(form.sales_order_id) : null,
    quotation_id: form.quotation_id ? Number(form.quotation_id) : null,
    contact_id: form.contact_id ? Number(form.contact_id) : null,
    assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
    client_name: form.client_name || null, client_email: form.client_email || null,
    client_phone: form.client_phone || null, client_org: form.client_org || null,
    client_gstin: form.client_gstin || null, billing_address: form.billing_address || null,
    header_discount_amount: Number(form.header_discount_amount) || 0,
    header_discount_percent: Number(form.header_discount_percent) || 0,
    round_off: Number(form.round_off) || 0,
    payment_terms: form.payment_terms || null, bank_instructions: form.bank_instructions || null,
    billing_notes: form.billing_notes || null, internal_notes: form.internal_notes || null,
    line_items: form.line_items.filter((li) => li.item_name.trim()).map((li, idx) => ({
      product_id: li.product_id ? Number(li.product_id) : null, sort_order: idx,
      section: li.section || null, item_name: li.item_name.trim(), description: li.description || null,
      quantity: Number(li.quantity) || 0, unit: li.unit || "Service", unit_price: Number(li.unit_price) || 0,
      discount_percent: Number(li.discount_percent) || 0, discount_amount: Number(li.discount_amount) || 0,
      tax_rate: Number(li.tax_rate) || 0,
    })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = buildPayload();
      if (isEdit) {
        await apiFetch(`/invoices/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        navigate(`/invoices/${id}`);
      } else {
        const created = await apiFetch("/invoices", { method: "POST", body: JSON.stringify(payload) });
        navigate(`/invoices/${created.id}`);
      }
    } catch (err) { setError(err.message); }
  };

  if (loading) return <DashboardLayout title="Invoice" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;

  return (
    <DashboardLayout title={isEdit ? "Edit Invoice" : "New Invoice"} roleLabel={role}>
      <div className="crm-quote-builder">
        <div className="crm-panel crm-quote-builder-main">
          <Link to={isEdit ? `/invoices/${id}` : "/invoices"} className="crm-link crm-link-left">← Back</Link>
          {error && <p className="crm-error crm-mt">{error}</p>}
          <form onSubmit={handleSubmit} className="crm-form crm-mt">
            <div className="crm-form-grid">
              <div className="crm-span-2"><label>Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><label>Type</label><select value={form.invoice_type} onChange={(e) => setForm({ ...form, invoice_type: e.target.value })}>{Object.entries(INVOICE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><label>Issue date</label><input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
              <div><label>Due date</label><input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>
            <h3 className="crm-mt-lg">Customer</h3>
            <div className="crm-form-grid">
              <div><label>Name *</label><input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required /></div>
              <div><label>Email</label><input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} /></div>
              <div><label>GSTIN</label><input value={form.client_gstin} onChange={(e) => setForm({ ...form, client_gstin: e.target.value })} /></div>
              <div className="crm-span-2"><label>Billing address</label><textarea className="crm-textarea" rows={2} value={form.billing_address} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} /></div>
            </div>
            <h3 className="crm-mt-lg">Line items</h3>
            {form.line_items.map((line, index) => (
              <div key={index} className="crm-quote-line-item crm-mb">
                <div className="crm-form-grid">
                  <div className="crm-span-2"><label>Item *</label><input value={line.item_name} onChange={(e) => { const items = [...form.line_items]; items[index] = { ...items[index], item_name: e.target.value }; setForm({ ...form, line_items: items }); }} required /></div>
                  <div><label>Qty</label><input type="number" min="0" value={line.quantity} onChange={(e) => { const items = [...form.line_items]; items[index] = { ...items[index], quantity: e.target.value }; setForm({ ...form, line_items: items }); }} /></div>
                  <div><label>Rate</label><input type="number" min="0" value={line.unit_price} onChange={(e) => { const items = [...form.line_items]; items[index] = { ...items[index], unit_price: e.target.value }; setForm({ ...form, line_items: items }); }} /></div>
                  <div><label>Tax %</label><input type="number" min="0" value={line.tax_rate} onChange={(e) => { const items = [...form.line_items]; items[index] = { ...items[index], tax_rate: e.target.value }; setForm({ ...form, line_items: items }); }} /></div>
                </div>
              </div>
            ))}
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => setForm({ ...form, line_items: [...form.line_items, emptyLineItem()] })}>+ Add line</button>
            <label className="crm-mt">Payment terms</label><textarea className="crm-textarea" rows={2} value={form.payment_terms} onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} />
            <label>Bank instructions</label><textarea className="crm-textarea" rows={2} value={form.bank_instructions} onChange={(e) => setForm({ ...form, bank_instructions: e.target.value })} />
            <div className="crm-quote-sticky-footer crm-mt-lg"><button type="submit" className="crm-btn crm-btn-inline">Save draft</button></div>
          </form>
        </div>
        <aside className="crm-panel crm-quote-summary-panel">
          <h3>Summary</h3>
          <div className="crm-quote-summary-row"><span>Subtotal</span><span className="crm-num">{formatCurrency(totals.subtotal, form.currency)}</span></div>
          <div className="crm-quote-summary-row"><span>Tax</span><span className="crm-num">{formatCurrency(totals.totalTax, form.currency)}</span></div>
          <div className="crm-quote-summary-total"><span>Grand total</span><strong className="crm-num">{formatCurrency(totals.grandTotal, form.currency)}</strong></div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

export default InvoiceForm;
