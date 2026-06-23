import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { APPLICANT_STATUS_LABELS, JOB_STATUS_LABELS, applicantBadgeClass, jobBadgeClass } from "../utils/recruitment";

function RecruitmentJobDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "Staff";
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", experience_years: "", resume_summary: "" });
  const canManage = hasPermission("recruitment.manage");

  const load = () => apiFetch(`/recruitment/jobs/${id}`).then(setJob).catch((err) => setError(err.message));
  useEffect(() => { load(); }, [id]);

  const addApplicant = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/recruitment/jobs/${id}/applicants`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          experience_years: form.experience_years ? parseFloat(form.experience_years) : null,
        }),
      });
      setForm({ name: "", email: "", phone: "", experience_years: "", resume_summary: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (applicantId, status) => {
    try {
      await apiFetch(`/recruitment/applicants/${applicantId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!job && !error) {
    return <DashboardLayout title="Job" roleLabel={role}><div className="crm-panel"><p>Loading…</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout title={job?.title || "Job"} roleLabel={role}>
      <div className="crm-panel">
        <Link to="/recruitment" className="crm-link crm-link-left">← Recruitment</Link>
        {error && <p className="crm-error crm-mt">{error}</p>}
        {job && (
          <>
            <div className="crm-detail-header crm-mt">
              <div>
                <h2>{job.job_code} — {job.title}</h2>
                <p className="crm-muted">{job.department}</p>
              </div>
              <span className={jobBadgeClass(job.status)}>{JOB_STATUS_LABELS[job.status]}</span>
            </div>
            <p className="crm-mt">{job.description}</p>

            <h3 className="crm-section-title crm-mt">Applicants ({job.applicants?.length || 0})</h3>
            {(job.applicants || []).map((a) => (
              <div key={a.id} className="crm-quote-approval-card crm-mt-sm">
                <div className="crm-detail-header">
                  <div><strong>{a.name}</strong> · {a.email}</div>
                  <span className={applicantBadgeClass(a.status)}>{APPLICANT_STATUS_LABELS[a.status]}</span>
                </div>
                <p className="crm-muted crm-text-sm">{a.resume_summary}</p>
                {canManage && (
                  <div className="crm-inline-actions crm-mt-sm">
                    {["screening", "interview", "offered", "hired", "rejected"].map((s) => (
                      <button key={s} type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={() => updateStatus(a.id, s)}>
                        {APPLICANT_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {canManage && (
              <form className="crm-form crm-mt" onSubmit={addApplicant}>
                <h3 className="crm-section-title">Add applicant</h3>
                <div className="crm-form-grid">
                  <div><label>Name *</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
                  <div><label>Email *</label><input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
                  <div><label>Phone</label><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
                  <div><label>Experience (years)</label><input type="number" step="0.5" value={form.experience_years} onChange={(e) => setForm((f) => ({ ...f, experience_years: e.target.value }))} /></div>
                  <div className="crm-form-full"><label>Summary</label><textarea rows={2} value={form.resume_summary} onChange={(e) => setForm((f) => ({ ...f, resume_summary: e.target.value }))} /></div>
                </div>
                <button type="submit" className="crm-btn crm-mt">Add applicant</button>
              </form>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default RecruitmentJobDetail;
