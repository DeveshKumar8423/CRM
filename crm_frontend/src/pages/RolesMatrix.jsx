import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

function RolesMatrix() {
  const [data, setData] = useState(null);
  const [role, setRole] = useState("Manager");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/roles-matrix")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const perms = data?.matrix?.[role] || [];

  return (
    <DashboardLayout title="Roles & Permissions" roleLabel="Admin">
      <div className="crm-panel">
        <Link to="/admin-dashboard" className="crm-link crm-link-left">← Back to dashboard</Link>
        <p className="crm-muted crm-mt">Read-only view of role permissions seeded in the system.</p>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {data && (
          <>
            <div className="crm-mt">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="crm-mt-sm">
                {data.roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <p className="crm-muted crm-mt">{perms.length} permissions for {role}</p>
            <div className="crm-table-wrap crm-mt-sm">
              <table className="crm-table">
                <thead><tr><th>Permission code</th><th>Name</th><th>Module</th></tr></thead>
                <tbody>
                  {data.permissions
                    .filter((p) => perms.includes(p.code))
                    .map((p) => (
                      <tr key={p.code}>
                        <td><code>{p.code}</code></td>
                        <td>{p.name}</td>
                        <td>{p.module}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default RolesMatrix;
