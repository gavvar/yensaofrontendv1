import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "./api/endpoints";
import { OrderFilters } from "@/types/orderFilters";
import { OrderStatus, PaymentStatus } from "@/types/order";

// Định nghĩa các interface cho các tham số
interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Thay thế [key: string]: any bằng type cụ thể
interface ProductData {
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  categoryId?: number;
  images?: string[];
  thumbnail?: string;
  featured?: boolean;
  status?: string;
  sku?: string;
  stockQuantity?: number;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  attributes?: Record<string, string>;
  variants?: Array<{
    id?: string;
    name?: string;
    price?: number;
    sku?: string;
    stockQuantity?: number;
    attributes?: Record<string, string>;
  }>;
}

interface CategoryData {
  name: string;
  description?: string;
  slug?: string;
  parentId?: number | null;
  image?: string;
  active?: boolean;
  order?: number;
  metaTitle?: string;
  metaDescription?: string;
  featuredProducts?: number[];
}

interface CouponData {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  validFrom?: Date | string;
  validTo?: Date | string;
  minOrderAmount?: number;
  maxUses?: number;
  perUserLimit?: number;
  active?: boolean;
  description?: string;
  categoryIds?: number[];
  productIds?: number[];
  excludedProductIds?: number[];
  excludedCategoryIds?: number[];
  maxDiscountAmount?: number;
  usageCount?: number;
}

interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
  status?: string;
  password?: string;
  avatar?: string;
  dateOfBirth?: string | Date;
  gender?: string;
  lastLogin?: string | Date;
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
    language?: string;
  };
  shippingAddresses?: Array<{
    id?: string | number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    isDefault?: boolean;
  }>;
}

/**
 * Service cho các chức năng Admin
 */
const adminService = {
  // ============= THỐNG KÊ (ANALYTICS) =============

  /**
   * Lấy dữ liệu thống kê từ một endpoint cụ thể
   */
  getStats: async (endpoint: string) => {
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  /**
   * Lấy thống kê tổng quan cho dashboard
   */
  getDashboardStats: async (
    period: "week" | "month" | "quarter" | "year" = "week"
  ) => {
    const response = await apiClient.get(API_ENDPOINTS.STATS.DASHBOARD, {
      params: { period },
    });
    return response.data;
  },

  /**
   * Lấy dữ liệu doanh thu theo thời gian
   */
  getRevenueStats: async (
    startDate: string,
    endDate: string,
    groupBy: "day" | "week" | "month" = "day"
  ) => {
    const response = await apiClient.get(API_ENDPOINTS.STATS.REVENUE, {
      params: { startDate, endDate, groupBy },
    });
    return response.data;
  },

  /**
   * Lấy danh sách sản phẩm bán chạy nhất
   */
  getTopProducts: async (
    period: "week" | "month" | "quarter" | "year" = "month",
    limit: number = 5
  ) => {
    const response = await apiClient.get(API_ENDPOINTS.STATS.TOP_PRODUCTS, {
      params: { period, limit },
    });
    return response.data;
  },

  /**
   * Lấy thống kê theo phương thức thanh toán
   */
  getPaymentMethodStats: async (
    period: "week" | "month" | "quarter" | "year" = "month"
  ) => {
    const response = await apiClient.get(API_ENDPOINTS.STATS.PAYMENT_METHODS, {
      params: { period },
    });
    return response.data;
  },

  /**
   * Lấy thống kê theo trạng thái đơn hàng
   */
  getOrderStatusStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.STATS.ORDER_STATUS);
    return response.data;
  },

  /**
   * Xuất báo cáo doanh thu
   */
  exportRevenueReport: async (
    startDate: string,
    endDate: string,
    format: "xlsx" | "csv" | "pdf" = "xlsx"
  ) => {
    const response = await apiClient.get(API_ENDPOINTS.STATS.EXPORT_REVENUE, {
      params: { startDate, endDate, format },
      responseType: "blob",
    });
    return response;
  },

  // ============= QUẢN LÝ ĐƠN HÀNG =============

  /**
   * Lấy danh sách đơn hàng cho admin
   */
  getOrders: async (filters: OrderFilters) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.ORDERS.LIST, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết đơn hàng
   */
  getOrderDetails: async (orderId: number) => {
    const response = await apiClient.get(
      API_ENDPOINTS.ADMIN.ORDERS.DETAIL(orderId)
    );
    return response.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  updateOrderStatus: async (
    orderId: number,
    status: OrderStatus,
    notes?: string
  ) => {
    const response = await apiClient.put(
      API_ENDPOINTS.ADMIN.ORDERS.UPDATE_STATUS(orderId),
      { status, notes }
    );
    return response.data;
  },

  /**
   * Cập nhật trạng thái thanh toán
   */
  updatePaymentStatus: async (
    orderId: number,
    status: PaymentStatus,
    notes?: string
  ) => {
    const response = await apiClient.put(
      API_ENDPOINTS.ADMIN.ORDERS.UPDATE_PAYMENT_STATUS(orderId),
      { status, notes }
    );
    return response.data;
  },

  /**
   * Xóa đơn hàng (soft delete)
   */
  deleteOrder: async (orderId: number) => {
    const response = await apiClient.delete(
      API_ENDPOINTS.ADMIN.ORDERS.DELETE(orderId)
    );
    return response.data;
  },

  /**
   * Xóa nhiều đơn hàng cùng lúc
   */
  bulkDeleteOrders: async (orderIds: number[]) => {
    const response = await apiClient.post(
      API_ENDPOINTS.ADMIN.ORDERS.BULK_DELETE,
      {
        orderIds,
      }
    );
    return response.data;
  },

  /**
   * Khôi phục đơn hàng đã xóa
   */
  restoreOrder: async (orderId: number) => {
    const response = await apiClient.post(
      API_ENDPOINTS.ADMIN.ORDERS.RESTORE(orderId)
    );
    return response.data;
  },

  /**
   * Khôi phục nhiều đơn hàng cùng lúc
   */
  bulkRestoreOrders: async (orderIds: number[]) => {
    const response = await apiClient.post(
      API_ENDPOINTS.ADMIN.ORDERS.BULK_RESTORE,
      {
        orderIds,
      }
    );
    return response.data;
  },

  /**
   * Thêm ghi chú cho đơn hàng
   */
  addOrderNote: async (
    orderId: number,
    content: string,
    isInternal: boolean = true
  ) => {
    const response = await apiClient.post(
      API_ENDPOINTS.ADMIN.ORDERS.ADD_NOTE(orderId),
      { content, isInternal }
    );
    return response.data;
  },

  /**
   * Xóa ghi chú đơn hàng
   */
  deleteOrderNote: async (orderId: number, noteId: number) => {
    const response = await apiClient.delete(
      API_ENDPOINTS.ADMIN.ORDERS.DELETE_NOTE(orderId, noteId)
    );
    return response.data;
  },

  /**
   * Xuất đơn hàng ra file
   */
  exportOrders: async (
    filters: OrderFilters,
    format: "xlsx" | "csv" | "pdf" = "xlsx"
  ) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.ORDERS.EXPORT, {
      params: { ...filters, format },
      responseType: "blob",
    });
    return response;
  },

  /**
   * Lấy lịch sử thay đổi đơn hàng
   */
  getOrderHistory: async (orderId: number) => {
    const response = await apiClient.get(
      API_ENDPOINTS.ADMIN.ORDERS.HISTORY(orderId)
    );
    return response.data;
  },

  /**
   * Gửi lại email xác nhận đơn hàng
   */
  resendOrderEmail: async (orderId: number) => {
    const response = await apiClient.post(
      API_ENDPOINTS.ADMIN.ORDERS.RESEND_EMAIL(orderId)
    );
    return response.data;
  },

  /**
   * Cập nhật thông tin tracking
   */
  updateOrderTracking: async (
    orderId: number,
    trackingNumber: string,
    carrier: string
  ) => {
    const response = await apiClient.put(
      API_ENDPOINTS.ADMIN.ORDERS.UPDATE_TRACKING(orderId),
      { trackingNumber, carrier }
    );
    return response.data;
  },

  /**
   * Tạo phiếu in đơn hàng
   */
  printOrder: async (orderId: number) => {
    const response = await apiClient.get(
      API_ENDPOINTS.ADMIN.ORDERS.PRINT(orderId),
      {
        responseType: "blob",
      }
    );
    return response;
  },

  /**
   * Lấy các đơn hàng gần đây
   */
  getRecentOrders: async (limit: number = 5) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.ORDERS.RECENT, {
      params: { limit },
    });
    return response.data;
  },

  // ============= QUẢN LÝ SẢN PHẨM =============

  /**
   * Lấy danh sách sản phẩm cho admin
   */
  getProducts: async (filters: ProductFilters) => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCT.LIST, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Tạo sản phẩm mới
   */
  createProduct: async (productData: ProductData) => {
    const response = await apiClient.post(
      API_ENDPOINTS.PRODUCT.CREATE,
      productData
    );
    return response.data;
  },

  /**
   * Cập nhật thông tin sản phẩm
   */
  updateProduct: async (productId: string, productData: ProductData) => {
    const response = await apiClient.put(
      API_ENDPOINTS.PRODUCT.UPDATE(productId),
      productData
    );
    return response.data;
  },

  /**
   * Xóa sản phẩm
   */
  deleteProduct: async (productId: string) => {
    const response = await apiClient.delete(
      API_ENDPOINTS.PRODUCT.DELETE(productId)
    );
    return response.data;
  },

  /**
   * Upload ảnh cho sản phẩm
   */
  uploadProductImages: async (productId: string, formData: FormData) => {
    const response = await apiClient.post(
      API_ENDPOINTS.PRODUCT.UPLOAD_IMAGES(productId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Đặt ảnh thumbnail cho sản phẩm
   */
  setProductThumbnail: async (productId: string, imageId: string) => {
    const response = await apiClient.put(
      API_ENDPOINTS.PRODUCT.SET_THUMBNAIL(productId, imageId)
    );
    return response.data;
  },

  // ============= QUẢN LÝ DANH MỤC =============

  /**
   * Lấy danh sách danh mục
   */
  getCategories: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORY.LIST);
    return response.data;
  },

  /**
   * Tạo danh mục mới
   */
  createCategory: async (categoryData: CategoryData) => {
    const response = await apiClient.post(
      API_ENDPOINTS.CATEGORY.CREATE,
      categoryData
    );
    return response.data;
  },

  /**
   * Cập nhật thông tin danh mục
   */
  updateCategory: async (categoryId: number, categoryData: CategoryData) => {
    const response = await apiClient.put(
      API_ENDPOINTS.CATEGORY.UPDATE(categoryId),
      categoryData
    );
    return response.data;
  },

  /**
   * Xóa danh mục
   */
  deleteCategory: async (categoryId: number) => {
    const response = await apiClient.delete(
      API_ENDPOINTS.CATEGORY.DELETE(categoryId)
    );
    return response.data;
  },

  // ============= QUẢN LÝ MÃ GIẢM GIÁ =============

  /**
   * Lấy danh sách mã giảm giá
   */
  getCoupons: async () => {
    const response = await apiClient.get(API_ENDPOINTS.COUPON.LIST);
    return response.data;
  },

  /**
   * Lấy chi tiết mã giảm giá
   */
  getCouponDetails: async (couponId: number) => {
    const response = await apiClient.get(API_ENDPOINTS.COUPON.DETAIL(couponId));
    return response.data;
  },

  /**
   * Tạo mã giảm giá mới
   */
  createCoupon: async (couponData: CouponData) => {
    const response = await apiClient.post(
      API_ENDPOINTS.COUPON.LIST,
      couponData
    );
    return response.data;
  },

  /**
   * Cập nhật mã giảm giá
   */
  updateCoupon: async (couponId: number, couponData: CouponData) => {
    const response = await apiClient.put(
      API_ENDPOINTS.COUPON.DETAIL(couponId),
      couponData
    );
    return response.data;
  },

  /**
   * Xóa mã giảm giá
   */
  deleteCoupon: async (couponId: number) => {
    const response = await apiClient.delete(
      API_ENDPOINTS.COUPON.DETAIL(couponId)
    );
    return response.data;
  },

  // ============= QUẢN LÝ NGƯỜI DÙNG =============

  /**
   * Lấy danh sách người dùng
   */
  getUsers: async (filters: UserFilters) => {
    const response = await apiClient.get(API_ENDPOINTS.USER.LIST, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Lấy chi tiết người dùng
   */
  getUserDetails: async (userId: string | number) => {
    const response = await apiClient.get(API_ENDPOINTS.USER.DETAIL(userId));
    return response.data;
  },

  /**
   * Cập nhật thông tin người dùng
   */
  updateUser: async (userId: string | number, userData: UserData) => {
    const response = await apiClient.put(
      API_ENDPOINTS.USER.DETAIL(userId),
      userData
    );
    return response.data;
  },

  /**
   * Lấy thống kê người dùng
   */
  getUserStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.USER.STATS);
    return response.data;
  },
};

export default adminService;
