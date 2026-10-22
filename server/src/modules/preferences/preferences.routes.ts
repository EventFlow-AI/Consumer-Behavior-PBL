import { Router } from "express";
import {
  getMyPreferencesController,
  updateMyPreferencesController,
} from "./preferences.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/me",
  authenticate,
  getMyPreferencesController,
);

router.put(
  "/me",
  authenticate,
  updateMyPreferencesController,
);

export default router;