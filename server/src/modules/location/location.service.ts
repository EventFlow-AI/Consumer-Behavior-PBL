import prisma from "../../config/prisma.js";
import type {
  CreateLocationInput,
  UpdateLocationInput,
} from "./location.validation.js";

export async function getLocationsByZone(zoneId: string) {
  return prisma.location.findMany({
    where: {
      zoneId,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getLocationById(id: string) {
  return prisma.location.findUnique({
    where: {
      id,
    },
    include: {
      zone: true,
      facilities: true,
    },
  });
}

export async function createLocation(
  zoneId: string,
  data: CreateLocationInput,
) {
  return prisma.location.create({
    data: {
      zoneId,
      name: data.name,
      type: data.type,
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateLocation(
  id: string,
  data: UpdateLocationInput,
) {
  return prisma.location.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteLocation(id: string) {
  return prisma.location.delete({
    where: {
      id,
    },
  });
}

export async function zoneExists(zoneId: string) {
  const zone = await prisma.zone.findUnique({
    where: {
      id: zoneId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(zone);
}