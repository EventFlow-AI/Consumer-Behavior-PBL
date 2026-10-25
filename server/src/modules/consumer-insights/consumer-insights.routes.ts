import { Router } from "express";
import { getConsumerInsightsController } from "./consumer-insights.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

const router = Router();

router.get(
  "/admin/consumer-insights",
  authenticate,
  authorizeRoles("ADMIN"),
  getConsumerInsightsController,
);

export default router;