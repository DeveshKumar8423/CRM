import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch, API_URL, getAuthHeaders } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  CATEGORY_LABELS,
  PAYMENT_MODE_LABELS,
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from "../utils/expenses";

function ExpenseDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [exp, setExp] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => apiFetch(`/expenses/${id}`).then(setExp).catch((err) => setError(err.message));
  useEffect(() => { load(); }, [id]);

  const run = async (path, body, msg) => {
    setError("");
    setMessage("");
    try {
      const updated = await apiFetch(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
      setExp(updated);
      setMessage(msg);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!exp && !error) {
    return <DashboardLayout title="Expense" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }
  if (error && !exp) {
    return <DashboardLayout title="Expense" roleLabel={role}><div className="crm-panel"><p className="crm-error">{error}</p></div></DashboardLayout>;
  }

  const canEdit = hasPermission("expenses.edit_own") && ["draft", "rejected"].includes(exp.status);
  const canSubmit = hasPermission("expenses.submit") && ["draft", "rejected"].includes(exp.status);
  const canApprove = hasPermission("expenses.approve") && ["submitted", "under_review"].includes(exp.status);
  const canReject = hasPermission("expenses.reject") && ["submitted", "under_review"].includes(exp.status);
  const canPay = hasPermission("expenses.mark_paid") && exp.status === "approved";
  const canCancel = ["draft", "submitted", "under_review", "approved", "rejected"].includes(exp.status);

  const downloadAttachment = async (attachmentId, filename) => {
    const response = await fetch(`${API_URL}/expenses/${id}/attachments/${attachmentId}/download`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      setError("Could not download attachment");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title={exp.title} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/expenses" className="crm-link crm-link-left">← All expenses</Link>
          <div className="crm-inline-actions">
            {canEdit && <Link to={`/expenses/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>}
            {canSubmit && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => run(`/expenses/${id}/submit`, null, "Submitted for approval")}>
                Submit for approval
              </button>
            )}
            {canApprove && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => run(`/expenses/${id}/approve`, { comments: "" }, "Approved")}>
                Approve
              </button>
            )}
            {canReject && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => {
                const reason = window.prompt("Rejection reason?");
                if (reason) run(`/expenses/${id}/reject`, { reason, comments: "" }, "Rejected");
              }}>
                Reject
              </button>
            )}
            {canPay && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => run(`/expenses/${id}/mark-paid`, null, "Marked as paid")}>
                Mark paid
              </button>
            )}
            {canCancel && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => run(`/expenses/${id}/cancel`, null, "Cancelled")}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-quote-header-strip crm-mt">
          <div><span className="crm-muted">Expense #</span> <strong>{exp.expense_number || "Draft"}</strong></div>
          <span className={statusBadgeClass(exp.status)}>{STATUS_LABELS[exp.status]}</span>
          <div className="crm-num"><strong>{formatCurrency(exp.total_amount, exp.currency)}</strong></div>
          <div><span className="crm-muted">Date</span> {formatDate(exp.expense_date)}</div>
          <div><span className="crm-muted">Submitter</span> {exp.submitted_by_name || "—"}</div>
        </div>

        <div className="crm-contact-meta crm-mt">
          <p><strong>Category:</strong> {CATEGORY_LABELS[exp.category] || exp.category}</p>
          <p><strong>Vendor:</strong> {exp.vendor_name}</p>
          <p><strong>Payment mode:</strong> {PAYMENT_MODE_LABELS[exp.payment_mode] || exp.payment_mode}</p>
          {exp.receipt_reference && <p><strong>Receipt ref:</strong> {exp.receipt_reference}</p>}
          {exp.deal_id && <p><strong>Deal:</strong> <Link to={`/deals/${exp.deal_id}`} className="crm-nav-link">{exp.deal_title}</Link></p>}
          {exp.contact_id && <p><strong>Contact:</strong> <Link to={`/contacts/${exp.contact_id}`} className="crm-nav-link">{exp.contact_name}</Link></p>}
          {exp.notes && <p><strong>Notes:</strong> {exp.notes}</p>}
          {exp.rejection_reason && <p className="crm-error"><strong>Rejection:</strong> {exp.rejection_reason}</p>}
          {exp.requires_proof && !exp.has_proof && <p><span className="crm-badge crm-expense-missing_proof">Missing Proof</span></p>}
        </div>

        <h3 className="crm-mt-lg">Proof / attachments</h3>
        {exp.attachments.length === 0 && <p className="crm-muted">No proof uploaded.</p>}
        <ul className="crm-timeline">
          {exp.attachments.map((a) => (
            <li key={a.id}>
              <button type="button" className="crm-nav-link crm-btn-link-style" onClick={() => downloadAttachment(a.id, a.original_filename)}>
                {a.original_filename}
              </button>
              <span className="crm-muted"> · {a.uploaded_by_name} · {(a.file_size / 1024).toFixed(1)} KB</span>
            </li>
          ))}
        </ul>

        <div className="crm-contact-meta crm-mt">
          {exp.approved_at && <p><strong>Approved:</strong> {formatDate(exp.approved_at)} by {exp.approved_by_name}</p>}
          {exp.paid_at && <p><strong>Paid:</strong> {formatDate(exp.paid_at)} by {exp.paid_by_name}</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ExpenseDetail;
