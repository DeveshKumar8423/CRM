import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  HALF_DAY_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
  formatDate,
  formatDateRange,
  statusBadgeClass,
} from "../utils/leaves";

function LeaveDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [leave, setLeave] = useState(null);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => apiFetch(`/leaves/${id}`).then(setLeave).catch((err) => setError(err.message));
  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    apiFetch("/users/me").then((u) => setUserId(u.id)).catch(() => {});
  }, []);

  const run = async (path, body, msg) => {
    setError("");
    setMessage("");
    try {
      const updated = await apiFetch(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
      setLeave(updated);
      setMessage(msg);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!leave && !error) {
    return <DashboardLayout title="Leave" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }
  if (error && !leave) {
    return <DashboardLayout title="Leave" roleLabel={role}><div className="crm-panel"><p className="crm-error">{error}</p></div></DashboardLayout>;
  }

  const isOwn = userId != null && leave.employee_id === userId;
  const canEdit = isOwn && hasPermission("leaves.edit_own") && ["draft", "rejected"].includes(leave.status);
  const canSubmit = isOwn && hasPermission("leaves.create") && ["draft", "rejected"].includes(leave.status);
  const canApprove = hasPermission("leaves.approve") && leave.status === "pending";
  const canCancelOwn = isOwn && hasPermission("leaves.cancel_own") && ["draft", "pending"].includes(leave.status);
  const canCancelAll = hasPermission("leaves.cancel_all") && leave.status !== "cancelled" && !canCancelOwn;

  return (
    <DashboardLayout title={leave.leave_number || "Leave request"} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/leaves" className="crm-link crm-link-left">← My leave</Link>
          <div className="crm-inline-actions">
            {canEdit && <Link to={`/leaves/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>}
            {canSubmit && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => run(`/leaves/${id}/submit`, {}, "Submitted for approval")}>
                Submit for approval
              </button>
            )}
            {canApprove && (
              <>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => {
                  const note = window.prompt("Approval note (optional)");
                  if (note === null) return;
                  run(`/leaves/${id}/approve`, { reviewer_note: note || null }, "Leave approved");
                }}>Approve</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => {
                  const note = window.prompt("Rejection reason (required)");
                  if (!note || !note.trim()) return;
                  run(`/leaves/${id}/reject`, { reviewer_note: note.trim() }, "Leave rejected");
                }}>Reject</button>
              </>
            )}
            {canCancelOwn && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => {
                if (!window.confirm("Cancel this leave request?")) return;
                run(`/leaves/${id}/cancel`, {}, "Leave cancelled");
              }}>Cancel</button>
            )}
            {canCancelAll && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => {
                const reason = window.prompt("Cancellation reason (optional)");
                if (reason === null) return;
                run(`/leaves/${id}/cancel`, { reason: reason || null }, "Leave cancelled");
              }}>Cancel request</button>
            )}
          </div>
        </div>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}
        {leave.overlap_warning && <p className="crm-warning crm-mt">{leave.overlap_warning}</p>}

        <div className="crm-contact-meta crm-mt">
          <p><span className={statusBadgeClass(leave.status)}>{STATUS_LABELS[leave.status]}</span></p>
          <p><strong>Employee:</strong> {leave.employee_name}</p>
          <p><strong>Type:</strong> {TYPE_LABELS[leave.leave_type]}</p>
          <p><strong>Dates:</strong> {formatDateRange(leave.start_date, leave.end_date, leave.total_days, leave.is_half_day)}</p>
          {leave.is_half_day && <p><strong>Half day:</strong> {HALF_DAY_LABELS[leave.half_day_period] || leave.half_day_period}</p>}
          <p><strong>Reason:</strong> {leave.reason}</p>
          {leave.submitted_at && <p><strong>Submitted:</strong> {formatDate(leave.submitted_at)}</p>}
          {leave.reviewed_by_name && <p><strong>Reviewed by:</strong> {leave.reviewed_by_name} on {formatDate(leave.reviewed_at)}</p>}
          {leave.reviewer_note && <p><strong>Reviewer note:</strong> {leave.reviewer_note}</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default LeaveDetail;
