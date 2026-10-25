import { useEffect, useState } from "react";
import { getEvents, type EventRecord } from "../api/events";
import {
  getConsumerInsights,
  type ConsumerInsights,
} from "../api/consumerInsights";

export default function ConsumerInsightsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [data, setData] = useState<ConsumerInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await getEvents();
        setEvents(response);
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
    loadInsights();
  }, [selectedEventId]);

  async function loadInsights() {
    try {
      setLoading(true);
      setError("");

      const response = await getConsumerInsights(
        selectedEventId || undefined,
      );

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load consumer insights",
      );
    } finally {
      setLoading(false);
    }
  }

  function formatLabel(value: string | null | undefined) {
    if (!value) return "Not specified";

    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Consumer Insights</h1>
          <p>
            Analyze consumer decisions and identify which
            attraction strategies influence customer behavior.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="form-card">
        <label htmlFor="insights-event">
          Event
        </label>

        <select
          id="insights-event"
          value={selectedEventId}
          onChange={(event) =>
            setSelectedEventId(event.target.value)
          }
        >
          <option value="">
            All Events
          </option>

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

      {loading ? (
        <p>Loading consumer insights...</p>
      ) : !data ? (
        <p>No insight data available.</p>
      ) : (
        <>
          <section>
            <h2 className="section-title">
              Decision-Making Overview
            </h2>

            <div className="dashboard-grid">
              <article className="dashboard-card">
                <span>Total Interactions</span>
                <strong>
                  {data.totalInteractions}
                </strong>
                <p>
                  Recorded consumer actions
                </p>
              </article>

              <article className="dashboard-card">
                <span>Top Choice Factor</span>
                <strong className="insight-text-value">
                  {data.topFactor
                    ? formatLabel(
                        data.topFactor.factor,
                      )
                    : "—"}
                </strong>
                <p>
                  {data.topFactor
                    ? `${data.topFactor.count} recorded decisions`
                    : "No choice factor data yet"}
                </p>
              </article>

              <article className="dashboard-card">
                <span>Brands Engaged</span>
                <strong>
                  {data.topBrands.length}
                </strong>
                <p>
                  Brands with recorded interactions
                </p>
              </article>

              <article className="dashboard-card">
                <span>Offers Engaged</span>
                <strong>
                  {data.topOffers.length}
                </strong>
                <p>
                  Promotional offers receiving engagement
                </p>
              </article>
            </div>
          </section>

          <section>
            <h2 className="section-title">
              Consumer Actions
            </h2>

            <div className="insights-breakdown-grid">
              {data.interactionBreakdown.length === 0 ? (
                <div className="table-card">
                  <p>
                    No consumer actions recorded yet.
                  </p>
                </div>
              ) : (
                data.interactionBreakdown.map(
                  (item) => (
                    <article
                      className="insight-breakdown-card"
                      key={item.action}
                    >
                      <span>
                        {formatLabel(item.action)}
                      </span>

                      <strong>{item.count}</strong>
                    </article>
                  ),
                )
              )}
            </div>
          </section>

          <section>
            <h2 className="section-title">
              Decision Factors
            </h2>

            <div className="table-card">
              {data.factorBreakdown.length === 0 ? (
                <p>
                  No decision factors recorded yet.
                </p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Choice Factor</th>
                        <th>Interactions</th>
                        <th>Share</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.factorBreakdown.map(
                        (item) => {
                          const total =
                            data.factorBreakdown.reduce(
                              (sum, factor) =>
                                sum + factor.count,
                              0,
                            );

                          const percentage =
                            total > 0
                              ? (
                                  (item.count /
                                    total) *
                                  100
                                ).toFixed(1)
                              : "0";

                          return (
                            <tr
                              key={
                                item.factor ??
                                "unknown"
                              }
                            >
                              <td>
                                <strong>
                                  {formatLabel(
                                    item.factor,
                                  )}
                                </strong>
                              </td>

                              <td>
                                {item.count}
                              </td>

                              <td>
                                {percentage}%
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="section-title">
              Top Brands
            </h2>

            <div className="table-card">
              {data.topBrands.length === 0 ? (
                <p>
                  No brand interactions recorded yet.
                </p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Brand</th>
                        <th>Category</th>
                        <th>Interactions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.topBrands.map((item) => (
                        <tr
                          key={
                            item.brand?.id ??
                            "unknown-brand"
                          }
                        >
                          <td>
                            <strong>
                              {item.brand?.name ??
                                "Unknown"}
                            </strong>
                          </td>

                          <td>
                            {item.brand?.category ??
                              "—"}
                          </td>

                          <td>
                            {item.interactions}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="section-title">
              Top Promotional Offers
            </h2>

            <div className="table-card">
              {data.topOffers.length === 0 ? (
                <p>
                  No offer interactions recorded yet.
                </p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Offer</th>
                        <th>Brand</th>
                        <th>Promotion</th>
                        <th>Interactions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.topOffers.map((item) => (
                        <tr
                          key={
                            item.offer?.id ??
                            "unknown-offer"
                          }
                        >
                          <td>
                            <strong>
                              {item.offer?.title ??
                                "Unknown"}
                            </strong>
                          </td>

                          <td>
                            {item.offer?.brand
                              .name ?? "—"}
                          </td>

                          <td>
                            {item.offer
                              ?.discountText ??
                              "—"}
                          </td>

                          <td>
                            {item.interactions}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}