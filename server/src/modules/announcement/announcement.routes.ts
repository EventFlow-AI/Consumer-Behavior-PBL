import { Router } from "express";
import {
  createAnnouncementController,
  deleteAnnouncementController,
  getActiveAnnouncementsController,
  getAnnouncementsByEventController,
  updateAnnouncementController,
} from "./announcement.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

const router = Router();

router.get(
  "/events/:eventId/announcements/active",
  authenticate,
  getActiveAnnouncementsController,
);

router.get(
  "/events/:eventId/announcements",
  authenticate,
  authorizeRoles("ADMIN"),
  getAnnouncementsByEventController,
);

router.post(
  "/announcements",
  authenticate,
  authorizeRoles("ADMIN"),
  createAnnouncementController,
);

router.patch(
  "/announcements/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateAnnouncementController,
);

router.delete(
  "/announcements/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteAnnouncementController,
);

export default router;