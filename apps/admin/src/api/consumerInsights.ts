import { apiRequest } from "./client";

export interface ConsumerInsights {
  totalInteractions: number;

  interactionBreakdown: Array<{
    action: string;
    count: number;
  }>;

  factorBreakdown: Array<{
    factor: string | null;
    count: number;
  }>;

  topFactor: {
    factor: string | null;
    count: number;
  } | null;

  topBrands: Array<{
    brand?: {
      id: string;
      name: string;
      category: string;
    };
    interactions: number;
  }>;

  topOffers: Array<{
    offer?: {
      id: string;
      title: string;
      discountText?: string | null;
      brand: {
        id: string;
        name: string;
      };
    };
    interactions: number;
  }>;
}

export async function getConsumerInsights(
  eventId?: string,
) {
  const query = eventId
    ? `?eventId=${encodeURIComponent(eventId)}`
    : "";

  const response = await apiRequest<{
    success: boolean;
    data: ConsumerInsights;
  }>(`/admin/consumer-insights${query}`);

  return response.data;
}