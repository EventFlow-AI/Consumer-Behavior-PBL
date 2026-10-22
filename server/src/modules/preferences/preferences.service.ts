import type { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import type { UpdatePreferencesInput } from "./preferences.validation.js";

export async function getUserPreferences(userId: string) {
  return prisma.userPreference.findUnique({
    where: {
      userId,
    },
  });
}

export async function upsertUserPreferences(
  userId: string,
  data: UpdatePreferencesInput,
) {
  return prisma.userPreference.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      priceSensitivity: data.priceSensitivity,
      crowdPreference: data.crowdPreference,
      walkingPreference: data.walkingPreference,
      accessibility: data.accessibility ?? false,
      brandPreference: data.brandPreference,
      foodPreferences:
        data.foodPreferences as Prisma.InputJsonValue | undefined,
    },
    update: {
      priceSensitivity: data.priceSensitivity,
      crowdPreference: data.crowdPreference,
      walkingPreference: data.walkingPreference,
      accessibility: data.accessibility,
      brandPreference: data.brandPreference,
      foodPreferences:
        data.foodPreferences as Prisma.InputJsonValue | undefined,
    },
  });
}