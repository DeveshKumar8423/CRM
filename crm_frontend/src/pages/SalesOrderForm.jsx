import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  ORDER_TYPES,
  computeOrderTotals,
  emptyForm,
  emptyLineItem,
  emptyMilestone,
  formatCurrency,
} from "../utils/salesOrders";

function SalesOrderForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";

  const [form, setForm] = useState({
    ...emptyForm(),
    deal_id: searchParams.get("deal_id") || "",
    lead_id: searchParams.get("lead_id") || "",
    contact_id: searchParams.get("contact_id") || "",
    quotation_id: searchParams.get("quotation_id") || "",
  });
  const [assignees, setAssignees] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    Promise.all([
      apiFetch("/sales-orders/assignees"),
      apiFetch("/products?limit=200"),
    ]).then(([staff, productData]) => {
      setAssignees(staff);
      setProducts(productData.items || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/sales-orders/${id}`).then((order) => {
      setForm({
        title: order.title || "",
        order_type: order.order_type || "mixed",
        currency: order.currency || "INR",
        order_date: order.order_date ? order.order_date.slice(0, 10) : "",
        due_date: order.due_date ? order.due_date.slice(0, 10) : "",
        internal_target_date: order.internal_target_date ? order.internal_target_date.slice(0, 10) : "",
        quotation_id: order.quotation_id ? String(order.quotation_id) : "",
        deal_id: order.deal_id ? String(order.deal_id) : "",
        lead_id: order.lead_id ? String(order.lead_id) : "",
        contact_id: order.contact_id ? String(order.contact_id) : "",
        assigned_to_id: order.assigned_to_id ? String(order.assigned_to_id) : "",
        client_name: order.client_name || "",
        client_email: order.client_email || "",
        client_phone: order.client_phone || "",
        client_org: order.client_org || "",
        attention_to: order.attention_to || "",
        billing_address: order.billing_address || "",
        delivery_address: order.delivery_address || "",
        header_discount_amount: String(order.header_discount_amount || 0),
        header_discount_percent: String(order.header_discount_percent || 0),
        billing_notes: order.billing_notes || "",
        payment_milestone_notes: order.payment_milestone_notes || "",
        delivery_instructions: order.delivery_instructions || "",
        internal_notes: order.internal_notes || "",
        line_items: order.line_items.length > 0
          ? order.line_items.map((li) => ({
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
        milestones: order.milestones.map((ms) => ({
          sort_order: ms.sort_order,
          title: ms.title || "",
          description: ms.description || "",
          status: ms.status || "pending",
          due_date: ms.due_date ? ms.due_date.slice(0, 10) : "",
          owner_id: ms.owner_id ? String(ms.owner_id) : "",
        })),
      });
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id, isEdit]);

  const totals = useMemo(
    () => computeOrderTotals(form.line_items, Number(form.header_discount_amount) || 0, Number(form.header_discount_percent) || 0),
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

  const buildPayload = () => ({
    title: form.title.trim(),
    order_type: form.order_type,
    currency: form.currency || "INR",
    order_date: form.order_date ? new Date(`${form.order_date}T00:00:00`).toISOString() : new Date().toISOString(),
    due_date: form.due_date ? new Date(`${form.due_date}T23:59:59`).toISOString() : null,
    internal_target_date: form.internal_target_date ? new Date(`${form.internal_target_date}T00:00:00`).toISOString() : null,
    quotation_id: form.quotation_id ? Number(form.quotation_id) : null,
    deal_id: form.deal_id ? Number(form.deal_id) : null,
    lead_id: form.lead_id ? Number(form.lead_id) : null,
    contact_id: form.contact_id ? Number(form.contact_id) : null,
    assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
    client_name: form.client_name || null,
    client_email: form.client_email || null,
    client_phone: form.client_phone || null,
    client_org: form.client_org || null,
    attention_to: form.attention_to || null,
    billing_address: form.billing_address || null,
    delivery_address: form.delivery_address || null,
    header_discount_amount: Number(form.header_discount_amount) || 0,
    header_discount_percent: Number(form.header_discount_percent) || 0,
    billing_notes: form.billing_notes || null,
    payment_milestone_notes: form.payment_milestone_notes || null,
    delivery_instructions: form.delivery_instructions || null,
    internal_notes: form.internal_notes || null,
    line_items: form.line_items.filter((li) => li.item_name.trim()).map((li, idx) => ({
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
    milestones: form.milestones.filter((ms) => ms.title.trim()).map((ms, idx) => ({
      sort_order: idx,
      title: ms.title.trim(),
      description: ms.description || null,
      status: ms.status || "pending",
      due_date: ms.due_date ? new Date(`${ms.due_date}T00:00:00`).toISOString() : null,
      owner_id: ms.owner_id ? Number(ms.owner_id) : null,
    })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = buildPayload();
      if (isEdit) {
        await apiFetch(`/sales-orders/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        navigate(`/sales-orders/${id}`);
      } else {
        const created = await apiFetch("/sales-orders", { method: "POST", body: JSON.stringify(payload) });
        navigate(`/sales-orders/${created.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <DashboardLayout title="Sales Order" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout title={isEdit ? "Edit Sales Order" : "New Sales Order"} roleLabel={role}>
      <div className="crm-quote-builder">
        <div className="crm-panel crm-quote-builder-main">
          <Link to={isEdit ? `/sales-orders/${id}` : "/sales-orders"} className="crm-link crm-link-left">← Back</Link>
          {error && <p className="crm-error crm-mt">{error}</p>}

          <form onSubmit={handleSubmit} className="crm-form crm-mt">
            <h3>Header</h3>
            <div className="crm-form-grid">
              <div className="crm-span-2">
                <label>Order title *</label>
                <input value={form.title} onChange={(e) => handleChange("title", e.target.value)} required />
              </div>
              <div>
                <label>Order type</label>
                <select value={form.order_type} onChange={(e) => handleChange("order_type", e.target.value)}>
                  {Object.entries(ORDER_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label>Order date</label>
                <input type="date" value={form.order_date} onChange={(e) => handleChange("order_date", e.target.value)} />
              </div>
              <div>
                <label>Due date</label>
                <input type="date" value={form.due_date} onChange={(e) => handleChange("due_date", e.target.value)} />
              </div>
              <div>
                <label>Internal target date</label>
                <input type="date" value={form.internal_target_date} onChange={(e) => handleChange("internal_target_date", e.target.value)} />
              </div>
              <div>
                <label>Owner</label>
                <select value={form.assigned_to_id} onChange={(e) => handleChange("assigned_to_id", e.target.value)}>
                  <option value="">Unassigned</option>
                  {assignees.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            <h3 className="crm-mt-lg">Customer</h3>
            <div className="crm-form-grid">
              <div><label>Name *</label><input value={form.client_name} onChange={(e) => handleChange("client_name", e.target.value)} required /></div>
              <div><label>Email</label><input type="email" value={form.client_email} onChange={(e) => handleChange("client_email", e.target.value)} /></div>
              <div><label>Phone</label><input value={form.client_phone} onChange={(e) => handleChange("client_phone", e.target.value)} /></div>
              <div><label>Organization</label><input value={form.client_org} onChange={(e) => handleChange("client_org", e.target.value)} /></div>
              <div className="crm-span-2"><label>Billing address</label><textarea className="crm-textarea" rows={2} value={form.billing_address} onChange={(e) => handleChange("billing_address", e.target.value)} /></div>
              <div className="crm-span-2"><label>Delivery address</label><textarea className="crm-textarea" rows={2} value={form.delivery_address} onChange={(e) => handleChange("delivery_address", e.target.value)} /></div>
            </div>

            <h3 className="crm-mt-lg">Source reference</h3>
            <div className="crm-form-grid">
              <div><label>Quotation ID</label><input value={form.quotation_id} onChange={(e) => handleChange("quotation_id", e.target.value)} /></div>
              <div><label>Deal ID</label><input value={form.deal_id} onChange={(e) => handleChange("deal_id", e.target.value)} /></div>
              <div><label>Contact ID</label><input value={form.contact_id} onChange={(e) => handleChange("contact_id", e.target.value)} /></div>
            </div>

            <h3 className="crm-mt-lg">Line items</h3>
            <select defaultValue="" className="crm-mb" onChange={(e) => {
              const p = products.find((x) => String(x.id) === e.target.value);
              if (!p) return;
              setForm((prev) => ({
                ...prev,
                line_items: [...prev.line_items, {
                  ...emptyLineItem(),
                  product_id: String(p.id),
                  item_name: p.name,
                  description: p.description || "",
                  unit: p.unit || "Service",
                  unit_price: String(p.offer_price || p.total_price || p.our_fees || 0),
                  tax_rate: String(p.gst_rate || 18),
                }],
              }));
              e.target.value = "";
            }}>
              <option value="">Add from product…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            {form.line_items.map((line, index) => (
              <div key={index} className="crm-quote-line-item crm-mb">
                <div className="crm-form-grid">
                  <div className="crm-span-2"><label>Item *</label><input value={line.item_name} onChange={(e) => handleLineChange(index, "item_name", e.target.value)} required /></div>
                  <div><label>Qty</label><input type="number" min="0" value={line.quantity} onChange={(e) => handleLineChange(index, "quantity", e.target.value)} /></div>
                  <div><label>Unit price</label><input type="number" min="0" value={line.unit_price} onChange={(e) => handleLineChange(index, "unit_price", e.target.value)} /></div>
                  <div><label>Tax %</label><input type="number" min="0" value={line.tax_rate} onChange={(e) => handleLineChange(index, "tax_rate", e.target.value)} /></div>
                </div>
                {form.line_items.length > 1 && (
                  <button type="button" className="crm-btn crm-btn-sm crm-btn-outline crm-mt" onClick={() => setForm((prev) => ({ ...prev, line_items: prev.line_items.filter((_, i) => i !== index) }))}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => setForm((prev) => ({ ...prev, line_items: [...prev.line_items, emptyLineItem()] }))}>+ Add line</button>

            <h3 className="crm-mt-lg">Milestones</h3>
            {form.milestones.map((ms, index) => (
              <div key={index} className="crm-quote-line-item crm-mb">
                <div className="crm-form-grid">
                  <div className="crm-span-2"><label>Milestone</label><input value={ms.title} onChange={(e) => setForm((prev) => { const m = [...prev.milestones]; m[index] = { ...m[index], title: e.target.value }; return { ...prev, milestones: m }; })} /></div>
                  <div><label>Due</label><input type="date" value={ms.due_date} onChange={(e) => setForm((prev) => { const m = [...prev.milestones]; m[index] = { ...m[index], due_date: e.target.value }; return { ...prev, milestones: m }; })} /></div>
                </div>
              </div>
            ))}
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => setForm((prev) => ({ ...prev, milestones: [...prev.milestones, emptyMilestone()] }))}>+ Add milestone</button>

            <h3 className="crm-mt-lg">Billing &amp; delivery notes</h3>
            <label>Billing notes</label><textarea className="crm-textarea" rows={2} value={form.billing_notes} onChange={(e) => handleChange("billing_notes", e.target.value)} />
            <label>Delivery instructions</label><textarea className="crm-textarea" rows={2} value={form.delivery_instructions} onChange={(e) => handleChange("delivery_instructions", e.target.value)} />
            <label>Internal notes</label><textarea className="crm-textarea" rows={2} value={form.internal_notes} onChange={(e) => handleChange("internal_notes", e.target.value)} />

            <div className="crm-quote-sticky-footer crm-mt-lg">
              <button type="submit" className="crm-btn crm-btn-inline">Save draft</button>
            </div>
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

export default SalesOrderForm;
