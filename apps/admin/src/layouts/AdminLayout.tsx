import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getStoredAdminUser, logoutAdmin } from "../api/auth";

export default function AdminLayout() {
  const navigate = useNavigate();
  const adminUser = getStoredAdminUser();

  function handleLogout() {
    logoutAdmin();
    navigate("/login");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img
            className="admin-brand-mark"
            src="/logo.webp"
            alt="Rahat Setu logo"
          />
          <div>
            <strong>Rahat Setu</strong>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/venues">Venues</NavLink>
          <NavLink to="/zones">Zones</NavLink>
          <NavLink to="/locations">Locations</NavLink>
          <NavLink to="/facilities">Facilities</NavLink>
          <NavLink to="/incidents">Incidents</NavLink>
          <NavLink to="/announcements">Announcements</NavLink>
          <NavLink to="/brands">
  Brands
</NavLink>

<NavLink to="/offers">
  Offers
</NavLink>
<NavLink to="/consumer-insights">
  Consumer Insights
</NavLink>
<NavLink to="/mobile-ops">
  Field &amp; Mobile Ops
</NavLink>
        </nav>

        <button
          className="admin-logout"
          type="button"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-topbar-label">Operations Console</span>
          </div>

          <div className="admin-profile" title={adminUser?.email}>
            <span className="admin-profile-dot" />
            <span>{adminUser?.name ?? "Administrator"}</span>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}