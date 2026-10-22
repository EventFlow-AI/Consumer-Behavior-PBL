import { z } from "zod";

export const updatePreferencesSchema = z.object({
  priceSensitivity: z.number().int().min(1).max(5).optional(),
  crowdPreference: z.number().int().min(1).max(5).optional(),
  walkingPreference: z.number().int().min(1).max(5).optional(),
  accessibility: z.boolean().optional(),
  brandPreference: z.string().optional(),
  foodPreferences: z.unknown().optional(),
});

export type UpdatePreferencesInput = z.infer<
  typeof updatePreferencesSchema
>;