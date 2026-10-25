import { z } from "zod";

export const incidentTypeSchema = z.enum([
  "MEDICAL",
  "SECURITY",
  "FIRE",
  "CROWD",
  "LOST_PERSON",
  "INFRASTRUCTURE",
  "OTHER",
]);

export const incidentSeveritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const incidentStatusSchema = z.enum([
  "OPEN",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

export const createIncidentSchema = z.object({
  eventId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  type: incidentTypeSchema,
  severity: incidentSeveritySchema.optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateIncidentSchema = z.object({
  severity: incidentSeveritySchema.optional(),
  status: incidentStatusSchema.optional(),
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
});

export type CreateIncidentInput = z.infer<
  typeof createIncidentSchema
>;

export type UpdateIncidentInput = z.infer<
  typeof updateIncidentSchema
>;