import { apiRequest } from "./client";

export interface VenueRecord {
  id: string;
  eventId: string;
  name: string;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapData?: unknown;
  createdAt: string;
}

export interface CreateVenuePayload {
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateVenuePayload {
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

interface VenuesResponse {
  success: boolean;
  data: VenueRecord[];
}

interface VenueResponse {
  success: boolean;
  message: string;
  data: VenueRecord;
}

export async function getVenues(eventId: string) {
  const response = await apiRequest<VenuesResponse>(
    `/events/${eventId}/venues`,
  );

  return response.data;
}

export async function createVenue(
  eventId: string,
  payload: CreateVenuePayload,
) {
  const response = await apiRequest<VenueResponse>(
    `/events/${eventId}/venues`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function updateVenue(
  id: string,
  payload: UpdateVenuePayload,
) {
  const response = await apiRequest<VenueResponse>(
    `/venues/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function deleteVenue(id: string) {
  await apiRequest<{ success: boolean; message: string }>(
    `/venues/${id}`,
    {
      method: "DELETE",
    },
  );
}