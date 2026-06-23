import { Link } from "react-router-dom";

function Home() {
  const portals = [
    {
      title: "Admin",
      description: "Manage users, settings, and system-wide reports.",
      path: "/admin-login",
      className: "crm-portal-admin",
    },
    {
      title: "Manager",
      description: "Track team performance and assign leads.",
      path: "/manager-login",
      className: "crm-portal-manager",
    },
    {
      title: "Employee",
      description: "HR self-service: attendance, leave, timesheets.",
      path: "/employee-login",
      className: "crm-portal-employee",
    },
    {
      title: "Sales",
      description: "Leads, pipeline, quotations, and client follow-ups.",
      path: "/sales-login",
      className: "crm-portal-sales",
    },
    {
      title: "Accountant",
      description: "Invoices, payments, tax reports, and ledgers.",
      path: "/accountant-login",
      className: "crm-portal-accountant",
    },
    {
      title: "User",
      description: "Sign in or create a new account.",
      path: "/user-login",
      className: "crm-portal-user",
    },
  ];

  return (
    <div className="crm-page">
      <header className="crm-hero">
        <img
          src="/branding/logo.svg"
          alt="BlackPapers"
          className="blackpapers-logo"
        />

        <h3 className="blackpapers-title">BlackPapers CRM</h3>

        <h1>Customer Relationship Management</h1>

        <p>Choose your portal to sign in.</p>
      </header>

      <section className="crm-portals">
        {portals.map((portal) => (
          <Link
            key={portal.path}
            to={portal.path}
            className={`crm-portal ${portal.className}`}
            aria-label={`${portal.title} login`}
          >
            <div>
              <h2>{portal.title}</h2>
              <p>{portal.description}</p>
            </div>

            <span>Sign in →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

export default Home;