import DashboardLayout from "../components/DashboardLayout";

function EmployeeDashboard() {
  return (
    <DashboardLayout title="Employee Dashboard" roleLabel="Employee">
      <div className="crm-panel">
        <h1>Welcome to EmployeeDashboard </h1>
      </div>
    </DashboardLayout>
  );
}

export default EmployeeDashboard;
