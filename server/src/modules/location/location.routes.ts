import { Router } from "express";
import {
  createLocationController,
  deleteLocationController,
  getLocationByIdController,
  getLocationsByZoneController,
  updateLocationController,
} from "./location.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

const router = Router();

router.get(
  "/zones/:zoneId/locations",
  authenticate,
  getLocationsByZoneController,
);

router.post(
  "/zones/:zoneId/locations",
  authenticate,
  authorizeRoles("ADMIN"),
  createLocationController,
);

router.get(
  "/locations/:id",
  authenticate,
  getLocationByIdController,
);

router.patch(
  "/locations/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateLocationController,
);

router.delete(
  "/locations/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteLocationController,
);

export default router;