import prisma from "../../config/prisma.js";
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "./announcement.validation.js";

export async function eventExists(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  return Boolean(event);
}

export async function getAnnouncementsByEvent(eventId: string) {
  return prisma.announcement.findMany({
    where: { eventId },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getActiveAnnouncementsByEvent(
  eventId: string,
) {
  const now = new Date();

  return prisma.announcement.findMany({
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
    orderBy: [
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  });
}

export async function getAnnouncementById(id: string) {
  return prisma.announcement.findUnique({
    where: { id },
  });
}

export async function createAnnouncement(
  data: CreateAnnouncementInput,
) {
  return prisma.announcement.create({
    data: {
      eventId: data.eventId,
      title: data.title,
      message: data.message,
      priority: data.priority ?? "INFO",
      isActive: data.isActive ?? true,
      startsAt: data.startsAt
        ? new Date(data.startsAt)
        : undefined,
      endsAt: data.endsAt
        ? new Date(data.endsAt)
        : undefined,
    },
  });
}

export async function updateAnnouncement(
  id: string,
  data: UpdateAnnouncementInput,
) {
  return prisma.announcement.update({
    where: { id },
    data: {
      title: data.title,
      message: data.message,
      priority: data.priority,
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
  });
}

export async function deleteAnnouncement(id: string) {
  return prisma.announcement.delete({
    where: { id },
  });
}