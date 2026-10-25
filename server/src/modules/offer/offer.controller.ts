import type { Request, Response } from "express";
import {
  brandExists,
  createOffer,
  deleteOffer,
  eventExists,
  getActiveOffersByEvent,
  getOfferById,
  getOffersByEvent,
  updateOffer,
} from "./offer.service.js";
import {
  createOfferSchema,
  updateOfferSchema,
} from "./offer.validation.js";

function getParamId(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export async function getOffersByEventController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const eventId = getParamId(req.params.eventId);

    if (!(await eventExists(eventId))) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    const offers = await getOffersByEvent(eventId);

    res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error("Get offers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
    });
  }
}

export async function getActiveOffersByEventController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const eventId = getParamId(req.params.eventId);

    if (!(await eventExists(eventId))) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    const offers = await getActiveOffersByEvent(eventId);

    res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error("Get active offers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch active offers",
    });
  }
}

export async function getOfferByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const offer = await getOfferById(id);

    if (!offer) {
      res.status(404).json({
        success: false,
        message: "Offer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error("Get offer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch offer",
    });
  }
}

export async function createOfferController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const parsed = createOfferSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid offer data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    if (!(await brandExists(parsed.data.brandId))) {
      res.status(404).json({
        success: false,
        message: "Brand not found",
      });
      return;
    }

    if (!(await eventExists(parsed.data.eventId))) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    const offer = await createOffer(parsed.data);

    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Create offer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create offer",
    });
  }
}

export async function updateOfferController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existing = await getOfferById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Offer not found",
      });
      return;
    }

    const parsed = updateOfferSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid offer data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const offer = await updateOffer(id, parsed.data);

    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Update offer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update offer",
    });
  }
}

export async function deleteOfferController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existing = await getOfferById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Offer not found",
      });
      return;
    }

    await deleteOffer(id);

    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete offer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete offer",
    });
  }
}