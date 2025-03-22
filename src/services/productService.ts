// src/services/productService.ts
import apiClient from "./axiosConfig";

// Thêm định nghĩa Product và export nó
export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  description: string;
  stock: number;
  ProductImages: { id: number; url: string; isFeatured: boolean }[];
  Category: { id: number; name: string; slug: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilter {
  categoryId?: number;
  price?: {
    min: number;
    max: number;
  };
}

export const getProducts = async (params: {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  filter?: ProductFilter;
}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sort) queryParams.append("sort", params.sort);
  if (params.search) queryParams.append("search", params.search);

  if (params.filter && Object.keys(params.filter).length > 0) {
    queryParams.append("filter", JSON.stringify(params.filter));
  }

  return apiClient.get(`/products?${queryParams.toString()}`);
};

export const getProductBySlug = async (slug: string) => {
  return apiClient.get(`/products/${slug}`);
};

export const getCategories = async () => {
  return apiClient.get("/categories");
};
