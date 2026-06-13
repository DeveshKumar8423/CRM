import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { NOTE_TYPE_LABELS, formatDateTime, noteTypeBadgeClass } from "../utils/clientNotes";

function ClientNotesFollowUpQueue() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = (page = 1) => {
    apiFetch(`/client-notes/follow-up-queue?page=${page}&limit=20`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load(1);
  }, []);

  const complete = async (id) => {
    setError("");
    try {
      await apiFetch(`/client-notes/${id}/complete-followup`, { method: "POST" });
      setMessage("Follow-up marked complete.");
      load(data.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Follow-Up Queue" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/client-notes" className="crm-link crm-link-left">← All client notes</Link>
        <p className="crm-muted crm-mt">{data.total} pending follow-up{data.total === 1 ? "" : "s"}</p>

        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}

        {data.items.length === 0 && <p className="crm-muted crm-mt">No pending follow-ups.</p>}

        <div className="crm-note-timeline crm-mt">
          {data.items.map((note) => (
            <div key={note.id} className={`crm-note-card ${note.follow_up_overdue ? "crm-note-card-overdue" : ""}`}>
              <div className="crm-note-card-header">
                <span className={noteTypeBadgeClass(note.note_type)}>{NOTE_TYPE_LABELS[note.note_type]}</span>
                {note.follow_up_overdue && <span className="crm-badge crm-note-overdue">Overdue</span>}
                <span className="crm-muted">Due {formatDateTime(note.follow_up_due_date)}</span>
              </div>
              <strong>{note.title}</strong>
              <p className="crm-note-excerpt">{note.body}</p>
              <div className="crm-note-card-meta crm-muted">
                {note.contact_name || "No contact"} · Owner: {note.assigned_to_name || note.author_name}
              </div>
              <div className="crm-inline-actions crm-mt">
                {note.contact_id && (
                  <Link to={`/contacts/${note.contact_id}`} className="crm-btn crm-btn-sm crm-btn-outline">Open contact</Link>
                )}
                <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => complete(note.id)}>Mark complete</button>
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

export default ClientNotesFollowUpQueue;
