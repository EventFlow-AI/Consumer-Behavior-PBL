import { Router } from "express";
import {
  createGroup,
  joinGroup,
  getActiveGroup,
  updateLocation,
  addMeetingPoint,
} from "./family.controller.js";

const router = Router();

router.post("/create", createGroup);
router.post("/join", joinGroup);
router.get("/active", getActiveGroup);
router.post("/location", updateLocation);
router.post("/:groupId/meeting-point", addMeetingPoint);

export default router;

