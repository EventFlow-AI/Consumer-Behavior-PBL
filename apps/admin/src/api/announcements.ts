import { apiRequest } from "./client";

export type AnnouncementPriority =
  | "INFO"
  | "IMPORTANT"
  | "URGENT";

export interface AnnouncementRecord {
  id: string;
  eventId: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getAnnouncementsByEvent(
  eventId: string,
) {
  return apiRequest<{
    success: boolean;
    data: AnnouncementRecord[];
  }>(`/events/${eventId}/announcements`);
}

export async function createAnnouncement(data: {
  eventId: string;
  title: string;
  message: string;
  priority?: AnnouncementPriority;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
}) {
  return apiRequest<{
    success: boolean;
    message: string;
    data: AnnouncementRecord;
  }>("/announcements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAnnouncement(
  id: string,
  data: Partial<{
    title: string;
    message: string;
    priority: AnnouncementPriority;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
  }>,
) {
  return apiRequest<{
    success: boolean;
    message: string;
    data: AnnouncementRecord;
  }>(`/announcements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAnnouncement(id: string) {
  return apiRequest<{
    success: boolean;
    message: string;
  }>(`/announcements/${id}`, {
    method: "DELETE",
  });
}