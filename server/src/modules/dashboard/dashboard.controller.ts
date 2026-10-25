import type { Request, Response } from "express";
import { getDashboardSummary } from "./dashboard.service.js";

export async function getDashboardController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = await getDashboardSummary();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
}