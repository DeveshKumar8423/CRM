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

function Pipeline() {
  const role = localStorage.getItem("role") || "Staff";
  const canEdit = hasPermission("deals.edit");
  const [board, setBoard] = useState({ columns: [], closed: [] });
  const [stats, setStats] = useState(null);
  const [stages, setStages] = useState([]);
  const [search, setSearch] = useState("");
  const [showClosed, setShowClosed] = useState(false);
  const [error, setError] = useState("");
  const [movingId, setMovingId] = useState(null);

  const loadBoard = () => {
    const params = new URLSearchParams({ include_closed: String(showClosed) });
    if (search.trim()) params.set("search", search.trim());

    Promise.all([
      apiFetch(`/deals/pipeline?${params}`),
      apiFetch("/deals/stats/summary"),
      apiFetch("/deals/stages"),
    ])
      .then(([pipeline, summary, stageList]) => {
        setBoard(pipeline);
        setStats(summary);
        setStages(stageList);
        setError("");
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadBoard();
  }, [showClosed]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadBoard();
  };

  const handleStageChange = async (dealId, stage) => {
    if (stage === "lost") {
      const reason = window.prompt("Reason for losing this deal?");
      if (!reason || !reason.trim()) return;
      setMovingId(dealId);
      try {
        await apiFetch(`/deals/${dealId}/stage`, {
          method: "PATCH",
          body: JSON.stringify({ stage, lost_reason: reason.trim() }),
        });
        loadBoard();
      } catch (err) {
        setError(err.message);
      } finally {
        setMovingId(null);
      }
      return;
    }

    setMovingId(dealId);
    try {
      await apiFetch(`/deals/${dealId}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stage }),
      });
      loadBoard();
    } catch (err) {
      setError(err.message);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <DashboardLayout title="Sales Pipeline" roleLabel={role}>
      <div className="crm-panel">
        {stats && (
          <div className="crm-pipeline-stats">
            <div className="crm-stat-card">
              <span className="crm-stat-label">Open deals</span>
              <strong>{stats.total - stats.won - stats.lost}</strong>
            </div>
            <div className="crm-stat-card">
              <span className="crm-stat-label">Pipeline value</span>
              <strong>{formatCurrency(stats.pipeline_value)}</strong>
            </div>
            <div className="crm-stat-card">
              <span className="crm-stat-label">Won</span>
              <strong>{stats.won} ({formatCurrency(stats.won_value)})</strong>
            </div>
            <div className="crm-stat-card">
              <span className="crm-stat-label">Lost</span>
              <strong>{stats.lost}</strong>
            </div>
          </div>
        )}

        <div className="crm-contacts-toolbar crm-mt">
          <form onSubmit={handleSearch} className="crm-search-form">
            <input
              placeholder="Search deals…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="crm-btn crm-btn-sm">Search</button>
          </form>
          <label className="crm-checkbox-label">
            <input
              type="checkbox"
              checked={showClosed}
              onChange={(e) => setShowClosed(e.target.checked)}
            />
            Show won / lost
          </label>
          <Link to="/deals" className="crm-btn crm-btn-sm crm-btn-outline">
            List view
          </Link>
          {hasPermission("deals.create") && (
            <Link to="/deals/new" className="crm-btn crm-btn-sm crm-btn-inline">
              + New deal
            </Link>
          )}
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-pipeline-board crm-mt">
          {board.columns.map((column) => (
            <div key={column.stage} className="crm-pipeline-column">
              <div className="crm-pipeline-column-header">
                <h3>{column.label}</h3>
                <span className="crm-muted">
                  {column.count} · {formatCurrency(column.total_value)}
                </span>
              </div>
              <div className="crm-pipeline-cards">
                {column.deals.length === 0 && (
                  <p className="crm-muted crm-pipeline-empty">No deals</p>
                )}
                {column.deals.map((deal) => (
                  <div key={deal.id} className="crm-pipeline-card">
                    <Link to={`/deals/${deal.id}`} className="crm-pipeline-card-title">
                      {deal.title}
                    </Link>
                    <p className="crm-muted crm-pipeline-card-meta">
                      {formatCurrency(deal.expected_value, deal.currency)}
                      {deal.assigned_to_name && ` · ${deal.assigned_to_name}`}
                    </p>
                    {deal.lead_name && (
                      <p className="crm-muted crm-pipeline-card-meta">Lead: {deal.lead_name}</p>
                    )}
                    {canEdit && (
                      <select
                        className="crm-pipeline-stage-select"
                        value={deal.stage}
                        disabled={movingId === deal.id}
                        onChange={(e) => handleStageChange(deal.id, e.target.value)}
                      >
                        {stages.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {showClosed && board.closed.length > 0 && (
          <div className="crm-mt-lg">
            <h3>Recently closed</h3>
            <div className="crm-table-wrap crm-mt">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Deal</th>
                    <th>Stage</th>
                    <th>Value</th>
                    <th>Assigned to</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {board.closed.map((deal) => (
                    <tr key={deal.id}>
                      <td>{deal.title}</td>
                      <td>
                        <span className={`crm-badge crm-deal-${deal.stage}`}>
                          {STAGE_LABELS[deal.stage] || deal.stage}
                        </span>
                      </td>
                      <td>{formatCurrency(deal.expected_value, deal.currency)}</td>
                      <td>{deal.assigned_to_name || "—"}</td>
                      <td>
                        <Link to={`/deals/${deal.id}`} className="crm-nav-link">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Pipeline;
