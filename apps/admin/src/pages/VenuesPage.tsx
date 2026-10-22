import { useEffect, useState, type FormEvent } from "react";
import { getEvents, type EventRecord } from "../api/events";
import {
  createVenue,
  deleteVenue,
  getVenues,
  updateVenue,
  type VenueRecord,
} from "../api/venues";

export default function VenuesPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [eventId, setEventId] = useState("");

  const [venues, setVenues] = useState<VenueRecord[]>([]);
  const [editingVenue, setEditingVenue] = useState<VenueRecord | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents();
        setEvents(data);

        if (data.length > 0) {
          setEventId(data[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load events",
        );
      }
    }

    void loadEvents();
  }, []);

  useEffect(() => {
    if (!eventId) {
      setVenues([]);
      return;
    }

    void loadVenues(eventId);
  }, [eventId]);

  async function loadVenues(id: string) {
    try {
      setError("");
      const data = await getVenues(id);
      setVenues(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load venues",
      );
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setLatitude("");
    setLongitude("");
    setEditingVenue(null);
  }

  function handleEdit(venue: VenueRecord) {
    setEditingVenue(venue);
    setName(venue.name);
    setDescription(venue.description ?? "");
    setLatitude(
      venue.latitude !== null && venue.latitude !== undefined
        ? String(venue.latitude)
        : "",
    );
    setLongitude(
      venue.longitude !== null && venue.longitude !== undefined
        ? String(venue.longitude)
        : "",
    );
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!eventId) {
      return;
    }

    const payload = {
      name,
      description: description || undefined,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
    };

    try {
      if (editingVenue) {
        await updateVenue(editingVenue.id, payload);
      } else {
        await createVenue(eventId, payload);
      }

      resetForm();
      setShowForm(false);
      await loadVenues(eventId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save venue",
      );
    }
  }

  async function handleDelete(venue: VenueRecord) {
    const confirmed = window.confirm(
      `Delete "${venue.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteVenue(venue.id);
      await loadVenues(eventId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete venue",
      );
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="page-kicker">Management</span>
          <h1>Venues</h1>
          <p>Manage venues belonging to each event.</p>
        </div>

        <button
          className="primary-button"
          type="button"
          disabled={!eventId}
          onClick={() => {
            resetForm();
            setShowForm((current) => !current);
          }}
        >
          {showForm ? "Cancel" : "Create venue"}
        </button>
      </div>

      <div className="content-panel create-panel">
        <label>
          Event
          <select
            value={eventId}
            onChange={(event) => {
              setEventId(event.target.value);
              setShowForm(false);
              resetForm();
            }}
          >
            {events.length === 0 && (
              <option value="">No events available</option>
            )}

            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {showForm && (
        <div className="content-panel create-panel">
          <h2>
            {editingVenue ? "Edit venue" : "Create venue"}
          </h2>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Venue name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>

              <label>
                Latitude
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(event) => setLatitude(event.target.value)}
                />
              </label>

              <label>
                Longitude
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(event) => setLongitude(event.target.value)}
                />
              </label>
            </div>

            <label>
              Description
              <textarea
                rows={4}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
              />
            </label>

            <div className="form-actions">
              {editingVenue && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>
              )}

              <button className="primary-button" type="submit">
                {editingVenue ? "Save changes" : "Create venue"}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="content-panel error-panel">
          <p className="form-error">{error}</p>
        </div>
      )}

      <div className="content-panel">
        {venues.length === 0 ? (
          <div className="empty-state">
            <h2>No venues</h2>
            <p>This event does not have any venues yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Venue</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {venues.map((venue) => (
                  <tr key={venue.id}>
                    <td>
                      <strong>{venue.name}</strong>

                      {venue.description && (
                        <span className="table-description">
                          {venue.description}
                        </span>
                      )}
                    </td>

                    <td>{venue.latitude ?? "—"}</td>
                    <td>{venue.longitude ?? "—"}</td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => handleEdit(venue)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="text-button danger-button"
                          onClick={() => void handleDelete(venue)}
                        >
                          Delete
                        </button>
                      </div>
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