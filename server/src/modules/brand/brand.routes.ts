import { Router } from "express";
import {
  createBrandController,
  deleteBrandController,
  getBrandByIdController,
  getBrandsController,
  updateBrandController,
} from "./brand.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

const router = Router();

router.get(
  "/brands",
  authenticate,
  getBrandsController,
);

router.get(
  "/brands/:id",
  authenticate,
  getBrandByIdController,
);

router.post(
  "/brands",
  authenticate,
  authorizeRoles("ADMIN"),
  createBrandController,
);

router.patch(
  "/brands/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateBrandController,
);

router.delete(
  "/brands/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteBrandController,
);

export default router;