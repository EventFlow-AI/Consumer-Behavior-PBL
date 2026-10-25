import { Router } from "express";
import { getDashboardController } from "./dashboard.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

const router = Router();

router.get(
  "/admin/dashboard",
  authenticate,
  authorizeRoles("ADMIN"),
  getDashboardController,
);

export default router;