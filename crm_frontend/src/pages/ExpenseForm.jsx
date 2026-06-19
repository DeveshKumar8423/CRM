import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch, API_URL, getAuthHeaders } from "../utils/api";
import { CATEGORY_LABELS, PAYMENT_MODE_LABELS, emptyForm } from "../utils/expenses";

function ExpenseForm() {
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
  const [categories, setCategories] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [proofFile, setProofFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    Promise.all([
      apiFetch("/expenses/categories"),
      apiFetch("/expenses/payment-modes"),
    ]).then(([cats, modes]) => {
      setCategories(cats);
      setPaymentModes(modes);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/expenses/${id}`).then((exp) => {
      setForm({
        title: exp.title,
        category: exp.category,
        vendor_name: exp.vendor_name,
        amount: String(exp.amount),
        tax_amount: String(exp.tax_amount || 0),
        currency: exp.currency,
        expense_date: exp.expense_date?.slice(0, 10) || "",
        reimbursement_due_date: exp.reimbursement_due_date?.slice(0, 10) || "",
        payment_mode: exp.payment_mode,
        notes: exp.notes || "",
        receipt_reference: exp.receipt_reference || "",
        cost_center: exp.cost_center || "",
        deal_id: exp.deal_id ? String(exp.deal_id) : "",
        contact_id: exp.contact_id ? String(exp.contact_id) : "",
      });
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id, isEdit]);

  const buildPayload = () => ({
    title: form.title.trim(),
    category: form.category,
    vendor_name: form.vendor_name.trim(),
    amount: Number(form.amount),
    tax_amount: Number(form.tax_amount) || 0,
    currency: form.currency,
    expense_date: new Date(`${form.expense_date}T12:00:00`).toISOString(),
    reimbursement_due_date: form.reimbursement_due_date
      ? new Date(`${form.reimbursement_due_date}T12:00:00`).toISOString()
      : null,
    payment_mode: form.payment_mode,
    notes: form.notes || null,
    receipt_reference: form.receipt_reference || null,
    cost_center: form.cost_center || null,
    deal_id: form.deal_id ? Number(form.deal_id) : null,
    contact_id: form.contact_id ? Number(form.contact_id) : null,
  });

  const uploadProof = async (expenseId) => {
    if (!proofFile) return;
    const body = new FormData();
    body.append("file", proofFile);
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/expenses/${expenseId}/attachments`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || "Proof upload failed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = buildPayload();
      let expenseId = id;
      if (isEdit) {
        await apiFetch(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        const created = await apiFetch("/expenses", { method: "POST", body: JSON.stringify(payload) });
        expenseId = created.id;
      }
      if (proofFile) await uploadProof(expenseId);
      navigate(`/expenses/${expenseId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <DashboardLayout title="Expense" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout title={isEdit ? "Edit Expense" : "New Expense"} roleLabel={role}>
      <div className="crm-panel">
        <Link to={isEdit ? `/expenses/${id}` : "/expenses"} className="crm-link crm-link-left">← Back</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <form onSubmit={handleSubmit} className="crm-form crm-mt">
          <div className="crm-form-grid">
            <div className="crm-span-2">
              <label>Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label>Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label>Vendor *</label>
              <input value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} required />
            </div>
            <div>
              <label>Amount *</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label>Tax</label>
              <input type="number" min="0" step="0.01" value={form.tax_amount} onChange={(e) => setForm({ ...form, tax_amount: e.target.value })} />
            </div>
            <div>
              <label>Expense date *</label>
              <input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} required />
            </div>
            <div>
              <label>Payment mode *</label>
              <select value={form.payment_mode} onChange={(e) => setForm({ ...form, payment_mode: e.target.value })} required>
                {paymentModes.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label>Reimbursement due</label>
              <input type="date" value={form.reimbursement_due_date} onChange={(e) => setForm({ ...form, reimbursement_due_date: e.target.value })} />
            </div>
            <div>
              <label>Receipt reference</label>
              <input value={form.receipt_reference} onChange={(e) => setForm({ ...form, receipt_reference: e.target.value })} />
            </div>
          </div>
          <label>Notes</label>
          <textarea className="crm-textarea" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <label>Proof / receipt (JPG, PNG, PDF — max 5MB)</label>
          <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
          <div className="crm-quote-sticky-footer crm-mt-lg">
            <button type="submit" className="crm-btn crm-btn-inline">Save draft</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default ExpenseForm;
