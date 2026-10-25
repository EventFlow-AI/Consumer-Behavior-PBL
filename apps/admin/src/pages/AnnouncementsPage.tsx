import { useEffect, useState } from "react";
import { getEvents, type EventRecord } from "../api/events";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementsByEvent,
  updateAnnouncement,
  type AnnouncementPriority,
  type AnnouncementRecord,
} from "../api/announcements";

const priorityOptions: AnnouncementPriority[] = [
  "INFO",
  "IMPORTANT",
  "URGENT",
];

export default function AnnouncementsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [announcements, setAnnouncements] = useState<
    AnnouncementRecord[]
  >([]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] =
    useState<AnnouncementPriority>("INFO");
  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(
    null,
  );

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
      setAnnouncements([]);
      return;
    }

    loadAnnouncements();
  }, [selectedEventId]);

  async function loadAnnouncements() {
    if (!selectedEventId) return;

    try {
      setLoading(true);
      setError("");

      const response =
        await getAnnouncementsByEvent(selectedEventId);

      setAnnouncements(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load announcements",
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setMessage("");
    setPriority("INFO");
    setIsActive(true);
    setEditingId(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedEventId) return;

    try {
      setError("");

      if (editingId) {
        await updateAnnouncement(editingId, {
          title,
          message,
          priority,
          isActive,
        });
      } else {
        await createAnnouncement({
          eventId: selectedEventId,
          title,
          message,
          priority,
          isActive,
        });
      }

      resetForm();
      await loadAnnouncements();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save announcement",
      );
    }
  }

  function handleEdit(announcement: AnnouncementRecord) {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setMessage(announcement.message);
    setPriority(announcement.priority);
    setIsActive(announcement.isActive);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this announcement?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteAnnouncement(id);

      if (editingId === id) {
        resetForm();
      }

      await loadAnnouncements();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete announcement",
      );
    }
  }

  async function handleActiveToggle(
    announcement: AnnouncementRecord,
  ) {
    try {
      setError("");

      await updateAnnouncement(announcement.id, {
        isActive: !announcement.isActive,
      });

      await loadAnnouncements();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update announcement",
      );
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Announcements</h1>
          <p>
            Publish operational updates and alerts for event
            attendees.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="form-card">
        <label htmlFor="announcement-event">
          Event
        </label>

        <select
          id="announcement-event"
          value={selectedEventId}
          onChange={(event) => {
            setSelectedEventId(event.target.value);
            resetForm();
          }}
        >
          {events.length === 0 && (
            <option value="">No events available</option>
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

      <form
        className="announcement-form"
        onSubmit={handleSubmit}
      >
        <div className="form-grid">
          <div>
            <label htmlFor="announcement-title">
              Title
            </label>

            <input
              id="announcement-title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Gate B temporarily closed"
              required
            />
          </div>

          <div>
            <label htmlFor="announcement-priority">
              Priority
            </label>

            <select
              id="announcement-priority"
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target
                    .value as AnnouncementPriority,
                )
              }
            >
              {priorityOptions.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="announcement-message">
            Message
          </label>

          <textarea
            id="announcement-message"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Please use Gate A until further notice."
            rows={4}
            required
          />
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) =>
              setIsActive(event.target.checked)
            }
          />

          Active
        </label>

        <div className="form-actions">
          <button type="submit">
            {editingId
              ? "Update Announcement"
              : "Create Announcement"}
          </button>

          {editingId && (
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-card">
        {loading ? (
          <p>Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p>
            No announcements created for this event.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Announcement</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement.id}>
                    <td>
                      <strong>
                        {announcement.title}
                      </strong>

                      <div className="table-secondary-text">
                        {announcement.message}
                      </div>
                    </td>

                    <td>
                      {announcement.priority}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          handleActiveToggle(
                            announcement,
                          )
                        }
                      >
                        {announcement.isActive
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </td>

                    <td>
                      {new Date(
                        announcement.createdAt,
                      ).toLocaleString()}
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            handleEdit(announcement)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() =>
                            handleDelete(
                              announcement.id,
                            )
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