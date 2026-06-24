import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { formatDateTime, MODULE_LABELS } from "../utils/workflows";

function WorkflowDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [wf, setWf] = useState(null);
  const [error, setError] = useState("");
  const [testRecordType, setTestRecordType] = useState("deal");
  const [testRecordId, setTestRecordId] = useState("");
  const [testResult, setTestResult] = useState(null);

  const load = () => apiFetch(`/workflows/${id}`).then(setWf).catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, [id]);

  const toggle = async () => {
    try {
      const path = wf.is_active ? "deactivate" : "activate";
      const data = await apiFetch(`/workflows/${id}/${path}`, { method: "POST" });
      setWf(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const runTest = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await apiFetch(`/workflows/${id}/test`, {
        method: "POST",
        body: JSON.stringify({ record_type: testRecordType, record_id: Number(testRecordId) }),
      });
      setTestResult(result);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!wf) {
    return (
      <DashboardLayout title="Workflow" roleLabel={role}>
        <div className="crm-panel">{error && <p className="crm-error">{error}</p>}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={wf.name} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/workflows" className="crm-muted">← Workflows</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-detail-header crm-mt">
          <div>
            <h2>{wf.workflow_code}</h2>
            <p className="crm-muted">{MODULE_LABELS[wf.module]} · {wf.trigger_type} · {wf.is_active ? "Active" : "Inactive"}</p>
          </div>
          <div className="crm-inline-actions">
            {hasPermission("workflows.edit") && !wf.is_active && (
              <Link to={`/workflows/${id}/edit`} className="crm-btn crm-btn-sm crm-btn-outline">Edit</Link>
            )}
            {hasPermission("workflows.activate") && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={toggle}>{wf.is_active ? "Deactivate" : "Activate"}</button>
            )}
          </div>
        </div>

        {wf.description && <p className="crm-mt">{wf.description}</p>}

        <h3 className="crm-mt">Configuration</h3>
        <p className="crm-muted">Priority {wf.priority} · Runs {wf.run_count} · Last {formatDateTime(wf.last_run_at)}</p>
        <pre className="workflow-json crm-mt">{JSON.stringify({ trigger_config: wf.trigger_config_json, conditions: wf.conditions_json, actions: wf.actions_json }, null, 2)}</pre>

        {hasPermission("workflows.test") && (
          <>
            <h3 className="crm-mt">Dry-run test</h3>
            <form className="crm-form crm-form-inline crm-mt" onSubmit={runTest}>
              <div className="crm-form-field">
                <label>Record type</label>
                <select value={testRecordType} onChange={(e) => setTestRecordType(e.target.value)}>
                  <option value="deal">deal</option>
                  <option value="lead">lead</option>
                  <option value="leave">leave</option>
                </select>
              </div>
              <div className="crm-form-field">
                <label>Record ID</label>
                <input type="number" value={testRecordId} onChange={(e) => setTestRecordId(e.target.value)} required />
              </div>
              <button type="submit" className="crm-btn crm-btn-sm">Test</button>
            </form>
            {testResult && (
              <div className="crm-mt">
                <p>Status: <strong>{testResult.status}</strong> (dry-run)</p>
                <pre className="workflow-json">{JSON.stringify(testResult, null, 2)}</pre>
                <Link to={`/workflows/runs/${testResult.id}`}>View run detail</Link>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default WorkflowDetail;
