import type { Request, Response } from "express";
import { getConsumerInsights } from "./consumer-insights.service.js";

function getQueryString(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export async function getConsumerInsightsController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const eventId = getQueryString(req.query.eventId as
      | string
      | string[]
      | undefined);

    const data = await getConsumerInsights(eventId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Consumer insights error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load consumer insights",
    });
  }
}