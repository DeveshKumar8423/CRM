import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import {
  computeBillTotals,
  emptyForm,
  emptyLineItem,
  formatCurrency,
} from "../utils/vendorBills";

function VendorBillForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [form, setForm] = useState({
    ...emptyForm(),
    purchase_order_id: searchParams.get("purchase_order_id") || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [creatingFromPo, setCreatingFromPo] = useState(false);

  useEffect(() => {
    const poId = searchParams.get("purchase_order_id");
    if (!isEdit && poId && searchParams.get("from_po") === "1") {
      setCreatingFromPo(true);
      apiFetch(`/vendor-bills/from-purchase-order/${poId}`, { method: "POST" })
        .then((bill) => navigate(`/vendor-bills/${bill.id}/edit`, { replace: true }))
        .catch((err) => { setError(err.message); setCreatingFromPo(false); });
    }
  }, [isEdit, navigate, searchParams]);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/vendor-bills/${id}`).then((bill) => {
      setForm({
        title: bill.title,
        supplier_invoice_number: bill.supplier_invoice_number || "",
        currency: bill.currency,
        bill_date: bill.bill_date?.slice(0, 10) || "",
        due_date: bill.due_date?.slice(0, 10) || "",
        payment_terms: bill.payment_terms || "Net 30",
        purchase_order_id: bill.purchase_order_id ? String(bill.purchase_order_id) : "",
        vendor_name: bill.vendor_name,
        vendor_email: bill.vendor_email || "",
        vendor_phone: bill.vendor_phone || "",
        vendor_gstin: bill.vendor_gstin || "",
        vendor_address: bill.vendor_address || "",
        deal_id: bill.deal_id ? String(bill.deal_id) : "",
        contact_id: bill.contact_id ? String(bill.contact_id) : "",
        round_off: String(bill.round_off || 0),
        internal_notes: bill.internal_notes || "",
        line_items: bill.line_items.length ? bill.line_items.map((li) => ({
          purchase_order_line_item_id: li.purchase_order_line_item_id ? String(li.purchase_order_line_item_id) : "",
          description: li.description,
          quantity: String(li.quantity),
          unit: li.unit || "Unit",
          unit_price: String(li.unit_price),
          tax_rate: String(li.tax_rate),
        })) : [emptyLineItem()],
      });
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id, isEdit]);

  const totals = useMemo(
    () => computeBillTotals(form.line_items, Number(form.round_off) || 0),
    [form],
  );

  const buildPayload = () => ({
    title: form.title.trim(),
    supplier_invoice_number: form.supplier_invoice_number || null,
    currency: form.currency,
    bill_date: form.bill_date ? new Date(`${form.bill_date}T00:00:00`).toISOString() : new Date().toISOString(),
    due_date: form.due_date ? new Date(`${form.due_date}T23:59:59`).toISOString() : null,
    payment_terms: form.payment_terms || null,
    purchase_order_id: form.purchase_order_id ? Number(form.purchase_order_id) : null,
    vendor_name: form.vendor_name.trim(),
    vendor_email: form.vendor_email || null,
    vendor_phone: form.vendor_phone || null,
    vendor_gstin: form.vendor_gstin || null,
    vendor_address: form.vendor_address || null,
    deal_id: form.deal_id ? Number(form.deal_id) : null,
    contact_id: form.contact_id ? Number(form.contact_id) : null,
    round_off: Number(form.round_off) || 0,
    internal_notes: form.internal_notes || null,
    line_items: form.line_items.filter((li) => li.description.trim()).map((li, idx) => ({
      purchase_order_line_item_id: li.purchase_order_line_item_id ? Number(li.purchase_order_line_item_id) : null,
      sort_order: idx,
      description: li.description.trim(),
      quantity: Number(li.quantity) || 0,
      unit: li.unit || "Unit",
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
        await apiFetch(`/vendor-bills/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        navigate(`/vendor-bills/${id}`);
      } else {
        const created = await apiFetch("/vendor-bills", { method: "POST", body: JSON.stringify(payload) });
        navigate(`/vendor-bills/${created.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading || creatingFromPo) {
    return <DashboardLayout title="Vendor Bill" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout title={isEdit ? "Edit Vendor Bill" : "New Vendor Bill"} roleLabel={role}>
      <div className="crm-quote-builder">
        <div className="crm-panel crm-quote-builder-main">
          <Link to={isEdit ? `/vendor-bills/${id}` : "/vendor-bills"} className="crm-link crm-link-left">← Back</Link>
          {error && <p className="crm-error crm-mt">{error}</p>}
          <form onSubmit={handleSubmit} className="crm-form crm-mt">
            <div className="crm-form-grid">
              <div className="crm-span-2"><label>Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><label>Supplier invoice #</label><input value={form.supplier_invoice_number} onChange={(e) => setForm({ ...form, supplier_invoice_number: e.target.value })} /></div>
              <div><label>Bill date</label><input type="date" value={form.bill_date} onChange={(e) => setForm({ ...form, bill_date: e.target.value })} /></div>
              <div><label>Due date</label><input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              <div><label>Payment terms</label><input value={form.payment_terms} onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} /></div>
            </div>
            <h3 className="crm-mt-lg">Vendor</h3>
            <div className="crm-form-grid">
              <div><label>Vendor name *</label><input value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} required /></div>
              <div><label>GSTIN</label><input value={form.vendor_gstin} onChange={(e) => setForm({ ...form, vendor_gstin: e.target.value })} /></div>
              <div><label>Email</label><input type="email" value={form.vendor_email} onChange={(e) => setForm({ ...form, vendor_email: e.target.value })} /></div>
              <div><label>Phone</label><input value={form.vendor_phone} onChange={(e) => setForm({ ...form, vendor_phone: e.target.value })} /></div>
              <div className="crm-span-2"><label>Address</label><textarea className="crm-textarea" rows={2} value={form.vendor_address} onChange={(e) => setForm({ ...form, vendor_address: e.target.value })} /></div>
            </div>
            <h3 className="crm-mt-lg">Line items</h3>
            {form.line_items.map((line, index) => (
              <div key={index} className="crm-quote-line-item crm-mb">
                <div className="crm-form-grid">
                  <div className="crm-span-2"><label>Description *</label><input value={line.description} onChange={(e) => { const items = [...form.line_items]; items[index] = { ...items[index], description: e.target.value }; setForm({ ...form, line_items: items }); }} required /></div>
                  <div><label>Qty</label><input type="number" min="0" step="0.01" value={line.quantity} onChange={(e) => { const items = [...form.line_items]; items[index] = { ...items[index], quantity: e.target.value }; setForm({ ...form, line_items: items }); }} /></div>
                  <div><label>Rate</label><input type="number" min="0" value={line.unit_price} onChange={(e) => { const items = [...form.line_items]; items[index] = { ...items[index], unit_price: e.target.value }; setForm({ ...form, line_items: items }); }} /></div>
                  <div><label>Tax %</label><input type="number" min="0" value={line.tax_rate} onChange={(e) => { const items = [...form.line_items]; items[index] = { ...items[index], tax_rate: e.target.value }; setForm({ ...form, line_items: items }); }} /></div>
                </div>
              </div>
            ))}
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => setForm({ ...form, line_items: [...form.line_items, emptyLineItem()] })}>+ Add line</button>
            <label className="crm-mt">Internal notes</label>
            <textarea className="crm-textarea" rows={2} value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} />
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

export default VendorBillForm;
