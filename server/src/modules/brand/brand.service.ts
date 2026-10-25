import prisma from "../../config/prisma.js";
import type {
  CreateBrandInput,
  UpdateBrandInput,
} from "./brand.validation.js";

export async function getBrands() {
  return prisma.brand.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getBrandById(id: string) {
  return prisma.brand.findUnique({
    where: {
      id,
    },
    include: {
      offers: true,
    },
  });
}

export async function createBrand(
  data: CreateBrandInput,
) {
  return prisma.brand.create({
    data: {
      name: data.name,
      category: data.category,
      description: data.description,
      logoUrl: data.logoUrl,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateBrand(
  id: string,
  data: UpdateBrandInput,
) {
  return prisma.brand.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteBrand(id: string) {
  return prisma.brand.delete({
    where: {
      id,
    },
  });
}