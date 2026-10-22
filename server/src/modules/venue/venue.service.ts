import type { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import type {
  CreateVenueInput,
  UpdateVenueInput,
} from "./venue.validation.js";

export async function getVenuesByEvent(eventId: string) {
  return prisma.venue.findMany({
    where: {
      eventId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getVenueById(id: string) {
  return prisma.venue.findUnique({
    where: {
      id,
    },
    include: {
      zones: true,
      event: true,
    },
  });
}

export async function createVenue(
  eventId: string,
  data: CreateVenueInput,
) {
  return prisma.venue.create({
    data: {
      eventId,
      name: data.name,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      mapData: data.mapData as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function updateVenue(
  id: string,
  data: UpdateVenueInput,
) {
  return prisma.venue.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      mapData: data.mapData as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function deleteVenue(id: string) {
  return prisma.venue.delete({
    where: {
      id,
    },
  });
}

export async function eventExists(eventId: string) {
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(event);
}