/**
 * Tập trung các endpoint URLs cho toàn bộ ứng dụng
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    LOGOUT_ALL: "/auth/logout-all",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
    SESSIONS: "/auth/sessions",
    ME: "/auth/me",
  },

  // User endpoints
  USER: {
    PROFILE: "/users/profile",
    LIST: "/users",
    DETAIL: (id: string) => `/users/${id}`,
    STATS: "/users/stats",
  },

  // Product endpoints
  PRODUCT: {
    LIST: "/products",
    DETAIL: (id: string) => `/products/${id}`,
    BY_SLUG: (slug: string) => `/products/slug/${slug}`,
    ADMIN_LIST: "/admin/products",
    ADMIN_DETAIL: (id: string) => `/admin/products/${id}`,
    ADMIN_BY_SLUG: (slug: string) => `/admin/products/slug/${slug}`,
  },

  // Category endpoints
  CATEGORY: {
    LIST: "/categories",
    DETAIL: (id: number) => `/categories/${id}`,
    ADMIN_LIST: "/admin/categories",
    ADMIN_DETAIL: (id: number) => `/admin/categories/${id}`,
  },

  // Order endpoints
  ORDER: {
    LIST: "/orders",
    DETAIL: (id: number) => `/orders/${id}`,
    ADMIN_LIST: "/admin/orders",
    ADMIN_DETAIL: (id: number) => `/admin/orders/${id}`,
    ADMIN_STATUS: (id: number) => `/admin/orders/${id}/status`,
  },

  // Statistics endpoints
  STATS: {
    DASHBOARD: "/admin/stats/dashboard",
    SALES: "/admin/stats/sales",
  },
};
