import type { Request, Response } from "express";
import {
  createFacility,
  deleteFacility,
  getFacilitiesByLocation,
  getFacilityById,
  locationExists,
  updateFacility,
} from "./facility.service.js";
import {
  createFacilitySchema,
  updateFacilitySchema,
} from "./facility.validation.js";

function getParamId(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export async function getFacilitiesByLocationController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const locationId = getParamId(req.params.locationId);

    const exists = await locationExists(locationId);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Location not found",
      });
      return;
    }

    const facilities = await getFacilitiesByLocation(locationId);

    res.status(200).json({
      success: true,
      data: facilities,
    });
  } catch (error) {
    console.error("Get facilities error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch facilities",
    });
  }
}

export async function getFacilityByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const facility = await getFacilityById(id);

    if (!facility) {
      res.status(404).json({
        success: false,
        message: "Facility not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: facility,
    });
  } catch (error) {
    console.error("Get facility error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch facility",
    });
  }
}

export async function createFacilityController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const locationId = getParamId(req.params.locationId);

    const exists = await locationExists(locationId);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Location not found",
      });
      return;
    }

    const parsed = createFacilitySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid facility data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const facility = await createFacility(locationId, parsed.data);

    res.status(201).json({
      success: true,
      message: "Facility created successfully",
      data: facility,
    });
  } catch (error) {
    console.error("Create facility error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create facility",
    });
  }
}

export async function updateFacilityController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existingFacility = await getFacilityById(id);

    if (!existingFacility) {
      res.status(404).json({
        success: false,
        message: "Facility not found",
      });
      return;
    }

    const parsed = updateFacilitySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid facility data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const facility = await updateFacility(id, parsed.data);

    res.status(200).json({
      success: true,
      message: "Facility updated successfully",
      data: facility,
    });
  } catch (error) {
    console.error("Update facility error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update facility",
    });
  }
}

export async function deleteFacilityController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existingFacility = await getFacilityById(id);

    if (!existingFacility) {
      res.status(404).json({
        success: false,
        message: "Facility not found",
      });
      return;
    }

    await deleteFacility(id);

    res.status(200).json({
      success: true,
      message: "Facility deleted successfully",
    });
  } catch (error) {
    console.error("Delete facility error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete facility",
    });
  }
}