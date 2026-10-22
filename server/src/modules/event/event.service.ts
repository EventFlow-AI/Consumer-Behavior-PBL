import prisma from "../../config/prisma.js";
import type {
  CreateEventInput,
  UpdateEventInput,
} from "./event.validation.js";

export async function getEvents() {
  return prisma.event.findMany({
    orderBy: {
      startTime: "asc",
    },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      venues: true,
    },
  });
}

export async function createEvent(data: CreateEventInput) {
  return prisma.event.create({
    data: {
      name: data.name,
      description: data.description,
      eventType: data.eventType,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status ?? "DRAFT",
      imageUrl: data.imageUrl,
    },
  });
}

export async function updateEvent(
  id: string,
  data: UpdateEventInput,
) {
  return prisma.event.update({
    where: { id },
    data,
  });
}

export async function deleteEvent(id: string) {
  return prisma.event.delete({
    where: { id },
  });
}