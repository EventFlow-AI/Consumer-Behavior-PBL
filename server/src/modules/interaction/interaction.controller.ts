import type { Request, Response } from "express";
import {
  brandExists,
  createInteraction,
  eventExists,
  getMyInteractions,
  offerExists,
} from "./interaction.service.js";
import { createInteractionSchema } from "./interaction.validation.js";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export async function createInteractionController(
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

    const parsed = createInteractionSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid interaction data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const data = parsed.data;

    if (!(await eventExists(data.eventId))) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    if (data.brandId && !(await brandExists(data.brandId))) {
      res.status(404).json({
        success: false,
        message: "Brand not found",
      });
      return;
    }

    if (data.offerId) {
      const offer = await offerExists(data.offerId);

      if (!offer) {
        res.status(404).json({
          success: false,
          message: "Offer not found",
        });
        return;
      }

      if (offer.eventId !== data.eventId) {
        res.status(400).json({
          success: false,
          message:
            "Selected offer does not belong to the selected event",
        });
        return;
      }

      if (
        data.brandId &&
        offer.brandId !== data.brandId
      ) {
        res.status(400).json({
          success: false,
          message:
            "Selected offer does not belong to the selected brand",
        });
        return;
      }
    }

    const interaction = await createInteraction(
      userId,
      data,
    );

    res.status(201).json({
      success: true,
      message: "Consumer interaction recorded successfully",
      data: interaction,
    });
  } catch (error) {
    console.error("Create interaction error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to record interaction",
    });
  }
}

export async function getMyInteractionsController(
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

    const interactions =
      await getMyInteractions(userId);

    res.status(200).json({
      success: true,
      data: interactions,
    });
  } catch (error) {
    console.error("Get interactions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch interactions",
    });
  }
}