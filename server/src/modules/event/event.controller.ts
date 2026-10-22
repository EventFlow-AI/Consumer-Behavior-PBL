import type { Request, Response } from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
} from "./event.service.js";
import {
  createEventSchema,
  updateEventSchema,
} from "./event.validation.js";

function getParamId(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export async function getEventsController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const events = await getEvents();

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Get events error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
}

export async function getEventByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const event = await getEventById(id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Get event error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
}

export async function createEventController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const parsed = createEventSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid event data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const event = await createEvent(parsed.data);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
}

export async function updateEventController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existingEvent = await getEventById(id);

    if (!existingEvent) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    const parsed = updateEventSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid event data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const event = await updateEvent(id, parsed.data);

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Update event error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
}

export async function deleteEventController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existingEvent = await getEventById(id);

    if (!existingEvent) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    await deleteEvent(id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
}