import { apiRequest } from "./client";
import type { EventRecord } from "./events";

export interface VenueRecord {
  id: string;
  eventId: string;
  name: string;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ZoneRecord {
  id: string;
  venueId: string;
  name: string;
  description?: string | null;
  capacity?: number | null;
}

export interface LocationRecord {
  id: string;
  zoneId: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  description?: string | null;
  isActive: boolean;
}

export interface FacilityRecord {
  id: string;
  locationId: string;
  name: string;
  type: string;
  status: string;
  capacity?: number | null;
  description?: string | null;
}

export interface AnnouncementRecord {
  id: string;
  eventId: string;
  title: string;
  message: string;
  priority: "INFO" | "IMPORTANT" | "URGENT";
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
}

export interface ActiveOffer {
  id: string;
  title: string;
  description?: string | null;
  discountText?: string | null;
  price?: number | null;
  brand: {
    id: string;
    name: string;
    category: string;
  };
}

export async function getEvent(id: string) {
  const response = await apiRequest<{
    success: boolean;
    data: EventRecord;
  }>(`/events/${id}`);

  return response.data;
}

export async function getVenues(eventId: string) {
  const response = await apiRequest<{
    success: boolean;
    data: VenueRecord[];
  }>(`/events/${eventId}/venues`);

  return response.data;
}

export async function getZones(venueId: string) {
  const response = await apiRequest<{
    success: boolean;
    data: ZoneRecord[];
  }>(`/venues/${venueId}/zones`);

  return response.data;
}

export async function getLocations(zoneId: string) {
  const response = await apiRequest<{
    success: boolean;
    data: LocationRecord[];
  }>(`/zones/${zoneId}/locations`);

  return response.data;
}

export async function getFacilities(locationId: string) {
  const response = await apiRequest<{
    success: boolean;
    data: FacilityRecord[];
  }>(`/locations/${locationId}/facilities`);

  return response.data;
}

export async function getActiveAnnouncements(eventId: string) {
  const response = await apiRequest<{
    success: boolean;
    data: AnnouncementRecord[];
  }>(`/events/${eventId}/announcements/active`);

  return response.data;
}

export async function getActiveOffers(eventId: string) {
  const response = await apiRequest<{
    success: boolean;
    data: ActiveOffer[];
  }>(`/events/${eventId}/offers/active`);

  return response.data;
}