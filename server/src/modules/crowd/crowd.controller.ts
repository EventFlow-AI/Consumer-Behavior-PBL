import type { Request, Response } from "express";
import { predictCrowd } from "./crowd.service.js";

export async function predictCrowdController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const result = await predictCrowd({
      locationId: req.body.locationId,
      locationName: req.body.locationName,
      timestamp: new Date(req.body.timestamp),
      temperature: req.body.temperature,
      weatherCondition: req.body.weatherCondition,
      hasIncident: req.body.hasIncident,
      currentCrowd: req.body.currentCrowd,
      towardsRatio: req.body.towardsRatio,
      lag1h: req.body.lag1h,
      lag2h: req.body.lag2h,
      lag3h: req.body.lag3h,
      lag24h: req.body.lag24h,
      lag168h: req.body.lag168h,
    });

    res.status(200).json({
      success: true,
      prediction: result,
    });
  } catch (error) {
    console.error("Crowd prediction error:", error);

    res.status(500).json({
      success: false,
      message: "Crowd prediction failed",
    });
  }
}