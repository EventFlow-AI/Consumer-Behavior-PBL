import prisma from "../../config/prisma.js";
import type {
  CreateIncidentInput,
  UpdateIncidentInput,
} from "./incident.validation.js";

export async function getIncidentsByEvent(eventId: string) {
  return prisma.incident.findMany({
    where: {
      eventId,
    },
    include: {
      location: true,
      reportedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getIncidentById(id: string) {
  return prisma.incident.findUnique({
    where: {
      id,
    },
    include: {
      event: true,
      location: true,
      reportedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function createIncident(
  reportedById: string,
  data: CreateIncidentInput,
) {
  return prisma.incident.create({
    data: {
      eventId: data.eventId,
      locationId: data.locationId,
      reportedById,
      type: data.type,
      severity: data.severity ?? "MEDIUM",
      title: data.title,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  });
}

export async function updateIncident(
  id: string,
  data: UpdateIncidentInput,
) {
  const shouldResolve =
    data.status === "RESOLVED" || data.status === "CLOSED";

  return prisma.incident.update({
    where: {
      id,
    },
    data: {
      severity: data.severity,
      status: data.status,
      title: data.title,
      description: data.description,
      resolvedAt: shouldResolve ? new Date() : undefined,
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