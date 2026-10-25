import prisma from "../../config/prisma.js";
import type {
  CreateOfferInput,
  UpdateOfferInput,
} from "./offer.validation.js";

export async function brandExists(brandId: string) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { id: true },
  });

  return Boolean(brand);
}

export async function eventExists(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  return Boolean(event);
}

export async function getOffersByEvent(eventId: string) {
  return prisma.offer.findMany({
    where: {
      eventId,
    },
    include: {
      brand: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getActiveOffersByEvent(
  eventId: string,
) {
  const now = new Date();

  return prisma.offer.findMany({
    where: {
      eventId,
      isActive: true,
      AND: [
        {
          OR: [
            { startsAt: null },
            { startsAt: { lte: now } },
          ],
        },
        {
          OR: [
            { endsAt: null },
            { endsAt: { gte: now } },
          ],
        },
      ],
    },
    include: {
      brand: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getOfferById(id: string) {
  return prisma.offer.findUnique({
    where: { id },
    include: {
      brand: true,
      event: true,
    },
  });
}

export async function createOffer(
  data: CreateOfferInput,
) {
  return prisma.offer.create({
    data: {
      brandId: data.brandId,
      eventId: data.eventId,
      title: data.title,
      description: data.description,
      discountText: data.discountText,
      price: data.price,
      isActive: data.isActive ?? true,
      startsAt: data.startsAt
        ? new Date(data.startsAt)
        : undefined,
      endsAt: data.endsAt
        ? new Date(data.endsAt)
        : undefined,
    },
    include: {
      brand: true,
    },
  });
}

export async function updateOffer(
  id: string,
  data: UpdateOfferInput,
) {
  return prisma.offer.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      discountText: data.discountText,
      price: data.price,
      isActive: data.isActive,
      startsAt:
        data.startsAt === null
          ? null
          : data.startsAt
            ? new Date(data.startsAt)
            : undefined,
      endsAt:
        data.endsAt === null
          ? null
          : data.endsAt
            ? new Date(data.endsAt)
            : undefined,
    },
    include: {
      brand: true,
    },
  });
}

export async function deleteOffer(id: string) {
  return prisma.offer.delete({
    where: { id },
  });
}