import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatCurrency, formatDate } from "../utils/employees";

function Employees() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0 });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    const params = new URLSearchParams({ page: "1", limit: "50" });
    if (search.trim()) params.set("search", search.trim());
    apiFetch(`/employees?${params}`).then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, []);

  return (
    <DashboardLayout title="Employee Database" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">{data.total} employee{data.total === 1 ? "" : "s"}</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="crm-search-form crm-mt">
          <input placeholder="Search name, email, ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="crm-btn crm-btn-sm">Search</button>
        </form>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Salary</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((e) => (
                <tr key={e.user_id}>
                  <td><strong>{e.name}</strong><div className="crm-muted crm-text-sm">{e.email}</div></td>
                  <td>{e.department || "—"}</td>
                  <td>{e.role}</td>
                  <td>{formatDate(e.joining_date)}</td>
                  <td>{formatCurrency(e.salary_monthly)}</td>
                  <td><Link to={`/employees/${e.user_id}`} className="crm-link">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.items.length === 0 && !error && <p className="crm-muted crm-mt">No employees found.</p>}
      </div>
    </DashboardLayout>
  );
}

export default Employees;
