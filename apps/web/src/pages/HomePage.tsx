import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getEvents,
  type EventRecord,
} from "../api/events";
import { logout } from "../api/auth";

export default function HomePage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const response = await getEvents();

        setEvents(
          response.filter(
            (event) =>
              event.status === "LIVE" ||
              event.status === "UPCOMING",
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load events",
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return events;
    }

    return events.filter((event) => {
      return [
        event.name,
        event.description ?? "",
        event.eventType,
      ].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [events, search]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function formatType(value: string) {
    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          type="button"
          className="brand-button"
          onClick={() => navigate("/")}
        >
          <span className="brand-mark">RS</span>

          <span className="brand-copy">
            <strong>Rahat Setu</strong>
            <small>Event intelligence</small>
          </span>
        </button>

        <div className="topbar-actions">
          <span className="topbar-active">
            Events
          </span>

          <button
            type="button"
            className="quiet-button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="page">
        <section className="page-intro">
          <span className="kicker">
            EVENT DISCOVERY
          </span>

          <h1>Find your event.</h1>

          <p>
            Crowd forecasts, facilities, live alerts and
            attendee offers — together in one place.
          </p>

          <div className="search-box">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search events"
              aria-label="Search events"
            />
          </div>
        </section>

        <section className="events-area">
          <div className="section-bar">
            <div>
              <h2>Live & upcoming</h2>
              <p>
                {filteredEvents.length} event
                {filteredEvents.length === 1
                  ? ""
                  : "s"}{" "}
                available
              </p>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <div className="simple-empty">
              Loading events…
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="simple-empty">
              No matching events found.
            </div>
          ) : (
            <div className="event-list">
              {filteredEvents.map((event) => (
                <button
                  type="button"
                  className="event-row"
                  key={event.id}
                  onClick={() =>
                    navigate(`/events/${event.id}`)
                  }
                >
                  <div className="event-row-main">
                    <div className="event-row-tags">
                      <span
                        className={`status-dot status-${event.status.toLowerCase()}`}
                      >
                        {event.status}
                      </span>

                      <span className="muted-tag">
                        {formatType(
                          event.eventType,
                        )}
                      </span>
                    </div>

                    <h3>{event.name}</h3>

                    <p>
                      {event.description ||
                        "Event information and attendee services."}
                    </p>
                  </div>

                  <div className="event-row-meta">
                    <div>
                      <span>Date</span>
                      <strong>
                        {new Date(
                          event.startTime,
                        ).toLocaleDateString(
                          undefined,
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Starts</span>
                      <strong>
                        {new Date(
                          event.startTime,
                        ).toLocaleTimeString(
                          undefined,
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </strong>
                    </div>

                    <span className="event-arrow">
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}