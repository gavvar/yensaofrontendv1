import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { AxiosError } from "axios";
import {
  Order,
  OrderSummary,
  CreateOrderRequest,
  CreateOrderResponse,
  UpdateOrderInfoRequest,
  UpdateOrderStatusRequest,
  UpdatePaymentStatusRequest,
  GetOrderStatusesResponse,
  OrderListParams,
  OrderListResponse,
  OrderStatus,
} from "@/types/order";

// Chỉ import từ một nơi
import { ShippingInfo } from "@/types/shipping";
import { CouponResponse } from "@/types/checkout"; // Ưu tiên sử dụng từ checkout.ts

// Thêm định nghĩa OrderDetail nếu không có trong types/order.ts
export interface OrderDetail extends Order {
  // Thêm các trường bổ sung cho chi tiết đơn hàng nếu cần
  customerFullAddress?: string;
  paymentDetails?: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  statusHistory?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}

// Cập nhật interface ApiErrorResponse để xử lý trường hợp error có thể là chuỗi hoặc object
interface ApiErrorResponse {
  success: false;
  error:
    | string
    | {
        message: string;
        [key: string]: unknown;
      };
}

// API response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Helper function to handle Axios errors
function handleAxiosError(error: unknown, customMessage?: string): void {
  if (error instanceof AxiosError && error.response?.data) {
    const errorData = error.response.data as ApiErrorResponse;
    console.error("API Error:", errorData.error);
  } else if (error instanceof Error) {
    console.error("Error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }

  if (customMessage) {
    console.error(customMessage);
  }
}

// Thêm phương thức generateInvoice
const generateInvoice = async (orderId: number): Promise<Blob> => {
  try {
    const response = await apiClient.get(`/orders/${orderId}/invoice`, {
      responseType: "blob", // Quan trọng để nhận dữ liệu dạng Blob
    });

    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

// Thêm hàm này vào orderService:
const trackOrderByTrackingNumber = async (trackingNumber: string) => {
  try {
    const response = await apiClient.get(`/shipping/track/${trackingNumber}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

/**
 * Theo dõi đơn hàng bằng mã đơn và số điện thoại
 */
const trackOrderByOrderNumberAndPhone = async (
  orderNumber: string,
  phone: string
): Promise<{ order: Order | null; tracking: ShippingInfo | null }> => {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.ORDER.TRACK_BY_ORDER_NUMBER_PHONE}?orderNumber=${orderNumber}&phone=${phone}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error tracking order by number and phone:", error);
    handleAxiosError(error, "Không thể tra cứu đơn hàng");
    throw error;
  }
};

/**
 * Xác thực mã giảm giá
 * @param code Mã giảm giá cần xác thực
 * @param totalAmount Tổng giá trị đơn hàng
 */
const validateCoupon = async (
  code: string,
  totalAmount: number
): Promise<CouponResponse> => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.COUPON.VALIDATE,
      {
        code,
        cartTotal: totalAmount,
      },
      { withCredentials: true }
    );

    // Map API response to CouponResponse interface
    const couponData = response.data.data.coupon || {};

    const couponResponse: CouponResponse = {
      valid: response.data.data.valid,
      coupon: response.data.data.coupon,
      code: code,
      discountType: couponData.type === "percentage" ? "percentage" : "fixed",
      discountValue: couponData.value || 0,
      maxDiscount: couponData.maxDiscount || null,
      discountAmount: response.data.data.discountAmount || 0,
      message: response.data.data.message || "",
    };

    return couponResponse;
  } catch (error: unknown) {
    console.error("Error validating coupon:", error);

    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      let errorMessage = "Mã giảm giá không hợp lệ";

      if (
        typeof errorData.error === "object" &&
        errorData.error !== null &&
        "message" in errorData.error
      ) {
        errorMessage = errorData.error.message;
      } else if (typeof errorData.error === "string") {
        errorMessage = errorData.error;
      }

      throw new Error(errorMessage);
    }

    throw new Error("Không thể xác thực mã giảm giá");
  }
};

const orderService = {
  /**
   * Lấy danh sách đơn hàng với phân trang và lọc
   * @param params Tham số lọc và phân trang
   */
  getOrders: async (params?: OrderListParams): Promise<OrderListResponse> => {
    try {
      // Xây dựng query params
      const queryParams = new URLSearchParams();
      if (params) {
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.orderStatus)
          queryParams.append("status", params.orderStatus);
        if (params.orderNumber)
          queryParams.append("orderNumber", params.orderNumber);
      }

      // Gọi API
      const response = await apiClient.get(
        `${API_ENDPOINTS.ORDER.LIST}?${queryParams.toString()}`
      );

      // Log data để debug
      console.log("Raw API response:", response.data);

      // Kiểm tra cấu trúc dữ liệu
      if (response.data && response.data.success) {
        // Chuyển đổi cấu trúc dữ liệu để khớp với OrderListResponse
        return {
          orders: response.data.data.orders || [], // Sửa 'data' thành 'orders'
          pagination: {
            page: response.data.data.pagination.page || 1,
            limit: response.data.data.pagination.limit || 10,
            total: response.data.data.pagination.total || 0, // Thêm 'total'
            totalPages: response.data.data.pagination.totalPages || 0,
            // Không cần totalItems vì đã có total
          },
        };
      }

      // Trường hợp không có dữ liệu
      return {
        orders: [], // Sửa 'data' thành 'orders'
        pagination: {
          page: 1,
          limit: 10,
          total: 0, // Thêm 'total'
          totalPages: 0,
          // Không cần totalItems
        },
      };
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết đơn hàng theo ID
   * @param id ID đơn hàng
   */
  getOrderById: async (id: number): Promise<OrderDetail> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDER.DETAIL(id), {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      handleAxiosError(error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết đơn hàng theo số đơn hàng
   * @param orderNumber Số đơn hàng
   */
  getOrderByNumber: async (orderNumber: string): Promise<OrderDetail> => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.ORDER.BY_NUMBER(orderNumber),
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching order ${orderNumber}:`, error);
      handleAxiosError(error);
      throw error;
    }
  },

  /**
   * Tạo đơn hàng mới
   */
  createOrder: async (
    orderData: CreateOrderRequest
  ): Promise<ApiResponse<CreateOrderResponse>> => {
    try {
      console.log("Sending order data:", JSON.stringify(orderData, null, 2));

      // Đảm bảo mảng items tồn tại và không rỗng
      if (
        !orderData.items ||
        !Array.isArray(orderData.items) ||
        orderData.items.length === 0
      ) {
        throw new Error("Danh sách sản phẩm không hợp lệ");
      }

      // Thêm withCredentials để gửi cookie
      const response = await apiClient.post(
        API_ENDPOINTS.ORDER.CREATE,
        orderData,
        { withCredentials: true } // Đảm bảo cookies được gửi với mỗi request
      );

      // Đảm bảo luôn trả về định dạng nhất quán
      const apiResponse: ApiResponse<CreateOrderResponse> = {
        success: response.data.success || true,
        data: {
          // Bỏ trường 'id' ở đây vì không tồn tại trong interface CreateOrderResponse
          orderId:
            response.data.orderId || response.data.id || response.data.data?.id,
          orderNumber:
            response.data.orderNumber ||
            response.data.data?.orderNumber ||
            orderData.orderNumber,
          success: response.data.success || true,
          message: response.data.message,
          // Thêm các trường khác từ response.data nếu cần
          ...(response.data.order && { order: response.data.order }),
        },
        message: response.data.message,
      };

      return apiResponse;
    } catch (error: unknown) {
      // Thêm kiểu cho error và kiểm tra kiểu trước khi truy cập thuộc tính
      console.error(
        "Order creation error detail:",
        error instanceof AxiosError ? error.response?.data : error
      );

      // Xử lý lỗi cụ thể - kiểm tra kiểu AxiosError
      if (error instanceof AxiosError && error.response?.data?.error) {
        const errorMessage =
          typeof error.response.data.error === "object" &&
          error.response.data.error.message
            ? error.response.data.error.message
            : error.response.data.error;
        throw new Error(errorMessage);
      }

      // Xử lý trường hợp error là Error (ví dụ: lỗi từ throw new Error)
      if (error instanceof Error) {
        throw error; // Đã có message
      }

      // Trường hợp error không phải Error hoặc AxiosError
      handleAxiosError(error, "Không thể tạo đơn hàng");
      throw new Error("Không thể tạo đơn hàng");
    }
  },

  /**
   * Hủy đơn hàng
   * @param id ID đơn hàng cần hủy
   * @param reason Lý do hủy đơn hàng (tham số tùy chọn)
   */
  cancelOrder: async (
    id: number,
    reason?: string
  ): Promise<ApiResponse<OrderSummary>> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.ORDER.CANCEL(id),
        { reason }, // Thêm reason vào request body
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Error cancelling order ${id}:`, error);
      handleAxiosError(error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin đơn hàng
   * @param id ID đơn hàng
   * @param updateData Thông tin cần cập nhật
   */
  updateOrderInfo: async (
    id: number,
    updateData: UpdateOrderInfoRequest
  ): Promise<ApiResponse<Order>> => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.ORDER.UPDATE_INFO(id),
        updateData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating order info for ${id}:`, error);
      handleAxiosError(error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng (chỉ cho Admin)
   * @param id ID đơn hàng
   * @param statusData Dữ liệu trạng thái mới
   */
  updateOrderStatusAdmin: async (
    id: number,
    statusData: UpdateOrderStatusRequest
  ): Promise<ApiResponse<Order>> => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.ORDER.UPDATE_STATUS(id),
        statusData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating order status for ${id}:`, error);
      handleAxiosError(error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái thanh toán (chỉ cho Admin)
   * @param id ID đơn hàng
   * @param paymentData Dữ liệu thanh toán mới
   */
  updatePaymentStatus: async (
    id: number,
    paymentData: UpdatePaymentStatusRequest
  ): Promise<ApiResponse<Order>> => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.ORDER.UPDATE_PAYMENT(id),
        paymentData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating payment status for ${id}:`, error);
      handleAxiosError(error);
      throw error;
    }
  },

  /**
   * Lấy danh sách trạng thái đơn hàng và trạng thái thanh toán
   */
  getOrderStatuses: async (): Promise<GetOrderStatusesResponse> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDER.STATUSES);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching order statuses:", error);
      handleAxiosError(error);
      throw error;
    }
  },

  generateInvoice, // Thêm method này
  trackOrderByTrackingNumber, // Thêm hàm này
  trackOrderByOrderNumberAndPhone, // Thêm method này
  validateCoupon, // Thêm method này

  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại
   */
  getUserOrders: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ORDER.LIST);
    return response.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng
   * @param id ID đơn hàng
   * @param status Trạng thái đơn hàng mới
   * @param notes Ghi chú (tuỳ chọn)
   */
  updateOrderStatus: async (
    id: number,
    status: OrderStatus,
    notes?: string
  ) => {
    const response = await apiClient.put(
      API_ENDPOINTS.ORDER.UPDATE_STATUS(id),
      { status, notes }
    );
    return response.data;
  },

  /**
   * Theo dõi đơn hàng bằng số đơn và số điện thoại
   */
  trackOrder: async (data: { orderNumber: string; phone: string }) => {
    const response = await apiClient.post(
      API_ENDPOINTS.ORDER.TRACK_BY_ORDER_NUMBER_PHONE,
      data
    );
    return response.data;
  },
};

export default orderService;
