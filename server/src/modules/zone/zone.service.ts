import type { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import type {
  CreateZoneInput,
  UpdateZoneInput,
} from "./zone.validation.js";

export async function getZonesByVenue(venueId: string) {
  return prisma.zone.findMany({
    where: {
      venueId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getZoneById(id: string) {
  return prisma.zone.findUnique({
    where: {
      id,
    },
    include: {
      venue: true,
      locations: true,
    },
  });
}

export async function createZone(
  venueId: string,
  data: CreateZoneInput,
) {
  return prisma.zone.create({
    data: {
      venueId,
      name: data.name,
      description: data.description,
      capacity: data.capacity,
      geometry: data.geometry as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function updateZone(
  id: string,
  data: UpdateZoneInput,
) {
  return prisma.zone.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      description: data.description,
      capacity: data.capacity,
      geometry: data.geometry as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function deleteZone(id: string) {
  return prisma.zone.delete({
    where: {
      id,
    },
  });
}

export async function venueExists(venueId: string) {
  const venue = await prisma.venue.findUnique({
    where: {
      id: venueId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(venue);
}