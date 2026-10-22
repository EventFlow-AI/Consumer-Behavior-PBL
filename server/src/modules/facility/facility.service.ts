import prisma from "../../config/prisma.js";
import type {
  CreateFacilityInput,
  UpdateFacilityInput,
} from "./facility.validation.js";

export async function getFacilitiesByLocation(locationId: string) {
  return prisma.facility.findMany({
    where: {
      locationId,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getFacilityById(id: string) {
  return prisma.facility.findUnique({
    where: {
      id,
    },
    include: {
      location: true,
    },
  });
}

export async function createFacility(
  locationId: string,
  data: CreateFacilityInput,
) {
  return prisma.facility.create({
    data: {
      locationId,
      name: data.name,
      type: data.type,
      status: data.status ?? "AVAILABLE",
      capacity: data.capacity,
      description: data.description,
    },
  });
}

export async function updateFacility(
  id: string,
  data: UpdateFacilityInput,
) {
  return prisma.facility.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteFacility(id: string) {
  return prisma.facility.delete({
    where: {
      id,
    },
  });
}

export async function locationExists(locationId: string) {
  const location = await prisma.location.findUnique({
    where: {
      id: locationId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(location);
}