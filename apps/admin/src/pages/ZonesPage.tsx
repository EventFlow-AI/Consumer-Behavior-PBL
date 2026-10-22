import { useEffect, useState, type FormEvent } from "react";
import { getEvents, type EventRecord } from "../api/events";
import { getVenues, type VenueRecord } from "../api/venues";
import {
  createZone,
  deleteZone,
  getZones,
  updateZone,
  type ZoneRecord,
} from "../api/zones";

export default function ZonesPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [venues, setVenues] = useState<VenueRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);

  const [eventId, setEventId] = useState("");
  const [venueId, setVenueId] = useState("");

  const [editingZone, setEditingZone] = useState<ZoneRecord | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");

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
      setVenueId("");
      return;
    }

    async function loadVenues() {
      try {
        const data = await getVenues(eventId);
        setVenues(data);

        if (data.length > 0) {
          setVenueId(data[0].id);
        } else {
          setVenueId("");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load venues",
        );
      }
    }

    void loadVenues();
  }, [eventId]);

  useEffect(() => {
    if (!venueId) {
      setZones([]);
      return;
    }

    void loadZones(venueId);
  }, [venueId]);

  async function loadZones(id: string) {
    try {
      setError("");
      const data = await getZones(id);
      setZones(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load zones",
      );
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setCapacity("");
    setEditingZone(null);
  }

  function handleEdit(zone: ZoneRecord) {
    setEditingZone(zone);
    setName(zone.name);
    setDescription(zone.description ?? "");
    setCapacity(zone.capacity ? String(zone.capacity) : "");
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!venueId) {
      return;
    }

    const payload = {
      name,
      description: description || undefined,
      capacity: capacity ? Number(capacity) : undefined,
    };

    try {
      if (editingZone) {
        await updateZone(editingZone.id, payload);
      } else {
        await createZone(venueId, payload);
      }

      resetForm();
      setShowForm(false);
      await loadZones(venueId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save zone",
      );
    }
  }

  async function handleDelete(zone: ZoneRecord) {
    if (!window.confirm(`Delete "${zone.name}"?`)) {
      return;
    }

    try {
      await deleteZone(zone.id);
      await loadZones(venueId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete zone",
      );
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="page-kicker">Management</span>
          <h1>Zones</h1>
          <p>Manage zones within each venue.</p>
        </div>

        <button
          className="primary-button"
          type="button"
          disabled={!venueId}
          onClick={() => {
            resetForm();
            setShowForm((current) => !current);
          }}
        >
          {showForm ? "Cancel" : "Create zone"}
        </button>
      </div>

      <div className="content-panel create-panel">
        <div className="form-grid">
          <label>
            Event
            <select
              value={eventId}
              onChange={(event) => setEventId(event.target.value)}
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Venue
            <select
              value={venueId}
              onChange={(event) => setVenueId(event.target.value)}
            >
              {venues.length === 0 && (
                <option value="">No venues available</option>
              )}

              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {showForm && (
        <div className="content-panel create-panel">
          <h2>{editingZone ? "Edit zone" : "Create zone"}</h2>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Zone name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>

              <label>
                Capacity
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value)}
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
              <button className="primary-button" type="submit">
                {editingZone ? "Save changes" : "Create zone"}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="content-panel">
        {zones.length === 0 ? (
          <div className="empty-state">
            <h2>No zones</h2>
            <p>This venue does not have any zones yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.id}>
                    <td>
                      <strong>{zone.name}</strong>
                      {zone.description && (
                        <span className="table-description">
                          {zone.description}
                        </span>
                      )}
                    </td>

                    <td>{zone.capacity ?? "—"}</td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => handleEdit(zone)}
                        >
                          Edit
                        </button>

                        <button
                          className="text-button danger-button"
                          type="button"
                          onClick={() => void handleDelete(zone)}
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