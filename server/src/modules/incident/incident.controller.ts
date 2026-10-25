import type { Request, Response } from "express";
import {
  createIncident,
  eventExists,
  getIncidentById,
  getIncidentsByEvent,
  locationExists,
  updateIncident,
} from "./incident.service.js";
import {
  createIncidentSchema,
  updateIncidentSchema,
} from "./incident.validation.js";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

function getParamId(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export async function getIncidentsByEventController(
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

    const incidents = await getIncidentsByEvent(eventId);

    res.status(200).json({
      success: true,
      data: incidents,
    });
  } catch (error) {
    console.error("Get incidents error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch incidents",
    });
  }
}

export async function getIncidentByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const incident = await getIncidentById(id);

    if (!incident) {
      res.status(404).json({
        success: false,
        message: "Incident not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: incident,
    });
  } catch (error) {
    console.error("Get incident error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch incident",
    });
  }
}

export async function createIncidentController(
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

    const parsed = createIncidentSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid incident data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const exists = await eventExists(parsed.data.eventId);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    if (parsed.data.locationId) {
      const locationFound = await locationExists(
        parsed.data.locationId,
      );

      if (!locationFound) {
        res.status(404).json({
          success: false,
          message: "Location not found",
        });
        return;
      }
    }

    const incident = await createIncident(
      userId,
      parsed.data,
    );

    res.status(201).json({
      success: true,
      message: "Incident reported successfully",
      data: incident,
    });
  } catch (error) {
    console.error("Create incident error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to report incident",
    });
  }
}

export async function updateIncidentController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existingIncident = await getIncidentById(id);

    if (!existingIncident) {
      res.status(404).json({
        success: false,
        message: "Incident not found",
      });
      return;
    }

    const parsed = updateIncidentSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid incident data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const incident = await updateIncident(
      id,
      parsed.data,
    );

    res.status(200).json({
      success: true,
      message: "Incident updated successfully",
      data: incident,
    });
  } catch (error) {
    console.error("Update incident error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update incident",
    });
  }
}