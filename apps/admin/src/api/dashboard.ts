import { apiRequest } from "./client";

export interface DashboardSummary {
  events: {
    total: number;
    live: number;
    upcoming: number;
  };

  infrastructure: {
    venues: number;
    zones: number;
    locations: number;
    facilities: number;
  };

  incidents: {
    active: number;
    critical: number;
  };

  announcements: {
    active: number;
    urgent: number;
  };

  recentIncidents: Array<{
    id: string;
    title: string;
    type: string;
    severity: string;
    status: string;
    createdAt: string;
    event: {
      id: string;
      name: string;
    };
    location?: {
      id: string;
      name: string;
    } | null;
  }>;
}

export async function getDashboardSummary() {
  const response = await apiRequest<{
    success: boolean;
    data: DashboardSummary;
  }>("/admin/dashboard");

  return response.data;
}