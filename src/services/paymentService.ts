import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { AxiosError } from "axios";
import {
  PaymentMethod,
  ProcessPaymentRequest,
  ProcessPaymentResponse,
  CreatePaymentRequest, // Thêm import này để thay thế định nghĩa nội bộ
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  ApplyCouponRequest,
  ApplyCouponResponse,
  ProcessPaymentStatusRequest,
  ProcessPaymentStatusResponse,
} from "@/types/payment";

// API Error Response interface
interface ApiErrorResponse {
  success: false;
  error: string;
}

// API response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Định nghĩa kiểu dữ liệu cho phương thức thanh toán từ API
interface PaymentMethodResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  enabled: boolean;
  [key: string]: unknown; // Cho phép các thuộc tính khác từ API
}

const paymentService = {
  /**
   * Lấy danh sách phương thức thanh toán
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PAYMENT.METHODS);

      // Chuyển đổi dữ liệu để phù hợp với interface
      return response.data.data.map((method: PaymentMethodResponse) => ({
        ...method,
        isAvailable: method.enabled !== false,
      }));
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      handleAxiosError(error, "Không thể lấy phương thức thanh toán");
      return [];
    }
  },

  /**
   * Xử lý thanh toán đơn hàng và chuyển hướng đến cổng thanh toán nếu cần
   * @param paymentData Dữ liệu thanh toán
   */
  processPayment: async (
    paymentData: ProcessPaymentRequest
  ): Promise<ApiResponse<ProcessPaymentResponse>> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.PAYMENT.PROCESS,
        paymentData
      );
      return response.data;
    } catch (error) {
      console.error("Error processing payment:", error);
      handleAxiosError(error);
      throw error;
    }
  },

  /**
   * Xác minh trạng thái thanh toán
   * @param verifyData Dữ liệu xác minh thanh toán
   */
  verifyPayment: async (
    verifyData: VerifyPaymentRequest
  ): Promise<ApiResponse<VerifyPaymentResponse>> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.PAYMENT.VERIFY,
        verifyData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error || "Không thể xác thực thanh toán");
      }

      throw new Error("Không thể xác thực thanh toán");
    }
  },

  /**
   * Áp dụng mã giảm giá và tính toán số tiền giảm
   * @param couponData Dữ liệu mã giảm giá
   */
  applyCoupon: async (
    couponData: ApplyCouponRequest
  ): Promise<ApiResponse<ApplyCouponResponse>> => {
    try {
      const response = await apiClient.post("/coupons/apply", couponData);
      return response.data;
    } catch (error) {
      console.error("Error applying coupon:", error);
      handleAxiosError(error);
      throw error;
    }
  },

  /**
   * Xác thực mã giảm giá
   * @param code Mã giảm giá
   */
  validateCoupon: async (code: string): Promise<boolean> => {
    try {
      const response = await apiClient.get(`/coupons/validate/${code}`);
      return response.data.success;
    } catch (error) {
      console.error(`Error validating coupon ${code}:`, error);
      handleAxiosError(error);
      return false;
    }
  },

  /**
   * Tạo yêu cầu thanh toán mới
   */
  createPayment: async (
    paymentData: CreatePaymentRequest
  ): Promise<ApiResponse<ProcessPaymentResponse>> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.PAYMENT.CREATE,
        paymentData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating payment:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error || "Không thể tạo thanh toán");
      }

      throw new Error("Không thể tạo yêu cầu thanh toán");
    }
  },

  /**
   * Kiểm tra trạng thái thanh toán của một đơn hàng
   * @param orderId ID đơn hàng cần kiểm tra
   */
  processPaymentStatus: async (
    orderId: number
  ): Promise<ApiResponse<ProcessPaymentStatusResponse>> => {
    try {
      const request: ProcessPaymentStatusRequest = { orderId };
      const response = await apiClient.post(
        API_ENDPOINTS.PAYMENT.PROCESS,
        request,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error processing payment status:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(
          errorData.error || "Không thể kiểm tra trạng thái thanh toán"
        );
      }

      throw new Error("Không thể kiểm tra trạng thái thanh toán");
    }
  },
};

// Helper function to handle Axios errors
function handleAxiosError(error: unknown, customMessage?: string): void {
  if (error instanceof AxiosError && error.response?.data) {
    const errorData = error.response.data as ApiErrorResponse;
    console.error("API Error:", errorData.error);
  }
  if (customMessage) {
    console.error(customMessage);
  }
}

export default paymentService;
