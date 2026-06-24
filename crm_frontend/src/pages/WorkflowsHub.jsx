import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { formatDateTime, MODULE_LABELS } from "../utils/workflows";

function WorkflowsHub() {
  const role = localStorage.getItem("role") || "Staff";
  const [dashboard, setDashboard] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([
      apiFetch("/workflows/dashboard"),
      apiFetch("/workflows?limit=100"),
      apiFetch("/workflows/templates"),
    ])
      .then(([dash, list, tpls]) => {
        setDashboard(dash);
        setWorkflows(list.items || []);
        setTemplates(tpls || []);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const duplicateTemplate = async (key) => {
    try {
      const wf = await apiFetch(`/workflows/templates/${key}`, { method: "POST" });
      window.location.href = `/workflows/${wf.id}/edit`;
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (wf) => {
    try {
      const path = wf.is_active ? "deactivate" : "activate";
      await apiFetch(`/workflows/${wf.id}/${path}`, { method: "POST" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="Workflow Builder" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-detail-header">
          <p className="crm-muted">Custom automations with triggers, conditions, and actions</p>
          <div className="crm-inline-actions">
            <Link to="/workflows/runs" className="crm-btn crm-btn-sm crm-btn-outline">Run history</Link>
            {hasPermission("workflows.manage_settings") && (
              <Link to="/workflows/settings" className="crm-btn crm-btn-sm crm-btn-outline">Settings</Link>
            )}
            {hasPermission("workflows.create") && (
              <Link to="/workflows/new" className="crm-btn crm-btn-sm">New workflow</Link>
            )}
          </div>
        </div>

        {error && <p className="crm-error crm-mt">{error}</p>}
        {dashboard && !dashboard.is_enabled && (
          <p className="crm-muted crm-mt">Workflow Builder is disabled. Enable it in settings to run automations.</p>
        )}

        {dashboard && (
          <div className="crm-stats-grid crm-mt">
            <div className="crm-stat-card"><span className="crm-stat-value">{dashboard.active_count}</span><span className="crm-stat-label">Active</span></div>
            <div className="crm-stat-card"><span className="crm-stat-value">{dashboard.runs_today}</span><span className="crm-stat-label">Runs today</span></div>
            <div className="crm-stat-card"><span className="crm-stat-value">{dashboard.failures_today}</span><span className="crm-stat-label">Failures today</span></div>
          </div>
        )}

        {hasPermission("workflows.create") && templates.length > 0 && (
          <>
            <h3 className="crm-mt">Starter templates</h3>
            <div className="crm-stats-grid crm-mt">
              {templates.map((t) => (
                <button key={t.key} type="button" className="crm-stat-card crm-stat-card-link" onClick={() => duplicateTemplate(t.key)}>
                  <p className="crm-stat-label">{t.name}</p>
                  <p className="crm-muted crm-text-sm">{t.description}</p>
                </button>
              ))}
            </div>
          </>
        )}

        <h3 className="crm-mt">Workflows</h3>
        {workflows.length === 0 ? (
          <p className="crm-muted crm-mt">No workflows yet.</p>
        ) : (
          <table className="crm-table crm-mt">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Module</th>
                <th>Trigger</th>
                <th>Active</th>
                <th>Runs</th>
                <th>Last run</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {workflows.map((w) => (
                <tr key={w.id}>
                  <td><Link to={`/workflows/${w.id}`}>{w.workflow_code}</Link></td>
                  <td>{w.name}</td>
                  <td>{MODULE_LABELS[w.module] || w.module}</td>
                  <td>{w.trigger_type}</td>
                  <td>{w.is_active ? "Yes" : "No"}</td>
                  <td>{w.run_count}</td>
                  <td>{formatDateTime(w.last_run_at)}</td>
                  <td>
                    {hasPermission("workflows.activate") && (
                      <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => toggleActive(w)}>
                        {w.is_active ? "Deactivate" : "Activate"}
                      </button>
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

export default WorkflowsHub;
