import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export const updateBrandSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export type CreateBrandInput = z.infer<
  typeof createBrandSchema
>;

export type UpdateBrandInput = z.infer<
  typeof updateBrandSchema
>;