import type { Request, Response } from "express";
import {
  createBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  updateBrand,
} from "./brand.service.js";
import {
  createBrandSchema,
  updateBrandSchema,
} from "./brand.validation.js";

function getParamId(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export async function getBrandsController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const brands = await getBrands();

    res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error("Get brands error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
    });
  }
}

export async function getBrandByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const brand = await getBrandById(id);

    if (!brand) {
      res.status(404).json({
        success: false,
        message: "Brand not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error("Get brand error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch brand",
    });
  }
}

export async function createBrandController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const parsed = createBrandSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid brand data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const brand = await createBrand(parsed.data);

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });
  } catch (error) {
    console.error("Create brand error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create brand",
    });
  }
}

export async function updateBrandController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existing = await getBrandById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Brand not found",
      });
      return;
    }

    const parsed = updateBrandSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid brand data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const brand = await updateBrand(id, parsed.data);

    res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    console.error("Update brand error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update brand",
    });
  }
}

export async function deleteBrandController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = getParamId(req.params.id);

    const existing = await getBrandById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Brand not found",
      });
      return;
    }

    await deleteBrand(id);

    res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Delete brand error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete brand",
    });
  }
}