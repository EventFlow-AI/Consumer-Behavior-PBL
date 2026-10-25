import prisma from "../../config/prisma.js";

export async function getConsumerInsights(eventId?: string) {
  const interactionWhere = eventId ? { eventId } : {};

  const [
    totalInteractions,
    interactionBreakdown,
    factorBreakdown,
    brandBreakdown,
    offerBreakdown,
  ] = await Promise.all([
    prisma.consumerInteraction.count({
      where: interactionWhere,
    }),

    prisma.consumerInteraction.groupBy({
      by: ["action"],
      where: interactionWhere,
      _count: {
        action: true,
      },
    }),

    prisma.consumerInteraction.groupBy({
      by: ["factor"],
      where: {
        ...interactionWhere,
        factor: {
          not: null,
        },
      },
      _count: {
        factor: true,
      },
    }),

    prisma.consumerInteraction.groupBy({
      by: ["brandId"],
      where: {
        ...interactionWhere,
        brandId: {
          not: null,
        },
      },
      _count: {
        brandId: true,
      },
      orderBy: {
        _count: {
          brandId: "desc",
        },
      },
      take: 5,
    }),

    prisma.consumerInteraction.groupBy({
      by: ["offerId"],
      where: {
        ...interactionWhere,
        offerId: {
          not: null,
        },
      },
      _count: {
        offerId: true,
      },
      orderBy: {
        _count: {
          offerId: "desc",
        },
      },
      take: 5,
    }),
  ]);

  const brandIds = brandBreakdown
    .map((item) => item.brandId)
    .filter((id): id is string => Boolean(id));

  const offerIds = offerBreakdown
    .map((item) => item.offerId)
    .filter((id): id is string => Boolean(id));

  const [brands, offers] = await Promise.all([
    prisma.brand.findMany({
      where: {
        id: {
          in: brandIds,
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
    }),

    prisma.offer.findMany({
      where: {
        id: {
          in: offerIds,
        },
      },
      select: {
        id: true,
        title: true,
        discountText: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  const topBrands = brandBreakdown.map((item) => ({
    brand: brands.find(
      (brand) => brand.id === item.brandId,
    ),
    interactions: item._count.brandId,
  }));

  const topOffers = offerBreakdown.map((item) => ({
    offer: offers.find(
      (offer) => offer.id === item.offerId,
    ),
    interactions: item._count.offerId,
  }));

  const topFactor =
    factorBreakdown.length > 0
      ? [...factorBreakdown].sort(
          (a, b) =>
            b._count.factor - a._count.factor,
        )[0]
      : null;

  return {
    totalInteractions,

    interactionBreakdown: interactionBreakdown.map(
      (item) => ({
        action: item.action,
        count: item._count.action,
      }),
    ),

    factorBreakdown: factorBreakdown.map((item) => ({
      factor: item.factor,
      count: item._count.factor,
    })),

    topFactor: topFactor
      ? {
          factor: topFactor.factor,
          count: topFactor._count.factor,
        }
      : null,

    topBrands,
    topOffers,
  };
}