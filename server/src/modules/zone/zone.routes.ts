import { Router } from "express";
import {
  createZoneController,
  deleteZoneController,
  getZoneByIdController,
  getZonesByVenueController,
  updateZoneController,
} from "./zone.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

const router = Router();

router.get(
  "/venues/:venueId/zones",
  authenticate,
  getZonesByVenueController,
);

router.post(
  "/venues/:venueId/zones",
  authenticate,
  authorizeRoles("ADMIN"),
  createZoneController,
);

router.get(
  "/zones/:id",
  authenticate,
  getZoneByIdController,
);

router.patch(
  "/zones/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateZoneController,
);

router.delete(
  "/zones/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteZoneController,
);

export default router;