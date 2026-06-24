import AppLauncher from "./AppLauncher";
import SalesKpis from "./SalesKpis";

function RoleHomePage({
  greeting = "Welcome back",
  subtitle,
  children,
  showKpis = true,
  launcherTitle = "Your apps",
  launcherSubtitle,
}) {
  return (
    <div className="crm-role-home">
      <header className="crm-role-home-hero">
        <div>
          <p className="crm-role-home-eyebrow">Workspace</p>
          <h1>{greeting}</h1>
          {subtitle && <p className="crm-role-home-sub">{subtitle}</p>}
        </div>
      </header>

      {children}

      {showKpis && <SalesKpis />}

      <AppLauncher
        title={launcherTitle}
        subtitle={launcherSubtitle}
        groupByCategory
        className="crm-role-home-launcher"
      />
    </div>
  );
}

export default RoleHomePage;
