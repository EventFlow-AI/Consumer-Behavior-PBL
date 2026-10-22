import type { Request, Response } from "express";
import {
  getUserPreferences,
  upsertUserPreferences,
} from "./preferences.service.js";
import { updatePreferencesSchema } from "./preferences.validation.js";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export async function getMyPreferencesController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const preferences = await getUserPreferences(userId);

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("Get preferences error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch preferences",
    });
  }
}

export async function updateMyPreferencesController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const parsed = updatePreferencesSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid preference data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const preferences = await upsertUserPreferences(
      userId,
      parsed.data,
    );

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: preferences,
    });
  } catch (error) {
    console.error("Update preferences error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update preferences",
    });
  }
}