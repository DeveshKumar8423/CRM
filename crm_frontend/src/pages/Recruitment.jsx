import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { JOB_STATUS_LABELS, formatCurrency, formatDate, jobBadgeClass } from "../utils/recruitment";

function Recruitment() {
  const role = localStorage.getItem("role") || "Staff";
  const [data, setData] = useState({ items: [], total: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/recruitment/jobs?limit=50").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout title="Recruitment" roleLabel={role}>
      <div className="crm-panel">
        <p className="crm-muted">{data.total} job opening{data.total === 1 ? "" : "s"}</p>
        {error && <p className="crm-error crm-mt">{error}</p>}
        <div className="crm-mt">
          {data.items.map((job) => (
            <div key={job.id} className="crm-quote-approval-card">
              <div className="crm-detail-header">
                <div>
                  <strong>{job.job_code} — {job.title}</strong>
                  <div className="crm-muted">{job.department} · {job.applicant_count} applicant{job.applicant_count === 1 ? "" : "s"}</div>
                </div>
                <span className={jobBadgeClass(job.status)}>{JOB_STATUS_LABELS[job.status]}</span>
              </div>
              <p className="crm-muted crm-text-sm">Posted {formatDate(job.posted_at)} · {formatCurrency(job.salary_min)} – {formatCurrency(job.salary_max)}</p>
              <Link to={`/recruitment/jobs/${job.id}`} className="crm-btn crm-btn-sm crm-btn-outline crm-mt">View pipeline</Link>
            </div>
          ))}
        </div>
        {data.items.length === 0 && !error && <p className="crm-muted crm-mt">No job openings.</p>}
      </div>
    </DashboardLayout>
  );
}

export default Recruitment;
