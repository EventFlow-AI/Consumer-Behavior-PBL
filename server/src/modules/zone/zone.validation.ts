import { z } from "zod";

export const createZoneSchema = z.object({
  name: z.string().min(2, "Zone name must be at least 2 characters"),
  description: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  geometry: z.unknown().optional(),
});

export const updateZoneSchema = z.object({
  name: z.string().min(2, "Zone name must be at least 2 characters").optional(),
  description: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  geometry: z.unknown().optional(),
});

export type CreateZoneInput = z.infer<typeof createZoneSchema>;
export type UpdateZoneInput = z.infer<typeof updateZoneSchema>;