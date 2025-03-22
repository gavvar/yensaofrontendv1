import apiClient from "./axiosConfig";

// Product Management
export const getAdminProducts = async (params: {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sort) queryParams.append("sort", params.sort);
  if (params.search) queryParams.append("search", params.search);

  return apiClient.get(`/admin/products?${queryParams.toString()}`);
};

export const getAdminProductById = async (id: number) => {
  return apiClient.get(`/admin/products/${id}`);
};

export const getProductBySlug = async (slug: string) => {
  return apiClient.get(`/admin/products/slug/${slug}`);
};

export const createProduct = async (productData: FormData) => {
  return apiClient.post("/admin/products", productData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateProduct = async (slug: string, productData: FormData) => {
  return apiClient.put(`/admin/products/${slug}`, productData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteProduct = async (slug: string) => {
  return apiClient.delete(`/admin/products/${slug}`);
};

// Category Management
export const getAdminCategories = async () => {
  return apiClient.get("/admin/categories");
};

export const createCategory = async (categoryData: {
  name: string;
  description?: string;
}) => {
  return apiClient.post("/admin/categories", categoryData);
};

export const updateCategory = async (
  id: number,
  categoryData: { name: string; description?: string }
) => {
  return apiClient.put(`/admin/categories/${id}`, categoryData);
};

export const deleteCategory = async (id: number) => {
  return apiClient.delete(`/admin/categories/${id}`);
};

// Order Management
export const getAdminOrders = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.status) queryParams.append("status", params.status);
  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);

  return apiClient.get(`/admin/orders?${queryParams.toString()}`);
};

export const getAdminOrderById = async (id: number) => {
  return apiClient.get(`/admin/orders/${id}`);
};

export const updateOrderStatus = async (id: number, status: string) => {
  return apiClient.patch(`/admin/orders/${id}/status`, { status });
};

// User Management
export const getAdminUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);

  return apiClient.get(`/admin/users?${queryParams.toString()}`);
};

export const getAdminUserById = async (id: number) => {
  return apiClient.get(`/admin/users/${id}`);
};

export const updateUserStatus = async (
  id: number,
  status: "active" | "inactive"
) => {
  return apiClient.patch(`/admin/users/${id}/status`, { status });
};

// Dashboard Statistics
export const getDashboardStats = async () => {
  return apiClient.get("/admin/stats/dashboard");
};

export const getSalesReport = async (params: {
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate?: string;
  endDate?: string;
}) => {
  const queryParams = new URLSearchParams();
  queryParams.append("period", params.period);

  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);

  return apiClient.get(`/admin/stats/sales?${queryParams.toString()}`);
};
