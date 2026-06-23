import { useCallback, useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";
import { hasPermission } from "../utils/permissions";
import { STATUS_LABELS, formatDate, formatTime, statusBadgeClass } from "../utils/attendance";

function Attendance() {
  const role = localStorage.getItem("role") || "Staff";
  const teamView = hasPermission("attendance.view_all");
  const canCheckIn = hasPermission("attendance.check_in") && !teamView;

  const [today, setToday] = useState(null);
  const [teamToday, setTeamToday] = useState(null);
  const [history, setHistory] = useState({ items: [], total: 0 });
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (teamView) {
      apiFetch("/attendance/team/today").then(setTeamToday).catch(() => {});
      apiFetch("/attendance?days=30&limit=100").then(setHistory).catch((err) => setError(err.message));
      apiFetch("/attendance/stats/summary").then(setStats).catch(() => {});
    } else {
      apiFetch("/attendance/today").then(setToday).catch(() => {});
      apiFetch("/attendance?days=30&limit=50").then(setHistory).catch((err) => setError(err.message));
    }
  }, [teamView]);

  useEffect(() => { load(); }, [load]);

  const checkIn = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await apiFetch("/attendance/check-in", { method: "POST", body: JSON.stringify({}) });
      setMessage("You checked in successfully. Your start time has been recorded.");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await apiFetch("/attendance/check-out", { method: "POST" });
      setMessage("You checked out successfully. Your work hours have been saved.");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const todayDateLabel = today?.attendance_date
    ? formatDate(today.attendance_date)
    : formatDate(new Date().toISOString());

  const pageTitle = teamView ? "Team Attendance" : "My Attendance";

  return (
    <DashboardLayout title={pageTitle} roleLabel={role}>
      <div className="crm-panel">
        {teamView && (
          <>
            <p className="crm-muted">
              View attendance for all employees. To mark your own check-in or check-out, use your employee login — this screen is for oversight only.
            </p>

            {stats && (
              <div className="crm-stats-grid crm-mt">
                <div className="crm-stat-card">
                  <p className="crm-stat-label">Present today</p>
                  <p className="crm-stat-value">{stats.present_today}</p>
                </div>
                <div className="crm-stat-card">
                  <p className="crm-stat-label">Late today</p>
                  <p className="crm-stat-value">{stats.late_today}</p>
                </div>
                <div className="crm-stat-card">
                  <p className="crm-stat-label">Absent today</p>
                  <p className="crm-stat-value">{stats.absent_today ?? "—"}</p>
                </div>
              </div>
            )}

            {error && <p className="crm-error crm-mt">{error}</p>}

            {teamToday && (
              <>
                <h3 className="crm-section-title crm-mt">
                  Today — {formatDate(teamToday.attendance_date)}
                </h3>
                <p className="crm-muted crm-text-sm">
                  {teamToday.checked_in_count} of {teamToday.total_staff} checked in,
                  {" "}{teamToday.checked_out_count} checked out
                </p>
                <div className="crm-table-wrap crm-mt-sm">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Check in</th>
                        <th>Check out</th>
                        <th>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamToday.items.map((r) => (
                        <tr key={r.user_id}>
                          <td><strong>{r.user_name}</strong></td>
                          <td>{r.department || "—"}</td>
                          <td>{r.role}</td>
                          <td>
                            {r.status ? (
                              <span className={statusBadgeClass(r.status)}>{r.status_label}</span>
                            ) : (
                              <span className="crm-attendance-status crm-attendance-status-absent">Not checked in</span>
                            )}
                          </td>
                          <td>{formatTime(r.check_in_at)}</td>
                          <td>{formatTime(r.check_out_at)}</td>
                          <td>{r.worked_hours ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <h3 className="crm-section-title crm-mt">Attendance sheet (last 30 days)</h3>
            <div className="crm-table-wrap crm-mt-sm">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Status</th>
                    <th>Check in</th>
                    <th>Check out</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {history.items.map((r) => (
                    <tr key={r.id}>
                      <td>{formatDate(r.attendance_date)}</td>
                      <td>{r.user_name || "—"}</td>
                      <td><span className={statusBadgeClass(r.status)}>{STATUS_LABELS[r.status]}</span></td>
                      <td>{formatTime(r.check_in_at)}</td>
                      <td>{formatTime(r.check_out_at)}</td>
                      <td>{r.worked_hours ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {history.items.length === 0 && <p className="crm-muted crm-mt">No attendance records yet.</p>}
          </>
        )}

        {!teamView && (
          <>
            <div className="crm-attendance-today-card">
              <div className="crm-attendance-today-header">
                <div>
                  <p className="crm-section-title" style={{ margin: 0 }}>Today — {todayDateLabel}</p>
                  <p className="crm-muted crm-text-sm">Mark when your workday starts and ends</p>
                </div>
                {today?.status && (
                  <span className={statusBadgeClass(today.status)}>
                    {today.status_label || STATUS_LABELS[today.status]}
                  </span>
                )}
                {!today?.has_record && (
                  <span className="crm-attendance-status crm-attendance-status-absent">Not checked in</span>
                )}
              </div>

              <div className="crm-attendance-today-times crm-mt">
                <div className="crm-attendance-time-block">
                  <p className="crm-stat-label">Check in</p>
                  <p className="crm-attendance-time-value">
                    {today?.check_in_at ? formatTime(today.check_in_at) : "—"}
                  </p>
                  {today?.late_minutes > 0 && (
                    <p className="crm-warning crm-text-sm">{today.late_minutes} min late</p>
                  )}
                </div>
                <div className="crm-attendance-time-block">
                  <p className="crm-stat-label">Check out</p>
                  <p className="crm-attendance-time-value">
                    {today?.check_out_at ? formatTime(today.check_out_at) : "—"}
                  </p>
                </div>
                <div className="crm-attendance-time-block">
                  <p className="crm-stat-label">Hours worked</p>
                  <p className="crm-attendance-time-value">
                    {today?.worked_hours != null ? `${today.worked_hours}h` : "—"}
                  </p>
                </div>
              </div>

              {canCheckIn && (
                <div className="crm-attendance-actions crm-mt">
                  <button
                    type="button"
                    className="crm-btn crm-btn-lg crm-attendance-btn-in"
                    onClick={checkIn}
                    disabled={loading || !today?.can_check_in}
                  >
                    {today?.check_in_at ? "Checked in" : "Check in — start day"}
                  </button>
                  <button
                    type="button"
                    className="crm-btn crm-btn-lg crm-btn-outline crm-attendance-btn-out"
                    onClick={checkOut}
                    disabled={loading || !today?.can_check_out}
                  >
                    {today?.check_out_at ? "Checked out" : "Check out — end day"}
                  </button>
                </div>
              )}

              {!canCheckIn && (
                <p className="crm-muted crm-mt">
                  You can view your attendance history. Contact HR if check-in is not enabled for your account.
                </p>
              )}
            </div>

            {message && <p className="crm-success crm-mt">{message}</p>}
            {error && <p className="crm-error crm-mt">{error}</p>}

            <h3 className="crm-section-title crm-mt">My history (last 30 days)</h3>
            <div className="crm-table-wrap crm-mt-sm">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check in</th>
                    <th>Check out</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {history.items.map((r) => (
                    <tr key={r.id}>
                      <td>{formatDate(r.attendance_date)}</td>
                      <td><span className={statusBadgeClass(r.status)}>{STATUS_LABELS[r.status]}</span></td>
                      <td>{formatTime(r.check_in_at)}</td>
                      <td>{formatTime(r.check_out_at)}</td>
                      <td>{r.worked_hours ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {history.items.length === 0 && <p className="crm-muted crm-mt">No attendance records yet.</p>}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Attendance;
