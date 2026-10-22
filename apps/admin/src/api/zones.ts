import { apiRequest } from "./client";

export interface ZoneRecord {
  id: string;
  venueId: string;
  name: string;
  description?: string | null;
  capacity?: number | null;
  geometry?: unknown;
  createdAt: string;
}

export interface CreateZonePayload {
  name: string;
  description?: string;
  capacity?: number;
}

export interface UpdateZonePayload {
  name?: string;
  description?: string;
  capacity?: number;
}

interface ZonesResponse {
  success: boolean;
  data: ZoneRecord[];
}

interface ZoneResponse {
  success: boolean;
  message: string;
  data: ZoneRecord;
}

export async function getZones(venueId: string) {
  const response = await apiRequest<ZonesResponse>(
    `/venues/${venueId}/zones`,
  );

  return response.data;
}

export async function createZone(
  venueId: string,
  payload: CreateZonePayload,
) {
  const response = await apiRequest<ZoneResponse>(
    `/venues/${venueId}/zones`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function updateZone(
  id: string,
  payload: UpdateZonePayload,
) {
  const response = await apiRequest<ZoneResponse>(
    `/zones/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function deleteZone(id: string) {
  await apiRequest<{ success: boolean; message: string }>(
    `/zones/${id}`,
    {
      method: "DELETE",
    },
  );
}