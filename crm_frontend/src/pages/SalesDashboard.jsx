import DashboardLayout from "../components/DashboardLayout";
import RoleHomePage from "../components/RoleHomePage";

function SalesDashboard() {
  const name = localStorage.getItem("name");

  return (
    <DashboardLayout title="Sales" roleLabel="Sales">
      <RoleHomePage
        greeting={name ? `Hi, ${name.split(" ")[0]}` : "Sales workspace"}
        subtitle="Leads, pipeline, quotations, orders, and client follow-ups."
        launcherSubtitle="Pick an app to start working."
      />
    </DashboardLayout>
  );
}

export default SalesDashboard;
