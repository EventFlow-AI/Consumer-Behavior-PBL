import { z } from "zod";

export const locationTypeSchema = z.enum([
  "GATE",
  "EXIT",
  "STAGE",
  "STALL",
  "WASHROOM",
  "MEDICAL",
  "HELP_POINT",
  "PARKING",
  "WATER_POINT",
  "OTHER",
]);

export const createLocationSchema = z.object({
  name: z.string().min(2, "Location name must be at least 2 characters"),
  type: locationTypeSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateLocationSchema = z.object({
  name: z.string().min(2, "Location name must be at least 2 characters").optional(),
  type: locationTypeSchema.optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;