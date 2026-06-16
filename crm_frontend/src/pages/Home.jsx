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
      description: "Update leads, tasks, and daily activity.",
      path: "/employee-login",
      className: "crm-portal-employee",
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