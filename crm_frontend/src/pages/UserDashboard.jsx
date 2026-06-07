import DashboardLayout from "../components/DashboardLayout";

function UserDashboard() {
  const name = localStorage.getItem("name");

  return (
    <DashboardLayout title="User Dashboard" roleLabel="User">
      <div className="crm-panel">
        <h2>Welcome user</h2>
        {name && <p>You are signed in as {name}.</p>}
      </div>
    </DashboardLayout>
  );
}

export default UserDashboard;
