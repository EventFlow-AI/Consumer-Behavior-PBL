import { useEffect, useState, type FormEvent } from "react";
import { getEvents, type EventRecord } from "../api/events";
import { getVenues, type VenueRecord } from "../api/venues";
import { getZones, type ZoneRecord } from "../api/zones";
import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation,
  type LocationRecord,
  type LocationType,
} from "../api/locations";

const locationTypes: LocationType[] = [
  "GATE",
  "EXIT",
  "STAGE",
  "STALL",
  "WASHROOM",
  "MEDICAL",
  "HELP_POINT",
  "PARKING",
  "WATER_POINT",
  "OTHER",
];

export default function LocationsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [venues, setVenues] = useState<VenueRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [locations, setLocations] = useState<LocationRecord[]>([]);

  const [eventId, setEventId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [zoneId, setZoneId] = useState("");

  const [editingLocation, setEditingLocation] =
    useState<LocationRecord | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<LocationType>("GATE");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const data = await getEvents();
      setEvents(data);

      if (data.length > 0) {
        setEventId(data[0].id);
      }
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
      return;
    }

    void loadLocations(zoneId);
  }, [zoneId]);

  async function loadLocations(id: string) {
    try {
      setError("");
      setLocations(await getLocations(id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load locations",
      );
    }
  }

  function resetForm() {
    setEditingLocation(null);
    setName("");
    setType("GATE");
    setLatitude("");
    setLongitude("");
    setDescription("");
    setIsActive(true);
  }

  function handleEdit(location: LocationRecord) {
    setEditingLocation(location);
    setName(location.name);
    setType(location.type);
    setLatitude(String(location.latitude));
    setLongitude(String(location.longitude));
    setDescription(location.description ?? "");
    setIsActive(location.isActive);
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!zoneId) return;

    const payload = {
      name,
      type,
      latitude: Number(latitude),
      longitude: Number(longitude),
      description: description || undefined,
      isActive,
    };

    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, payload);
      } else {
        await createLocation(zoneId, payload);
      }

      resetForm();
      setShowForm(false);
      await loadLocations(zoneId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save location",
      );
    }
  }

  async function handleDelete(location: LocationRecord) {
    if (!window.confirm(`Delete "${location.name}"?`)) return;

    try {
      await deleteLocation(location.id);
      await loadLocations(zoneId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete location",
      );
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="page-kicker">Management</span>
          <h1>Locations</h1>
          <p>Manage gates, stages, stalls and operational points.</p>
        </div>

        <button
          className="primary-button"
          type="button"
          disabled={!zoneId}
          onClick={() => {
            resetForm();
            setShowForm((current) => !current);
          }}
        >
          {showForm ? "Cancel" : "Create location"}
        </button>
      </div>

      <div className="content-panel create-panel">
        <div className="form-grid">
          <label>
            Event
            <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
              {events.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Venue
            <select value={venueId} onChange={(e) => setVenueId(e.target.value)}>
              {venues.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Zone
            <select value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
              {zones.map((item) => (
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
            {editingLocation ? "Edit location" : "Create location"}
          </h2>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label>
                Type
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as LocationType)
                  }
                >
                  {locationTypes.map((item) => (
                    <option key={item} value={item}>
                      {item.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Latitude
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                />
              </label>

              <label>
                Longitude
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                />
              </label>
            </div>

            <label>
              Description
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active location
            </label>

            <div className="form-actions">
              <button className="primary-button" type="submit">
                {editingLocation ? "Save changes" : "Create location"}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="content-panel">
        {locations.length === 0 ? (
          <div className="empty-state">
            <h2>No locations</h2>
            <p>This zone does not have any locations yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Coordinates</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {locations.map((location) => (
                  <tr key={location.id}>
                    <td>
                      <strong>{location.name}</strong>
                      {location.description && (
                        <span className="table-description">
                          {location.description}
                        </span>
                      )}
                    </td>

                    <td>{location.type.replaceAll("_", " ")}</td>

                    <td>
                      {location.isActive ? "Active" : "Inactive"}
                    </td>

                    <td>
                      {location.latitude}, {location.longitude}
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => handleEdit(location)}
                        >
                          Edit
                        </button>

                        <button
                          className="text-button danger-button"
                          type="button"
                          onClick={() => void handleDelete(location)}
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