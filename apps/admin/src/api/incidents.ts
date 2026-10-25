import { apiRequest } from "./client";

export type IncidentType =
  | "MEDICAL"
  | "SECURITY"
  | "FIRE"
  | "CROWD"
  | "LOST_PERSON"
  | "INFRASTRUCTURE"
  | "OTHER";

export type IncidentSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type IncidentStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export interface IncidentRecord {
  id: string;
  eventId: string;
  locationId?: string | null;
  reportedById: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;

  location?: {
    id: string;
    name: string;
    type: string;
  } | null;

  reportedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export async function getIncidentsByEvent(eventId: string) {
  return apiRequest<{
    success: boolean;
    data: IncidentRecord[];
  }>(`/events/${eventId}/incidents`);
}

export async function updateIncident(
  incidentId: string,
  data: Partial<{
    severity: IncidentSeverity;
    status: IncidentStatus;
    title: string;
    description: string;
  }>,
) {
  return apiRequest<{
    success: boolean;
    message: string;
    data: IncidentRecord;
  }>(`/incidents/${incidentId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}