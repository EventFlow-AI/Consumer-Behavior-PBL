import { apiRequest } from "./client";
import type { BrandRecord } from "./brands";

export interface OfferRecord {
  id: string;
  brandId: string;
  eventId: string;
  title: string;
  description?: string | null;
  discountText?: string | null;
  price?: number | null;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  updatedAt: string;

  brand: BrandRecord;
}

export async function getOffersByEvent(eventId: string) {
  const response = await apiRequest<{
    success: boolean;
    data: OfferRecord[];
  }>(`/events/${eventId}/offers`);

  return response.data;
}

export async function createOffer(data: {
  brandId: string;
  eventId: string;
  title: string;
  description?: string;
  discountText?: string;
  price?: number;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
}) {
  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: OfferRecord;
  }>("/offers", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function updateOffer(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    discountText: string;
    price: number;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
  }>,
) {
  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: OfferRecord;
  }>(`/offers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function deleteOffer(id: string) {
  await apiRequest<{
    success: boolean;
    message: string;
  }>(`/offers/${id}`, {
    method: "DELETE",
  });
}