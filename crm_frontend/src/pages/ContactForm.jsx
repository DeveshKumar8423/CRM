import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

const CONTACT_TYPES = ["Customer", "Vendor", "Partner", "Other"];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

const emptyForm = {
  name: "",
  organization_name: "",
  email: "",
  phone: "",
  alt_phone: "",
  contact_type: "Customer",
  status: "active",
  designation: "",
  website: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  gstin: "",
  pan: "",
  assigned_to_id: "",
};

function ContactForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Staff";

  const [form, setForm] = useState(emptyForm);
  const [assignees, setAssignees] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    apiFetch("/contacts/assignees").then(setAssignees).catch(() => {});

    if (isEdit) {
      apiFetch(`/contacts/${id}`)
        .then((c) => {
          setForm({
            name: c.name || "",
            organization_name: c.organization_name || "",
            email: c.email || "",
            phone: c.phone || "",
            alt_phone: c.alt_phone || "",
            contact_type: c.contact_type || "Customer",
            status: c.status || "active",
            designation: c.designation || "",
            website: c.website || "",
            address_line1: c.address_line1 || "",
            address_line2: c.address_line2 || "",
            city: c.city || "",
            state: c.state || "",
            pincode: c.pincode || "",
            country: c.country || "India",
            gstin: c.gstin || "",
            pan: c.pan || "",
            assigned_to_id: c.assigned_to_id ? String(c.assigned_to_id) : "",
          });
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    organization_name: form.organization_name || null,
    email: form.email || null,
    phone: form.phone || null,
    alt_phone: form.alt_phone || null,
    contact_type: form.contact_type,
    status: form.status,
    designation: form.designation || null,
    website: form.website || null,
    address_line1: form.address_line1 || null,
    address_line2: form.address_line2 || null,
    city: form.city || null,
    state: form.state || null,
    pincode: form.pincode || null,
    country: form.country || "India",
    gstin: form.gstin || null,
    pan: form.pan || null,
    assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = buildPayload();
      if (isEdit) {
        await apiFetch(`/contacts/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        navigate(`/contacts/${id}`);
      } else {
        const created = await apiFetch("/contacts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        navigate(`/contacts/${created.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title={isEdit ? "Edit Contact" : "New Contact"} roleLabel={role}>
        <div className="crm-panel"><p>Loading…</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? "Edit Contact" : "New Contact"} roleLabel={role}>
      <div className="crm-panel">
        <Link to={isEdit ? `/contacts/${id}` : "/contacts"} className="crm-link crm-link-left">
          ← Back
        </Link>

        {error && <p className="crm-error crm-mt">{error}</p>}

        <form onSubmit={handleSubmit} className="crm-form crm-mt">
          <div className="crm-form-grid">
            <div>
              <label>Name *</label>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <label>Organization</label>
              <input
                value={form.organization_name}
                onChange={(e) => handleChange("organization_name", e.target.value)}
              />
            </div>
            <div>
              <label>Type *</label>
              <select
                value={form.contact_type}
                onChange={(e) => handleChange("contact_type", e.target.value)}
              >
                {CONTACT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label>Email</label>
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
              <label>Alternate phone</label>
              <input
                value={form.alt_phone}
                onChange={(e) => handleChange("alt_phone", e.target.value)}
              />
            </div>
            <div>
              <label>Designation</label>
              <input
                value={form.designation}
                onChange={(e) => handleChange("designation", e.target.value)}
              />
            </div>
            <div>
              <label>Assigned to</label>
              <select
                value={form.assigned_to_id}
                onChange={(e) => handleChange("assigned_to_id", e.target.value)}
              >
                <option value="">Unassigned</option>
                {assignees.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Website</label>
              <input
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </div>
            <div>
              <label>GSTIN</label>
              <input
                value={form.gstin}
                onChange={(e) => handleChange("gstin", e.target.value.toUpperCase())}
                maxLength={15}
              />
            </div>
            <div>
              <label>PAN</label>
              <input
                value={form.pan}
                onChange={(e) => handleChange("pan", e.target.value.toUpperCase())}
                maxLength={10}
              />
            </div>
          </div>

          <h4 className="crm-section-title">Address</h4>
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
              <input value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
            </div>
            <div>
              <label>State</label>
              <select value={form.state} onChange={(e) => handleChange("state", e.target.value)}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label>PIN code</label>
              <input
                value={form.pincode}
                onChange={(e) => handleChange("pincode", e.target.value)}
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

          <button type="submit" className="crm-btn crm-btn-inline">
            {isEdit ? "Save changes" : "Create contact"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default ContactForm;
