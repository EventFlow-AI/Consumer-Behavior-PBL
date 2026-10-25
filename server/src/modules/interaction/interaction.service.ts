import { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import type { CreateInteractionInput } from "./interaction.validation.js";

export async function eventExists(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  return Boolean(event);
}

export async function brandExists(brandId: string) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { id: true },
  });

  return Boolean(brand);
}

export async function offerExists(offerId: string) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    select: {
      id: true,
      eventId: true,
      brandId: true,
    },
  });

  return offer;
}

export async function createInteraction(
  userId: string,
  data: CreateInteractionInput,
) {
  return prisma.consumerInteraction.create({
    data: {
      userId,
      eventId: data.eventId,
      brandId: data.brandId,
      offerId: data.offerId,
      action: data.action,
      factor: data.factor,
      rating: data.rating,
      metadata:
        data.metadata !== undefined
          ? (data.metadata as Prisma.InputJsonValue)
          : undefined,
    },
  });
}

export async function getMyInteractions(
  userId: string,
) {
  return prisma.consumerInteraction.findMany({
    where: {
      userId,
    },
    include: {
      event: {
        select: {
          id: true,
          name: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      offer: {
        select: {
          id: true,
          title: true,
          discountText: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}