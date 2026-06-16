import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

// ─── empty form state ────────────────────────────────────────────────────────
const emptyForm = {
  name: "",
  subject: "",
  body: "",
  description: "",
  is_active: true,
};

// ─── helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({ template, onClose }) {
  if (!template) return null;
  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div
        className="crm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="crm-modal-header">
          <h3>Preview — {template.name}</h3>
          <button
            type="button"
            className="crm-modal-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        <div className="crm-modal-body">
          <p className="crm-section-title" style={{ marginTop: 0 }}>Subject</p>
          <div className="crm-preview-subject">{template.subject}</div>

          <p className="crm-section-title">Body</p>
          <pre className="crm-preview-body">{template.body}</pre>

          {template.description && (
            <>
              <p className="crm-section-title">Description</p>
              <p className="crm-muted" style={{ fontSize: "0.9rem" }}>
                {template.description}
              </p>
            </>
          )}
        </div>

        <div className="crm-modal-footer">
          <button
            type="button"
            className="crm-btn crm-btn-outline crm-btn-inline"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);   // null = create mode
  const [showForm, setShowForm] = useState(false);
  const [previewTpl, setPreviewTpl] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // ── load ──────────────────────────────────────────────────────────────────
  const loadTemplates = async () => {
    try {
      const data = await apiFetch("/admin/email-templates");
      setTemplates(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { loadTemplates(); }, []);

  // ── form helpers ──────────────────────────────────────────────────────────
  const field = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const openEdit = (tpl) => {
    setEditingId(tpl.id);
    setForm({
      name: tpl.name,
      subject: tpl.subject,
      body: tpl.body,
      description: tpl.description || "",
      is_active: tpl.is_active,
    });
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  };

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        description: form.description || null,
      };
      if (editingId) {
        await apiFetch(`/admin/email-templates/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("Template updated successfully.");
      } else {
        await apiFetch("/admin/email-templates", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Template created successfully.");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── toggle ────────────────────────────────────────────────────────────────
  const handleToggle = async (tpl) => {
    setMessage("");
    setError("");
    try {
      await apiFetch(`/admin/email-templates/${tpl.id}/toggle`, {
        method: "PATCH",
      });
      setMessage(
        `"${tpl.name}" is now ${tpl.is_active ? "inactive" : "active"}.`
      );
      await loadTemplates();
    } catch (err) {
      setError(err.message);
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (tpl) => {
    if (!window.confirm(`Delete template "${tpl.name}"? This cannot be undone.`))
      return;
    setMessage("");
    setError("");
    try {
      await apiFetch(`/admin/email-templates/${tpl.id}`, { method: "DELETE" });
      setMessage(`"${tpl.name}" deleted.`);
      await loadTemplates();
    } catch (err) {
      setError(err.message);
    }
  };

  // ── filtered list ─────────────────────────────────────────────────────────
  const filtered = templates.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q)
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Email Templates" roleLabel="Admin">
      <div className="crm-panel">

        {/* ── back + description ── */}
        <Link to="/admin-dashboard" className="crm-link crm-link-left">
          ← Back to dashboard
        </Link>
        <p className="crm-muted crm-mt">
          Manage reusable email templates for CRM notifications. Placeholders
          like <code>{"{{name}}"}</code> and <code>{"{{reset_link}}"}</code> are
          stored as-is and resolved at send time.
        </p>

        {/* ── alerts ── */}
        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}

        {/* ── toolbar ── */}
        {!showForm && (
          <div className="crm-contacts-toolbar crm-mt">
            <form
              className="crm-search-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                placeholder="Search by name, subject or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <button
              type="button"
              className="crm-btn crm-btn-sm crm-btn-inline"
              onClick={openCreate}
            >
              + Create Template
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            FORM — create / edit
        ══════════════════════════════════════════ */}
        {showForm && (
          <form onSubmit={handleSubmit} className="crm-form crm-mt">
            <h3>{editingId ? "Edit Template" : "New Template"}</h3>

            <div className="crm-form-grid">
              {/* Name */}
              <div>
                <label>Template Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => field("name", e.target.value)}
                  placeholder="e.g. WELCOME_EMAIL"
                  maxLength={120}
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label>Subject *</label>
                <input
                  value={form.subject}
                  onChange={(e) => field("subject", e.target.value)}
                  placeholder="e.g. Welcome to {{company_name}}"
                  maxLength={255}
                  required
                />
              </div>

              {/* Description */}
              <div className="crm-span-2">
                <label>Description</label>
                <input
                  value={form.description}
                  onChange={(e) => field("description", e.target.value)}
                  placeholder="Brief description and list of placeholders used…"
                  maxLength={2000}
                />
              </div>

              {/* Body */}
              <div className="crm-span-2">
                <label>Body *</label>
                <textarea
                  className="crm-textarea"
                  rows={10}
                  value={form.body}
                  onChange={(e) => field("body", e.target.value)}
                  placeholder={"Hello {{name}},\n\nYour message here…"}
                  required
                />
              </div>

              {/* Active toggle */}
              <div>
                <label className="crm-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => field("is_active", e.target.checked)}
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="crm-inline-actions crm-mt">
              <button
                type="submit"
                className="crm-btn crm-btn-inline"
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : editingId
                  ? "Save Changes"
                  : "Create Template"}
              </button>
              <button
                type="button"
                className="crm-btn crm-btn-outline crm-btn-inline"
                onClick={cancelForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ══════════════════════════════════════════
            TABLE
        ══════════════════════════════════════════ */}
        {!showForm && (
          <div className="crm-table-wrap crm-mt">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="crm-muted">
                      {search ? "No templates match your search." : "No templates yet. Create one above."}
                    </td>
                  </tr>
                )}
                {filtered.map((tpl) => (
                  <tr key={tpl.id}>
                    <td>
                      <strong>{tpl.name}</strong>
                      {tpl.description && (
                        <>
                          <br />
                          <span className="crm-muted" style={{ fontSize: "0.82rem" }}>
                            {tpl.description.length > 60
                              ? tpl.description.slice(0, 60) + "…"
                              : tpl.description}
                          </span>
                        </>
                      )}
                    </td>
                    <td className="crm-nowrap">{tpl.subject}</td>
                    <td>
                      <span
                        className={`crm-badge ${
                          tpl.is_active
                            ? "crm-badge-active"
                            : "crm-badge-inactive"
                        }`}
                      >
                        {tpl.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="crm-nowrap">{formatDate(tpl.created_at)}</td>
                    <td>
                      <div className="crm-table-actions">
                        <button
                          type="button"
                          className="crm-btn crm-btn-sm crm-btn-outline"
                          onClick={() => setPreviewTpl(tpl)}
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          className="crm-btn crm-btn-sm crm-btn-outline"
                          onClick={() => openEdit(tpl)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="crm-btn crm-btn-sm crm-btn-outline"
                          onClick={() => handleToggle(tpl)}
                        >
                          {tpl.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          className="crm-btn crm-btn-sm"
                          style={{ background: "var(--crm-danger)" }}
                          onClick={() => handleDelete(tpl)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Preview Modal ── */}
      <PreviewModal
        template={previewTpl}
        onClose={() => setPreviewTpl(null)}
      />
    </DashboardLayout>
  );
}

export default EmailTemplates;
