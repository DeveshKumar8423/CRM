import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import {
  STATUS_LABELS,
  formatDate,
  formatHours,
  statusBadgeClass,
} from "../utils/timesheets";

function TimesheetDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [entry, setEntry] = useState(null);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => apiFetch(`/timesheets/${id}`).then(setEntry).catch((err) => setError(err.message));
  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    apiFetch("/users/me").then((u) => setUserId(u.id)).catch(() => {});
  }, []);

  const run = async (path, body, msg) => {
    setError("");
    setMessage("");
    try {
      const updated = await apiFetch(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
      setEntry(updated);
      setMessage(msg);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!entry && !error) {
    return <DashboardLayout title="Timesheet" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }
  if (error && !entry) {
    return <DashboardLayout title="Timesheet" roleLabel={role}><div className="crm-panel"><p className="crm-error">{error}</p></div></DashboardLayout>;
  }

  const isOwn = userId != null && entry.employee_id === userId;
  const canEdit = isOwn && hasPermission("timesheets.edit_own") && ["draft", "rejected"].includes(entry.status);
  const canSubmit = isOwn && hasPermission("timesheets.submit") && ["draft", "rejected"].includes(entry.status);
  const canApprove = hasPermission("timesheets.approve") && entry.status === "submitted" && !isOwn;
  const canDelete = isOwn && hasPermission("timesheets.delete_own") && entry.status === "draft";

  const handleDelete = async () => {
    if (!window.confirm("Delete this draft entry?")) return;
    try {
      await apiFetch(`/timesheets/${id}`, { method: "DELETE" });
      window.location.href = "/timesheets";
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title={entry.entry_number || "Timesheet entry"} roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <Link to="/timesheets" className="crm-link crm-link-left">← My timesheets</Link>
          <div className="crm-inline-actions">
            {canEdit && <Link to={`/timesheets/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>}
            {canSubmit && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => run(`/timesheets/${id}/submit`, {}, "Submitted for approval")}>
                Submit for approval
              </button>
            )}
            {canApprove && (
              <>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => {
                  const note = window.prompt("Approval note (optional)");
                  if (note === null) return;
                  run(`/timesheets/${id}/approve`, { reviewer_note: note || null }, "Timesheet approved");
                }}>Approve</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => {
                  const note = window.prompt("Rejection reason (required)");
                  if (!note || note.trim().length < 5) return;
                  run(`/timesheets/${id}/reject`, { reviewer_note: note.trim() }, "Timesheet rejected");
                }}>Reject</button>
              </>
            )}
            {canDelete && (
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={handleDelete}>Delete draft</button>
            )}
          </div>
        </div>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-contact-meta crm-mt">
          <p><span className={statusBadgeClass(entry.status)}>{STATUS_LABELS[entry.status]}</span></p>
          <p><strong>Employee:</strong> {entry.employee_name}</p>
          <p><strong>Date:</strong> {formatDate(entry.work_date)}</p>
          <p><strong>Hours:</strong> {formatHours(entry.hours)} ({entry.is_billable ? "Billable" : "Non-billable"})</p>
          {entry.project_name && <p><strong>Project:</strong> {entry.project_number} — {entry.project_name}</p>}
          {entry.task_title && <p><strong>Task:</strong> {entry.task_title}</p>}
          {entry.contact_name && <p><strong>Client:</strong> {entry.contact_name}</p>}
          <p><strong>Description:</strong> {entry.description}</p>
          {entry.submitted_at && <p><strong>Submitted:</strong> {formatDate(entry.submitted_at)}</p>}
          {entry.reviewed_by_name && <p><strong>Reviewed by:</strong> {entry.reviewed_by_name} on {formatDate(entry.reviewed_at)}</p>}
          {entry.reviewer_note && <p><strong>Reviewer note:</strong> {entry.reviewer_note}</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default TimesheetDetail;
