import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { STATUS_LABELS, statusBadgeClass } from "../utils/website";

function WebsiteBlog() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0 });
  const [error, setError] = useState("");

  const load = () => {
    apiFetch("/website/blog").then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, []);

  const publish = async (postId) => {
    await apiFetch(`/website/blog/${postId}/publish`, { method: "POST" });
    load();
  };

  return (
    <DashboardLayout title="Website blog" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total} post{data.total === 1 ? "" : "s"}</p>
          <div className="crm-inline-actions">
            <Link to="/website" className="crm-btn crm-btn-sm crm-btn-outline">Dashboard</Link>
            {hasPermission("website.manage") && (
              <Link to="/website/blog/new" className="crm-btn crm-btn-sm crm-btn-inline">+ New post</Link>
            )}
          </div>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {data.items.length === 0 ? (
          <p className="crm-empty-state crm-mt">No blog posts yet.</p>
        ) : (
          <table className="crm-table crm-mt">
            <thead>
              <tr><th>Title</th><th>Status</th><th>Author</th><th>Published</th><th>Views (7d)</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td><span className={statusBadgeClass(p.status)}>{STATUS_LABELS[p.status]}</span></td>
                  <td>{p.author_name || "—"}</td>
                  <td>{p.published_at ? new Date(p.published_at).toLocaleDateString() : "—"}</td>
                  <td>{p.view_count_7d}</td>
                  <td className="crm-inline-actions">
                    <Link to={`/website/blog/${p.id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>
                    {hasPermission("website.publish") && p.status !== "published" && (
                      <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => publish(p.id)}>Publish</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

export default WebsiteBlog;
