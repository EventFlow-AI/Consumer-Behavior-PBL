import { Router } from "express";
import {
  createOfferController,
  deleteOfferController,
  getActiveOffersByEventController,
  getOfferByIdController,
  getOffersByEventController,
  updateOfferController,
} from "./offer.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

const router = Router();

router.get(
  "/events/:eventId/offers/active",
  authenticate,
  getActiveOffersByEventController,
);

router.get(
  "/events/:eventId/offers",
  authenticate,
  getOffersByEventController,
);

router.get(
  "/offers/:id",
  authenticate,
  getOfferByIdController,
);

router.post(
  "/offers",
  authenticate,
  authorizeRoles("ADMIN"),
  createOfferController,
);

router.patch(
  "/offers/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateOfferController,
);

router.delete(
  "/offers/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteOfferController,
);

export default router;