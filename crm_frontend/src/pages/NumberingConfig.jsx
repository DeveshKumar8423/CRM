import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import PermissionGate from "../components/PermissionGate";
import { apiFetch } from "../utils/api";

const emptyForm = {
  entity_name: "",
  prefix: "",
  starting_number: 1,
  current_number: 0,
  suffix: "",
  is_active: true,
};

function NumberingConfig() {
  const [configs, setConfigs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const data = await apiFetch("/admin/numbering-config");
      setConfigs(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await apiFetch("/admin/numbering-config", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          suffix: form.suffix || null,
        }),
      });
      setForm(emptyForm);
      setMessage("Numbering configuration created.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setMessage("");
    setError("");
    try {
      await apiFetch(`/admin/numbering-config/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          prefix: form.prefix || undefined,
          starting_number: form.starting_number || undefined,
          current_number: form.current_number || undefined,
          suffix: form.suffix || null,
          is_active: form.is_active,
        }),
      });
      setForm(emptyForm);
      setEditingId(null);
      setMessage("Numbering configuration updated.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (config) => {
    setForm({
      entity_name: config.entity_name,
      prefix: config.prefix,
      starting_number: config.starting_number,
      current_number: config.current_number,
      suffix: config.suffix || "",
      is_active: config.is_active,
    });
    setEditingId(config.id);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleActivate = async (config) => {
    setMessage("");
    setError("");
    try {
      await apiFetch(`/admin/numbering-config/${config.id}/activate`, {
        method: "POST",
      });
      setMessage(`${config.entity_name} activated.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeactivate = async (config) => {
    setMessage("");
    setError("");
    try {
      await apiFetch(`/admin/numbering-config/${config.id}/deactivate`, {
        method: "POST",
      });
      setMessage(`${config.entity_name} deactivated.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (config) => {
    if (!confirm(`Are you sure you want to delete configuration for ${config.entity_name}?`)) {
      return;
    }
    setMessage("");
    setError("");
    try {
      await apiFetch(`/admin/numbering-config/${config.id}`, {
        method: "DELETE",
      });
      setMessage(`${config.entity_name} deleted.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const previewNextNumber = async (entityName) => {
    try {
      const data = await apiFetch(`/admin/numbering-config/preview/${entityName}`);
      alert(`Next number for ${entityName}: ${data.next_number}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="Numbering Configuration" roleLabel="Admin">
      <div className="crm-panel">
        <Link to="/admin-dashboard" className="crm-link crm-link-left">
          ← Back to dashboard
        </Link>

        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}

        <PermissionGate permission="numbering_config.create">
          <form
            onSubmit={editingId ? handleUpdate : handleCreate}
            className="crm-form crm-mt"
          >
            <h3>{editingId ? "Edit Configuration" : "Add Configuration"}</h3>
            <div className="crm-form-grid">
              <div>
                <label>Entity Name</label>
                <input
                  value={form.entity_name}
                  onChange={(e) =>
                    setForm({ ...form, entity_name: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., CONTACT, INVOICE"
                  disabled={editingId !== null}
                  required
                />
              </div>
              <div>
                <label>Prefix</label>
                <input
                  value={form.prefix}
                  onChange={(e) =>
                    setForm({ ...form, prefix: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., CNT, INV"
                  required
                />
              </div>
              <div>
                <label>Starting Number</label>
                <input
                  type="number"
                  value={form.starting_number}
                  onChange={(e) =>
                    setForm({ ...form, starting_number: parseInt(e.target.value) || 1 })
                  }
                  min="1"
                  required
                />
              </div>
              <div>
                <label>Current Number</label>
                <input
                  type="number"
                  value={form.current_number}
                  onChange={(e) =>
                    setForm({ ...form, current_number: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  required
                />
              </div>
              <div>
                <label>Suffix (Optional)</label>
                <input
                  value={form.suffix}
                  onChange={(e) =>
                    setForm({ ...form, suffix: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., 2024"
                />
              </div>
              <div>
                <label>Status</label>
                <select
                  value={form.is_active.toString()}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.value === "true" })
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="crm-inline-actions">
              <button type="submit" className="crm-btn crm-btn-inline">
                {editingId ? "Update Configuration" : "Create Configuration"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="crm-btn crm-btn-outline crm-btn-inline"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </PermissionGate>

        <div className="crm-table-wrap crm-mt-lg">
          <h3>Configurations</h3>
          <table className="crm-table">
            <thead>
              <tr>
                <th>Entity</th>
                <th>Prefix</th>
                <th>Starting Number</th>
                <th>Current Number</th>
                <th>Suffix</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <tr key={config.id}>
                  <td>{config.entity_name}</td>
                  <td>{config.prefix}</td>
                  <td>{config.starting_number}</td>
                  <td>{config.current_number}</td>
                  <td>{config.suffix || "—"}</td>
                  <td>
                    <span
                      className={
                        config.is_active
                          ? "crm-badge crm-badge-active"
                          : "crm-badge crm-badge-inactive"
                      }
                    >
                      {config.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="crm-table-actions">
                    <PermissionGate permission="numbering_config.edit">
                      <button
                        type="button"
                        className="crm-btn crm-btn-sm crm-btn-outline"
                        onClick={() => handleEdit(config)}
                      >
                        Edit
                      </button>
                      {config.is_active ? (
                        <button
                          type="button"
                          className="crm-btn crm-btn-sm crm-btn-outline"
                          onClick={() => handleDeactivate(config)}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="crm-btn crm-btn-sm crm-btn-outline"
                          onClick={() => handleActivate(config)}
                        >
                          Activate
                        </button>
                      )}
                      <button
                        type="button"
                        className="crm-btn crm-btn-sm crm-btn-outline"
                        onClick={() => previewNextNumber(config.entity_name)}
                      >
                        Preview
                      </button>
                    </PermissionGate>
                    <PermissionGate permission="numbering_config.delete">
                      <button
                        type="button"
                        className="crm-btn crm-btn-sm"
                        onClick={() => handleDelete(config)}
                      >
                        Delete
                      </button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default NumberingConfig;
