import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { AxiosError } from "axios";
import {
  Order,
  OrderWithNotes,
  OrderNote,
  OrderDashboardResponse,
  OrderExportResponse,
  AddOrderNoteRequest,
  PaymentStatus,
  OrderHistoryEntry,
  UpdateOrderStatusRequest,
  UpdatePaymentStatusRequest,
} from "@/types/order";
import {
  AdminOrderFilters,
  OrderDashboardParams,
  OrderExportParams,
} from "@/types/orderFilters";

// API response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Thêm các interface cần thiết cho các phương thức mới
interface UpdatePaymentInfoRequest {
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  paymentId?: string;
  paidAmount?: number;
  paidAt?: string;
}

interface UpdateTrackingInfoRequest {
  trackingNumber: string;
  shippingProvider?: string;
  estimatedDeliveryDate?: string;
}

// Helper function to handle Axios errors
function handleAdminApiError(error: unknown, customMessage?: string): void {
  if (error instanceof AxiosError && error.response?.data) {
    console.error("Admin API Error:", error.response.data);

    // Nếu là lỗi 403 (Forbidden), ghi log riêng
    if (error.response.status === 403) {
      console.error("Access denied: Admin permission required");
    }
  } else if (error instanceof Error) {
    console.error("Error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }

  if (customMessage) {
    console.error(customMessage);
  }
}

/**
 * Service API cho Admin quản lý đơn hàng
 */
const adminOrderService = {
  /**
   * Lấy dashboard thống kê đơn hàng
   * @param params Tham số cho dashboard
   */
  getDashboard: async (
    params: OrderDashboardParams
  ): Promise<OrderDashboardResponse> => {
    try {
      // Xây dựng query params
      const queryParams = new URLSearchParams();
      queryParams.append("period", params.period);

      if (params.fromDate) queryParams.append("fromDate", params.fromDate);
      if (params.toDate) queryParams.append("toDate", params.toDate);
      if (params.compareWithPrevious)
        queryParams.append("compareWithPrevious", "true");

      const response = await apiClient.get(
        `${API_ENDPOINTS.ADMIN.ORDERS.DASHBOARD}?${queryParams.toString()}`,
        { withCredentials: true }
      );

      return response.data.data;
    } catch (error) {
      console.error("Error fetching order dashboard:", error);
      handleAdminApiError(error, "Không thể tải dữ liệu dashboard");
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng cho admin (với filter nâng cao)
   * @param filters Bộ lọc nâng cao
   */
  getOrders: async (
    filters: AdminOrderFilters = {}
  ): Promise<{
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    try {
      // Xây dựng query params từ filters
      const queryParams = new URLSearchParams();

      // Chuyển đổi filters thành query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });

      const response = await apiClient.get(
        `${API_ENDPOINTS.ADMIN.ORDERS.LIST}?${queryParams.toString()}`,
        { withCredentials: true }
      );

      return {
        orders: response.data.data.orders,
        pagination: response.data.data.pagination,
      };
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      handleAdminApiError(error, "Không thể tải danh sách đơn hàng");
      throw error;
    }
  },

  /**
   * Lấy chi tiết đơn hàng bao gồm ghi chú và lịch sử
   * @param id ID đơn hàng
   */
  getOrderDetail: async (id: number): Promise<OrderWithNotes> => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.ADMIN.ORDERS.DETAIL(id),
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching admin order detail ${id}:`, error);
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Thêm ghi chú cho đơn hàng
   * @param orderId ID đơn hàng
   * @param noteData Dữ liệu ghi chú
   */
  addOrderNote: async (
    orderId: number,
    noteData: AddOrderNoteRequest
  ): Promise<ApiResponse<OrderNote>> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.ADMIN.ORDERS.ADD_NOTE(orderId),
        noteData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding note to order ${orderId}:`, error);
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Xóa ghi chú của đơn hàng
   * @param orderId ID đơn hàng
   * @param noteId ID ghi chú
   */
  deleteOrderNote: async (
    orderId: number,
    noteId: number
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.ADMIN.ORDERS.DELETE_NOTE(orderId, noteId),
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error deleting note ${noteId} from order ${orderId}:`,
        error
      );
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Xuất dữ liệu đơn hàng
   * @param params Tham số để xuất
   */
  exportOrders: async (
    params: OrderExportParams
  ): Promise<OrderExportResponse> => {
    try {
      // Xây dựng query params từ params
      const queryParams = new URLSearchParams();

      // Chuyển đổi params thành query params
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });

      const response = await apiClient.get(
        `${API_ENDPOINTS.ADMIN.ORDERS.EXPORT}?${queryParams.toString()}`,
        { withCredentials: true }
      );

      return response.data.data;
    } catch (error) {
      console.error("Error exporting orders:", error);
      handleAdminApiError(error, "Không thể xuất dữ liệu đơn hàng");
      throw error;
    }
  },

  /**
   * Tải xuống file excel đơn hàng
   * @param params Tham số để xuất
   */
  downloadExcel: async (params: OrderExportParams): Promise<Blob> => {
    try {
      // Xây dựng query params từ params
      const queryParams = new URLSearchParams();

      // Chuyển đổi params thành query params
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });

      const response = await apiClient.get(
        `${
          API_ENDPOINTS.ADMIN.ORDERS.DOWNLOAD_EXCEL
        }?${queryParams.toString()}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error downloading excel:", error);
      handleAdminApiError(error, "Không thể tải xuống file Excel");
      throw error;
    }
  },

  /**
   * Soft delete đơn hàng
   * @param id ID đơn hàng
   */
  deleteOrder: async (
    id: number
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.ADMIN.ORDERS.DELETE(id),
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Khôi phục đơn hàng đã xóa
   * @param id ID đơn hàng
   */
  restoreOrder: async (id: number): Promise<ApiResponse<Order>> => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.ADMIN.ORDERS.RESTORE(id),
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Error restoring order ${id}:`, error);
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Lấy thống kê đơn hàng theo thời gian
   * @param fromDate Từ ngày
   * @param toDate Đến ngày
   */
  getOrderStatsByDate: async (fromDate: string, toDate: string) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.ADMIN.ORDERS.STATS_BY_DATE}?fromDate=${fromDate}&toDate=${toDate}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching order stats by date:", error);
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Lấy top sản phẩm bán chạy
   * @param limit Số lượng sản phẩm muốn lấy
   * @param fromDate Từ ngày (tùy chọn)
   * @param toDate Đến ngày (tùy chọn)
   */
  getTopProducts: async (
    limit: number = 10,
    fromDate?: string,
    toDate?: string
  ) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("limit", limit.toString());

      if (fromDate) queryParams.append("fromDate", fromDate);
      if (toDate) queryParams.append("toDate", toDate);

      const response = await apiClient.get(
        `${API_ENDPOINTS.ADMIN.ORDERS.TOP_PRODUCTS}?${queryParams.toString()}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching top products:", error);
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * In đơn hàng
   * @param id ID đơn hàng
   */
  printOrder: async (id: number): Promise<Blob> => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.ADMIN.ORDERS.PRINT(id),
        {
          responseType: "blob",
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error printing order ${id}:`, error);
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Lấy các đơn hàng gần đây
   * @param limit Số lượng đơn hàng muốn lấy
   */
  getRecentOrders: async (limit: number = 5) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.ADMIN.ORDERS.RECENT}?limit=${limit}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử đơn hàng
   * @param orderId ID đơn hàng
   */
  getOrderHistory: async (orderId: number): Promise<OrderHistoryEntry[]> => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.ADMIN.ORDERS.HISTORY(orderId),
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      console.error(
        `Error fetching order history for order ${orderId}:`,
        error
      );
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng
   * @param orderId ID đơn hàng
   * @param statusData Dữ liệu trạng thái mới
   */
  updateOrderStatus: async (
    orderId: number,
    statusData: UpdateOrderStatusRequest
  ): Promise<ApiResponse<Order>> => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.ADMIN.ORDERS.UPDATE_STATUS(orderId),
        statusData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating order status for order ${orderId}:`, error);
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái thanh toán
   * @param orderId ID đơn hàng
   * @param statusData Dữ liệu trạng thái thanh toán mới
   */
  updatePaymentStatus: async (
    orderId: number,
    statusData: UpdatePaymentStatusRequest
  ): Promise<ApiResponse<Order>> => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.ADMIN.ORDERS.UPDATE_PAYMENT_STATUS(orderId),
        statusData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating payment status for order ${orderId}:`,
        error
      );
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin thanh toán
   * @param orderId ID đơn hàng
   * @param paymentData Dữ liệu thanh toán mới
   */
  updatePaymentInfo: async (
    orderId: number,
    paymentData: UpdatePaymentInfoRequest
  ): Promise<ApiResponse<Order>> => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.ADMIN.ORDERS.UPDATE_PAYMENT_INFO(orderId),
        paymentData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating payment info for order ${orderId}:`, error);
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin vận chuyển
   * @param orderId ID đơn hàng
   * @param trackingData Dữ liệu vận chuyển mới
   */
  updateTrackingInfo: async (
    orderId: number,
    trackingData: UpdateTrackingInfoRequest
  ): Promise<ApiResponse<Order>> => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.ADMIN.ORDERS.UPDATE_TRACKING(orderId),
        trackingData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating tracking info for order ${orderId}:`,
        error
      );
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Gửi lại email xác nhận đơn hàng
   * @param orderId ID đơn hàng
   */
  resendOrderEmail: async (
    orderId: number
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.ADMIN.ORDERS.RESEND_EMAIL(orderId),
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Error resending order email for order ${orderId}:`, error);
      handleAdminApiError(error);
      throw error;
    }
  },

  // Thêm các phương thức batch operations
  /**
   * Xóa nhiều đơn hàng cùng lúc
   * @param orderIds Danh sách ID đơn hàng cần xóa
   */
  bulkDeleteOrders: async (
    orderIds: number[]
  ): Promise<ApiResponse<{ success: boolean; count: number }>> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.ADMIN.ORDERS.BULK_DELETE,
        { orderIds },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error bulk deleting orders:", error);
      handleAdminApiError(error);
      throw error;
    }
  },

  /**
   * Khôi phục nhiều đơn hàng đã xóa cùng lúc
   * @param orderIds Danh sách ID đơn hàng cần khôi phục
   */
  bulkRestoreOrders: async (
    orderIds: number[]
  ): Promise<ApiResponse<{ success: boolean; count: number }>> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.ADMIN.ORDERS.BULK_RESTORE,
        { orderIds },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error bulk restoring orders:", error);
      handleAdminApiError(error);
      throw error;
    }
  },
};

export default adminOrderService;
