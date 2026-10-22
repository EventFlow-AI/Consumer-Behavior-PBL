import type { Request, Response } from "express";
import {
  createVenue,
  deleteVenue,
  eventExists,
  getVenueById,
  getVenuesByEvent,
  updateVenue,
} from "./venue.service.js";
import {
  createVenueSchema,
  updateVenueSchema,
} from "./venue.validation.js";

function getParamId(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export async function getVenuesByEventController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const eventId = getParamId(req.params.eventId);

    const exists = await eventExists(eventId);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    const venues = await getVenuesByEvent(eventId);

    res.status(200).json({
      success: true,
      data: venues,
    });
  } catch (error) {
    console.error("Get venues error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch venues",
    });
  }
}

export async function getVenueByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const venue = await getVenueById(id);

    if (!venue) {
      res.status(404).json({
        success: false,
        message: "Venue not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: venue,
    });
  } catch (error) {
    console.error("Get venue error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch venue",
    });
  }
}

export async function createVenueController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const eventId = getParamId(req.params.eventId);

    const exists = await eventExists(eventId);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    const parsed = createVenueSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid venue data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const venue = await createVenue(eventId, parsed.data);

    res.status(201).json({
      success: true,
      message: "Venue created successfully",
      data: venue,
    });
  } catch (error) {
    console.error("Create venue error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create venue",
    });
  }
}

export async function updateVenueController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existingVenue = await getVenueById(id);

    if (!existingVenue) {
      res.status(404).json({
        success: false,
        message: "Venue not found",
      });
      return;
    }

    const parsed = updateVenueSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid venue data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const venue = await updateVenue(id, parsed.data);

    res.status(200).json({
      success: true,
      message: "Venue updated successfully",
      data: venue,
    });
  } catch (error) {
    console.error("Update venue error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update venue",
    });
  }
}

export async function deleteVenueController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existingVenue = await getVenueById(id);

    if (!existingVenue) {
      res.status(404).json({
        success: false,
        message: "Venue not found",
      });
      return;
    }

    await deleteVenue(id);

    res.status(200).json({
      success: true,
      message: "Venue deleted successfully",
    });
  } catch (error) {
    console.error("Delete venue error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete venue",
    });
  }
}