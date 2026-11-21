// import { useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import { recordInteraction, type ChoiceFactor } from "../api/interactions";
// import { recommendOffers, type OfferRecommendation } from "../utils/recommendOffers";
// import type { EventRecord } from "../api/events";

// import {
//   getActiveAnnouncements,
//   getActiveOffers,
//   getEvent,
//   getFacilities,
//   getLocations,
//   getVenues,
//   getZones,
//   type ActiveOffer,
//   type AnnouncementRecord,
//   type FacilityRecord,
//   type LocationRecord,
//   type VenueRecord,
//   type ZoneRecord,
// } from "../api/eventDetails";

// import { predictCrowd, type CrowdPredictionResult } from "../api/crowd";

// interface VenueTree {
//   venue: VenueRecord;
//   zones: Array<{
//     zone: ZoneRecord;
//     locations: Array<{
//       location: LocationRecord;
//       facilities: FacilityRecord[];
//     }>;
//   }>;
// }

// type LagField = "lag1h" | "lag2h" | "lag3h" | "lag24h" | "lag168h";

// const lagFields: Array<{ key: LagField; label: string }> = [
//   { key: "lag1h", label: "1 hour ago" },
//   { key: "lag2h", label: "2 hours ago" },
//   { key: "lag3h", label: "3 hours ago" },
//   { key: "lag24h", label: "24 hours ago" },
//   { key: "lag168h", label: "1 week ago" },
// ];

// const choiceFactors: Array<{ value: ChoiceFactor; label: string }> = [
//   { value: "PRICE", label: "Better price" },
//   { value: "DISCOUNT", label: "Attractive discount" },
//   { value: "BRAND_FAMILIARITY", label: "I know / trust the brand" },
//   { value: "CONVENIENCE", label: "More convenient" },
//   { value: "DISTANCE", label: "Closer to me" },
//   { value: "CROWD", label: "Less crowded" },
//   { value: "QUEUE", label: "Shorter queue" },
//   { value: "OTHER", label: "Other reason" },
// ];

// const label = (value: string) => value.replaceAll("_", " ");

// export default function EventDetailsPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [event, setEvent] = useState<EventRecord | null>(null);
//   const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
//   const [offers, setOffers] = useState<ActiveOffer[]>([]);
//   const [venueTree, setVenueTree] = useState<VenueTree[]>([]);
//   const [crowdPrediction, setCrowdPrediction] = useState<CrowdPredictionResult | null>(null);
//   const [crowdLoading, setCrowdLoading] = useState(false);
//   const [crowdError, setCrowdError] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
//   const [interactionMessage, setInteractionMessage] = useState("");
//   const [interactionLoading, setInteractionLoading] = useState<string | null>(null);
//   const [pendingOffer, setPendingOffer] = useState<ActiveOffer | null>(null);
//   const [selectedFactor, setSelectedFactor] = useState<ChoiceFactor | "">("");

//   const [crowdInputs, setCrowdInputs] = useState({
//     locationId: "",
//     locationName: "",
//     timestamp: new Date().toISOString(),
//     temperature: 28,
//     weatherCondition: "clear",
//     hasIncident: false,
//     currentCrowd: 500,
//     towardsRatio: 0.5,
//     lag1h: 480,
//     lag2h: 450,
//     lag3h: 430,
//     lag24h: 520,
//     lag168h: 500,
//   });

//   const [recommendationPriority, setRecommendationPriority] =
//     useState<ChoiceFactor>("DISCOUNT");
//   const [recommendation, setRecommendation] =
//     useState<OfferRecommendation | null>(null);

//   useEffect(() => {
//     if (!id) return;

//     async function loadEventDetails() {
//       try {
//         setLoading(true);
//         setError("");

//         const [eventData, announcementData, offerData, venues] =
//           await Promise.all([
//             getEvent(id!),
//             getActiveAnnouncements(id!),
//             getActiveOffers(id!),
//             getVenues(id!),
//           ]);

//         const fullVenueTree = await Promise.all(
//           venues.map(async (venue) => {
//             const zones = await getZones(venue.id);

//             const zoneData = await Promise.all(
//               zones.map(async (zone) => {
//                 const locations = await getLocations(zone.id);

//                 const locationData = await Promise.all(
//                   locations.map(async (location) => ({
//                     location,
//                     facilities: await getFacilities(location.id),
//                   })),
//                 );

//                 return { zone, locations: locationData };
//               }),
//             );

//             return { venue, zones: zoneData };
//           }),
//         );

//         setEvent(eventData);
//         setAnnouncements(announcementData);
//         setOffers(offerData);
//         setVenueTree(fullVenueTree);

//         const firstLocation = fullVenueTree
//           .flatMap((item) => item.zones)
//           .flatMap((item) => item.locations)[0]?.location;

//         if (firstLocation) {
//           setCrowdInputs((previous) => ({
//             ...previous,
//             locationId: firstLocation.id,
//             locationName: firstLocation.name,
//           }));
//         }
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "Failed to load event details",
//         );
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadEventDetails();
//   }, [id]);

//   useEffect(() => {
//     if (!id || offers.length === 0) return;

//     async function recordOfferViews() {
//       for (const offer of offers) {
//         const key = `offer-viewed:${id}:${offer.id}`;

//         if (sessionStorage.getItem(key)) continue;

//         try {
//           await recordInteraction({
//             eventId: id!,
//             brandId: offer.brand.id,
//             offerId: offer.id,
//             action: "VIEW",
//             metadata: { source: "event-details" },
//           });

//           sessionStorage.setItem(key, "true");
//         } catch (error) {
//           console.error(`Failed to record view for ${offer.title}:`, error);
//         }
//       }
//     }

//     recordOfferViews();
//   }, [id, offers]);

//   const availableLocations = useMemo(
//     () =>
//       venueTree.flatMap((venue) =>
//         venue.zones.flatMap((zone) =>
//           zone.locations.map((item) => item.location),
//         ),
//       ),
//     [venueTree],
//   );

//   function selectLocation(locationId: string) {
//     const selected = availableLocations.find(
//       (location) => location.id === locationId,
//     );

//     if (!selected) return;

//     setCrowdInputs((previous) => ({
//       ...previous,
//       locationId: selected.id,
//       locationName: selected.name,
//     }));

//     setCrowdPrediction(null);
//     setCrowdError("");
//   }

//   async function handleCrowdPrediction() {
//     if (!crowdInputs.locationId) return;

//     try {
//       setCrowdLoading(true);
//       setCrowdError("");

//       const result = await predictCrowd({
//         ...crowdInputs,
//         timestamp: new Date().toISOString(),
//       });

//       setCrowdPrediction(result);
//     } catch (err) {
//       setCrowdError(
//         err instanceof Error ? err.message : "Crowd forecast unavailable",
//       );
//     } finally {
//       setCrowdLoading(false);
//     }
//   }

//   async function handleOfferInteraction(
//     offer: ActiveOffer,
//     action: "CLICK" | "SAVE",
//   ) {
//     if (!id) return;

//     try {
//       setInteractionLoading(`${offer.id}-${action}`);
//       setInteractionMessage("");

//       await recordInteraction({
//         eventId: id,
//         brandId: offer.brand.id,
//         offerId: offer.id,
//         action,
//         metadata: {
//           source: "attendee-web",
//           offerTitle: offer.title,
//           brandName: offer.brand.name,
//         },
//       });

//       if (action === "SAVE") {
//         setInteractionMessage(`${offer.title} saved.`);
//       }
//     } catch (error) {
//       console.error("Failed to record interaction:", error);
//       setInteractionMessage("Unable to record this action right now.");
//     } finally {
//       setInteractionLoading(null);
//     }
//   }

//   function openChoiceReason(offer: ActiveOffer) {
//     setPendingOffer(offer);
//     setSelectedFactor("");
//     setInteractionMessage("");
//   }

//   async function confirmOfferSelection() {
//     if (!pendingOffer || !selectedFactor || !id) return;

//     try {
//       setInteractionLoading(`${pendingOffer.id}-SELECT`);
//       setInteractionMessage("");

//       await recordInteraction({
//         eventId: id,
//         brandId: pendingOffer.brand.id,
//         offerId: pendingOffer.id,
//         action: "SELECT",
//         factor: selectedFactor,
//         metadata: {
//           source: "attendee-web",
//           offerTitle: pendingOffer.title,
//           brandName: pendingOffer.brand.name,
//         },
//       });

//       setSelectedOfferId(pendingOffer.id);
//       setInteractionMessage(`${pendingOffer.brand.name} offer selected.`);
//       setPendingOffer(null);
//       setSelectedFactor("");
//     } catch (error) {
//       console.error("Failed to record selection:", error);
//       setInteractionMessage("Unable to record your selection.");
//     } finally {
//       setInteractionLoading(null);
//     }
//   }

//   function generateRecommendation() {
//     const ranked = recommendOffers(offers, recommendationPriority);
//     setRecommendation(ranked[0] ?? null);
//   }

//   function setInput<K extends keyof typeof crowdInputs>(
//     key: K,
//     value: (typeof crowdInputs)[K],
//   ) {
//     setCrowdInputs({ ...crowdInputs, [key]: value });
//   }

//   const header = (
//     <header className="topbar">
//       <button type="button" className="brand-button" onClick={() => navigate("/")}>
//         <img className="brand-mark" src="/logo.webp" alt="Rahat Setu logo" />
//         <span className="brand-copy">
//           <strong>Rahat Setu</strong>
//           <small>Event intelligence</small>
//         </span>
//       </button>

//       <button type="button" className="quiet-button" onClick={() => navigate("/")}>
//         ← All events
//       </button>
//     </header>
//   );

//   if (loading) {
//     return (
//       <div className="app-shell">
//         {header}
//         <main className="page event-page" aria-busy="true">
//           <div className="skeleton skeleton-hero" />
//           <div className="skeleton skeleton-block" />
//           <div className="skeleton skeleton-block" />
//         </main>
//       </div>
//     );
//   }

//   if (error || !event) {
//     return (
//       <div className="app-shell">
//         {header}
//         <main className="page">
//           <div className="error-message" role="alert">
//             {error || "Event not found"}
//           </div>
//           <button type="button" className="quiet-button" onClick={() => navigate("/")}>
//             Back to all events
//           </button>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="app-shell">
//       {header}

//       <main className="page event-page">
//         <section className="event-heading hero">
//           <div className="event-heading-main">
//             <div className="event-row-tags">
//               <span className={`status-dot status-${event.status.toLowerCase()}`}>
//                 {event.status}
//               </span>
//               <span className="muted-tag">{label(event.eventType)}</span>
//             </div>

//             <h1>{event.name}</h1>
//             <p>{event.description || "Event information and attendee services."}</p>
//           </div>

//           <div className="event-summary">
//             <div>
//               <span>Date</span>
//               <strong>
//                 {new Date(event.startTime).toLocaleDateString(undefined, {
//                   day: "numeric",
//                   month: "short",
//                   year: "numeric",
//                 })}
//               </strong>
//             </div>

//             <div>
//               <span>Time</span>
//               <strong>
//                 {new Date(event.startTime).toLocaleTimeString(undefined, {
//                   hour: "numeric",
//                   minute: "2-digit",
//                 })}
//                 {" – "}
//                 {new Date(event.endTime).toLocaleTimeString(undefined, {
//                   hour: "numeric",
//                   minute: "2-digit",
//                 })}
//               </strong>
//             </div>
//           </div>
//         </section>

//         <nav className="section-nav" aria-label="Sections">
//           <a href="#crowd">Crowd</a>
//           <a href="#updates">Updates</a>
//           <a href="#facilities">Facilities</a>
//           <a href="#recommended">Recommended</a>
//           <a href="#offers">Offers</a>
//         </nav>

//         {/* CROWD */}
//         <section className="content-section" id="crowd">
//           <div className="content-heading">
//             <div>
//               <h2>Crowd forecast</h2>
//               <p className="section-sub">Expected pedestrian flow for the next hour</p>
//             </div>
//             <span className="prototype-chip">Prototype</span>
//           </div>

//           <div className="crowd-main">
//             <div className="crowd-primary">
//               <label htmlFor="forecast-location">Forecast location</label>

//               <select
//                 id="forecast-location"
//                 value={crowdInputs.locationId}
//                 onChange={(e) => selectLocation(e.target.value)}
//               >
//                 {availableLocations.map((location) => (
//                   <option key={location.id} value={location.id}>
//                     {location.name}
//                   </option>
//                 ))}
//               </select>

//               {crowdPrediction ? (
//                 <div className="forecast-number" aria-live="polite">
//                   <strong>
//                     {Math.round(crowdPrediction.predictedCrowd).toLocaleString()}
//                   </strong>
//                   <span>pedestrians / hour</span>
//                   <p>
//                     Expected pedestrian flow over the next{" "}
//                     {crowdPrediction.predictionHorizonHours} hour.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="forecast-placeholder">
//                   <strong>—</strong>
//                   <span>Generate a forecast to see upcoming pedestrian flow.</span>
//                 </div>
//               )}

//               {crowdError && (
//                 <div className="inline-error" role="alert">
//                   {crowdError}
//                 </div>
//               )}

//               <button
//                 type="button"
//                 className="primary-button"
//                 onClick={handleCrowdPrediction}
//                 disabled={crowdLoading || !crowdInputs.locationId}
//               >
//                 {crowdLoading ? "Generating…" : "Generate forecast"}
//               </button>
//             </div>

//             <div className="crowd-side">
//               <h3>About this estimate</h3>
//               <p>
//                 A one-hour prototype forecast from the currently integrated
//                 pedestrian-flow model. It is not a live sensor reading.
//               </p>

//               {crowdPrediction && (
//                 <dl className="forecast-meta">
//                   <div>
//                     <dt>Model</dt>
//                     <dd>{crowdPrediction.modelVersion}</dd>
//                   </div>
//                   <div>
//                     <dt>Scope</dt>
//                     <dd>{crowdPrediction.modelScope}</dd>
//                   </div>
//                 </dl>
//               )}

//               <details className="model-inputs">
//                 <summary>Adjust model inputs</summary>

//                 <div className="input-grid">
//                   <label>
//                     Temperature (°C)
//                     <input
//                       type="number"
//                       value={crowdInputs.temperature}
//                       onChange={(e) => setInput("temperature", Number(e.target.value))}
//                     />
//                   </label>

//                   <label>
//                     Weather
//                     <input
//                       value={crowdInputs.weatherCondition}
//                       onChange={(e) => setInput("weatherCondition", e.target.value)}
//                     />
//                   </label>

//                   <label>
//                     Current pedestrians
//                     <input
//                       type="number"
//                       value={crowdInputs.currentCrowd}
//                       onChange={(e) => setInput("currentCrowd", Number(e.target.value))}
//                     />
//                   </label>

//                   <label>
//                     Towards ratio
//                     <input
//                       type="number"
//                       min="0"
//                       max="1"
//                       step="0.01"
//                       value={crowdInputs.towardsRatio}
//                       onChange={(e) => setInput("towardsRatio", Number(e.target.value))}
//                     />
//                   </label>

//                   {lagFields.map(({ key, label: text }) => (
//                     <label key={key}>
//                       {text}
//                       <input
//                         type="number"
//                         value={crowdInputs[key]}
//                         onChange={(e) => setInput(key, Number(e.target.value))}
//                       />
//                     </label>
//                   ))}

//                   <label className="check-line">
//                     <input
//                       type="checkbox"
//                       checked={crowdInputs.hasIncident}
//                       onChange={(e) => setInput("hasIncident", e.target.checked)}
//                     />
//                     Incident reported nearby
//                   </label>
//                 </div>
//               </details>
//             </div>
//           </div>
//         </section>

//         {/* UPDATES */}
//         <section className="content-section" id="updates">
//           <div className="content-heading">
//             <div>
//               <h2>Announcements</h2>
//               <p className="section-sub">Live notices from the organisers</p>
//             </div>
//           </div>

//           {announcements.length === 0 ? (
//             <p className="section-empty">No active announcements.</p>
//           ) : (
//             <div className="update-list">
//               {announcements.map((a) => (
//                 <article key={a.id} className="update-row">
//                   <span className={`update-priority priority-${a.priority.toLowerCase()}`}>
//                     {a.priority}
//                   </span>
//                   <div>
//                     <h3>{a.title}</h3>
//                     <p>{a.message}</p>
//                   </div>
//                 </article>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* FACILITIES */}
//         <section className="content-section" id="facilities">
//           <div className="content-heading">
//             <div>
//               <h2>Facilities and locations</h2>
//               <p className="section-sub">Venues, zones and what is available in each</p>
//             </div>
//           </div>

//           {venueTree.length === 0 ? (
//             <p className="section-empty">No venue information available.</p>
//           ) : (
//             <div className="venue-sections">
//               {venueTree.map(({ venue, zones }) => (
//                 <div key={venue.id} className="venue-section">
//                   <div className="venue-title">
//                     <h3>{venue.name}</h3>
//                     {venue.description && <p>{venue.description}</p>}
//                   </div>

//                   {zones.map(({ zone, locations }) => (
//                     <div key={zone.id} className="zone-section">
//                       <div className="zone-title">
//                         <strong>{zone.name}</strong>
//                         {zone.capacity && <span>Capacity {zone.capacity}</span>}
//                       </div>

//                       <div className="location-list">
//                         {locations.map(({ location, facilities }) => (
//                           <div key={location.id} className="location-row">
//                             <div>
//                               <span className="location-label">{label(location.type)}</span>
//                               <strong>{location.name}</strong>
//                               {location.description && <p>{location.description}</p>}
//                             </div>

//                             <div className="facility-stack">
//                               {facilities.map((facility) => (
//                                 <div key={facility.id} className="facility-item">
//                                   <span>{facility.name}</span>
//                                   <strong
//                                     className={`facility-status status-${String(facility.status).toLowerCase()}`}
//                                   >
//                                     {label(String(facility.status))}
//                                   </strong>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* RECOMMENDED */}
//         <section className="content-section" id="recommended">
//           <div className="content-heading">
//             <div>
//               <h2>Recommended for you</h2>
//               <p className="section-sub">
//                 Pick what matters most and we will rank the available offers.
//               </p>
//             </div>
//           </div>

//           <div className="recommendation-controls">
//             <select
//               aria-label="Recommendation priority"
//               value={recommendationPriority}
//               onChange={(e) => {
//                 setRecommendationPriority(e.target.value as ChoiceFactor);
//                 setRecommendation(null);
//               }}
//             >
//               <option value="DISCOUNT">Best discount</option>
//               <option value="PRICE">Lowest price</option>
//               <option value="BRAND_FAMILIARITY">Brand familiarity</option>
//               <option value="CONVENIENCE">Convenience</option>
//               <option value="CROWD">Lower crowd</option>
//               <option value="QUEUE">Shorter queue</option>
//               <option value="DISTANCE">Closer option</option>
//             </select>

//             <button
//               type="button"
//               className="primary-button"
//               onClick={generateRecommendation}
//               disabled={offers.length === 0}
//             >
//               Recommend
//             </button>
//           </div>

//           {recommendation && (
//             <div className="recommendation-card">
//               <span className="badge">Top match</span>
//               <h3>{recommendation.offer.brand.name}</h3>
//               <strong>{recommendation.offer.title}</strong>

//               {recommendation.offer.discountText && (
//                 <div className="recommendation-offer">
//                   {recommendation.offer.discountText}
//                 </div>
//               )}

//               {recommendation.offer.price != null && (
//                 <p className="price">₹{recommendation.offer.price}</p>
//               )}

//               <div className="recommendation-reasons">
//                 <span>Why this was recommended</span>
//                 <ul>
//                   {recommendation.reasons.map((reason) => (
//                     <li key={reason}>{reason}</li>
//                   ))}
//                 </ul>
//               </div>

//               <button
//                 type="button"
//                 className="offer-select-button"
//                 onClick={() => openChoiceReason(recommendation.offer)}
//               >
//                 Choose this offer
//               </button>
//             </div>
//           )}
//         </section>

//         {/* OFFERS */}
//         <section className="content-section" id="offers">
//           <div className="content-heading">
//             <div>
//               <h2>Offers for attendees</h2>
//               <p className="section-sub">Explore offers and choose what suits you.</p>
//             </div>
//           </div>

//           {interactionMessage && (
//             <div className="interaction-message" role="status">
//               {interactionMessage}
//             </div>
//           )}

//           {offers.length === 0 ? (
//             <p className="section-empty">No active offers.</p>
//           ) : (
//             <div className="offer-list">
//               {offers.map((offer) => {
//                 const selected = selectedOfferId === offer.id;

//                 return (
//                   <article
//                     className={`offer-row ${selected ? "offer-row-selected" : ""}`}
//                     key={offer.id}
//                     onClick={() => handleOfferInteraction(offer, "CLICK")}
//                   >
//                     <div>
//                       <span className="offer-brand-label">{offer.brand.name}</span>
//                       <h3>{offer.title}</h3>
//                       {offer.description && <p>{offer.description}</p>}

//                       <div className="offer-actions">
//                         <button
//                           type="button"
//                           className="offer-select-button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             openChoiceReason(offer);
//                           }}
//                         >
//                           {selected ? "Selected" : "Choose offer"}
//                         </button>

//                         <button
//                           type="button"
//                           className="offer-save-button"
//                           disabled={interactionLoading === `${offer.id}-SAVE`}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleOfferInteraction(offer, "SAVE");
//                           }}
//                         >
//                           {interactionLoading === `${offer.id}-SAVE` ? "Saving…" : "Save"}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="offer-value">
//                       <strong>{offer.discountText || "Event offer"}</strong>
//                       {offer.price != null && <span>₹{offer.price}</span>}
//                     </div>
//                   </article>
//                 );
//               })}
//             </div>
//           )}

//           {pendingOffer && (
//             <div className="choice-reason-box" role="dialog" aria-label="Choice reason">
//               <div className="choice-reason-heading">
//                 <div>
//                   <h3>Why did you choose this offer?</h3>
//                   <p>
//                     {pendingOffer.brand.name} · {pendingOffer.title}
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   className="quiet-button"
//                   onClick={() => {
//                     setPendingOffer(null);
//                     setSelectedFactor("");
//                   }}
//                 >
//                   Cancel
//                 </button>
//               </div>

//               <div className="choice-factor-grid">
//                 {choiceFactors.map((factor) => (
//                   <button
//                     type="button"
//                     key={factor.value}
//                     aria-pressed={selectedFactor === factor.value}
//                     className={`choice-factor-button ${
//                       selectedFactor === factor.value ? "choice-factor-selected" : ""
//                     }`}
//                     onClick={() => setSelectedFactor(factor.value)}
//                   >
//                     {factor.label}
//                   </button>
//                 ))}
//               </div>

//               <button
//                 type="button"
//                 className="primary-button"
//                 disabled={
//                   !selectedFactor || interactionLoading === `${pendingOffer.id}-SELECT`
//                 }
//                 onClick={confirmOfferSelection}
//               >
//                 {interactionLoading === `${pendingOffer.id}-SELECT`
//                   ? "Saving choice…"
//                   : "Confirm choice"}
//               </button>
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
import { useNavigate, useParams } from "react-router-dom";

import { recordInteraction, type ChoiceFactor } from "../api/interactions";
import { recommendOffers, type OfferRecommendation } from "../utils/recommendOffers";
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
  type CrowdPredictionInput,
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

type LagField = "lag1h" | "lag2h" | "lag3h" | "lag24h" | "lag168h";

const lagFields: Array<{ key: LagField; label: string }> = [
  { key: "lag1h", label: "1 hour ago" },
  { key: "lag2h", label: "2 hours ago" },
  { key: "lag3h", label: "3 hours ago" },
  { key: "lag24h", label: "24 hours ago" },
  { key: "lag168h", label: "1 week ago" },
];

const choiceFactors: Array<{ value: ChoiceFactor; label: string }> = [
  { value: "PRICE", label: "Better price" },
  { value: "DISCOUNT", label: "Attractive discount" },
  { value: "BRAND_FAMILIARITY", label: "I know / trust the brand" },
  { value: "CONVENIENCE", label: "More convenient" },
  { value: "DISTANCE", label: "Closer to me" },
  { value: "CROWD", label: "Less crowded" },
  { value: "QUEUE", label: "Shorter queue" },
  { value: "OTHER", label: "Other reason" },
];

const pickPriorities: Array<{ value: ChoiceFactor; label: string }> = [
  { value: "DISCOUNT", label: "Best discount" },
  { value: "PRICE", label: "Lowest price" },
  { value: "BRAND_FAMILIARITY", label: "A brand I know" },
  { value: "CONVENIENCE", label: "Convenience" },
  { value: "CROWD", label: "Lower crowd" },
  { value: "QUEUE", label: "Shorter queue" },
  { value: "DISTANCE", label: "Closer to me" },
];

const priorityRank: Record<AnnouncementRecord["priority"], number> = {
  URGENT: 0,
  IMPORTANT: 1,
  INFO: 2,
};

const sectionIds = ["crowd", "updates", "facilities", "offers"];

const label = (value: string) => value.replaceAll("_", " ");

/**
 * Where to look for a cover photo, in order:
 * 1. the event's own imageUrl
 * 2. /covers/<event-type>.jpg   (e.g. public/covers/festival.jpg)
 * 3. /covers/default.jpg
 * Anything missing falls through to the green pattern.
 * (Same order as the home page cards, so both show the same picture.)
 */
function coverCandidates(event: EventRecord) {
  return [
    event.imageUrl,
    `/covers/${event.eventType.toLowerCase()}.jpg`,
    "/covers/default.jpg",
  ].filter((source): source is string => Boolean(source));
}

/* ---------- small helpers ---------- */

/** Feeds the pointer position to CSS so a soft glow can follow the cursor. */
function trackPointer(event: React.MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

/** Eases a number up to its target. Jumps straight there when motion is reduced. */
function useCountUp(target: number | null) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === null) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reduceMotion ? 0 : 800;
    const startedAt = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress =
        duration === 0 ? 1 : Math.min((now - startedAt) / duration, 1);

      setValue(target * (1 - Math.pow(1 - progress, 3)));

      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

type IconName =
  | "arrow-left"
  | "calendar"
  | "clock"
  | "pin"
  | "chevron"
  | "alert"
  | "info"
  | "medical"
  | "help"
  | "stage"
  | "gate"
  | "food"
  | "check"
  | "close"
  | "up"
  | "down"
  | "flat";

const iconPaths: Record<IconName, React.ReactNode> = {
  "arrow-left": <path d="M19 12H5M11 6l-6 6 6 6" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  alert: (
    <>
      <path d="M12 3 2.5 20h19L12 3z" />
      <path d="M12 10v4M12 17.5v.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8v.01" />
    </>
  ),
  medical: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17v.01" />
    </>
  ),
  stage: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </>
  ),
  gate: (
    <>
      <path d="M4 21V8l8-5 8 5v13" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  food: <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  up: <path d="M7 17 17 7M9 7h8v8" />,
  down: <path d="M7 7l10 10M17 9v8H9" />,
  flat: <path d="M5 12h14M13 6l6 6-6 6" />,
};

function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}

function locationIcon(type: string): IconName {
  const value = type.toLowerCase();

  if (value.includes("medic") || value.includes("first")) return "medical";
  if (
    value.includes("help") ||
    value.includes("info") ||
    value.includes("police") ||
    value.includes("security")
  )
    return "help";
  if (value.includes("stage") || value.includes("perform")) return "stage";
  if (
    value.includes("gate") ||
    value.includes("entry") ||
    value.includes("exit")
  )
    return "gate";
  if (
    value.includes("food") ||
    value.includes("stall") ||
    value.includes("cafe")
  )
    return "food";

  return "pin";
}

function facilityTone(status: string) {
  const value = status.toLowerCase();

  if (["open", "available", "operational"].includes(value)) return "is-ok";
  if (["closed", "unavailable", "out_of_service"].includes(value)) return "is-bad";

  return "";
}

interface SparkPoint {
  label: string;
  value: number;
  kind?: "now" | "next";
}

function Sparkline({ points }: { points: SparkPoint[] }) {
  const width = 300;
  const height = 92;
  const barWidth = 34;
  const gap = (width - barWidth * points.length) / (points.length - 1);
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <svg
      className="spark"
      viewBox={`0 0 ${width} ${height + 22}`}
      role="img"
      aria-label={`Pedestrian flow: ${points
        .map((point) => `${point.label} ${Math.round(point.value)}`)
        .join(", ")}`}
    >
      {points.map((point, index) => {
        const barHeight = Math.max(4, (point.value / max) * height);
        const x = index * (barWidth + gap);

        return (
          <g key={point.label}>
            <rect
              className={`bar ${point.kind ?? ""}`}
              style={{ "--i": index } as React.CSSProperties}
              x={x}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
              rx={7}
            />
            <text x={x + barWidth / 2} y={height + 16}>
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- page ---------- */

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventRecord | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [offers, setOffers] = useState<ActiveOffer[]>([]);
  const [venueTree, setVenueTree] = useState<VenueTree[]>([]);
  const [crowdPrediction, setCrowdPrediction] = useState<CrowdPredictionResult | null>(null);
  const [forecastSnapshot, setForecastSnapshot] = useState<CrowdPredictionInput | null>(null);
  const [crowdLoading, setCrowdLoading] = useState(false);
  const [crowdError, setCrowdError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [interactionMessage, setInteractionMessage] = useState("");
  const [interactionLoading, setInteractionLoading] = useState<string | null>(null);
  const [pendingOffer, setPendingOffer] = useState<ActiveOffer | null>(null);
  const [selectedFactor, setSelectedFactor] = useState<ChoiceFactor | "">("");
  const [coverStep, setCoverStep] = useState(0);
  const [activeSection, setActiveSection] = useState("crowd");

  const [crowdInputs, setCrowdInputs] = useState<CrowdPredictionInput>({
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

  const [recommendationPriority, setRecommendationPriority] =
    useState<ChoiceFactor>("DISCOUNT");
  const [recommendation, setRecommendation] =
    useState<OfferRecommendation | null>(null);

  const animatedForecast = useCountUp(
    crowdPrediction ? crowdPrediction.predictedCrowd : null,
  );

  useEffect(() => {
    if (!id) return;

    async function loadEventDetails() {
      try {
        setLoading(true);
        setError("");

        const [eventData, announcementData, offerData, venues] =
          await Promise.all([
            getEvent(id!),
            getActiveAnnouncements(id!),
            getActiveOffers(id!),
            getVenues(id!),
          ]);

        const fullVenueTree = await Promise.all(
          venues.map(async (venue) => {
            const zones = await getZones(venue.id);

            const zoneData = await Promise.all(
              zones.map(async (zone) => {
                const locations = await getLocations(zone.id);

                const locationData = await Promise.all(
                  locations.map(async (location) => ({
                    location,
                    facilities: await getFacilities(location.id),
                  })),
                );

                return { zone, locations: locationData };
              }),
            );

            return { venue, zones: zoneData };
          }),
        );

        setEvent(eventData);
        setAnnouncements(announcementData);
        setOffers(offerData);
        setVenueTree(fullVenueTree);

        const firstLocation = fullVenueTree
          .flatMap((item) => item.zones)
          .flatMap((item) => item.locations)[0]?.location;

        if (firstLocation) {
          setCrowdInputs((previous) => ({
            ...previous,
            locationId: firstLocation.id,
            locationName: firstLocation.name,
          }));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load event details",
        );
      } finally {
        setLoading(false);
      }
    }

    loadEventDetails();
  }, [id]);

  useEffect(() => {
    if (!id || offers.length === 0) return;

    async function recordOfferViews() {
      for (const offer of offers) {
        const key = `offer-viewed:${id}:${offer.id}`;

        if (sessionStorage.getItem(key)) continue;

        try {
          await recordInteraction({
            eventId: id!,
            brandId: offer.brand.id,
            offerId: offer.id,
            action: "VIEW",
            metadata: { source: "event-details" },
          });

          sessionStorage.setItem(key, "true");
        } catch (error) {
          console.error(`Failed to record view for ${offer.title}:`, error);
        }
      }
    }

    recordOfferViews();
  }, [id, offers]);

  // Highlight the section currently being read in the sticky nav.
  useEffect(() => {
    if (loading) return;

    const sections = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [loading]);

  // Toast disappears on its own.
  useEffect(() => {
    if (!interactionMessage) return;

    const timer = window.setTimeout(() => setInteractionMessage(""), 3400);
    return () => window.clearTimeout(timer);
  }, [interactionMessage]);

  // Escape closes the choice dialog.
  useEffect(() => {
    if (!pendingOffer) return;

    function onKeyDown(keyEvent: KeyboardEvent) {
      if (keyEvent.key === "Escape") {
        setPendingOffer(null);
        setSelectedFactor("");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pendingOffer]);

  const availableLocations = useMemo(
    () =>
      venueTree.flatMap((venue) =>
        venue.zones.flatMap((zone) =>
          zone.locations.map((item) => item.location),
        ),
      ),
    [venueTree],
  );

  const sortedAnnouncements = useMemo(
    () =>
      [...announcements].sort(
        (a, b) => priorityRank[a.priority] - priorityRank[b.priority],
      ),
    [announcements],
  );

  const orderedOffers = useMemo(
    () =>
      recommendation
        ? [
            recommendation.offer,
            ...offers.filter((offer) => offer.id !== recommendation.offer.id),
          ]
        : offers,
    [offers, recommendation],
  );

  function selectLocation(locationId: string) {
    const selected = availableLocations.find(
      (location) => location.id === locationId,
    );

    if (!selected) return;

    setCrowdInputs((previous) => ({
      ...previous,
      locationId: selected.id,
      locationName: selected.name,
    }));

    setCrowdPrediction(null);
    setForecastSnapshot(null);
    setCrowdError("");
  }

  async function handleCrowdPrediction() {
    if (!crowdInputs.locationId) return;

    try {
      setCrowdLoading(true);
      setCrowdError("");

      const request = {
        ...crowdInputs,
        timestamp: new Date().toISOString(),
      };

      const result = await predictCrowd(request);

      setForecastSnapshot(request);
      setCrowdPrediction(result);
    } catch (err) {
      setCrowdError(
        err instanceof Error ? err.message : "Crowd forecast unavailable",
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
      setInteractionLoading(`${offer.id}-${action}`);
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
        setInteractionMessage(`${offer.title} saved.`);
      }
    } catch (error) {
      console.error("Failed to record interaction:", error);
      setInteractionMessage("Unable to record this action right now.");
    } finally {
      setInteractionLoading(null);
    }
  }

  function openChoiceReason(offer: ActiveOffer) {
    setPendingOffer(offer);
    setSelectedFactor("");
    setInteractionMessage("");
  }

  function closeChoiceReason() {
    setPendingOffer(null);
    setSelectedFactor("");
  }

  async function confirmOfferSelection() {
    if (!pendingOffer || !selectedFactor || !id) return;

    try {
      setInteractionLoading(`${pendingOffer.id}-SELECT`);
      setInteractionMessage("");

      await recordInteraction({
        eventId: id,
        brandId: pendingOffer.brand.id,
        offerId: pendingOffer.id,
        action: "SELECT",
        factor: selectedFactor,
        metadata: {
          source: "attendee-web",
          offerTitle: pendingOffer.title,
          brandName: pendingOffer.brand.name,
        },
      });

      setSelectedOfferId(pendingOffer.id);
      setInteractionMessage(`${pendingOffer.brand.name} offer selected.`);
      setPendingOffer(null);
      setSelectedFactor("");
    } catch (error) {
      console.error("Failed to record selection:", error);
      setInteractionMessage("Unable to record your selection.");
    } finally {
      setInteractionLoading(null);
    }
  }

  function pickPriority(priority: ChoiceFactor) {
    setRecommendationPriority(priority);
    setRecommendation(recommendOffers(offers, priority)[0] ?? null);
  }

  function setInput<K extends keyof CrowdPredictionInput>(
    key: K,
    value: CrowdPredictionInput[K],
  ) {
    setCrowdInputs({ ...crowdInputs, [key]: value });
  }

  const header = (
    <header className="topbar">
      <button type="button" className="brand-button" onClick={() => navigate("/")}>
        <img className="brand-mark" src="/logo.webp" alt="Rahat Setu logo" />
        <span className="brand-copy">
          <strong>Rahat Setu</strong>
          <small>Event intelligence</small>
        </span>
      </button>

      <button type="button" className="quiet-button" onClick={() => navigate("/")}>
        <Icon name="arrow-left" />
        All events
      </button>
    </header>
  );

  const footer = (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <strong>Rahat Setu</strong>
        <span>Event intelligence for attendees</span>
      </div>
    </footer>
  );

  if (loading) {
    return (
      <div className="app-shell">
        {header}
        <main className="page event-page" aria-busy="true">
          <div className="skeleton skeleton-hero" />
          <div className="skeleton skeleton-block" />
          <div className="skeleton skeleton-block" />
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="app-shell">
        {header}
        <main className="page">
          <div className="error-message" role="alert">
            {error || "Event not found"}
          </div>
          <button type="button" className="quiet-button" onClick={() => navigate("/")}>
            Back to all events
          </button>
        </main>
      </div>
    );
  }

  const start = new Date(event.startTime);
  const coverSource = coverCandidates(event)[coverStep];
  const showCover = coverSource !== undefined;
  const venueName = venueTree[0]?.venue.name;

  const navItems = [
    { id: "crowd", label: "Crowd", count: null },
    { id: "updates", label: "Updates", count: announcements.length },
    { id: "facilities", label: "Facilities", count: availableLocations.length },
    { id: "offers", label: "Offers", count: offers.length },
  ];

  // Compare the forecast with the "now" value that was sent with it.
  const currentAtForecast = forecastSnapshot?.currentCrowd ?? 0;
  const forecastDelta =
    crowdPrediction && currentAtForecast > 0
      ? (crowdPrediction.predictedCrowd - currentAtForecast) / currentAtForecast
      : null;

  const trend =
    forecastDelta === null
      ? null
      : Math.abs(forecastDelta) < 0.05
        ? { icon: "flat" as IconName, text: "Holding steady" }
        : forecastDelta > 0
          ? {
              icon: "up" as IconName,
              text: `Up ${Math.round(forecastDelta * 100)}% from now`,
            }
          : {
              icon: "down" as IconName,
              text: `Down ${Math.round(Math.abs(forecastDelta) * 100)}% from now`,
            };

  return (
    <div className="app-shell">
      {header}

      <section className="hero-band event-hero" onMouseMove={trackPointer}>
        <div className="hero-inner">
          <div className="event-heading-main">
            <div className="event-row-tags">
              <span className={`status-dot status-${event.status.toLowerCase()}`}>
                {event.status}
              </span>
              <span className="muted-tag">{label(event.eventType)}</span>
            </div>

            <h1>{event.name}</h1>
            <p>{event.description || "Event information and attendee services."}</p>

            <div className="event-facts">
              <div className="fact">
                <Icon name="calendar" />
                <div>
                  <span>Date</span>
                  <strong>
                    {start.toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </div>
              </div>

              <div className="fact">
                <Icon name="clock" />
                <div>
                  <span>Time</span>
                  <strong>
                    {start.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {" – "}
                    {new Date(event.endTime).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </strong>
                </div>
              </div>

              {venueName && (
                <div className="fact">
                  <Icon name="pin" />
                  <div>
                    <span>Venue</span>
                    <strong>{venueName}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`event-cover ${showCover ? "has-image" : ""}`}>
            {showCover && (
              <img
                src={coverSource}
                alt=""
                onError={() => setCoverStep((current) => current + 1)}
              />
            )}

            <div className="event-date" aria-hidden="true">
              <strong>{start.getDate()}</strong>
              <span>{start.toLocaleDateString(undefined, { month: "short" })}</span>
            </div>

            <div className="event-cover-caption" aria-hidden="true">
              <span>{label(event.eventType)}</span>
              {venueName && <strong>{venueName}</strong>}
            </div>
          </div>
        </div>
      </section>

      <div className="section-nav-wrap">
        <nav className="section-nav" aria-label="Sections">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeSection === item.id ? "is-active" : ""}
              aria-current={activeSection === item.id ? "true" : undefined}
            >
              {item.label}
              {item.count !== null && item.count > 0 && <small>{item.count}</small>}
            </a>
          ))}
        </nav>
      </div>

      <main className="page event-page">
        {/* CROWD */}
        <section className="content-section reveal" id="crowd">
          <div className="content-heading">
            <div>
              <h2>Crowd forecast</h2>
              <p className="section-sub">Expected pedestrian flow for the next hour</p>
            </div>
            <span className="muted-tag">Prototype</span>
          </div>

          <div className="crowd-grid">
            <div className="crowd-controls">
              <label htmlFor="forecast-location">Forecast location</label>

              <select
                id="forecast-location"
                value={crowdInputs.locationId}
                onChange={(e) => selectLocation(e.target.value)}
              >
                {availableLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>

              {crowdError && (
                <div className="inline-error" role="alert">
                  {crowdError}
                </div>
              )}

              <button
                type="button"
                className="primary-button"
                onClick={handleCrowdPrediction}
                disabled={crowdLoading || !crowdInputs.locationId}
              >
                {crowdLoading ? (
                  <>
                    <span className="spinner" />
                    Generating…
                  </>
                ) : (
                  "Generate forecast"
                )}
              </button>

              <p className="crowd-note">
                A one-hour prototype forecast from the currently integrated
                pedestrian-flow model. It is not a live sensor reading.
              </p>

              <details className="model-inputs">
                <summary>
                  Adjust model inputs
                  <Icon name="chevron" />
                </summary>

                <div className="input-grid">
                  <label>
                    Temperature (°C)
                    <input
                      type="number"
                      value={crowdInputs.temperature}
                      onChange={(e) => setInput("temperature", Number(e.target.value))}
                    />
                  </label>

                  <label>
                    Weather
                    <input
                      value={crowdInputs.weatherCondition}
                      onChange={(e) => setInput("weatherCondition", e.target.value)}
                    />
                  </label>

                  <label>
                    Current pedestrians
                    <input
                      type="number"
                      value={crowdInputs.currentCrowd}
                      onChange={(e) => setInput("currentCrowd", Number(e.target.value))}
                    />
                  </label>

                  <label>
                    Towards ratio
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={crowdInputs.towardsRatio}
                      onChange={(e) => setInput("towardsRatio", Number(e.target.value))}
                    />
                  </label>

                  {lagFields.map(({ key, label: text }) => (
                    <label key={key}>
                      {text}
                      <input
                        type="number"
                        value={crowdInputs[key]}
                        onChange={(e) => setInput(key, Number(e.target.value))}
                      />
                    </label>
                  ))}

                  <label className="check-line">
                    <input
                      type="checkbox"
                      checked={crowdInputs.hasIncident}
                      onChange={(e) => setInput("hasIncident", e.target.checked)}
                    />
                    Incident reported nearby
                  </label>
                </div>
              </details>
            </div>

            <div
              className={`forecast-card ${crowdPrediction ? "" : "is-empty"}`}
              aria-live="polite"
            >
              {crowdPrediction && forecastSnapshot ? (
                <>
                  <span className="forecast-label">
                    Next hour · {forecastSnapshot.locationName}
                  </span>

                  <div className="forecast-value">
                    <strong>{Math.round(animatedForecast).toLocaleString()}</strong>
                    <span>pedestrians / hour</span>
                  </div>

                  {trend && (
                    <span className="trend">
                      <Icon name={trend.icon} />
                      {trend.text}
                    </span>
                  )}

                  <Sparkline
                    points={[
                      { label: "3h ago", value: forecastSnapshot.lag3h },
                      { label: "2h ago", value: forecastSnapshot.lag2h },
                      { label: "1h ago", value: forecastSnapshot.lag1h },
                      { label: "Now", value: forecastSnapshot.currentCrowd, kind: "now" },
                      { label: "Next hr", value: crowdPrediction.predictedCrowd, kind: "next" },
                    ]}
                  />

                  <div className="forecast-foot">
                    <span>Model {crowdPrediction.modelVersion}</span>
                    <span>{crowdPrediction.modelScope}</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="forecast-label">Forecast</span>
                  <p className="forecast-empty-copy">
                    Pick a location and generate a forecast to see how busy it
                    is likely to be over the next hour.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* UPDATES */}
        <section className="content-section reveal" id="updates">
          <div className="content-heading">
            <div>
              <h2>Announcements</h2>
              <p className="section-sub">Live notices from the organisers</p>
            </div>
          </div>

          {sortedAnnouncements.length === 0 ? (
            <p className="section-empty">No active announcements.</p>
          ) : (
            <div className="update-list">
              {sortedAnnouncements.map((a) => (
                <article
                  key={a.id}
                  className={`update-row priority-${a.priority.toLowerCase()}`}
                  role={a.priority === "URGENT" ? "alert" : undefined}
                >
                  <span className="update-icon">
                    <Icon name={a.priority === "INFO" ? "info" : "alert"} />
                  </span>
                  <div>
                    <div className="update-top">
                      <span className="update-priority">{a.priority}</span>
                      <h3>{a.title}</h3>
                    </div>
                    <p>{a.message}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FACILITIES */}
        <section className="content-section reveal" id="facilities">
          <div className="content-heading">
            <div>
              <h2>Facilities and locations</h2>
              <p className="section-sub">Venues, zones and what is available in each</p>
            </div>
          </div>

          {venueTree.length === 0 ? (
            <p className="section-empty">No venue information available.</p>
          ) : (
            <div className="venue-sections">
              {venueTree.map(({ venue, zones }, venueIndex) => (
                <div key={venue.id} className="venue-section">
                  <div className="venue-title">
                    <h3>{venue.name}</h3>
                    {venue.description && <p>{venue.description}</p>}
                  </div>

                  <div className="zone-list">
                    {zones.map(({ zone, locations }, zoneIndex) => (
                      <details
                        key={zone.id}
                        className="zone-section"
                        open={venueIndex === 0 && zoneIndex === 0}
                      >
                        <summary>
                          <div className="zone-title">
                            <strong>{zone.name}</strong>
                            <span>
                              {locations.length} location
                              {locations.length === 1 ? "" : "s"}
                              {zone.capacity ? ` · Capacity ${zone.capacity.toLocaleString()}` : ""}
                            </span>
                          </div>
                          <Icon name="chevron" />
                        </summary>

                        <div className="zone-body">
                          {locations.length === 0 ? (
                            <p className="section-empty">No locations listed.</p>
                          ) : (
                            <div className="location-list">
                              {locations.map(({ location, facilities }) => (
                                <div key={location.id} className="location-row">
                                  <span className="location-icon">
                                    <Icon name={locationIcon(location.type)} />
                                  </span>

                                  <div>
                                    <span className="location-label">{label(location.type)}</span>
                                    <strong>{location.name}</strong>
                                    {location.description && <p>{location.description}</p>}
                                  </div>

                                  <div className="facility-stack">
                                    {facilities.map((facility) => (
                                      <div key={facility.id} className="facility-item">
                                        <span>{facility.name}</span>
                                        <strong
                                          className={`facility-status ${facilityTone(String(facility.status))}`}
                                        >
                                          {label(String(facility.status))}
                                        </strong>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* OFFERS (with recommendation) */}
        <section className="content-section reveal" id="offers">
          <div className="content-heading">
            <div>
              <h2>Offers for attendees</h2>
              <p className="section-sub">Explore offers and choose what suits you.</p>
            </div>
          </div>

          {offers.length > 0 && (
            <div className="pick-bar">
              <div className="pick-bar-head">
                <strong>What matters most to you?</strong>
                {recommendation && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setRecommendation(null)}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="chip-row" role="group" aria-label="Recommendation priority">
                {pickPriorities.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    className="chip"
                    aria-pressed={
                      recommendation !== null &&
                      recommendationPriority === priority.value
                    }
                    onClick={() => pickPriority(priority.value)}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {offers.length === 0 ? (
            <p className="section-empty">No active offers.</p>
          ) : (
            <div className="offer-list">
              {orderedOffers.map((offer) => {
                const selected = selectedOfferId === offer.id;
                const isTopMatch = recommendation?.offer.id === offer.id;

                return (
                  <article
                    className={`offer-row ${selected ? "offer-row-selected" : ""} ${
                      isTopMatch ? "offer-row-top" : ""
                    }`}
                    key={offer.id}
                    onClick={() => handleOfferInteraction(offer, "CLICK")}
                  >
                    <span className="offer-avatar" aria-hidden="true">
                      {offer.brand.name.charAt(0).toUpperCase()}
                    </span>

                    <div>
                      <span className="offer-brand-label">
                        {offer.brand.name}
                        {isTopMatch && <span className="badge">Top match</span>}
                      </span>
                      <h3>{offer.title}</h3>
                      {offer.description && <p>{offer.description}</p>}

                      {isTopMatch && recommendation && (
                        <ul className="offer-reasons">
                          {recommendation.reasons.map((reason) => (
                            <li key={reason}>
                              <Icon name="check" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="offer-actions">
                        <button
                          type="button"
                          className="offer-select-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openChoiceReason(offer);
                          }}
                        >
                          {selected ? "Selected" : "Choose offer"}
                        </button>

                        <button
                          type="button"
                          className="offer-save-button"
                          disabled={interactionLoading === `${offer.id}-SAVE`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOfferInteraction(offer, "SAVE");
                          }}
                        >
                          {interactionLoading === `${offer.id}-SAVE` ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </div>

                    <div className="offer-value">
                      <strong>{offer.discountText || "Event offer"}</strong>
                      {offer.price != null && <span>₹{offer.price}</span>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {footer}

      {pendingOffer && (
        <div className="sheet-backdrop" onClick={closeChoiceReason}>
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="choice-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-grab" />

            <div className="choice-reason-heading">
              <div>
                <h3 id="choice-title">Why did you choose this offer?</h3>
                <p>
                  {pendingOffer.brand.name} · {pendingOffer.title}
                </p>
              </div>

              <button
                type="button"
                className="icon-button"
                aria-label="Cancel"
                onClick={closeChoiceReason}
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="choice-factor-grid">
              {choiceFactors.map((factor) => (
                <button
                  type="button"
                  key={factor.value}
                  aria-pressed={selectedFactor === factor.value}
                  className={`choice-factor-button ${
                    selectedFactor === factor.value ? "choice-factor-selected" : ""
                  }`}
                  onClick={() => setSelectedFactor(factor.value)}
                >
                  {factor.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="primary-button"
              disabled={
                !selectedFactor || interactionLoading === `${pendingOffer.id}-SELECT`
              }
              onClick={confirmOfferSelection}
            >
              {interactionLoading === `${pendingOffer.id}-SELECT`
                ? "Saving choice…"
                : "Confirm choice"}
            </button>
          </div>
        </div>
      )}

      {interactionMessage && (
        <div className="toast" role="status">
          {interactionMessage}
        </div>
      )}
    </div>
  );
}
