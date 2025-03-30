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
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // User endpoints
  USER: {
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    LIST: "/users",
    DETAIL: (id: string | number) => `/users/${id}`,
    STATS: "/users/stats",
    ADDRESSES: "/users/addresses",
    ADDRESS_DETAIL: (id: string) => `/users/addresses/${id}`,
    SET_DEFAULT_ADDRESS: (id: string) => `/users/addresses/${id}/default`,
    ORDERS: "/users/orders",
    ORDER_DETAIL: (id: string) => `/users/orders/${id}`,
  },

  // Product endpoints
  PRODUCT: {
    LIST: "/products",
    DETAIL: (id: string) => `/products/id/${id}`,
    BY_SLUG: (slug: string) => `/products/${slug}`,
    BY_ID: (id: string) => `/products/id/${id}`,
    FEATURED: "/products/featured",
    RELATED: (productId: string) => `/products/related/${productId}`,
    VIEW: (productId: string) => `/products/id/${productId}/view`,
    BY_CATEGORY: (slug: string) => `/products/category/${slug}`,
    CREATE: "/products",
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    UPLOAD_IMAGES: (productId: string) => `/products/${productId}/images`,
    SET_THUMBNAIL: (productId: string, imageId: string) =>
      `/products/${productId}/images/${imageId}/thumbnail`,
  },

  // Category endpoints
  CATEGORY: {
    LIST: "/categories",
    DETAIL: (id: string) => `/categories/${id}`,
    BY_SLUG: "/categories/slug", // Đường dẫn cơ bản không chứa placeholder
    CREATE: "/categories",
    UPDATE: (id: number) => `/categories/${id}`,
    DELETE: (id: number) => `/categories/${id}`,
    ROOT: "/categories/root",
  },

  // Order endpoints - cập nhật đầy đủ
  ORDER: {
    LIST: "/orders",
    DETAIL: (id: number) => `/orders/id/${id}`,
    BY_NUMBER: (orderNumber: string) => `/orders/number/${orderNumber}`,
    CREATE: "/orders",
    CANCEL: (id: number) => `/orders/${id}/cancel`,
    UPDATE_INFO: (id: number) => `/orders/${id}/info`,
    UPDATE_STATUS: (id: number) => `/orders/${id}/status`,
    UPDATE_PAYMENT: (id: number) => `/orders/${id}/payment`,
    STATUSES: "/orders/statuses",
    TRACK_BY_ORDER_NUMBER_PHONE: "/orders/track",
  },

  // Thêm endpoints cho Cart
  CART: {
    GET: "/cart",
    ADD: "/cart",
    UPDATE_QUANTITY: (id: number) => `/cart/${id}`,
    REMOVE_ITEM: (id: number) => `/cart/${id}`,
    REMOVE_ITEMS: "/cart/delete-many",
    TOGGLE_SELECT: (id: number) => `/cart/${id}/select`,
    UPDATE_NOTES: (id: number) => `/cart/${id}/notes`,
    BATCH_UPDATE: "/cart/batch-update",
  },

  // Shipping endpoints - thêm mới
  SHIPPING: {
    PROVIDERS: "/shipping/providers",
    CALCULATE_FEE: "/shipping/calculate-fee",
  },

  // Payment endpoints - thêm mới
  PAYMENT: {
    METHODS: "/payments/methods",
    CREATE: "/payments",
    PROCESS: "/payments/process",
    VERIFY: "/payments/verify",
    CALLBACK: "/payments/callback", //
  },

  // Thêm COUPON endpoints
  COUPON: {
    VALIDATE: "/coupons/validate",
    APPLY: "/coupons/apply",
    LIST: "/coupons",
    DETAIL: (id: number) => `/coupons/${id}`,
  },

  // Statistics endpoints
  STATS: {
    DASHBOARD: "/stats/dashboard",
    REVENUE: "/stats/revenue",
    TOP_PRODUCTS: "/stats/top-products",
    PAYMENT_METHODS: "/stats/payment-methods",
    ORDER_STATUS: "/stats/order-status",
    EXPORT_REVENUE: "/stats/export/revenue",
  },

  // Admin endpoints
  ADMIN: {
    ORDERS: {
      LIST: "/orders",
      DETAIL: (id: number) => `/orders/${id}`,
      DASHBOARD: "/orders/dashboard",
      EXPORT: "/orders/export",
      DOWNLOAD_EXCEL: "/orders/download-excel",
      DELETE: (id: number) => `/orders/${id}`,
      RESTORE: (id: number) => `/orders/${id}/restore`,
      ADD_NOTE: (orderId: number) => `/orders/${orderId}/notes`,
      DELETE_NOTE: (orderId: number, noteId: number) =>
        `/orders/${orderId}/notes/${noteId}`,
      STATS_BY_DATE: "/orders/stats",
      TOP_PRODUCTS: "/orders/top-products",
      PRINT: (id: number) => `/orders/${id}/print`,
      RECENT: "/orders/recent",
      BULK_DELETE: "/orders/bulk-delete",
      BULK_RESTORE: "/orders/bulk-restore",

      // Thêm các endpoints còn thiếu
      HISTORY: (id: number) => `/orders/${id}/history`,
      UPDATE_STATUS: (id: number) => `/orders/${id}/status`,
      UPDATE_PAYMENT_STATUS: (id: number) =>
        `/admin/orders/${id}/payment-status`,
      UPDATE_PAYMENT_INFO: (id: number) => `/orders/${id}/payment`,
      UPDATE_TRACKING: (id: number) => `/orders/${id}/tracking`,
      RESEND_EMAIL: (id: number) => `/orders/${id}/resend-email`,
    },
    // Các admin endpoints khác...
  },
};
