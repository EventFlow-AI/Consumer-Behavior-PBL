import { apiRequest } from "./client";

export type FacilityStatus =
  | "AVAILABLE"
  | "BUSY"
  | "FULL"
  | "CLOSED"
  | "MAINTENANCE";

export interface FacilityRecord {
  id: string;
  locationId: string;
  name: string;
  type: string;
  status: FacilityStatus;
  capacity?: number | null;
  description?: string | null;
}

export interface FacilityPayload {
  name: string;
  type: string;
  status?: FacilityStatus;
  capacity?: number;
  description?: string;
}

interface FacilitiesResponse {
  success: boolean;
  data: FacilityRecord[];
}

interface FacilityResponse {
  success: boolean;
  message: string;
  data: FacilityRecord;
}

export async function getFacilities(locationId: string) {
  const response = await apiRequest<FacilitiesResponse>(
    `/locations/${locationId}/facilities`,
  );

  return response.data;
}

export async function createFacility(
  locationId: string,
  payload: FacilityPayload,
) {
  const response = await apiRequest<FacilityResponse>(
    `/locations/${locationId}/facilities`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function updateFacility(
  id: string,
  payload: Partial<FacilityPayload>,
) {
  const response = await apiRequest<FacilityResponse>(
    `/facilities/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function deleteFacility(id: string) {
  await apiRequest<{ success: boolean; message: string }>(
    `/facilities/${id}`,
    {
      method: "DELETE",
    },
  );
}