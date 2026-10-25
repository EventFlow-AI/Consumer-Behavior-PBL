import { Router } from "express";
import {
  createInteractionController,
  getMyInteractionsController,
} from "./interaction.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/interactions",
  authenticate,
  createInteractionController,
);

router.get(
  "/interactions/me",
  authenticate,
  getMyInteractionsController,
);

export default router;