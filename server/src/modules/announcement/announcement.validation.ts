import { z } from "zod";

export const announcementPrioritySchema = z.enum([
  "INFO",
  "IMPORTANT",
  "URGENT",
]);

export const createAnnouncementSchema = z
  .object({
    eventId: z.string().uuid(),
    title: z.string().min(3),
    message: z.string().min(5),
    priority: announcementPrioritySchema.optional(),
    isActive: z.boolean().optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
  })
  .refine(
    (data) =>
      !data.startsAt ||
      !data.endsAt ||
      new Date(data.endsAt) > new Date(data.startsAt),
    {
      message: "endsAt must be after startsAt",
      path: ["endsAt"],
    },
  );

export const updateAnnouncementSchema = z
  .object({
    title: z.string().min(3).optional(),
    message: z.string().min(5).optional(),
    priority: announcementPrioritySchema.optional(),
    isActive: z.boolean().optional(),
    startsAt: z.string().datetime().nullable().optional(),
    endsAt: z.string().datetime().nullable().optional(),
  })
  .refine(
    (data) =>
      !data.startsAt ||
      !data.endsAt ||
      new Date(data.endsAt) > new Date(data.startsAt),
    {
      message: "endsAt must be after startsAt",
      path: ["endsAt"],
    },
  );

export type CreateAnnouncementInput = z.infer<
  typeof createAnnouncementSchema
>;

export type UpdateAnnouncementInput = z.infer<
  typeof updateAnnouncementSchema
>;