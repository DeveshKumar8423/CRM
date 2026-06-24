import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { PAGE_TYPE_LABELS, STATUS_LABELS, statusBadgeClass } from "../utils/website";

function WebsitePages() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0 });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    apiFetch(`/website/pages?${params}`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, [status]);

  const publish = async (id) => {
    await apiFetch(`/website/pages/${id}/publish`, { method: "POST" });
    load();
  };

  const unpublish = async (id) => {
    await apiFetch(`/website/pages/${id}/unpublish`, { method: "POST" });
    load();
  };

  return (
    <DashboardLayout title="Website pages" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total} page{data.total === 1 ? "" : "s"}</p>
          <div className="crm-inline-actions">
            <Link to="/website" className="crm-btn crm-btn-sm crm-btn-outline">Dashboard</Link>
            {hasPermission("website.manage") && (
              <Link to="/website/pages/new" className="crm-btn crm-btn-sm crm-btn-inline">+ New page</Link>
            )}
          </div>
        </div>
        <div className="crm-filters crm-mt">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {data.items.length === 0 ? (
          <p className="crm-empty-state crm-mt">No pages yet.</p>
        ) : (
          <table className="crm-table crm-mt">
            <thead>
              <tr><th>Title</th><th>Type</th><th>Slug</th><th>Status</th><th>Views (7d)</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}{p.is_home ? " (Home)" : ""}</td>
                  <td>{PAGE_TYPE_LABELS[p.page_type] || p.page_type}</td>
                  <td>{p.slug}</td>
                  <td><span className={statusBadgeClass(p.status)}>{STATUS_LABELS[p.status]}</span></td>
                  <td>{p.view_count_7d}</td>
                  <td className="crm-inline-actions">
                    <Link to={`/website/pages/${p.id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>
                    {p.public_url && <a href={p.public_url} target="_blank" rel="noreferrer" className="crm-btn crm-btn-sm crm-btn-outline">View</a>}
                    {hasPermission("website.publish") && p.status !== "published" && (
                      <button type="button" className="crm-btn crm-btn-sm crm-btn-inline" onClick={() => publish(p.id)}>Publish</button>
                    )}
                    {hasPermission("website.publish") && p.status === "published" && (
                      <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => unpublish(p.id)}>Unpublish</button>
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

export default WebsitePages;
