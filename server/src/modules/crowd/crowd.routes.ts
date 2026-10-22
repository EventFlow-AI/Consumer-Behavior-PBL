import { Router } from "express";
import { predictCrowdController } from "./crowd.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/predict", authenticate, predictCrowdController);

export default router;