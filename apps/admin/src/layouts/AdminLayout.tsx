import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../api/auth";

export default function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    logoutAdmin();
    navigate("/login");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">RS</span>
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

          <div className="admin-profile">
            <span className="admin-profile-dot" />
            <span>Administrator</span>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}