import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

const CATEGORIES = [
  { value: "announcement", label: "Announcement" },
  { value: "follow_up", label: "Follow-up" },
  { value: "approval", label: "Approval" },
  { value: "payment", label: "Payment" },
  { value: "task", label: "Task" },
  { value: "system", label: "System" },
];

const ROLE_LABELS = {
  all_staff: "All staff roles",
  Admin: "Admin only",
  Manager: "Managers only",
  Employee: "Employees only",
  Sales: "Sales team only",
  Accountant: "Accountants only",
  User: "Portal users only",
};

const DASHBOARD_PATHS = {
  Admin: "/admin-dashboard",
  Manager: "/manager-dashboard",
  Employee: "/employee-dashboard",
  Sales: "/sales-dashboard",
  Accountant: "/accountant-dashboard",
};

function SendNotification() {
  const role = localStorage.getItem("role") || "Staff";
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    target_role: "all_staff",
    category: "announcement",
    title: "",
    message: "",
    link_path: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    apiFetch("/notifications/roles")
      .then((data) => {
        const list = data.roles || [];
        setRoles(list);
        setForm((f) => {
          if (f.target_role === "all_staff" || list.includes(f.target_role)) return f;
          return { ...f, target_role: list[0] || "all_staff" };
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSending(true);
    try {
      const result = await apiFetch("/notifications/send", {
        method: "POST",
        body: JSON.stringify({
          target_role: form.target_role,
          category: form.category,
          title: form.title,
          message: form.message,
          link_path: form.link_path.trim() || null,
        }),
      });
      setMessage(`${result.message} (${result.recipient_count} recipient(s) for ${ROLE_LABELS[result.target_role] || result.target_role})`);
      setForm((f) => ({ ...f, title: "", message: "", link_path: "" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout title="Send staff alert" roleLabel={role}>
      <div className="crm-panel">
        <Link to={DASHBOARD_PATHS[role] || "/"} className="crm-link crm-link-left">← Back to dashboard</Link>
        <p className="crm-muted crm-mt">
          Send an in-app alert to a role group. Recipients see it in the <strong>🔔 Alerts</strong> bell.
          Your own role is not listed — you cannot broadcast to your own role group.
        </p>

        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}

        <form className="crm-form crm-mt" onSubmit={submit}>
          <div className="crm-form-grid">
            <div>
              <label>Send to</label>
              <select
                value={form.target_role}
                onChange={(e) => setForm((f) => ({ ...f, target_role: e.target.value }))}
                required
              >
                <option value="all_staff">{ROLE_LABELS.all_staff}</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <label>Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Office closed tomorrow"
            maxLength={200}
            required
          />

          <label>Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Write the alert message staff should read…"
            rows={4}
            maxLength={2000}
            required
          />

          <label>Link (optional)</label>
          <input
            value={form.link_path}
            onChange={(e) => setForm((f) => ({ ...f, link_path: e.target.value }))}
            placeholder="/leaves or /profile"
          />
          <p className="crm-muted crm-text-sm">Internal app path — recipients can tap Open in their bell.</p>

          <button type="submit" className="crm-btn crm-mt" disabled={sending}>
            {sending ? "Sending…" : "Send alert"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default SendNotification;
