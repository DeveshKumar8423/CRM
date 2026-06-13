import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

const STATUS_LABELS = {
  open: "Open",
  hot: "Hot",
  follow_up: "Follow up",
  cold: "Cold",
  lost: "Lost",
  qualified: "Qualified",
  converted: "Converted",
};

function Leads() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [sources, setSources] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/leads/sources").then(setSources).catch(() => {});
  }, []);

  const loadLeads = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    if (source) params.set("source", source);
    if (search.trim()) params.set("search", search.trim());

    apiFetch(`/leads?${params}`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadLeads(1);
  }, [status, source]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadLeads(1);
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Leads" roleLabel={role}>
      <div className="crm-panel">
        <p className="crm-muted">
          {data.total.toLocaleString()} lead{data.total === 1 ? "" : "s"} total
        </p>

        <div className="crm-contacts-toolbar crm-mt">
          <form onSubmit={handleSearch} className="crm-search-form">
            <input
              placeholder="Search name, phone, org, requirement…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="crm-btn crm-btn-sm">Search</button>
          </form>
          <div className="crm-filters">
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="">All sources</option>
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All status</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          {hasPermission("leads.create") && (
            <Link to="/leads/new" className="crm-btn crm-btn-sm crm-btn-inline">
              + New lead
            </Link>
          )}
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Organization</th>
                <th>Phone</th>
                <th>Source</th>
                <th>Assigned to</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && (
                <tr><td colSpan={7} className="crm-muted">No leads found.</td></tr>
              )}
              {data.items.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.name}</strong>
                    {lead.city && (
                      <><br /><span className="crm-muted">{lead.city}</span></>
                    )}
                  </td>
                  <td>{lead.organization_name || "—"}</td>
                  <td>{lead.phone || "—"}</td>
                  <td>{lead.source}</td>
                  <td>{lead.assigned_to_name || "—"}</td>
                  <td>
                    <span className={`crm-badge crm-lead-${lead.status}`}>
                      {STATUS_LABELS[lead.status] || lead.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/leads/${lead.id}`} className="crm-nav-link">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page <= 1} onClick={() => loadLeads(data.page - 1)}>Previous</button>
            <span className="crm-muted">Page {data.page} of {totalPages}</span>
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page >= totalPages} onClick={() => loadLeads(data.page + 1)}>Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Leads;
