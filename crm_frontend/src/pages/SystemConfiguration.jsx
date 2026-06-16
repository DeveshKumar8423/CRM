import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

const DEFAULTS = {
  company_name: "BlackPapers",
  default_currency: "INR",
  date_format: "DD/MM/YYYY",
  timezone: "Asia/Kolkata",
  support_email: "support@blackpapers.in",
  maintenance_mode: false,
};

const DATE_FORMAT_OPTIONS = [
  "DD/MM/YYYY",
  "MM/DD/YYYY",
  "YYYY-MM-DD",
  "DD-MM-YYYY",
  "MM-DD-YYYY",
];

const TIMEZONE_OPTIONS = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "UTC",
];

const CURRENCY_OPTIONS = [
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "JPY", label: "JPY — Japanese Yen" },
];

function SystemConfiguration() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadConfig = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/admin/system-config");
      setForm({
        company_name: data.company_name,
        default_currency: data.default_currency,
        date_format: data.date_format,
        timezone: data.timezone,
        support_email: data.support_email,
        maintenance_mode: data.maintenance_mode,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);
    try {
      await apiFetch("/admin/system-config", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setMessage("Configuration saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setMessage("");
    setError("");
    setSaving(true);
    try {
      const data = await apiFetch("/admin/system-config/reset", {
        method: "POST",
      });
      setForm({
        company_name: data.company_name,
        default_currency: data.default_currency,
        date_format: data.date_format,
        timezone: data.timezone,
        support_email: data.support_email,
        maintenance_mode: data.maintenance_mode,
      });
      setMessage("Configuration reset to defaults.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <DashboardLayout title="System Configuration" roleLabel="Admin">
      <div className="crm-panel">
        <Link to="/admin-dashboard" className="crm-link crm-link-left">
          ← Back to dashboard
        </Link>

        <p className="crm-muted crm-mt">
          Global settings that apply across the entire CRM. Only administrators
          can view or change these.
        </p>

        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}

        {loading ? (
          <p className="crm-muted crm-mt">Loading…</p>
        ) : (
          <form onSubmit={handleSave} className="crm-form crm-mt">
            {/* ── General ── */}
            <p className="crm-section-title">General</p>
            <div className="crm-form-grid">
              <div>
                <label>Company Name</label>
                <input
                  value={form.company_name}
                  onChange={(e) => field("company_name", e.target.value)}
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label>Support Email</label>
                <input
                  type="email"
                  value={form.support_email}
                  onChange={(e) => field("support_email", e.target.value)}
                  maxLength={255}
                  required
                />
              </div>
            </div>

            {/* ── Localisation ── */}
            <p className="crm-section-title crm-mt">Localisation</p>
            <div className="crm-form-grid">
              <div>
                <label>Default Currency</label>
                <select
                  value={form.default_currency}
                  onChange={(e) => field("default_currency", e.target.value)}
                  required
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Date Format</label>
                <select
                  value={form.date_format}
                  onChange={(e) => field("date_format", e.target.value)}
                  required
                >
                  {DATE_FORMAT_OPTIONS.map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Timezone</label>
                <select
                  value={form.timezone}
                  onChange={(e) => field("timezone", e.target.value)}
                  required
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── System ── */}
            <p className="crm-section-title crm-mt">System</p>
            <div>
              <label className="crm-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.maintenance_mode}
                  onChange={(e) => field("maintenance_mode", e.target.checked)}
                />
                Maintenance Mode
                {form.maintenance_mode && (
                  <span
                    className="crm-badge"
                    style={{
                      background: "rgba(239,68,68,.15)",
                      color: "#ef4444",
                      marginLeft: 8,
                    }}
                  >
                    ACTIVE
                  </span>
                )}
              </label>
              <p className="crm-muted crm-mt-sm" style={{ fontSize: "0.85rem" }}>
                When enabled, non-admin users may be warned that the system is
                under maintenance. No automatic lock-out is applied.
              </p>
            </div>

            {/* ── Actions ── */}
            <div className="crm-inline-actions crm-mt">
              <button
                type="submit"
                className="crm-btn crm-btn-inline"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                className="crm-btn crm-btn-outline crm-btn-inline"
                onClick={handleReset}
                disabled={saving}
              >
                Reset to Defaults
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default SystemConfiguration;
