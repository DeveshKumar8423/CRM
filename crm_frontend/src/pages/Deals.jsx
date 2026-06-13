import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

const STAGE_LABELS = {
  new: "New",
  contacted: "Contacted",
  meeting: "Meeting booked",
  proposal: "Proposal sent",
  won: "Won",
  lost: "Lost",
};

function formatCurrency(value, currency = "INR") {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function Deals() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [stages, setStages] = useState([]);
  const [stage, setStage] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/deals/stages").then(setStages).catch(() => {});
  }, []);

  const loadDeals = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (stage) params.set("stage", stage);
    if (search.trim()) params.set("search", search.trim());

    apiFetch(`/deals?${params}`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadDeals(1);
  }, [stage]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadDeals(1);
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <DashboardLayout title="Deals" roleLabel={role}>
      <div className="crm-panel">
        <p className="crm-muted">
          {data.total.toLocaleString()} deal{data.total === 1 ? "" : "s"} total
        </p>

        <div className="crm-contacts-toolbar crm-mt">
          <form onSubmit={handleSearch} className="crm-search-form">
            <input
              placeholder="Search deals…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="crm-btn crm-btn-sm">Search</button>
          </form>
          <div className="crm-filters">
            <select value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="">All stages</option>
              {stages.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <Link to="/pipeline" className="crm-btn crm-btn-sm crm-btn-outline">
            Pipeline board
          </Link>
          {hasPermission("deals.create") && (
            <Link to="/deals/new" className="crm-btn crm-btn-sm crm-btn-inline">
              + New deal
            </Link>
          )}
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-table-wrap crm-mt">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Stage</th>
                <th>Value</th>
                <th>Lead / Contact</th>
                <th>Assigned to</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && (
                <tr><td colSpan={6} className="crm-muted">No deals found.</td></tr>
              )}
              {data.items.map((deal) => (
                <tr key={deal.id}>
                  <td><strong>{deal.title}</strong></td>
                  <td>
                    <span className={`crm-badge crm-deal-${deal.stage}`}>
                      {STAGE_LABELS[deal.stage] || deal.stage}
                    </span>
                  </td>
                  <td>{formatCurrency(deal.expected_value, deal.currency)}</td>
                  <td>{deal.lead_name || deal.contact_name || "—"}</td>
                  <td>{deal.assigned_to_name || "—"}</td>
                  <td>
                    <Link to={`/deals/${deal.id}`} className="crm-nav-link">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="crm-pagination crm-mt">
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page <= 1} onClick={() => loadDeals(data.page - 1)}>Previous</button>
            <span className="crm-muted">Page {data.page} of {totalPages}</span>
            <button type="button" className="crm-btn crm-btn-outline crm-btn-sm" disabled={data.page >= totalPages} onClick={() => loadDeals(data.page + 1)}>Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Deals;
