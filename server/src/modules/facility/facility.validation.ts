import { z } from "zod";

export const facilityStatusSchema = z.enum([
  "AVAILABLE",
  "BUSY",
  "FULL",
  "CLOSED",
  "MAINTENANCE",
]);

export const createFacilitySchema = z.object({
  name: z.string().min(2, "Facility name must be at least 2 characters"),
  type: z.string().min(2, "Facility type must be at least 2 characters"),
  status: facilityStatusSchema.optional(),
  capacity: z.number().int().positive().optional(),
  description: z.string().optional(),
});

export const updateFacilitySchema = z.object({
  name: z.string().min(2, "Facility name must be at least 2 characters").optional(),
  type: z.string().min(2, "Facility type must be at least 2 characters").optional(),
  status: facilityStatusSchema.optional(),
  capacity: z.number().int().positive().optional(),
  description: z.string().optional(),
});

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;