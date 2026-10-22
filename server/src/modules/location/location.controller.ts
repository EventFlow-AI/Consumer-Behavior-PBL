import type { Request, Response } from "express";
import {
  createLocation,
  deleteLocation,
  getLocationById,
  getLocationsByZone,
  updateLocation,
  zoneExists,
} from "./location.service.js";
import {
  createLocationSchema,
  updateLocationSchema,
} from "./location.validation.js";

function getParamId(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export async function getLocationsByZoneController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const zoneId = getParamId(req.params.zoneId);

    const exists = await zoneExists(zoneId);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Zone not found",
      });
      return;
    }

    const locations = await getLocationsByZone(zoneId);

    res.status(200).json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Get locations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
    });
  }
}

export async function getLocationByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const location = await getLocationById(id);

    if (!location) {
      res.status(404).json({
        success: false,
        message: "Location not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Get location error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch location",
    });
  }
}

export async function createLocationController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const zoneId = getParamId(req.params.zoneId);

    const exists = await zoneExists(zoneId);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Zone not found",
      });
      return;
    }

    const parsed = createLocationSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid location data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const location = await createLocation(zoneId, parsed.data);

    res.status(201).json({
      success: true,
      message: "Location created successfully",
      data: location,
    });
  } catch (error) {
    console.error("Create location error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create location",
    });
  }
}

export async function updateLocationController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existingLocation = await getLocationById(id);

    if (!existingLocation) {
      res.status(404).json({
        success: false,
        message: "Location not found",
      });
      return;
    }

    const parsed = updateLocationSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid location data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const location = await updateLocation(id, parsed.data);

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: location,
    });
  } catch (error) {
    console.error("Update location error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update location",
    });
  }
}

export async function deleteLocationController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existingLocation = await getLocationById(id);

    if (!existingLocation) {
      res.status(404).json({
        success: false,
        message: "Location not found",
      });
      return;
    }

    await deleteLocation(id);

    res.status(200).json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Delete location error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete location",
    });
  }
}