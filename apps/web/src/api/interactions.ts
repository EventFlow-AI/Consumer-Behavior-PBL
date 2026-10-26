import { apiRequest } from "./client";

export type InteractionType =
  | "VIEW"
  | "CLICK"
  | "SELECT"
  | "SAVE"
  | "REDEEM";

export type ChoiceFactor =
  | "PRICE"
  | "DISCOUNT"
  | "DISTANCE"
  | "CROWD"
  | "QUEUE"
  | "BRAND_FAMILIARITY"
  | "CONVENIENCE"
  | "OTHER";

export interface CreateInteractionInput {
  eventId: string;
  brandId?: string;
  offerId?: string;
  action: InteractionType;
  factor?: ChoiceFactor;
  rating?: number;
  metadata?: unknown;
}

export interface ConsumerInteraction {
  id: string;
  userId: string;
  eventId: string;
  brandId?: string | null;
  offerId?: string | null;
  action: InteractionType;
  factor?: ChoiceFactor | null;
  rating?: number | null;
  metadata?: unknown;
  createdAt: string;
}

export async function recordInteraction(
  input: CreateInteractionInput,
) {
  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: ConsumerInteraction;
  }>("/interactions", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function getMyInteractions() {
  const response = await apiRequest<{
    success: boolean;
    data: ConsumerInteraction[];
  }>("/interactions/me");

  return response.data;
}