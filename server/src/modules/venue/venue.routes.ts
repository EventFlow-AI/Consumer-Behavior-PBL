import { Router } from "express";
import {
  createVenueController,
  deleteVenueController,
  getVenueByIdController,
  getVenuesByEventController,
  updateVenueController,
} from "./venue.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

const router = Router();

router.get(
  "/events/:eventId/venues",
  authenticate,
  getVenuesByEventController,
);

router.post(
  "/events/:eventId/venues",
  authenticate,
  authorizeRoles("ADMIN"),
  createVenueController,
);

router.get(
  "/venues/:id",
  authenticate,
  getVenueByIdController,
);

router.patch(
  "/venues/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateVenueController,
);

router.delete(
  "/venues/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteVenueController,
);

export default router;