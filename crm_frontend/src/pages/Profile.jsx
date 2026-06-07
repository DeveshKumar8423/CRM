import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

const DASHBOARD_PATHS = {
  Admin: "/admin-dashboard",
  Manager: "/manager-dashboard",
  Employee: "/employee-dashboard",
  User: "/user-dashboard",
};

function Profile() {
  const role = localStorage.getItem("role") || "User";
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/users/me")
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setPhone(data.phone || "");
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const data = await apiFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify({ name, phone: phone || null }),
      });
      setProfile(data);
      localStorage.setItem("name", data.name);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await apiFetch("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password changed successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="My Profile" roleLabel={role}>
      <div className="crm-panel">
        <Link to={DASHBOARD_PATHS[role] || "/"} className="crm-link crm-link-left">
          ← Back to dashboard
        </Link>

        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}

        {profile && (
          <div className="crm-profile-meta crm-mt">
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <p>
              <strong>Role:</strong> {profile.role}
            </p>
            <p>
              <strong>Status:</strong> {profile.status}
            </p>
            {profile.employee_id && (
              <p>
                <strong>Employee ID:</strong> {profile.employee_id}
              </p>
            )}
            {profile.designation && (
              <p>
                <strong>Designation:</strong> {profile.designation}
              </p>
            )}
            {profile.department && (
              <p>
                <strong>Department:</strong> {profile.department}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleProfileSave} className="crm-form crm-mt">
          <h3>Edit profile</h3>
          <label htmlFor="profile-name">Name</label>
          <input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="profile-phone">Phone (optional)</label>
          <input
            id="profile-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button type="submit" className="crm-btn">
            Save profile
          </button>
        </form>

        <form onSubmit={handlePasswordChange} className="crm-form crm-mt-lg">
          <h3>Change password</h3>
          <label htmlFor="current-password">Current password</label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />

          <button type="submit" className="crm-btn">
            Update password
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
