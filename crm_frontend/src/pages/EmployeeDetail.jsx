import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { EMPLOYMENT_LABELS, formatCurrency, formatDate } from "../utils/employees";

function EmployeeDetail() {
  const { userId } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [emp, setEmp] = useState(null);
  const [meta, setMeta] = useState({ employment_types: [], genders: [] });
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const canEdit = hasPermission("employees.edit");

  useEffect(() => {
    apiFetch("/employees/meta").then(setMeta).catch(() => {});
    apiFetch(`/employees/${userId}`).then((data) => {
      setEmp(data);
      setForm({
        joining_date: data.joining_date?.slice(0, 10) || "",
        employment_type: data.employment_type || "full_time",
        salary_monthly: data.salary_monthly ?? "",
        department: data.department || "",
        designation: data.designation || "",
        emergency_contact_name: data.emergency_contact_name || "",
        emergency_contact_phone: data.emergency_contact_phone || "",
        city: data.city || "",
        pan: data.pan || "",
        notes: data.notes || "",
      });
    }).catch((err) => setError(err.message));
  }, [userId]);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        salary_monthly: form.salary_monthly ? parseFloat(form.salary_monthly) : null,
        joining_date: form.joining_date ? new Date(`${form.joining_date}T12:00:00`).toISOString() : null,
      };
      const updated = await apiFetch(`/employees/${userId}/profile`, { method: "PUT", body: JSON.stringify(payload) });
      setEmp(updated);
      setMessage("Profile saved.");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!emp && !error) {
    return <DashboardLayout title="Employee" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout title={emp?.name || "Employee"} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/employees" className="crm-link crm-link-left">← Employees</Link>
        {message && <p className="crm-success crm-mt">{message}</p>}
        {error && <p className="crm-error crm-mt">{error}</p>}
        {emp && (
          <>
            <div className="crm-contact-meta crm-mt">
              <p><strong>{emp.name}</strong> · {emp.email}</p>
              <p>Employee ID: {emp.employee_id || "—"} · Status: {emp.status}</p>
              <p>Manager: {emp.manager_name || "—"}</p>
              <p>Employment: {EMPLOYMENT_LABELS[emp.employment_type] || emp.employment_type || "—"}</p>
              <p>Salary: {formatCurrency(emp.salary_monthly)} · Joined: {formatDate(emp.joining_date)}</p>
            </div>
            {canEdit && (
              <form className="crm-form crm-mt" onSubmit={save}>
                <h3 className="crm-section-title">Edit HR profile</h3>
                <div className="crm-form-grid">
                  <div><label>Joining date</label><input type="date" value={form.joining_date} onChange={(e) => setForm((f) => ({ ...f, joining_date: e.target.value }))} /></div>
                  <div><label>Salary (monthly)</label><input type="number" value={form.salary_monthly} onChange={(e) => setForm((f) => ({ ...f, salary_monthly: e.target.value }))} /></div>
                  <div><label>Department</label><input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} /></div>
                  <div><label>Designation</label><input value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} /></div>
                  <div>
                    <label>Employment type</label>
                    <select value={form.employment_type} onChange={(e) => setForm((f) => ({ ...f, employment_type: e.target.value }))}>
                      {(meta.employment_types || []).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div><label>Emergency contact</label><input value={form.emergency_contact_name} onChange={(e) => setForm((f) => ({ ...f, emergency_contact_name: e.target.value }))} /></div>
                  <div><label>Emergency phone</label><input value={form.emergency_contact_phone} onChange={(e) => setForm((f) => ({ ...f, emergency_contact_phone: e.target.value }))} /></div>
                  <div><label>City</label><input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} /></div>
                  <div><label>PAN</label><input value={form.pan} onChange={(e) => setForm((f) => ({ ...f, pan: e.target.value }))} /></div>
                  <div className="crm-span-2">
                    <label htmlFor="employee-notes">Notes</label>
                    <textarea
                      id="employee-notes"
                      className="crm-textarea"
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                  </div>
                </div>
                <button type="submit" className="crm-btn crm-mt">Save profile</button>
              </form>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default EmployeeDetail;
