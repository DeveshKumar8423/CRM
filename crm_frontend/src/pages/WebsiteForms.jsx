import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

function WebsiteForms() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0 });
  const [error, setError] = useState("");

  const load = () => {
    apiFetch("/website/forms").then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, []);

  return (
    <DashboardLayout title="Website forms" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total} form{data.total === 1 ? "" : "s"}</p>
          <div className="crm-inline-actions">
            <Link to="/website" className="crm-btn crm-btn-sm crm-btn-outline">Dashboard</Link>
            {hasPermission("website.forms") && (
              <Link to="/website/forms/new" className="crm-btn crm-btn-sm crm-btn-inline">+ New form</Link>
            )}
          </div>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {data.items.length === 0 ? (
          <p className="crm-empty-state crm-mt">No forms yet. Create a contact form to capture leads from your site.</p>
        ) : (
          <table className="crm-table crm-mt">
            <thead>
              <tr><th>Name</th><th>Slug</th><th>Active</th><th>Submissions</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data.items.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{f.slug}</td>
                  <td>{f.is_active ? "Yes" : "No"}</td>
                  <td>{f.submission_count}</td>
                  <td>
                    {hasPermission("website.forms") && (
                      <Link to={`/website/forms/${f.id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>
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

export default WebsiteForms;
