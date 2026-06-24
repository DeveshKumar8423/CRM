import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { MODULE_LABELS } from "../utils/workflows";

const EMPTY = {
  name: "",
  description: "",
  module: "sales",
  trigger_type: "deal.stage_changed",
  trigger_config_json: {},
  conditions_json: [],
  actions_json: [{ type: "notify.role", role: "Manager", title: "Workflow alert", message: "{{title}}" }],
  priority: 100,
  stop_on_match: false,
};

function WorkflowForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";
  const [form, setForm] = useState(EMPTY);
  const [triggers, setTriggers] = useState([]);
  const [actions, setActions] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([apiFetch("/workflows/triggers"), apiFetch("/workflows/actions")])
      .then(([t, a]) => {
        setTriggers(t);
        setActions(a);
      })
      .catch((err) => setError(err.message));
    if (isEdit) {
      apiFetch(`/workflows/${id}`).then(setForm).catch((err) => setError(err.message));
    }
  }, [id, isEdit]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const moduleTriggers = triggers.filter((t) => t.module === form.module);

  const save = async (e) => {
    e.preventDefault();
    setSaved(false);
    setError("");
    try {
      const data = isEdit
        ? await apiFetch(`/workflows/${id}`, { method: "PUT", body: JSON.stringify(form) })
        : await apiFetch("/workflows", { method: "POST", body: JSON.stringify(form) });
      setSaved(true);
      navigate(`/workflows/${data.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateAction = (idx, key, value) => {
    setForm((f) => {
      const list = [...(f.actions_json || [])];
      list[idx] = { ...list[idx], [key]: value };
      return { ...f, actions_json: list };
    });
  };

  const addAction = () => {
    setForm((f) => ({
      ...f,
      actions_json: [...(f.actions_json || []), { type: "notify.role", role: "Manager", title: "", message: "" }],
    }));
  };

  const removeAction = (idx) => {
    setForm((f) => ({
      ...f,
      actions_json: (f.actions_json || []).filter((_, i) => i !== idx),
    }));
  };

  return (
    <DashboardLayout title={isEdit ? "Edit workflow" : "New workflow"} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/workflows" className="crm-muted">← Workflows</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {saved && <p className="crm-success crm-mt">Saved.</p>}
        <form className="crm-form crm-mt" onSubmit={save}>
          <div className="crm-form-field"><label>Name</label><input value={form.name} onChange={(e) => setField("name", e.target.value)} required /></div>
          <div className="crm-form-field"><label>Description</label><textarea value={form.description || ""} onChange={(e) => setField("description", e.target.value)} /></div>
          <div className="crm-form-row">
            <div className="crm-form-field">
              <label>Module</label>
              <select value={form.module} onChange={(e) => setField("module", e.target.value)}>
                {Object.entries(MODULE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="crm-form-field">
              <label>Trigger</label>
              <select value={form.trigger_type} onChange={(e) => setField("trigger_type", e.target.value)}>
                {moduleTriggers.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
          </div>
          {form.trigger_type === "deal.stage_changed" && (
            <div className="crm-form-row">
              <div className="crm-form-field">
                <label>To stage</label>
                <input
                  value={form.trigger_config_json?.to_stage || ""}
                  onChange={(e) => setField("trigger_config_json", { ...form.trigger_config_json, to_stage: e.target.value })}
                  placeholder="negotiation"
                />
              </div>
              <div className="crm-form-field">
                <label>From stage (optional)</label>
                <input
                  value={form.trigger_config_json?.from_stage || ""}
                  onChange={(e) => setField("trigger_config_json", { ...form.trigger_config_json, from_stage: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="crm-form-row">
            <div className="crm-form-field"><label>Priority (lower first)</label><input type="number" value={form.priority} onChange={(e) => setField("priority", Number(e.target.value))} /></div>
            <div className="crm-form-field">
              <label><input type="checkbox" checked={form.stop_on_match} onChange={(e) => setField("stop_on_match", e.target.checked)} /> Stop on match</label>
            </div>
          </div>

          <h3 className="crm-mt">Conditions (JSON)</h3>
          <div className="crm-form-field">
            <textarea
              rows={4}
              value={JSON.stringify(form.conditions_json || [], null, 2)}
              onChange={(e) => {
                try {
                  setField("conditions_json", JSON.parse(e.target.value));
                } catch {
                  setError("Invalid conditions JSON");
                }
              }}
            />
            <p className="crm-muted">Example: {`[{"type":"field_gte","field":"expected_value","value":500000}]`}</p>
          </div>

          <h3 className="crm-mt">Actions</h3>
          {(form.actions_json || []).map((action, idx) => (
            <div key={idx} className="workflow-action-row crm-mt">
              <div className="crm-form-field">
                <label>Action type</label>
                <select value={action.type} onChange={(e) => updateAction(idx, "type", e.target.value)}>
                  {actions.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                </select>
              </div>
              {action.type === "notify.role" && (
                <div className="crm-form-field"><label>Role</label><input value={action.role || ""} onChange={(e) => updateAction(idx, "role", e.target.value)} /></div>
              )}
              {action.type === "notify.user" && (
                <div className="crm-form-field"><label>User ID</label><input type="number" value={action.user_id || ""} onChange={(e) => updateAction(idx, "user_id", Number(e.target.value))} /></div>
              )}
              {(action.type === "notify.role" || action.type === "notify.user" || action.type === "notify.record_owner") && (
                <>
                  <div className="crm-form-field"><label>Title</label><input value={action.title || ""} onChange={(e) => updateAction(idx, "title", e.target.value)} /></div>
                  <div className="crm-form-field"><label>Message</label><input value={action.message || ""} onChange={(e) => updateAction(idx, "message", e.target.value)} /></div>
                </>
              )}
              {action.type === "create.reminder" && (
                <>
                  <div className="crm-form-field"><label>Title</label><input value={action.title || ""} onChange={(e) => updateAction(idx, "title", e.target.value)} /></div>
                  <div className="crm-form-field"><label>Due in days</label><input type="number" value={action.due_in_days || 1} onChange={(e) => updateAction(idx, "due_in_days", Number(e.target.value))} /></div>
                </>
              )}
              {action.type === "log.activity" && (
                <div className="crm-form-field"><label>Message</label><input value={action.message || ""} onChange={(e) => updateAction(idx, "message", e.target.value)} /></div>
              )}
              <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => removeAction(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="crm-btn crm-btn-sm crm-btn-outline crm-mt" onClick={addAction}>Add action</button>

          <div className="crm-mt">
            <button type="submit" className="crm-btn">Save workflow</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default WorkflowForm;
