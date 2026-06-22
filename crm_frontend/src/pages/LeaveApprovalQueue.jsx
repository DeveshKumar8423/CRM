import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import {
  STATUS_LABELS,
  TYPE_LABELS,
  formatDate,
  formatDateRange,
  statusBadgeClass,
} from "../utils/leaves";

function LeaveApprovalQueue() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [meta, setMeta] = useState({ leave_types: [] });
  const [leaveType, setLeaveType] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch("/leaves/meta").then(setMeta).catch(() => {});
  }, []);

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (leaveType) params.set("leave_type", leaveType);
    apiFetch(`/leaves/approval-queue?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, [leaveType]);

  const approve = async (id) => {
    setError("");
    try {
      const note = window.prompt("Approval note (optional)");
      if (note === null) return;
      await apiFetch(`/leaves/${id}/approve`, { method: "POST", body: JSON.stringify({ reviewer_note: note || null }) });
      setMessage("Leave approved.");
      load(data.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const reject = async (id) => {
    const reason = window.prompt("Rejection reason (required)");
    if (!reason || !reason.trim()) return;
    setError("");
    try {
      await apiFetch(`/leaves/${id}/reject`, { method: "POST", body: JSON.stringify({ reviewer_note: reason.trim() }) });
      setMessage("Leave rejected.");
      load(data.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Leave Approval Queue" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/leaves" className="crm-link crm-link-left">← My leave</Link>
        <p className="crm-muted crm-mt">{data.total} request{data.total === 1 ? "" : "s"} awaiting approval</p>

        <div className="crm-filters crm-mt">
          <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
            <option value="">All types</option>
            {(meta.leave_types || []).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        {data.items.length === 0 && <p className="crm-muted crm-mt">No leave requests pending approval.</p>}

        <div className="crm-quote-approval-list crm-mt">
          {data.items.map((leave) => (
            <div key={leave.id} className="crm-quote-approval-card">
              <div className="crm-quote-approval-header">
                <div>
                  <strong>{leave.employee_name}</strong> — {TYPE_LABELS[leave.leave_type]}
                  <div className="crm-muted">{formatDateRange(leave.start_date, leave.end_date, leave.total_days, leave.is_half_day)}</div>
                </div>
                <span className={statusBadgeClass(leave.status)}>{STATUS_LABELS[leave.status]}</span>
              </div>
              <p className="crm-mt">{leave.reason}</p>
              <div className="crm-muted crm-text-sm">Submitted {formatDate(leave.submitted_at)}</div>
              {leave.overlap_warning && <p className="crm-warning crm-mt-sm">{leave.overlap_warning}</p>}
              <div className="crm-inline-actions crm-mt">
                <Link to={`/leaves/${leave.id}`} className="crm-btn crm-btn-sm crm-btn-outline">Review</Link>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => approve(leave.id)}>Approve</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => reject(leave.id)}>Reject</button>
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

export default LeaveApprovalQueue;
