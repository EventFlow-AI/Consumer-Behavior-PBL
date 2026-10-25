import { useEffect, useState } from "react";
import { getEvents, type EventRecord } from "../api/events";
import {
  getIncidentsByEvent,
  updateIncident,
  type IncidentRecord,
  type IncidentSeverity,
  type IncidentStatus,
} from "../api/incidents";

const severityOptions: IncidentSeverity[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const statusOptions: IncidentStatus[] = [
  "OPEN",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

export default function IncidentsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await getEvents();
setEvents(response);

if (response.length > 0) {
  setSelectedEventId(response[0].id);
}
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load events",
        );
      }
    }

    loadEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setIncidents([]);
      return;
    }

    loadIncidents();
  }, [selectedEventId]);

  async function loadIncidents() {
    if (!selectedEventId) return;

    try {
      setLoading(true);
      setError("");

      const response =
        await getIncidentsByEvent(selectedEventId);

      setIncidents(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load incidents",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    incidentId: string,
    status: IncidentStatus,
  ) {
    try {
      await updateIncident(incidentId, { status });
      await loadIncidents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update incident status",
      );
    }
  }

  async function handleSeverityChange(
    incidentId: string,
    severity: IncidentSeverity,
  ) {
    try {
      await updateIncident(incidentId, { severity });
      await loadIncidents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update incident severity",
      );
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Incidents</h1>
          <p>
            Monitor and manage emergency reports for each
            event.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-card">
        <label htmlFor="incident-event">
          Event
        </label>

        <select
          id="incident-event"
          value={selectedEventId}
          onChange={(event) =>
            setSelectedEventId(event.target.value)
          }
        >
          {events.length === 0 && (
            <option value="">
              No events available
            </option>
          )}

          {events.map((event) => (
            <option
              key={event.id}
              value={event.id}
            >
              {event.name}
            </option>
          ))}
        </select>
      </div>

      <div className="table-card">
        {loading ? (
          <p>Loading incidents...</p>
        ) : incidents.length === 0 ? (
          <p>No incidents reported for this event.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Incident</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Reported By</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Reported</th>
                </tr>
              </thead>

              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>
                      <strong>
                        {incident.title}
                      </strong>

                      <div className="table-secondary-text">
                        {incident.description}
                      </div>
                    </td>

                    <td>
                      {incident.type.replaceAll(
                        "_",
                        " ",
                      )}
                    </td>

                    <td>
                      {incident.location?.name ??
                        "GPS / Unspecified"}
                    </td>

                    <td>
                      {incident.reportedBy?.name ??
                        "Unknown"}

                      {incident.reportedBy?.email && (
                        <div className="table-secondary-text">
                          {
                            incident.reportedBy
                              .email
                          }
                        </div>
                      )}
                    </td>

                    <td>
                      <select
                        value={incident.severity}
                        onChange={(event) =>
                          handleSeverityChange(
                            incident.id,
                            event.target
                              .value as IncidentSeverity,
                          )
                        }
                      >
                        {severityOptions.map(
                          (severity) => (
                            <option
                              key={severity}
                              value={severity}
                            >
                              {severity}
                            </option>
                          ),
                        )}
                      </select>
                    </td>

                    <td>
                      <select
                        value={incident.status}
                        onChange={(event) =>
                          handleStatusChange(
                            incident.id,
                            event.target
                              .value as IncidentStatus,
                          )
                        }
                      >
                        {statusOptions.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status.replaceAll(
                                "_",
                                " ",
                              )}
                            </option>
                          ),
                        )}
                      </select>
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
    </div>
  );
}