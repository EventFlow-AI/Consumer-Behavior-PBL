import { Router } from "express";
import {
  createFacilityController,
  deleteFacilityController,
  getFacilitiesByLocationController,
  getFacilityByIdController,
  updateFacilityController,
} from "./facility.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

const router = Router();

router.get(
  "/locations/:locationId/facilities",
  authenticate,
  getFacilitiesByLocationController,
);

router.post(
  "/locations/:locationId/facilities",
  authenticate,
  authorizeRoles("ADMIN"),
  createFacilityController,
);

router.get(
  "/facilities/:id",
  authenticate,
  getFacilityByIdController,
);

router.patch(
  "/facilities/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateFacilityController,
);

router.delete(
  "/facilities/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteFacilityController,
);

export default router;