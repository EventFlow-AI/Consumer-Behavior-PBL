import { z } from "zod";

export const createOfferSchema = z
  .object({
    brandId: z.string().uuid(),
    eventId: z.string().uuid(),
    title: z.string().min(3),
    description: z.string().optional(),
    discountText: z.string().optional(),
    price: z.number().nonnegative().optional(),
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

export const updateOfferSchema = z
  .object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    discountText: z.string().optional(),
    price: z.number().nonnegative().optional(),
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

export type CreateOfferInput = z.infer<
  typeof createOfferSchema
>;

export type UpdateOfferInput = z.infer<
  typeof updateOfferSchema
>;