import DashboardLayout from "../components/DashboardLayout";
import RoleHomePage from "../components/RoleHomePage";

function AccountantDashboard() {
  const name = localStorage.getItem("name");

  return (
    <DashboardLayout title="Finance" roleLabel="Accountant">
      <RoleHomePage
        greeting={name ? `Hi, ${name.split(" ")[0]}` : "Finance workspace"}
        subtitle="GST invoices, payments, ledgers, tax reports, and payroll."
        launcherSubtitle="Billing and finance modules at a glance."
      />
    </DashboardLayout>
  );
}

export default AccountantDashboard;
