import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from "../utils/expenses";

function ExpenseApprovalQueue() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = (page = 1) => {
    apiFetch(`/expenses/approval-queue?page=${page}&limit=20`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, []);

  const approve = async (id) => {
    setError("");
    try {
      await apiFetch(`/expenses/${id}/approve`, { method: "POST", body: JSON.stringify({ comments: "" }) });
      setMessage("Expense approved.");
      load(data.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const reject = async (id) => {
    const reason = window.prompt("Rejection reason?");
    if (!reason) return;
    setError("");
    try {
      await apiFetch(`/expenses/${id}/reject`, { method: "POST", body: JSON.stringify({ reason, comments: "" }) });
      setMessage("Expense rejected.");
      load(data.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Expense Approval Queue" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/expenses" className="crm-link crm-link-left">← All expenses</Link>
        <p className="crm-muted crm-mt">{data.total} expense{data.total === 1 ? "" : "s"} awaiting approval</p>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        {data.items.length === 0 && <p className="crm-muted crm-mt">No expenses pending approval.</p>}

        <div className="crm-quote-approval-list crm-mt">
          {data.items.map((exp) => (
            <div key={exp.id} className="crm-quote-approval-card">
              <div className="crm-quote-approval-header">
                <div>
                  <strong>{exp.expense_number || "Draft"}</strong> — {exp.title}
                  <div className="crm-muted">{exp.vendor_name} · {CATEGORY_LABELS[exp.category]}</div>
                </div>
                <strong className="crm-num">{formatCurrency(exp.total_amount, exp.currency)}</strong>
              </div>
              <div className="crm-quote-approval-flags">
                <span className={statusBadgeClass(exp.status)}>{STATUS_LABELS[exp.status]}</span>
                {!exp.has_proof && exp.requires_proof && (
                  <span className="crm-badge crm-expense-missing_proof">Missing Proof</span>
                )}
                <span className="crm-muted">{exp.submitted_by_name} · {formatDate(exp.expense_date)}</span>
              </div>
              <div className="crm-inline-actions crm-mt">
                <Link to={`/expenses/${exp.id}`} className="crm-btn crm-btn-sm crm-btn-outline">Review</Link>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => approve(exp.id)}>Approve</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => reject(exp.id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page <= 1} onClick={() => load(data.page - 1)}>Previous</button>
            <span className="crm-muted">Page {data.page} of {totalPages}</span>
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page >= totalPages} onClick={() => load(data.page + 1)}>Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ExpenseApprovalQueue;
