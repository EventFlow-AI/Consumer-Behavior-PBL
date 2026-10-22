import { useEffect, useState, type FormEvent } from "react";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
  type CreateEventPayload,
  type EventRecord,
  type EventStatus,
  type EventType,
  type UpdateEventPayload,
} from "../api/events";

const eventTypes: EventType[] = [
  "CONCERT",
  "SPORTS",
  "PILGRIMAGE",
  "FESTIVAL",
  "EXHIBITION",
  "CONFERENCE",
  "COLLEGE_FEST",
  "OTHER",
];

const eventStatuses: EventStatus[] = [
  "DRAFT",
  "UPCOMING",
  "LIVE",
  "COMPLETED",
  "CANCELLED",
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>("FESTIVAL");
  const [status, setStatus] = useState<EventStatus>("DRAFT");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  async function loadEvents() {
    try {
      setError("");
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load events",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  function resetForm() {
    setName("");
    setDescription("");
    setEventType("FESTIVAL");
    setStatus("DRAFT");
    setStartTime("");
    setEndTime("");
  }

  async function handleCreateEvent(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setIsCreating(true);

    try {
      const payload: CreateEventPayload = {
        name,
        description: description || undefined,
        eventType,
        status,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      };

      await createEvent(payload);

      resetForm();
      setShowCreateForm(false);

      await loadEvents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create event",
      );
    } finally {
      setIsCreating(false);
    }
  }

  function handleEditClick(event: EventRecord) {
    setEditingEvent(event);

    setName(event.name);
    setDescription(event.description ?? "");
    setEventType(event.eventType);
    setStatus(event.status);

    setStartTime(
      new Date(event.startTime).toISOString().slice(0, 16),
    );

    setEndTime(
      new Date(event.endTime).toISOString().slice(0, 16),
    );

    setShowCreateForm(false);
  }

  async function handleUpdateEvent(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editingEvent) {
      return;
    }

    setError("");
    setIsUpdating(true);

    try {
      const payload: UpdateEventPayload = {
        name,
        description: description || undefined,
        eventType,
        status,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      };

      await updateEvent(editingEvent.id, payload);

      resetForm();
      setEditingEvent(null);

      await loadEvents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update event",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteEvent(event: EventRecord) {
    const confirmed = window.confirm(
      `Delete "${event.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeletingId(event.id);

    try {
      await deleteEvent(event.id);
      await loadEvents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete event",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const formMode = editingEvent ? "edit" : "create";
  const showForm = showCreateForm || Boolean(editingEvent);

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="page-kicker">Management</span>
          <h1>Events</h1>
          <p>Create and manage Rahat Setu events.</p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => {
            resetForm();
            setEditingEvent(null);
            setShowCreateForm((current) => !current);
          }}
        >
          {showCreateForm ? "Cancel" : "Create event"}
        </button>
      </div>

      {showForm && (
        <div className="content-panel create-panel">
          <h2>
            {formMode === "edit"
              ? "Edit event"
              : "Create event"}
          </h2>

          <form
            className="admin-form"
            onSubmit={
              formMode === "edit"
                ? handleUpdateEvent
                : handleCreateEvent
            }
          >
            <div className="form-grid">
              <label>
                Event name
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>

              <label>
                Event type
                <select
                  value={eventType}
                  onChange={(event) =>
                    setEventType(event.target.value as EventType)
                  }
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Status
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as EventStatus)
                  }
                >
                  {eventStatuses.map((eventStatus) => (
                    <option key={eventStatus} value={eventStatus}>
                      {eventStatus}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Start time
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                />
              </label>

              <label>
                End time
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  required
                />
              </label>
            </div>

            <label>
              Description
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={4}
              />
            </label>

            <div className="form-actions">
              {editingEvent && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    resetForm();
                    setEditingEvent(null);
                  }}
                >
                  Cancel
                </button>
              )}

              <button
                className="primary-button"
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {formMode === "edit"
                  ? isUpdating
                    ? "Saving..."
                    : "Save changes"
                  : isCreating
                    ? "Creating..."
                    : "Create event"}
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

      {isLoading ? (
        <div className="content-panel loading-panel">
          <p>Loading events...</p>
        </div>
      ) : (
        <div className="content-panel">
          {events.length === 0 ? (
            <div className="empty-state">
              <h2>No events yet</h2>
              <p>Create your first event to get started.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Starts</th>
                    <th>Ends</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <strong>{event.name}</strong>

                        {event.description && (
                          <span className="table-description">
                            {event.description}
                          </span>
                        )}
                      </td>

                      <td>{event.eventType.replaceAll("_", " ")}</td>

                      <td>
                        <span
                          className={`status-badge status-${event.status.toLowerCase()}`}
                        >
                          {event.status}
                        </span>
                      </td>

                      <td>
                        {new Date(event.startTime).toLocaleString()}
                      </td>

                      <td>
                        {new Date(event.endTime).toLocaleString()}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => handleEditClick(event)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="text-button danger-button"
                            disabled={deletingId === event.id}
                            onClick={() =>
                              void handleDeleteEvent(event)
                            }
                          >
                            {deletingId === event.id
                              ? "Deleting..."
                              : "Delete"}
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
      )}
    </div>
  );
}