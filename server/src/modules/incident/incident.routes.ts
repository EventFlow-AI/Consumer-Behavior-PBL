import { Router } from "express";
import {
  createIncidentController,
  getIncidentByIdController,
  getIncidentsByEventController,
  updateIncidentController,
} from "./incident.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

const router = Router();

router.post(
  "/incidents",
  authenticate,
  createIncidentController,
);

router.get(
  "/events/:eventId/incidents",
  authenticate,
  getIncidentsByEventController,
);

router.get(
  "/incidents/:id",
  authenticate,
  getIncidentByIdController,
);

router.patch(
  "/incidents/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateIncidentController,
);

export default router;