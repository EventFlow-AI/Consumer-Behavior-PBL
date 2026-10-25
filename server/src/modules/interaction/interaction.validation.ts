import { z } from "zod";

export const interactionTypeSchema = z.enum([
  "VIEW",
  "CLICK",
  "SELECT",
  "SAVE",
  "REDEEM",
]);

export const choiceFactorSchema = z.enum([
  "PRICE",
  "DISCOUNT",
  "DISTANCE",
  "CROWD",
  "QUEUE",
  "BRAND_FAMILIARITY",
  "CONVENIENCE",
  "OTHER",
]);

export const createInteractionSchema = z.object({
  eventId: z.string().uuid(),
  brandId: z.string().uuid().optional(),
  offerId: z.string().uuid().optional(),
  action: interactionTypeSchema,
  factor: choiceFactorSchema.optional(),
  rating: z.number().int().min(1).max(5).optional(),
  metadata: z.unknown().optional(),
});

export type CreateInteractionInput = z.infer<
  typeof createInteractionSchema
>;