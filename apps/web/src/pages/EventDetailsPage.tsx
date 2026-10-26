import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  recordInteraction,
  type ChoiceFactor,
} from "../api/interactions";
import {
  recommendOffers,
  type OfferRecommendation,
} from "../utils/recommendOffers";
import type { EventRecord } from "../api/events";

import {
  getActiveAnnouncements,
  getActiveOffers,
  getEvent,
  getFacilities,
  getLocations,
  getVenues,
  getZones,
  type ActiveOffer,
  type AnnouncementRecord,
  type FacilityRecord,
  type LocationRecord,
  type VenueRecord,
  type ZoneRecord,
} from "../api/eventDetails";

import {
  predictCrowd,
  type CrowdPredictionResult,
} from "../api/crowd";

interface VenueTree {
  venue: VenueRecord;
  zones: Array<{
    zone: ZoneRecord;
    locations: Array<{
      location: LocationRecord;
      facilities: FacilityRecord[];
    }>;
  }>;
}

type LagField =
  | "lag1h"
  | "lag2h"
  | "lag3h"
  | "lag24h"
  | "lag168h";

const lagFields: Array<{
  key: LagField;
  label: string;
}> = [
  { key: "lag1h", label: "1 hour ago" },
  { key: "lag2h", label: "2 hours ago" },
  { key: "lag3h", label: "3 hours ago" },
  { key: "lag24h", label: "24 hours ago" },
  { key: "lag168h", label: "1 week ago" },
];

const choiceFactors: Array<{
  value: ChoiceFactor;
  label: string;
}> = [
  {
    value: "PRICE",
    label: "Better price",
  },
  {
    value: "DISCOUNT",
    label: "Attractive discount",
  },
  {
    value: "BRAND_FAMILIARITY",
    label: "I know / trust the brand",
  },
  {
    value: "CONVENIENCE",
    label: "More convenient",
  },
  {
    value: "DISTANCE",
    label: "Closer to me",
  },
  {
    value: "CROWD",
    label: "Less crowded",
  },
  {
    value: "QUEUE",
    label: "Shorter queue",
  },
  {
    value: "OTHER",
    label: "Other reason",
  },
];

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] =
    useState<EventRecord | null>(null);

  const [announcements, setAnnouncements] =
    useState<AnnouncementRecord[]>([]);

  const [offers, setOffers] =
    useState<ActiveOffer[]>([]);

  const [venueTree, setVenueTree] =
    useState<VenueTree[]>([]);

  const [crowdPrediction, setCrowdPrediction] =
    useState<CrowdPredictionResult | null>(null);

  const [crowdLoading, setCrowdLoading] =
    useState(false);

  const [crowdError, setCrowdError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedOfferId, setSelectedOfferId] =
    useState<string | null>(null);

  const [interactionMessage, setInteractionMessage] =
    useState("");

  const [interactionLoading, setInteractionLoading] =
    useState<string | null>(null);

  const [pendingOffer, setPendingOffer] =
    useState<ActiveOffer | null>(null);

  const [selectedFactor, setSelectedFactor] =
    useState<ChoiceFactor | "">("");

  const [crowdInputs, setCrowdInputs] =
    useState({
      locationId: "",
      locationName: "",
      timestamp: new Date().toISOString(),
      temperature: 28,
      weatherCondition: "clear",
      hasIncident: false,
      currentCrowd: 500,
      towardsRatio: 0.5,
      lag1h: 480,
      lag2h: 450,
      lag3h: 430,
      lag24h: 520,
      lag168h: 500,
    });


    const [
  recommendationPriority,
  setRecommendationPriority,
] = useState<ChoiceFactor>("DISCOUNT");

const [
  recommendation,
  setRecommendation,
] =
  useState<OfferRecommendation | null>(
    null,
  );
  useEffect(() => {
    if (!id) return;

    async function loadEventDetails() {
      try {
        setLoading(true);
        setError("");

        const [
          eventData,
          announcementData,
          offerData,
          venues,
        ] = await Promise.all([
          getEvent(id!),
          getActiveAnnouncements(id!),
          getActiveOffers(id!),
          getVenues(id!),
        ]);

        const fullVenueTree =
          await Promise.all(
            venues.map(async (venue) => {
              const zones =
                await getZones(venue.id);

              const zoneData =
                await Promise.all(
                  zones.map(async (zone) => {
                    const locations =
                      await getLocations(zone.id);

                    const locationData =
                      await Promise.all(
                        locations.map(
                          async (location) => ({
                            location,
                            facilities:
                              await getFacilities(
                                location.id,
                              ),
                          }),
                        ),
                      );

                    return {
                      zone,
                      locations:
                        locationData,
                    };
                  }),
                );

              return {
                venue,
                zones: zoneData,
              };
            }),
          );

        setEvent(eventData);
        setAnnouncements(
          announcementData,
        );
        setOffers(offerData);
        setVenueTree(fullVenueTree);

        const firstLocation =
          fullVenueTree
            .flatMap((item) => item.zones)
            .flatMap(
              (item) => item.locations,
            )[0]?.location;

        if (firstLocation) {
          setCrowdInputs(
            (previous) => ({
              ...previous,
              locationId:
                firstLocation.id,
              locationName:
                firstLocation.name,
            }),
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load event details",
        );
      } finally {
        setLoading(false);
      }
    }

    loadEventDetails();
  }, [id]);

  useEffect(() => {
    if (!id || offers.length === 0) {
      return;
    }

    async function recordOfferViews() {
      for (const offer of offers) {
        const key =
          `offer-viewed:${id}:${offer.id}`;

        if (sessionStorage.getItem(key)) {
          continue;
        }

        try {
          await recordInteraction({
            eventId: id!,
            brandId: offer.brand.id,
            offerId: offer.id,
            action: "VIEW",
            metadata: {
              source: "event-details",
            },
          });

          sessionStorage.setItem(
            key,
            "true",
          );
        } catch (error) {
          console.error(
            `Failed to record view for ${offer.title}:`,
            error,
          );
        }
      }
    }

    recordOfferViews();
  }, [id, offers]);

  const availableLocations =
    useMemo(
      () =>
        venueTree.flatMap((venue) =>
          venue.zones.flatMap((zone) =>
            zone.locations.map(
              (item) => item.location,
            ),
          ),
        ),
      [venueTree],
    );

  function selectLocation(
    locationId: string,
  ) {
    const selected =
      availableLocations.find(
        (location) =>
          location.id === locationId,
      );

    if (!selected) return;

    setCrowdInputs((previous) => ({
      ...previous,
      locationId: selected.id,
      locationName: selected.name,
    }));

    setCrowdPrediction(null);
    setCrowdError("");
  }

  async function handleCrowdPrediction() {
    if (!crowdInputs.locationId) return;

    try {
      setCrowdLoading(true);
      setCrowdError("");

      const result = await predictCrowd({
        ...crowdInputs,
        timestamp:
          new Date().toISOString(),
      });

      setCrowdPrediction(result);
    } catch (err) {
      setCrowdError(
        err instanceof Error
          ? err.message
          : "Crowd forecast unavailable",
      );
    } finally {
      setCrowdLoading(false);
    }
  }

  async function handleOfferInteraction(
    offer: ActiveOffer,
    action: "CLICK" | "SAVE",
  ) {
    if (!id) return;

    try {
      setInteractionLoading(
        `${offer.id}-${action}`,
      );

      setInteractionMessage("");

      await recordInteraction({
        eventId: id,
        brandId: offer.brand.id,
        offerId: offer.id,
        action,
        metadata: {
          source: "attendee-web",
          offerTitle: offer.title,
          brandName: offer.brand.name,
        },
      });

      if (action === "SAVE") {
        setInteractionMessage(
          `${offer.title} saved.`,
        );
      }
    } catch (error) {
      console.error(
        "Failed to record interaction:",
        error,
      );

      setInteractionMessage(
        "Unable to record this action right now.",
      );
    } finally {
      setInteractionLoading(null);
    }
  }

  function openChoiceReason(
    offer: ActiveOffer,
  ) {
    setPendingOffer(offer);
    setSelectedFactor("");
    setInteractionMessage("");
  }

  async function confirmOfferSelection() {
    if (
      !pendingOffer ||
      !selectedFactor ||
      !id
    ) {
      return;
    }

    try {
      setInteractionLoading(
        `${pendingOffer.id}-SELECT`,
      );

      setInteractionMessage("");

      await recordInteraction({
        eventId: id,
        brandId: pendingOffer.brand.id,
        offerId: pendingOffer.id,
        action: "SELECT",
        factor: selectedFactor,
        metadata: {
          source: "attendee-web",
          offerTitle:
            pendingOffer.title,
          brandName:
            pendingOffer.brand.name,
        },
      });

      setSelectedOfferId(
        pendingOffer.id,
      );

      setInteractionMessage(
        `${pendingOffer.brand.name} offer selected.`,
      );

      setPendingOffer(null);
      setSelectedFactor("");
    } catch (error) {
      console.error(
        "Failed to record selection:",
        error,
      );

      setInteractionMessage(
        "Unable to record your selection.",
      );
    } finally {
      setInteractionLoading(null);
    }
  }


  function generateRecommendation() {
      const ranked = recommendOffers(
        offers,
        recommendationPriority,
      );

      setRecommendation(
        ranked[0] ?? null,
      );
    }
  if (loading) {
    return (
      <main className="page">
        Loading event…
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="page">
        <div className="error-message">
          {error || "Event not found"}
        </div>
      </main>
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
          <span className="brand-mark">
            RS
          </span>

          <span className="brand-copy">
            <strong>Rahat Setu</strong>
            <small>
              Event intelligence
            </small>
          </span>
        </button>

        <button
          type="button"
          className="quiet-button"
          onClick={() => navigate("/")}
        >
          ← All events
        </button>
      </header>

      <main className="page event-page">
        <section className="event-heading">
          <div className="event-heading-main">
            <div className="event-row-tags">
              <span
                className={`status-dot status-${event.status.toLowerCase()}`}
              >
                {event.status}
              </span>

              <span className="muted-tag">
                {event.eventType.replaceAll(
                  "_",
                  " ",
                )}
              </span>
            </div>

            <h1>{event.name}</h1>

            <p>
              {event.description ||
                "Event information and attendee services."}
            </p>
          </div>

          <div className="event-summary">
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
              <span>Time</span>

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

                {" – "}

                {new Date(
                  event.endTime,
                ).toLocaleTimeString(
                  undefined,
                  {
                    hour: "numeric",
                    minute: "2-digit",
                  },
                )}
              </strong>
            </div>
          </div>
        </section>

        <nav className="section-nav">
          <a href="#crowd">
            Crowd
          </a>

          <a href="#updates">
            Updates
          </a>

          <a href="#facilities">
            Facilities
          </a>

          <a href="#offers">
            Offers
          </a>
        </nav>

        <section
          className="content-section"
          id="crowd"
        >
          <div className="content-heading">
            <div>
              <span className="kicker">
                CROWD
              </span>

              <h2>
                1-hour forecast
              </h2>
            </div>

            <span className="prototype-chip">
              Prototype
            </span>
          </div>

          <div className="crowd-main">
            <div className="crowd-primary">
              <label>
                Forecast location
              </label>

              <select
                value={
                  crowdInputs.locationId
                }
                onChange={(event) =>
                  selectLocation(
                    event.target.value,
                  )
                }
              >
                {availableLocations.map(
                  (location) => (
                    <option
                      key={location.id}
                      value={location.id}
                    >
                      {location.name}
                    </option>
                  ),
                )}
              </select>

              {crowdPrediction ? (
                <div className="forecast-number">
                  <strong>
                    {Math.round(
                      crowdPrediction.predictedCrowd,
                    ).toLocaleString()}
                  </strong>

                  <span>
                    pedestrians / hour
                  </span>

                  <p>
                    Expected pedestrian
                    flow over the next{" "}
                    {
                      crowdPrediction.predictionHorizonHours
                    }{" "}
                    hour.
                  </p>
                </div>
              ) : (
                <div className="forecast-placeholder">
                  <strong>—</strong>

                  <span>
                    Run the forecast to
                    estimate upcoming
                    pedestrian flow.
                  </span>
                </div>
              )}

              {crowdError && (
                <div className="inline-error">
                  {crowdError}
                </div>
              )}

              <button
                type="button"
                className="primary-button"
                onClick={
                  handleCrowdPrediction
                }
                disabled={
                  crowdLoading ||
                  !crowdInputs.locationId
                }
              >
                {crowdLoading
                  ? "Generating…"
                  : "Generate forecast"}
              </button>
            </div>

            <div className="crowd-side">
              <h3>
                About this estimate
              </h3>

              <p>
                This is a one-hour
                prototype forecast using
                the currently integrated
                pedestrian-flow model.
                It is not a live sensor
                reading.
              </p>

              {crowdPrediction && (
                <dl className="forecast-meta">
                  <div>
                    <dt>Model</dt>

                    <dd>
                      {
                        crowdPrediction.modelVersion
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>Scope</dt>

                    <dd>
                      {
                        crowdPrediction.modelScope
                      }
                    </dd>
                  </div>
                </dl>
              )}

              <details className="model-inputs">
                <summary>
                  Model inputs
                </summary>

                <div className="input-grid">
                  <label>
                    Temperature

                    <input
                      type="number"
                      value={
                        crowdInputs.temperature
                      }
                      onChange={(event) =>
                        setCrowdInputs({
                          ...crowdInputs,
                          temperature:
                            Number(
                              event.target.value,
                            ),
                        })
                      }
                    />
                  </label>

                  <label>
                    Weather

                    <input
                      value={
                        crowdInputs.weatherCondition
                      }
                      onChange={(event) =>
                        setCrowdInputs({
                          ...crowdInputs,
                          weatherCondition:
                            event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Current pedestrians

                    <input
                      type="number"
                      value={
                        crowdInputs.currentCrowd
                      }
                      onChange={(event) =>
                        setCrowdInputs({
                          ...crowdInputs,
                          currentCrowd:
                            Number(
                              event.target.value,
                            ),
                        })
                      }
                    />
                  </label>

                  <label>
                    Towards ratio

                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={
                        crowdInputs.towardsRatio
                      }
                      onChange={(event) =>
                        setCrowdInputs({
                          ...crowdInputs,
                          towardsRatio:
                            Number(
                              event.target.value,
                            ),
                        })
                      }
                    />
                  </label>

                  <label className="check-line">
                    <input
                      type="checkbox"
                      checked={
                        crowdInputs.hasIncident
                      }
                      onChange={(event) =>
                        setCrowdInputs({
                          ...crowdInputs,
                          hasIncident:
                            event.target.checked,
                        })
                      }
                    />

                    Incident context
                  </label>

                  {lagFields.map(
                    ({ key, label }) => (
                      <label key={key}>
                        {label}

                        <input
                          type="number"
                          value={
                            crowdInputs[key]
                          }
                          onChange={(event) =>
                            setCrowdInputs({
                              ...crowdInputs,
                              [key]:
                                Number(
                                  event.target.value,
                                ),
                            })
                          }
                        />
                      </label>
                    ),
                  )}
                </div>
              </details>
            </div>
          </div>
        </section>

        <section
          className="content-section"
          id="updates"
        >
          <div className="content-heading">
            <div>
              <span className="kicker">
                UPDATES
              </span>

              <h2>
                Announcements
              </h2>
            </div>
          </div>

          {announcements.length === 0 ? (
            <p className="section-empty">
              No active announcements.
            </p>
          ) : (
            <div className="update-list">
              {announcements.map(
                (announcement) => (
                  <article
                    key={announcement.id}
                    className="update-row"
                  >
                    <span
                      className={`update-priority priority-${announcement.priority.toLowerCase()}`}
                    >
                      {
                        announcement.priority
                      }
                    </span>

                    <div>
                      <h3>
                        {
                          announcement.title
                        }
                      </h3>

                      <p>
                        {
                          announcement.message
                        }
                      </p>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>

        <section
          className="content-section"
          id="facilities"
        >
          <div className="content-heading">
            <div>
              <span className="kicker">
                VENUE
              </span>

              <h2>
                Facilities & locations
              </h2>
            </div>
          </div>

          {venueTree.length === 0 ? (
            <p className="section-empty">
              No venue information
              available.
            </p>
          ) : (
            <div className="venue-sections">
              {venueTree.map(
                ({ venue, zones }) => (
                  <div
                    key={venue.id}
                    className="venue-section"
                  >
                    <div className="venue-title">
                      <h3>
                        {venue.name}
                      </h3>

                      {venue.description && (
                        <p>
                          {
                            venue.description
                          }
                        </p>
                      )}
                    </div>

                    {zones.map(
                      ({
                        zone,
                        locations,
                      }) => (
                        <div
                          key={zone.id}
                          className="zone-section"
                        >
                          <div className="zone-title">
                            <strong>
                              {zone.name}
                            </strong>

                            {zone.capacity && (
                              <span>
                                Capacity{" "}
                                {
                                  zone.capacity
                                }
                              </span>
                            )}
                          </div>

                          <div className="location-list">
                            {locations.map(
                              ({
                                location,
                                facilities,
                              }) => (
                                <div
                                  key={
                                    location.id
                                  }
                                  className="location-row"
                                >
                                  <div>
                                    <span className="location-label">
                                      {location.type.replaceAll(
                                        "_",
                                        " ",
                                      )}
                                    </span>

                                    <strong>
                                      {
                                        location.name
                                      }
                                    </strong>

                                    {location.description && (
                                      <p>
                                        {
                                          location.description
                                        }
                                      </p>
                                    )}
                                  </div>

                                  <div className="facility-stack">
                                    {facilities.map(
                                      (
                                        facility,
                                      ) => (
                                        <div
                                          key={
                                            facility.id
                                          }
                                          className="facility-item"
                                        >
                                          <span>
                                            {
                                              facility.name
                                            }
                                          </span>

                                          <strong>
                                            {
                                              facility.status
                                            }
                                          </strong>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        <section className="content-section">
  <div className="content-heading">
    <div>
      <span className="kicker">
        PERSONALIZED
      </span>

      <h2>
        Recommended for you
      </h2>
    </div>
  </div>

  <p className="section-intro">
    Tell us what matters most right
    now. Rahat Setu will rank the
    available event offers accordingly.
  </p>

  <div className="recommendation-controls">
    <select
      value={
        recommendationPriority
      }
      onChange={(event) => {
        setRecommendationPriority(
          event.target
            .value as ChoiceFactor,
        );

        setRecommendation(null);
      }}
    >
      <option value="DISCOUNT">
        Best discount
      </option>

      <option value="PRICE">
        Lowest price
      </option>

      <option value="BRAND_FAMILIARITY">
        Brand familiarity
      </option>

      <option value="CONVENIENCE">
        Convenience
      </option>

      <option value="CROWD">
        Lower crowd
      </option>

      <option value="QUEUE">
        Shorter queue
      </option>

      <option value="DISTANCE">
        Closer option
      </option>
    </select>

    <button
      type="button"
      className="primary-button"
      onClick={
        generateRecommendation
      }
    >
      Recommend
    </button>
  </div>

  {recommendation && (
    <div className="recommendation-card">
      <span className="kicker">
        TOP MATCH
      </span>

      <h3>
        {
          recommendation.offer
            .brand.name
        }
      </h3>

      <strong>
        {
          recommendation.offer
            .title
        }
      </strong>

      {recommendation.offer
        .discountText && (
        <div className="recommendation-offer">
          {
            recommendation.offer
              .discountText
          }
        </div>
      )}

      {recommendation.offer
        .price != null && (
        <p>
          ₹
          {
            recommendation.offer
              .price
          }
        </p>
      )}

      <div className="recommendation-reasons">
        <span>
          Why this was recommended
        </span>

        <ul>
          {recommendation.reasons.map(
            (reason) => (
              <li key={reason}>
                {reason}
              </li>
            ),
          )}
        </ul>
      </div>

      <button
        type="button"
        className="offer-select-button"
        onClick={() =>
          openChoiceReason(
            recommendation.offer,
          )
        }
      >
        Choose this offer
      </button>
    </div>
  )}
</section>
        <section
          className="content-section"
          id="offers"
        >
          <div className="content-heading">
            <div>
              <span className="kicker">
                OFFERS
              </span>

              <h2>
                For attendees
              </h2>
            </div>
          </div>

          <p className="section-intro">
            Explore event offers and
            choose what matters most to
            you.
          </p>

          {interactionMessage && (
            <div className="interaction-message">
              {interactionMessage}
            </div>
          )}

          {offers.length === 0 ? (
            <p className="section-empty">
              No active offers.
            </p>
          ) : (
            <div className="offer-list">
              {offers.map((offer) => {
                const selected =
                  selectedOfferId ===
                  offer.id;

                return (
                  <article
                    className={`offer-row ${
                      selected
                        ? "offer-row-selected"
                        : ""
                    }`}
                    key={offer.id}
                    onClick={() =>
                      handleOfferInteraction(
                        offer,
                        "CLICK",
                      )
                    }
                  >
                    <div>
                      <span className="offer-brand-label">
                        {
                          offer.brand.name
                        }
                      </span>

                      <h3>
                        {offer.title}
                      </h3>

                      {offer.description && (
                        <p>
                          {
                            offer.description
                          }
                        </p>
                      )}

                      <div className="offer-actions">
                        <button
                          type="button"
                          className="offer-select-button"
                          onClick={(
                            event,
                          ) => {
                            event.stopPropagation();

                            openChoiceReason(
                              offer,
                            );
                          }}
                        >
                          {selected
                            ? "Selected"
                            : "Choose offer"}
                        </button>

                        <button
                          type="button"
                          className="offer-save-button"
                          disabled={
                            interactionLoading ===
                            `${offer.id}-SAVE`
                          }
                          onClick={(
                            event,
                          ) => {
                            event.stopPropagation();

                            handleOfferInteraction(
                              offer,
                              "SAVE",
                            );
                          }}
                        >
                          {interactionLoading ===
                          `${offer.id}-SAVE`
                            ? "Saving..."
                            : "Save"}
                        </button>
                      </div>
                    </div>

                    <div className="offer-value">
                      <strong>
                        {offer.discountText ||
                          "Event offer"}
                      </strong>

                      {offer.price != null && (
                        <span>
                          ₹{offer.price}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {pendingOffer && (
            <div className="choice-reason-box">
              <div className="choice-reason-heading">
                <div>
                  <span className="kicker">
                    YOUR DECISION
                  </span>

                  <h3>
                    Why did you choose
                    this offer?
                  </h3>

                  <p>
                    {
                      pendingOffer.brand
                        .name
                    }{" "}
                    · {pendingOffer.title}
                  </p>
                </div>

                <button
                  type="button"
                  className="quiet-button"
                  onClick={() => {
                    setPendingOffer(null);
                    setSelectedFactor("");
                  }}
                >
                  Cancel
                </button>
              </div>

              <div className="choice-factor-grid">
                {choiceFactors.map(
                  (factor) => (
                    <button
                      type="button"
                      key={factor.value}
                      className={`choice-factor-button ${
                        selectedFactor ===
                        factor.value
                          ? "choice-factor-selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedFactor(
                          factor.value,
                        )
                      }
                    >
                      {factor.label}
                    </button>
                  ),
                )}
              </div>

              <button
                type="button"
                className="primary-button"
                disabled={
                  !selectedFactor ||
                  interactionLoading ===
                    `${pendingOffer.id}-SELECT`
                }
                onClick={
                  confirmOfferSelection
                }
              >
                {interactionLoading ===
                `${pendingOffer.id}-SELECT`
                  ? "Saving decision..."
                  : "Confirm choice"}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}