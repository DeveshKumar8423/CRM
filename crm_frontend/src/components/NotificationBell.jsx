import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

function formatWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const wrapRef = useRef(null);

  const load = useCallback(() => {
    if (!hasPermission("notifications.view")) return;
    apiFetch("/notifications/unread-count")
      .then((d) => setUnread(d.unread_count || 0))
      .catch(() => setUnread(0));
  }, []);

  const loadList = useCallback(() => {
    if (!hasPermission("notifications.view")) return;
    setError("");
    apiFetch("/notifications?limit=15")
      .then((d) => {
        setItems(d.items || []);
        setUnread(d.unread_count || 0);
      })
      .catch((err) => setError(err.message || "Could not load notifications"));
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (open) loadList();
  }, [open, loadList]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!hasPermission("notifications.view")) return null;

  const dismiss = async (id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    setUnread((c) => Math.max(0, c - 1));
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      load();
    } catch {
      loadList();
    }
  };

  const clearAll = async () => {
    setItems([]);
    setUnread(0);
    try {
      await apiFetch("/notifications/read-all", { method: "POST" });
    } catch {
      loadList();
    }
  };

  return (
    <div className="crm-notif-wrap" ref={wrapRef}>
      <button
        type="button"
        className="crm-notif-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Open notifications"
        aria-expanded={open}
        title="Notifications — follow-ups, approvals, payments, tasks"
      >
        <span className="crm-notif-icon" aria-hidden>🔔</span>
        <span>Alerts</span>
        {unread > 0 && (
          <span className="crm-notif-badge" aria-label={`${unread} unread`}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="crm-notif-panel" role="dialog" aria-label="Notifications">
          <div className="crm-notif-panel-header">
            <strong>Notifications</strong>
            {items.length > 0 && (
              <button type="button" className="crm-link" onClick={clearAll}>
                Clear all
              </button>
            )}
          </div>
          <div className="crm-notif-list">
            {error && <p className="crm-error crm-pad-sm">{error}</p>}
            {!error && items.length === 0 && (
              <p className="crm-muted crm-pad-sm">No new notifications</p>
            )}
            {items.map((n) => (
              <div
                key={n.id}
                className="crm-notif-item crm-notif-item-unread"
                role="button"
                tabIndex={0}
                onClick={() => dismiss(n.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    dismiss(n.id);
                  }
                }}
              >
                <p className="crm-notif-title">{n.title}</p>
                <p className="crm-muted crm-text-sm">{n.message}</p>
                <p className="crm-muted crm-text-sm">{formatWhen(n.created_at)}</p>
                {n.link_path && (
                  <div className="crm-inline-actions crm-mt-sm">
                    <Link
                      to={n.link_path}
                      className="crm-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismiss(n.id);
                        setOpen(false);
                      }}
                    >
                      Open
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
