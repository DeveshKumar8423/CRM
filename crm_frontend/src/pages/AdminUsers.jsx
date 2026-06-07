import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

const STAFF_ROLES = ["Admin", "Manager", "Employee"];

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "Employee",
  phone: "",
  employee_id: "",
  designation: "",
  department: "",
  status: "active",
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [resetUserId, setResetUserId] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    const userList = await apiFetch("/admin/users");
    setUsers(userList.filter((u) => u.role !== "User"));
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          phone: form.phone || null,
          employee_id: form.employee_id || null,
          designation: form.designation || null,
          department: form.department || null,
        }),
      });
      setForm(emptyForm);
      setMessage("Staff user created.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleStatus = async (user) => {
    setMessage("");
    setError("");
    try {
      const nextStatus = user.status === "active" ? "inactive" : "active";
      await apiFetch(`/admin/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      setMessage(`${user.name} is now ${nextStatus}.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetUserId) return;
    setMessage("");
    setError("");
    try {
      await apiFetch(`/admin/users/${resetUserId}/reset-password`, {
        method: "PUT",
        body: JSON.stringify({ new_password: resetPassword }),
      });
      setResetUserId(null);
      setResetPassword("");
      setMessage("Password reset successfully.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="User Management" roleLabel="Admin">
      <div className="crm-panel">
        <Link to="/admin-dashboard" className="crm-link crm-link-left">
          ← Back to dashboard
        </Link>

        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}

        <form onSubmit={handleCreate} className="crm-form crm-mt">
          <h3>Add staff member</h3>
          <div className="crm-form-grid">
            <div>
              <label>Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Employee ID</label>
              <input
                value={form.employee_id}
                onChange={(e) =>
                  setForm({ ...form, employee_id: e.target.value })
                }
              />
            </div>
            <div>
              <label>Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label>Designation</label>
              <input
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
              />
            </div>
            <div>
              <label>Department</label>
              <input
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
              />
            </div>
          </div>
          <button type="submit" className="crm-btn crm-btn-inline">
            Create staff user
          </button>
        </form>

        <div className="crm-table-wrap crm-mt-lg">
          <h3>Staff users</h3>
          <table className="crm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.employee_id || "—"}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span
                      className={
                        user.status === "active"
                          ? "crm-badge crm-badge-active"
                          : "crm-badge crm-badge-inactive"
                      }
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="crm-table-actions">
                    <button
                      type="button"
                      className="crm-btn crm-btn-sm crm-btn-outline"
                      onClick={() => toggleStatus(user)}
                    >
                      {user.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      className="crm-btn crm-btn-sm"
                      onClick={() => setResetUserId(user.id)}
                    >
                      Reset password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {resetUserId && (
          <form onSubmit={handleResetPassword} className="crm-form crm-mt">
            <h3>Reset password</h3>
            <input
              type="password"
              placeholder="New temporary password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              minLength={6}
              required
            />
            <div className="crm-inline-actions">
              <button type="submit" className="crm-btn crm-btn-inline">
                Confirm reset
              </button>
              <button
                type="button"
                className="crm-btn crm-btn-outline crm-btn-inline"
                onClick={() => {
                  setResetUserId(null);
                  setResetPassword("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <p className="crm-mt-lg">
          <Link to="/admin/activity-logs" className="crm-nav-link">
            View full activity logs →
          </Link>
        </p>
      </div>
    </DashboardLayout>
  );
}

export default AdminUsers;
