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

export async function getEvents() {
  const response = await apiRequest<{
    success: boolean;
    data: EventRecord[];
  }>("/events");

  return response.data;
}