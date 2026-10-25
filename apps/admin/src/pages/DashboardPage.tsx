import { useEffect, useState } from "react";
import {
  getDashboardSummary,
  type DashboardSummary,
} from "../api/dashboard";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await getDashboardSummary();
        setData(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <div className="error-message">
          {error || "Dashboard data unavailable"}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <span className="page-kicker">Overview</span>
          <h1>Dashboard</h1>
          <p>
            Monitor Rahat Setu event operations from one place.
          </p>
        </div>
      </div>

      <section>
        <h2 className="section-title">Event Operations</h2>

        <div className="dashboard-grid">
          <article className="dashboard-card">
            <span>Total Events</span>
            <strong>{data.events.total}</strong>
            <p>
              {data.events.live} live ·{" "}
              {data.events.upcoming} upcoming
            </p>
          </article>

          <article className="dashboard-card">
            <span>Active Incidents</span>
            <strong>{data.incidents.active}</strong>
            <p>
              {data.incidents.critical} critical incidents
            </p>
          </article>

          <article className="dashboard-card">
            <span>Active Announcements</span>
            <strong>{data.announcements.active}</strong>
            <p>
              {data.announcements.urgent} urgent announcements
            </p>
          </article>
        </div>
      </section>

      <section>
        <h2 className="section-title">
          Event Infrastructure
        </h2>

        <div className="dashboard-grid">
          <article className="dashboard-card">
            <span>Venues</span>
            <strong>{data.infrastructure.venues}</strong>
            <p>Configured event venues</p>
          </article>

          <article className="dashboard-card">
            <span>Zones</span>
            <strong>{data.infrastructure.zones}</strong>
            <p>Operational venue zones</p>
          </article>

          <article className="dashboard-card">
            <span>Locations</span>
            <strong>{data.infrastructure.locations}</strong>
            <p>Mapped points across events</p>
          </article>

          <article className="dashboard-card">
            <span>Facilities</span>
            <strong>{data.infrastructure.facilities}</strong>
            <p>Registered attendee facilities</p>
          </article>
        </div>
      </section>

      <section>
        <h2 className="section-title">
          Recent Incidents
        </h2>

        <div className="table-card">
          {data.recentIncidents.length === 0 ? (
            <p>No incidents reported yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Incident</th>
                    <th>Event</th>
                    <th>Location</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Reported</th>
                  </tr>
                </thead>

                <tbody>
                  {data.recentIncidents.map((incident) => (
                    <tr key={incident.id}>
                      <td>
                        <strong>{incident.title}</strong>

                        <div className="table-secondary-text">
                          {incident.type.replaceAll(
                            "_",
                            " ",
                          )}
                        </div>
                      </td>

                      <td>{incident.event.name}</td>

                      <td>
                        {incident.location?.name ??
                          "Unspecified"}
                      </td>

                      <td>{incident.severity}</td>

                      <td>
                        {incident.status.replaceAll(
                          "_",
                          " ",
                        )}
                      </td>

                      <td>
                        {new Date(
                          incident.createdAt,
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}