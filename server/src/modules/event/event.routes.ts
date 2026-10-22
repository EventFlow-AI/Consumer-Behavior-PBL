import { Router } from "express";
import {
  createEventController,
  deleteEventController,
  getEventByIdController,
  getEventsController,
  updateEventController,
} from "./event.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

const router = Router();

router.get("/", authenticate, getEventsController);
router.get("/:id", authenticate, getEventByIdController);

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  createEventController,
);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateEventController,
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteEventController,
);

export default router;