import { useEffect, useState, type FormEvent } from "react";
import { getEvents, type EventRecord } from "../api/events";
import { getVenues, type VenueRecord } from "../api/venues";
import { getZones, type ZoneRecord } from "../api/zones";
import {
  getLocations,
  type LocationRecord,
} from "../api/locations";
import {
  createFacility,
  deleteFacility,
  getFacilities,
  updateFacility,
  type FacilityRecord,
  type FacilityStatus,
} from "../api/facilities";

const statuses: FacilityStatus[] = [
  "AVAILABLE",
  "BUSY",
  "FULL",
  "CLOSED",
  "MAINTENANCE",
];

export default function FacilitiesPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [venues, setVenues] = useState<VenueRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [facilities, setFacilities] = useState<FacilityRecord[]>([]);

  const [eventId, setEventId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [locationId, setLocationId] = useState("");

  const [editingFacility, setEditingFacility] =
    useState<FacilityRecord | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] =
    useState<FacilityStatus>("AVAILABLE");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const data = await getEvents();
      setEvents(data);
      setEventId(data[0]?.id ?? "");
    })();
  }, []);

  useEffect(() => {
    if (!eventId) {
      setVenues([]);
      setVenueId("");
      return;
    }

    void (async () => {
      const data = await getVenues(eventId);
      setVenues(data);
      setVenueId(data[0]?.id ?? "");
    })();
  }, [eventId]);

  useEffect(() => {
    if (!venueId) {
      setZones([]);
      setZoneId("");
      return;
    }

    void (async () => {
      const data = await getZones(venueId);
      setZones(data);
      setZoneId(data[0]?.id ?? "");
    })();
  }, [venueId]);

  useEffect(() => {
    if (!zoneId) {
      setLocations([]);
      setLocationId("");
      return;
    }

    void (async () => {
      const data = await getLocations(zoneId);
      setLocations(data);
      setLocationId(data[0]?.id ?? "");
    })();
  }, [zoneId]);

  useEffect(() => {
    if (!locationId) {
      setFacilities([]);
      return;
    }

    void loadFacilities(locationId);
  }, [locationId]);

  async function loadFacilities(id: string) {
    try {
      setError("");
      setFacilities(await getFacilities(id));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load facilities",
      );
    }
  }

  function resetForm() {
    setEditingFacility(null);
    setName("");
    setType("");
    setStatus("AVAILABLE");
    setCapacity("");
    setDescription("");
  }

  function handleEdit(facility: FacilityRecord) {
    setEditingFacility(facility);
    setName(facility.name);
    setType(facility.type);
    setStatus(facility.status);
    setCapacity(
      facility.capacity !== null &&
        facility.capacity !== undefined
        ? String(facility.capacity)
        : "",
    );
    setDescription(facility.description ?? "");
    setShowForm(true);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!locationId) return;

    const payload = {
      name,
      type,
      status,
      capacity: capacity ? Number(capacity) : undefined,
      description: description || undefined,
    };

    try {
      if (editingFacility) {
        await updateFacility(editingFacility.id, payload);
      } else {
        await createFacility(locationId, payload);
      }

      resetForm();
      setShowForm(false);
      await loadFacilities(locationId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save facility",
      );
    }
  }

  async function handleDelete(facility: FacilityRecord) {
    if (!window.confirm(`Delete "${facility.name}"?`)) {
      return;
    }

    try {
      await deleteFacility(facility.id);
      await loadFacilities(locationId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete facility",
      );
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="page-kicker">Management</span>
          <h1>Facilities</h1>
          <p>
            Manage facilities and their operational status.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          disabled={!locationId}
          onClick={() => {
            resetForm();
            setShowForm((current) => !current);
          }}
        >
          {showForm ? "Cancel" : "Create facility"}
        </button>
      </div>

      <div className="content-panel create-panel">
        <div className="form-grid">
          <label>
            Event
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            >
              {events.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Venue
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
            >
              {venues.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Zone
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
            >
              {zones.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Location
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
            >
              {locations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {showForm && (
        <div className="content-panel create-panel">
          <h2>
            {editingFacility
              ? "Edit facility"
              : "Create facility"}
          </h2>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Facility name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label>
                Type
                <input
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g. HELP_DESK"
                  required
                />
              </label>

              <label>
                Status
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as FacilityStatus,
                    )
                  }
                >
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Capacity
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) =>
                    setCapacity(e.target.value)
                  }
                />
              </label>
            </div>

            <label>
              Description
              <textarea
                rows={4}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />
            </label>

            <div className="form-actions">
              <button
                className="primary-button"
                type="submit"
              >
                {editingFacility
                  ? "Save changes"
                  : "Create facility"}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="content-panel">
        {facilities.length === 0 ? (
          <div className="empty-state">
            <h2>No facilities</h2>
            <p>
              This location does not have any facilities yet.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {facilities.map((facility) => (
                  <tr key={facility.id}>
                    <td>
                      <strong>{facility.name}</strong>

                      {facility.description && (
                        <span className="table-description">
                          {facility.description}
                        </span>
                      )}
                    </td>

                    <td>{facility.type}</td>

                    <td>
                      <span
                        className={`status-badge status-${facility.status.toLowerCase()}`}
                      >
                        {facility.status}
                      </span>
                    </td>

                    <td>{facility.capacity ?? "—"}</td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="text-button"
                          type="button"
                          onClick={() =>
                            handleEdit(facility)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="text-button danger-button"
                          type="button"
                          onClick={() =>
                            void handleDelete(facility)
                          }
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