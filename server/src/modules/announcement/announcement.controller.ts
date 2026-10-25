import type { Request, Response } from "express";
import {
  createAnnouncement,
  deleteAnnouncement,
  eventExists,
  getActiveAnnouncementsByEvent,
  getAnnouncementById,
  getAnnouncementsByEvent,
  updateAnnouncement,
} from "./announcement.service.js";
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from "./announcement.validation.js";

function getParamId(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export async function getAnnouncementsByEventController(
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

    const announcements =
      await getAnnouncementsByEvent(eventId);

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
}

export async function getActiveAnnouncementsController(
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

    const announcements =
      await getActiveAnnouncementsByEvent(eventId);

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error(
      "Get active announcements error:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
}

export async function createAnnouncementController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const parsed = createAnnouncementSchema.safeParse(
      req.body,
    );

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid announcement data",
        errors: parsed.error.flatten(),
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

    const announcement =
      await createAnnouncement(parsed.data);

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
}

export async function updateAnnouncementController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existing =
      await getAnnouncementById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
      return;
    }

    const parsed = updateAnnouncementSchema.safeParse(
      req.body,
    );

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid announcement data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const announcement =
      await updateAnnouncement(id, parsed.data);

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Update announcement error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update announcement",
    });
  }
}

export async function deleteAnnouncementController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existing =
      await getAnnouncementById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
      return;
    }

    await deleteAnnouncement(id);

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
    });
  }
}