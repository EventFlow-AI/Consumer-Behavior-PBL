import { z } from "zod";

export const eventTypeSchema = z.enum([
  "CONCERT",
  "SPORTS",
  "PILGRIMAGE",
  "FESTIVAL",
  "EXHIBITION",
  "CONFERENCE",
  "COLLEGE_FEST",
  "OTHER",
]);

export const eventStatusSchema = z.enum([
  "DRAFT",
  "UPCOMING",
  "LIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const createEventSchema = z
  .object({
    name: z.string().min(2, "Event name must be at least 2 characters"),
    description: z.string().optional(),
    eventType: eventTypeSchema,
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    status: eventStatusSchema.optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const updateEventSchema = z
  .object({
    name: z.string().min(2, "Event name must be at least 2 characters").optional(),
    description: z.string().optional(),
    eventType: eventTypeSchema.optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    status: eventStatusSchema.optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }

      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;