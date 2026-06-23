import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import {
  STATUS_LABELS,
  formatDate,
  formatHours,
  statusBadgeClass,
} from "../utils/timesheets";

function TimesheetApprovalQueue() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    apiFetch(`/timesheets/approval-queue?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(1); }, []);

  const approve = async (id) => {
    const note = window.prompt("Approval note (optional)");
    if (note === null) return;
    try {
      await apiFetch(`/timesheets/${id}/approve`, { method: "POST", body: JSON.stringify({ reviewer_note: note || null }) });
      setMessage("Timesheet approved.");
      load(data.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const reject = async (id) => {
    const reason = window.prompt("Rejection reason (required)");
    if (!reason || reason.trim().length < 5) return;
    try {
      await apiFetch(`/timesheets/${id}/reject`, { method: "POST", body: JSON.stringify({ reviewer_note: reason.trim() }) });
      setMessage("Timesheet rejected.");
      load(data.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Timesheet Approval Queue" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/timesheets" className="crm-link crm-link-left">← My timesheets</Link>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        {data.items.length === 0 && <p className="crm-muted crm-mt">No timesheet entries pending approval.</p>}

        <div className="crm-mt">
          {data.items.map((entry) => (
            <div key={entry.id} className="crm-quote-approval-card">
              <div className="crm-detail-header">
                <div>
                  <strong>{entry.employee_name}</strong> — {formatHours(entry.hours)} on {formatDate(entry.work_date)}
                  <div className="crm-muted">{entry.project_name || "No project"}{entry.task_title ? ` · ${entry.task_title}` : ""}</div>
                </div>
                <span className={statusBadgeClass(entry.status)}>{STATUS_LABELS[entry.status]}</span>
              </div>
              <p className="crm-mt">{entry.description}</p>
              <div className="crm-inline-actions crm-mt">
                <Link to={`/timesheets/${entry.id}`} className="crm-btn crm-btn-sm crm-btn-outline">Review</Link>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => approve(entry.id)}>Approve</button>
                <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => reject(entry.id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" disabled={data.page <= 1} onClick={() => load(data.page - 1)}>Previous</button>
            <span className="crm-muted">Page {data.page} of {totalPages}</span>
            <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" disabled={data.page >= totalPages} onClick={() => load(data.page + 1)}>Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default TimesheetApprovalQueue;
