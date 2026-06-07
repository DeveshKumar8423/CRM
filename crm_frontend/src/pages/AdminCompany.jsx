import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const emptyForm = {
  legal_name: "",
  display_name: "",
  email: "",
  phone: "",
  website: "",
  description: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  gstin: "",
  pan: "",
  currency: "INR",
  financial_year_start_month: 4,
  timezone: "Asia/Kolkata",
};

function AdminCompany() {
  const [form, setForm] = useState(emptyForm);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/company")
      .then((data) => {
        setForm({
          legal_name: data.legal_name || "",
          display_name: data.display_name || "",
          email: data.email || "",
          phone: data.phone || "",
          website: data.website || "",
          description: data.description || "",
          address_line1: data.address_line1 || "",
          address_line2: data.address_line2 || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          country: data.country || "India",
          gstin: data.gstin || "",
          pan: data.pan || "",
          currency: data.currency || "INR",
          financial_year_start_month: data.financial_year_start_month || 4,
          timezone: data.timezone || "Asia/Kolkata",
        });
        setIsNew(false);
      })
      .catch((err) => {
        if (err.message.includes("not configured")) {
          setIsNew(true);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => ({
    ...form,
    email: form.email || null,
    phone: form.phone || null,
    website: form.website || null,
    description: form.description || null,
    address_line1: form.address_line1 || null,
    address_line2: form.address_line2 || null,
    city: form.city || null,
    state: form.state || null,
    pincode: form.pincode || null,
    gstin: form.gstin || null,
    pan: form.pan || null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = buildPayload();
      if (isNew) {
        await apiFetch("/admin/company", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setIsNew(false);
        setMessage("Company profile created.");
      } else {
        await apiFetch("/admin/company", {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("Company profile updated.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Company Settings" roleLabel="Admin">
        <div className="crm-panel">
          <p>Loading company settings…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Company Settings" roleLabel="Admin">
      <div className="crm-panel">
        <Link to="/admin-dashboard" className="crm-link crm-link-left">
          ← Back to dashboard
        </Link>

        {error && <p className="crm-error crm-mt">{error}</p>}
        {message && <p className="crm-success crm-mt">{message}</p>}

        <form onSubmit={handleSubmit} className="crm-form crm-mt">
          <h3>{isNew ? "Set up company" : "Edit company"}</h3>

          <div className="crm-form-grid">
            <div>
              <label>Legal name *</label>
              <input
                value={form.legal_name}
                onChange={(e) => handleChange("legal_name", e.target.value)}
                required
              />
            </div>
            <div>
              <label>Display / trade name *</label>
              <input
                value={form.display_name}
                onChange={(e) => handleChange("display_name", e.target.value)}
                required
              />
            </div>
            <div>
              <label>Company email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div>
              <label>Phone</label>
              <input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div>
              <label>Website</label>
              <input
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </div>
            <div>
              <label>Currency</label>
              <input
                value={form.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                maxLength={3}
              />
            </div>
          </div>

          <label>Description</label>
          <textarea
            className="crm-textarea"
            rows={3}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />

          <h4 className="crm-section-title">Registered address</h4>
          <div className="crm-form-grid">
            <div className="crm-span-2">
              <label>Address line 1</label>
              <input
                value={form.address_line1}
                onChange={(e) => handleChange("address_line1", e.target.value)}
              />
            </div>
            <div className="crm-span-2">
              <label>Address line 2</label>
              <input
                value={form.address_line2}
                onChange={(e) => handleChange("address_line2", e.target.value)}
              />
            </div>
            <div>
              <label>City</label>
              <input
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>
            <div>
              <label>State</label>
              <select
                value={form.state}
                onChange={(e) => handleChange("state", e.target.value)}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>PIN code</label>
              <input
                value={form.pincode}
                onChange={(e) => handleChange("pincode", e.target.value)}
                maxLength={10}
              />
            </div>
            <div>
              <label>Country</label>
              <input
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
              />
            </div>
          </div>

          <h4 className="crm-section-title">Tax & compliance</h4>
          <div className="crm-form-grid">
            <div>
              <label>GSTIN</label>
              <input
                value={form.gstin}
                onChange={(e) => handleChange("gstin", e.target.value.toUpperCase())}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
              />
            </div>
            <div>
              <label>PAN</label>
              <input
                value={form.pan}
                onChange={(e) => handleChange("pan", e.target.value.toUpperCase())}
                placeholder="AAAAA9999A"
                maxLength={10}
              />
            </div>
            <div>
              <label>Financial year starts</label>
              <select
                value={form.financial_year_start_month}
                onChange={(e) =>
                  handleChange("financial_year_start_month", Number(e.target.value))
                }
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Timezone</label>
              <input
                value={form.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="crm-btn crm-btn-inline">
            {isNew ? "Create company profile" : "Save changes"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default AdminCompany;
