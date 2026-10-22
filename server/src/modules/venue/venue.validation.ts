import { z } from "zod";

export const createVenueSchema = z.object({
  name: z.string().min(2, "Venue name must be at least 2 characters"),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  mapData: z.unknown().optional(),
});

export const updateVenueSchema = z.object({
  name: z.string().min(2, "Venue name must be at least 2 characters").optional(),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  mapData: z.unknown().optional(),
});

export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;