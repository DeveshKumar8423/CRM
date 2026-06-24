import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatDateTime, runStatusClass } from "../utils/workflows";

function WorkflowRuns() {
  const role = localStorage.getItem("role") || "Staff";
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/workflows/runs?limit=100").then((d) => setRuns(d.items || [])).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="Workflow runs" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/workflows" className="crm-muted">← Workflows</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <table className="crm-table crm-mt">
          <thead>
            <tr>
              <th>Run #</th>
              <th>Workflow</th>
              <th>Trigger</th>
              <th>Record</th>
              <th>Status</th>
              <th>Dry-run</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id}>
                <td><Link to={`/workflows/runs/${r.id}`}>{r.run_number}</Link></td>
                <td>{r.workflow_name || r.workflow_id}</td>
                <td>{r.trigger_type}</td>
                <td>{r.record_type} #{r.record_id}</td>
                <td><span className={runStatusClass(r.status)}>{r.status}</span></td>
                <td>{r.is_dry_run ? "Yes" : "No"}</td>
                <td>{formatDateTime(r.triggered_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default WorkflowRuns;
