import type { Request, Response } from "express";
import {
  createZone,
  deleteZone,
  getZoneById,
  getZonesByVenue,
  updateZone,
  venueExists,
} from "./zone.service.js";
import {
  createZoneSchema,
  updateZoneSchema,
} from "./zone.validation.js";

function getParamId(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export async function getZonesByVenueController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const venueId = getParamId(req.params.venueId);

    const exists = await venueExists(venueId);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Venue not found",
      });
      return;
    }

    const zones = await getZonesByVenue(venueId);

    res.status(200).json({
      success: true,
      data: zones,
    });
  } catch (error) {
    console.error("Get zones error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch zones",
    });
  }
}

export async function getZoneByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const zone = await getZoneById(id);

    if (!zone) {
      res.status(404).json({
        success: false,
        message: "Zone not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: zone,
    });
  } catch (error) {
    console.error("Get zone error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch zone",
    });
  }
}

export async function createZoneController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const venueId = getParamId(req.params.venueId);

    const exists = await venueExists(venueId);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Venue not found",
      });
      return;
    }

    const parsed = createZoneSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid zone data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const zone = await createZone(venueId, parsed.data);

    res.status(201).json({
      success: true,
      message: "Zone created successfully",
      data: zone,
    });
  } catch (error) {
    console.error("Create zone error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create zone",
    });
  }
}

export async function updateZoneController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existingZone = await getZoneById(id);

    if (!existingZone) {
      res.status(404).json({
        success: false,
        message: "Zone not found",
      });
      return;
    }

    const parsed = updateZoneSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid zone data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const zone = await updateZone(id, parsed.data);

    res.status(200).json({
      success: true,
      message: "Zone updated successfully",
      data: zone,
    });
  } catch (error) {
    console.error("Update zone error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update zone",
    });
  }
}

export async function deleteZoneController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existingZone = await getZoneById(id);

    if (!existingZone) {
      res.status(404).json({
        success: false,
        message: "Zone not found",
      });
      return;
    }

    await deleteZone(id);

    res.status(200).json({
      success: true,
      message: "Zone deleted successfully",
    });
  } catch (error) {
    console.error("Delete zone error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete zone",
    });
  }
}