export default function DashboardPage() {
  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="page-kicker">Overview</span>
          <h1>Dashboard</h1>
          <p>
            Monitor and manage Rahat Setu event operations.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <span>Events</span>
          <strong>—</strong>
          <p>Manage upcoming and live events</p>
        </article>

        <article className="dashboard-card">
          <span>Venues</span>
          <strong>—</strong>
          <p>Configure venue structures</p>
        </article>

        <article className="dashboard-card">
          <span>Live Operations</span>
          <strong>Pending</strong>
          <p>Crowd and queue monitoring will appear here</p>
        </article>
      </div>
    </div>
  );
}