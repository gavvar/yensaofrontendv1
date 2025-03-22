import apiClient from "./axiosConfig";
// Import Product từ service hoặc type definitions
import { Product } from "./productService";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  products?: Product[];
  parent?: Category;
}

export interface CategoryListResponse {
  success: boolean;
  data: {
    categories: Category[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CategoryDetailResponse {
  success: boolean;
  data: Category;
}

export const getCategories = async (params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  parentId?: number;
}) => {
  return apiClient.get<CategoryListResponse>("/categories", { params });
};

export const getCategoryBySlug = async (slug: string) => {
  return apiClient.get<CategoryDetailResponse>(`/categories/${slug}`);
};

// Admin functions
export const createCategory = async (data: {
  name: string;
  description?: string;
  parentId?: number | null;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}) => {
  return apiClient.post<{ success: boolean; data: Category; message: string }>(
    "/categories",
    data
  );
};

export const updateCategory = async (
  id: number,
  data: {
    name?: string;
    description?: string | null;
    parentId?: number | null;
    imageUrl?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  }
) => {
  return apiClient.put<{ success: boolean; data: Category; message: string }>(
    `/categories/${id}`,
    data
  );
};

export const deleteCategory = async (id: number) => {
  return apiClient.delete<{ success: boolean; message: string }>(
    `/categories/${id}`
  );
};

export const reorderCategories = async (orderedIds: number[]) => {
  return apiClient.post<{ success: boolean; message: string }>(
    "/categories/reorder",
    { orderedIds }
  );
};
