import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

function ApprovalsHub() {
  const role = localStorage.getItem("role") || "Staff";
  const [summary, setSummary] = useState({ total_pending: 0, queues: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/approvals/summary").then(setSummary).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="Approval Hub" roleLabel={role}>
      <div className="crm-panel">
        <p className="crm-muted">{summary.total_pending} item{summary.total_pending === 1 ? "" : "s"} pending your approval</p>
        {error && <p className="crm-error crm-mt">{error}</p>}

        {summary.queues.length === 0 ? (
          <div className="crm-empty-state crm-mt">
            <p>No pending approvals — you&apos;re all caught up.</p>
          </div>
        ) : (
          <div className="crm-stats-grid crm-mt">
            {summary.queues.map((q) => (
              <Link key={q.module} to={q.path} className="crm-stat-card crm-stat-card-link">
                <p className="crm-stat-label">{q.label}</p>
                <p className="crm-stat-value">{q.count}</p>
                <p className="crm-muted crm-text-sm">Review queue →</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ApprovalsHub;
