// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import { getEvents, type EventRecord } from "../api/events";
// import { logout } from "../api/auth";

// function formatType(value: string) {
//   return value
//     .replaceAll("_", " ")
//     .toLowerCase()
//     .replace(/\b\w/g, (letter) => letter.toUpperCase());
// }

// export default function HomePage() {
//   const navigate = useNavigate();

//   const [events, setEvents] = useState<EventRecord[]>([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function loadEvents() {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await getEvents();

//         setEvents(
//           response.filter(
//             (event) =>
//               event.status === "LIVE" ||
//               event.status === "UPCOMING",
//           ),
//         );
//       } catch (err) {
//         setError(
//           err instanceof Error
//             ? err.message
//             : "Failed to load events",
//         );
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadEvents();
//   }, []);

//   const filteredEvents = useMemo(() => {
//     const query = search.trim().toLowerCase();
//     if (!query) return events;

//     return events.filter((event) =>
//       [event.name, event.description ?? "", event.eventType].some(
//         (value) => value.toLowerCase().includes(query),
//       ),
//     );
//   }, [events, search]);

//   function handleLogout() {
//     logout();
//     navigate("/login");
//   }

//   return (
//     <div className="app-shell">
//       <header className="topbar">
//         <button
//           type="button"
//           className="brand-button"
//           onClick={() => navigate("/")}
//         >
//           <img className="brand-mark" src="/logo.webp" alt="Rahat Setu logo" />
//           <span className="brand-copy">
//             <strong>Rahat Setu</strong>
//             <small>Event intelligence</small>
//           </span>
//         </button>

//         <div className="topbar-actions">
//           <span className="topbar-active">Events</span>
//           <button
//             type="button"
//             className="quiet-button"
//             onClick={handleLogout}
//           >
//             Sign out
//           </button>
//         </div>
//       </header>

//       <main className="page">
//         <section className="page-intro hero">
//           <h1>Find your event</h1>
//           <p>
//             Crowd forecasts, facilities, live alerts and attendee
//             offers, together in one place.
//           </p>

//           <div className="search-box">
//             <input
//               type="search"
//               value={search}
//               onChange={(event) => setSearch(event.target.value)}
//               placeholder="Search by name, type or description"
//               aria-label="Search events"
//             />
//           </div>
//         </section>

//         <section className="events-area">
//           <div className="section-bar">
//             <div>
//               <h2>Live and upcoming</h2>
//               <p>
//                 {filteredEvents.length} event
//                 {filteredEvents.length === 1 ? "" : "s"} available
//               </p>
//             </div>
//           </div>

//           {error && (
//             <div className="error-message" role="alert">
//               {error}
//             </div>
//           )}

//           {loading ? (
//             <div className="event-list" aria-busy="true">
//               {[0, 1, 2].map((n) => (
//                 <div className="event-row skeleton" key={n} />
//               ))}
//             </div>
//           ) : filteredEvents.length === 0 ? (
//             <div className="simple-empty">
//               {search
//                 ? "No events match your search. Try a different word."
//                 : "No live or upcoming events right now."}
//             </div>
//           ) : (
//             <div className="event-list">
//               {filteredEvents.map((event) => (
//                 <button
//                   type="button"
//                   className="event-row"
//                   key={event.id}
//                   onClick={() => navigate(`/events/${event.id}`)}
//                 >
//                   <div className="event-row-main">
//                     <div className="event-row-tags">
//                       <span
//                         className={`status-dot status-${event.status.toLowerCase()}`}
//                       >
//                         {event.status}
//                       </span>
//                       <span className="muted-tag">
//                         {formatType(event.eventType)}
//                       </span>
//                     </div>

//                     <h3>{event.name}</h3>

//                     <p>
//                       {event.description ||
//                         "Event information and attendee services."}
//                     </p>
//                   </div>

//                   <div className="event-row-meta">
//                     <div>
//                       <span>Date</span>
//                       <strong>
//                         {new Date(
//                           event.startTime,
//                         ).toLocaleDateString(undefined, {
//                           day: "numeric",
//                           month: "short",
//                           year: "numeric",
//                         })}
//                       </strong>
//                     </div>

//                     <div>
//                       <span>Starts</span>
//                       <strong>
//                         {new Date(
//                           event.startTime,
//                         ).toLocaleTimeString(undefined, {
//                           hour: "numeric",
//                           minute: "2-digit",
//                         })}
//                       </strong>
//                     </div>

//                     <span className="event-arrow" aria-hidden="true">
//                       →
//                     </span>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </section>
//       </main>

//       <footer className="site-footer">
//         <strong>Rahat Setu</strong>
//         <span>Event intelligence for attendees</span>
//       </footer>
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getEvents, type EventRecord } from "../api/events";
import { logout } from "../api/auth";

/* ---------- small helpers ---------- */

const TAGLINES = [
  "Check the crowd before you go.",
  "Find the nearest medical desk.",
  "See live alerts as they happen.",
  "Pick up an offer on the way.",
];

type StatusFilter = "ALL" | "LIVE" | "UPCOMING";

function formatType(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/** Types out each phrase, pauses, deletes it, moves on. Static when motion is reduced. */
function useTypewriter(phrases: string[]) {
  const [text, setText] = useState("");

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      const timer = window.setTimeout(() => setText(phrases[0]), 0);
      return () => window.clearTimeout(timer);
    }

    let phraseIndex = 0;
    let chars = 0;
    let deleting = false;
    let timer = 0;

    const tick = () => {
      const current = phrases[phraseIndex];
      chars += deleting ? -1 : 1;
      setText(current.slice(0, chars));

      let delay = deleting ? 22 : 48;

      if (!deleting && chars === current.length) {
        deleting = true;
        delay = 2200;
      } else if (deleting && chars === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 350;
      }

      timer = window.setTimeout(tick, delay);
    };

    timer = window.setTimeout(tick, 500);
    return () => window.clearTimeout(timer);
  }, [phrases]);

  return text;
}

/** Feeds the pointer position to CSS so a soft glow can follow the cursor. */
function trackPointer(event: React.MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

function Icon({ name }: { name: "search" | "clock" | "arrow" }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  };

  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/**
 * Where to look for a cover photo, in order:
 * 1. the event's own imageUrl
 * 2. /covers/<event-type>.jpg   (e.g. public/covers/festival.jpg)
 * 3. /covers/default.jpg
 * Anything missing falls through to the green pattern.
 */
function coverCandidates(event: EventRecord) {
  return [
    event.imageUrl,
    `/covers/${event.eventType.toLowerCase()}.jpg`,
    "/covers/default.jpg",
  ].filter((source): source is string => Boolean(source));
}

function OrbitArt() {
  return (
    <div className="orbit" aria-hidden="true">
      <svg viewBox="0 0 360 360">
        <defs>
          <path
            id="orbit-text-path"
            d="M180,180 m-150,0 a150,150 0 1,1 300,0 a150,150 0 1,1 -300,0"
          />
        </defs>

        <circle className="orbit-pulse" cx="180" cy="180" r="58" />
        <circle
          className="orbit-pulse"
          cx="180"
          cy="180"
          r="58"
          style={{ animationDelay: "1.2s" }}
        />
        <circle
          className="orbit-pulse"
          cx="180"
          cy="180"
          r="58"
          style={{ animationDelay: "2.4s" }}
        />

        <circle className="orbit-ring" cx="180" cy="180" r="92" />
        <circle className="orbit-ring" cx="180" cy="180" r="122" />

        <g className="orbit-spin orbit-text-spin">
          <text>
            <textPath
              href="#orbit-text-path"
              textLength="936"
              lengthAdjust="spacing"
            >
              RAHAT SETU · CROWD · FACILITIES · ALERTS · OFFERS ·
            </textPath>
          </text>
        </g>

        <g className="orbit-spin" style={{ animationDuration: "26s" }}>
          <circle className="orbit-dot" cx="302" cy="180" r="5" />
          <circle className="orbit-dot soft" cx="58" cy="180" r="3.5" />
        </g>
        <g
          className="orbit-spin"
          style={{ animationDuration: "19s", animationDirection: "reverse" }}
        >
          <circle className="orbit-dot amber" cx="272" cy="180" r="4.5" />
        </g>
      </svg>

      <div className="orbit-logo">
        <img src="/logo.webp" alt="" />
      </div>
    </div>
  );
}

function EventMedia({ event }: { event: EventRecord }) {
  const [step, setStep] = useState(0);
  const start = new Date(event.startTime);
  const sources = coverCandidates(event);
  const source = sources[step];
  const showImage = source !== undefined;

  return (
    <div className={`event-media ${showImage ? "has-image" : ""}`}>
      {showImage && (
        <img
          src={source}
          alt=""
          loading="lazy"
          onError={() => setStep((current) => current + 1)}
        />
      )}

      <div className="event-date" aria-hidden="true">
        <strong>{start.getDate()}</strong>
        <span>{start.toLocaleDateString(undefined, { month: "short" })}</span>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function HomePage() {
  const navigate = useNavigate();
  const tagline = useTypewriter(TAGLINES);

  const [events, setEvents] = useState<EventRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
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

  const counts = useMemo(
    () => ({
      ALL: events.length,
      LIVE: events.filter((event) => event.status === "LIVE").length,
      UPCOMING: events.filter((event) => event.status === "UPCOMING").length,
    }),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events
      .filter(
        (event) => statusFilter === "ALL" || event.status === statusFilter,
      )
      .filter(
        (event) =>
          !query ||
          [event.name, event.description ?? "", event.eventType].some(
            (value) => value.toLowerCase().includes(query),
          ),
      );
  }, [events, search, statusFilter]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const filters: Array<{ value: StatusFilter; label: string }> = [
    { value: "ALL", label: "All" },
    { value: "LIVE", label: "Live now" },
    { value: "UPCOMING", label: "Upcoming" },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          type="button"
          className="brand-button"
          onClick={() => navigate("/")}
        >
          <img className="brand-mark" src="/logo.webp" alt="Rahat Setu logo" />
          <span className="brand-copy">
            <strong>Rahat Setu</strong>
            <small>Event intelligence</small>
          </span>
        </button>

        <div className="topbar-actions">
          <span className="topbar-active">Events</span>
          <button
            type="button"
            className="quiet-button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </header>

      <section
        className="hero-band home-hero"
        onMouseMove={trackPointer}
      >
        <div className="hero-inner home-grid">
          <div className="home-hero-copy">
            <span className="eyebrow">A bridge to calmer crowds</span>
            <h1>Find your event</h1>

            <p className="sr-only">
              Crowd forecasts, facilities, live alerts and attendee offers,
              together in one place.
            </p>
            <p className="typewriter" aria-hidden="true">
              {tagline}
              <span className="typewriter-caret" />
            </p>

            <div className="search-box">
              <Icon name="search" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or type"
                aria-label="Search events"
              />
            </div>
          </div>

          <OrbitArt />
        </div>
      </section>

      <main className="page">
        <section className="events-area">
          <div className="section-bar">
            <div>
              <h2>Live and upcoming</h2>
              <p>
                {filteredEvents.length} event
                {filteredEvents.length === 1 ? "" : "s"} available
              </p>
            </div>

            <div className="chip-row" role="group" aria-label="Filter by status">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className="chip"
                  aria-pressed={statusFilter === filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                  <small>{counts[filter.value]}</small>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="event-list" aria-busy="true">
              {[0, 1, 2].map((n) => (
                <div className="event-card skeleton" key={n} />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="simple-empty">
              {search || statusFilter !== "ALL"
                ? "No events match your search. Try a different word or filter."
                : "No live or upcoming events right now."}
            </div>
          ) : (
            <div className="event-list">
              {filteredEvents.map((event, index) => (
                <Link
                  to={`/events/${event.id}`}
                  className="event-card spotlight"
                  key={event.id}
                  style={{ "--i": index } as React.CSSProperties}
                  onMouseMove={trackPointer}
                >
                  <EventMedia event={event} />

                  <div className="event-body">
                    <div className="event-row-tags">
                      <span
                        className={`status-dot status-${event.status.toLowerCase()}`}
                      >
                        {event.status}
                      </span>
                      <span className="muted-tag">
                        {formatType(event.eventType)}
                      </span>
                    </div>

                    <h3>{event.name}</h3>

                    <p>
                      {event.description ||
                        "Event information and attendee services."}
                    </p>

                    <div className="event-meta-line">
                      <span>
                        <Icon name="clock" />
                        {new Date(event.startTime).toLocaleDateString(
                          undefined,
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                        {" · "}
                        {new Date(event.startTime).toLocaleTimeString(
                          undefined,
                          { hour: "numeric", minute: "2-digit" },
                        )}
                      </span>
                    </div>
                  </div>

                  <span className="event-go" aria-hidden="true">
                    <Icon name="arrow" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <strong>Rahat Setu</strong>
          <span>Event intelligence for attendees</span>
        </div>
      </footer>
    </div>
  );
}
