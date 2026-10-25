import { useEffect, useState } from "react";
import { getEvents, type EventRecord } from "../api/events";
import { getBrands, type BrandRecord } from "../api/brands";
import {
  createOffer,
  deleteOffer,
  getOffersByEvent,
  updateOffer,
  type OfferRecord,
} from "../api/offers";

export default function OffersPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [offers, setOffers] = useState<OfferRecord[]>([]);

  const [selectedEventId, setSelectedEventId] = useState("");
  const [brandId, setBrandId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountText, setDiscountText] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(
    null,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [eventData, brandData] = await Promise.all([
          getEvents(),
          getBrands(),
        ]);

        setEvents(eventData);
        setBrands(brandData);

        if (eventData.length > 0) {
          setSelectedEventId(eventData[0].id);
        }

        if (brandData.length > 0) {
          setBrandId(brandData[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load offer data",
        );
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setOffers([]);
      return;
    }

    loadOffers();
  }, [selectedEventId]);

  async function loadOffers() {
    if (!selectedEventId) return;

    try {
      setLoading(true);
      setError("");

      const response =
        await getOffersByEvent(selectedEventId);

      setOffers(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load offers",
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setDiscountText("");
    setPrice("");
    setIsActive(true);
    setEditingId(null);

    if (brands.length > 0) {
      setBrandId(brands[0].id);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedEventId || !brandId) return;

    try {
      setError("");

      if (editingId) {
        await updateOffer(editingId, {
          title,
          description: description || undefined,
          discountText: discountText || undefined,
          price: price ? Number(price) : undefined,
          isActive,
        });
      } else {
        await createOffer({
          eventId: selectedEventId,
          brandId,
          title,
          description: description || undefined,
          discountText: discountText || undefined,
          price: price ? Number(price) : undefined,
          isActive,
        });
      }

      resetForm();
      await loadOffers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save offer",
      );
    }
  }

  function handleEdit(offer: OfferRecord) {
    setEditingId(offer.id);
    setBrandId(offer.brandId);
    setTitle(offer.title);
    setDescription(offer.description ?? "");
    setDiscountText(offer.discountText ?? "");
    setPrice(
      offer.price !== null &&
        offer.price !== undefined
        ? String(offer.price)
        : "",
    );
    setIsActive(offer.isActive);
  }

  async function handleToggle(offer: OfferRecord) {
    try {
      setError("");

      await updateOffer(offer.id, {
        isActive: !offer.isActive,
      });

      await loadOffers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update offer",
      );
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this offer?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteOffer(id);

      if (editingId === id) {
        resetForm();
      }

      await loadOffers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete offer",
      );
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Offers</h1>
          <p>
            Configure event-specific promotional strategies
            used to attract customers.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="form-card">
        <label htmlFor="offer-event">
          Event
        </label>

        <select
          id="offer-event"
          value={selectedEventId}
          onChange={(event) => {
            setSelectedEventId(event.target.value);
            resetForm();
          }}
        >
          {events.length === 0 && (
            <option value="">
              No events available
            </option>
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
            <label htmlFor="offer-brand">
              Brand
            </label>

            <select
              id="offer-brand"
              value={brandId}
              onChange={(event) =>
                setBrandId(event.target.value)
              }
              disabled={Boolean(editingId)}
              required
            >
              {brands.length === 0 && (
                <option value="">
                  No brands available
                </option>
              )}

              {brands.map((brand) => (
                <option
                  key={brand.id}
                  value={brand.id}
                >
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="offer-title">
              Offer Title
            </label>

            <input
              id="offer-title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="20% off event merchandise"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="offer-description">
            Description
          </label>

          <textarea
            id="offer-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Special attendee discount on selected merchandise."
            rows={3}
          />
        </div>

        <div className="form-grid">
          <div>
            <label htmlFor="offer-discount">
              Discount / Promotion
            </label>

            <input
              id="offer-discount"
              value={discountText}
              onChange={(event) =>
                setDiscountText(event.target.value)
              }
              placeholder="20% OFF"
            />
          </div>

          <div>
            <label htmlFor="offer-price">
              Price
            </label>

            <input
              id="offer-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) =>
                setPrice(event.target.value)
              }
              placeholder="799"
            />
          </div>
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
              ? "Update Offer"
              : "Create Offer"}
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
          <p>Loading offers...</p>
        ) : offers.length === 0 ? (
          <p>No offers created for this event.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Offer</th>
                  <th>Brand</th>
                  <th>Promotion</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id}>
                    <td>
                      <strong>{offer.title}</strong>

                      {offer.description && (
                        <div className="table-secondary-text">
                          {offer.description}
                        </div>
                      )}
                    </td>

                    <td>{offer.brand.name}</td>

                    <td>
                      {offer.discountText || "—"}
                    </td>

                    <td>
                      {offer.price !== null &&
                      offer.price !== undefined
                        ? `₹${offer.price}`
                        : "—"}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          handleToggle(offer)
                        }
                      >
                        {offer.isActive
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            handleEdit(offer)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() =>
                            handleDelete(offer.id)
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