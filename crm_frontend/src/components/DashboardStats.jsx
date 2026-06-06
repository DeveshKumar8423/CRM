import { useEffect, useState } from "react";

import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";

function DashboardStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!hasPermission("contacts.view")) return;
    apiFetch("/contacts/stats/summary")
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats || stats.total === 0) return null;

  return (
    <div className="crm-stats-grid crm-mt">
      <div className="crm-stat-card">
        <p className="crm-stat-label">Total clients</p>
        <p className="crm-stat-value">{stats.total}</p>
      </div>
      <div className="crm-stat-card">
        <p className="crm-stat-label">Active</p>
        <p className="crm-stat-value crm-stat-active">
          {stats.active} <span>({stats.active_percent}%)</span>
        </p>
      </div>
      <div className="crm-stat-card">
        <p className="crm-stat-label">Inactive</p>
        <p className="crm-stat-value crm-stat-inactive">
          {stats.inactive} <span>({stats.inactive_percent}%)</span>
        </p>
      </div>
    </div>
  );
}

export default DashboardStats;
