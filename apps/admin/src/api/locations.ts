import { apiRequest } from "./client";

export type LocationType =
  | "GATE"
  | "EXIT"
  | "STAGE"
  | "STALL"
  | "WASHROOM"
  | "MEDICAL"
  | "HELP_POINT"
  | "PARKING"
  | "WATER_POINT"
  | "OTHER";

export interface LocationRecord {
  id: string;
  zoneId: string;
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  description?: string | null;
  isActive: boolean;
}

export interface LocationPayload {
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  description?: string;
  isActive?: boolean;
}

interface LocationsResponse {
  success: boolean;
  data: LocationRecord[];
}

interface LocationResponse {
  success: boolean;
  message: string;
  data: LocationRecord;
}

export async function getLocations(zoneId: string) {
  const response = await apiRequest<LocationsResponse>(
    `/zones/${zoneId}/locations`,
  );

  return response.data;
}

export async function createLocation(
  zoneId: string,
  payload: LocationPayload,
) {
  const response = await apiRequest<LocationResponse>(
    `/zones/${zoneId}/locations`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function updateLocation(
  id: string,
  payload: Partial<LocationPayload>,
) {
  const response = await apiRequest<LocationResponse>(
    `/locations/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function deleteLocation(id: string) {
  await apiRequest<{ success: boolean; message: string }>(
    `/locations/${id}`,
    {
      method: "DELETE",
    },
  );
}