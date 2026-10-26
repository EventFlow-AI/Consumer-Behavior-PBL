import type { ActiveOffer } from "../api/eventDetails";
import type { ChoiceFactor } from "../api/interactions";

export interface OfferRecommendation {
  offer: ActiveOffer;
  score: number;
  reasons: string[];
}

function extractDiscount(
  discountText?: string | null,
) {
  if (!discountText) return 0;

  const match = discountText.match(/(\d+)\s*%/);

  if (match) {
    return Number(match[1]);
  }

  if (
    discountText.toLowerCase().includes("free")
  ) {
    return 15;
  }

  return 5;
}

export function recommendOffers(
  offers: ActiveOffer[],
  priority: ChoiceFactor,
): OfferRecommendation[] {
  if (offers.length === 0) return [];

  const prices = offers
    .map((offer) => offer.price)
    .filter(
      (price): price is number =>
        price !== null &&
        price !== undefined,
    );

  const lowestPrice =
    prices.length > 0
      ? Math.min(...prices)
      : null;

  return offers
    .map((offer) => {
      let score = 0;
      const reasons: string[] = [];

      const discount =
        extractDiscount(
          offer.discountText,
        );

      if (discount > 0) {
        score += discount / 5;
      }

      if (priority === "DISCOUNT") {
        score += discount;

        if (discount > 0) {
          reasons.push(
            `Strong promotional value: ${
              offer.discountText
            }`,
          );
        }
      }

      if (
        priority === "PRICE" &&
        lowestPrice !== null &&
        offer.price === lowestPrice
      ) {
        score += 40;

        reasons.push(
          "Lowest-priced option among current offers",
        );
      }

      if (
        priority ===
        "BRAND_FAMILIARITY"
      ) {
        score += 15;

        reasons.push(
          `Offer from ${offer.brand.name}`,
        );
      }

      if (
        priority === "CONVENIENCE"
      ) {
        score += 12;

        reasons.push(
          "Simple event offer available directly through Rahat Setu",
        );
      }

      if (
        priority === "CROWD" ||
        priority === "QUEUE" ||
        priority === "DISTANCE"
      ) {
        score += 8;

        reasons.push(
          "Can be evaluated alongside event location and crowd information",
        );
      }

      if (priority === "OTHER") {
        score += discount;

        reasons.push(
          "Good overall promotional value",
        );
      }

      if (
        offer.price !== null &&
        offer.price !== undefined
      ) {
        reasons.push(
          `Available at ₹${offer.price}`,
        );
      }

      if (reasons.length === 0) {
        reasons.push(
          "Relevant active event offer",
        );
      }

      return {
        offer,
        score,
        reasons,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score,
    );
}