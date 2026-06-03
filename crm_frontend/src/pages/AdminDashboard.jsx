import DashboardLayout from "../components/DashboardLayout";

function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard" roleLabel="Admin">
      <div className="crm-panel">
       <h1>Welcome to AdminDashboard</h1>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
