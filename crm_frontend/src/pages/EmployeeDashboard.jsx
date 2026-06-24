import DashboardLayout from "../components/DashboardLayout";
import RoleHomePage from "../components/RoleHomePage";

function EmployeeDashboard() {
  const name = localStorage.getItem("name");

  return (
    <DashboardLayout title="Employee" roleLabel="Employee">
      <RoleHomePage
        greeting={name ? `Hi, ${name.split(" ")[0]}` : "Your workspace"}
        subtitle="Attendance, leave, timesheets, projects, and payslips."
        showKpis={false}
        launcherSubtitle="Your day-to-day apps."
      />
    </DashboardLayout>
  );
}

export default EmployeeDashboard;
