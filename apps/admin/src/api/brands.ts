import { apiRequest } from "./client";

export interface BrandRecord {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getBrands() {
  const response = await apiRequest<{
    success: boolean;
    data: BrandRecord[];
  }>("/brands");

  return response.data;
}

export async function createBrand(data: {
  name: string;
  category: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
}) {
  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: BrandRecord;
  }>("/brands", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function updateBrand(
  id: string,
  data: Partial<{
    name: string;
    category: string;
    description: string;
    logoUrl: string;
    isActive: boolean;
  }>,
) {
  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: BrandRecord;
  }>(`/brands/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function deleteBrand(id: string) {
  await apiRequest<{
    success: boolean;
    message: string;
  }>(`/brands/${id}`, {
    method: "DELETE",
  });
}