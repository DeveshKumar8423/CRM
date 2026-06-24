import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { formatDateTime, recordLinkPath, runStatusClass } from "../utils/workflows";

function WorkflowRunDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [run, setRun] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/workflows/runs/${id}`).then(setRun).catch((err) => setError(err.message));
  }, [id]);

  const recordLink = run ? recordLinkPath(run.record_type, run.record_id) : null;

  return (
    <DashboardLayout title="Workflow run" roleLabel={role}>
      <div className="crm-panel">
        <Link to="/workflows/runs" className="crm-muted">← Run history</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {run && (
          <>
            <h2 className="crm-mt">{run.run_number}</h2>
            <p className="crm-muted">
              {run.workflow_name} · <span className={runStatusClass(run.status)}>{run.status}</span>
              {run.is_dry_run && " · dry-run"}
            </p>
            <p className="crm-mt">
              Record: {run.record_type} #{run.record_id}
              {recordLink && <> · <Link to={recordLink}>Open record</Link></>}
            </p>
            <p className="crm-muted">{formatDateTime(run.triggered_at)} — {formatDateTime(run.completed_at)}</p>
            {run.error_message && <p className="crm-error crm-mt">{run.error_message}</p>}

            <h3 className="crm-mt">Conditions</h3>
            <pre className="workflow-json">{JSON.stringify(run.conditions_result_json, null, 2)}</pre>

            <h3 className="crm-mt">Actions</h3>
            <pre className="workflow-json">{JSON.stringify(run.actions_result_json, null, 2)}</pre>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default WorkflowRunDetail;
