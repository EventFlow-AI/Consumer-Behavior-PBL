import { apiRequest } from "./client";

export type EventStatus =
  | "DRAFT"
  | "UPCOMING"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED";

export type EventType =
  | "CONCERT"
  | "SPORTS"
  | "PILGRIMAGE"
  | "FESTIVAL"
  | "EXHIBITION"
  | "CONFERENCE"
  | "COLLEGE_FEST"
  | "OTHER";

export interface EventRecord {
  id: string;
  name: string;
  description?: string | null;
  eventType: EventType;
  startTime: string;
  endTime: string;
  status: EventStatus;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EventsResponse {
  success: boolean;
  data: EventRecord[];
}

export async function getEvents() {
  const response = await apiRequest<EventsResponse>("/events");

  return response.data;
}
export interface CreateEventPayload {
  name: string;
  description?: string;
  eventType: EventType;
  startTime: string;
  endTime: string;
  status?: EventStatus;
  imageUrl?: string;
}

interface EventResponse {
  success: boolean;
  message: string;
  data: EventRecord;
}

export async function createEvent(payload: CreateEventPayload) {
  const response = await apiRequest<EventResponse>("/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export interface UpdateEventPayload {
  name?: string;
  description?: string;
  eventType?: EventType;
  startTime?: string;
  endTime?: string;
  status?: EventStatus;
  imageUrl?: string;
}

export async function updateEvent(
  id: string,
  payload: UpdateEventPayload,
) {
  const response = await apiRequest<EventResponse>(`/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function deleteEvent(id: string) {
  await apiRequest<{ success: boolean; message: string }>(
    `/events/${id}`,
    {
      method: "DELETE",
    },
  );
}