import DashboardLayout from "../components/DashboardLayout";
import RoleHomePage from "../components/RoleHomePage";

function ManagerDashboard() {
  const name = localStorage.getItem("name");

  return (
    <DashboardLayout title="Manager" roleLabel="Manager">
      <RoleHomePage
        greeting={name ? `Hi, ${name.split(" ")[0]}` : "Manager workspace"}
        subtitle="Team performance, pipeline, contacts, and business reports."
        launcherSubtitle="Modules for overseeing your team."
      />
    </DashboardLayout>
  );
}

export default ManagerDashboard;
