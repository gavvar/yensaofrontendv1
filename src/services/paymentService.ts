import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import orderService from "@/services/orderService";
import { AxiosError } from "axios";
import {
  PaymentMethod,
  PaymentMethodCode,
  ProcessPaymentRequest,
  ProcessPaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  ProcessPaymentStatusRequest,
  ProcessPaymentStatusResponse,
  PaymentCallbackParams,
  HandleCallbackResponse,
  ApplyCouponResponse,
} from "@/types/payment";

// Thêm interface để mô tả cấu trúc dữ liệu từ API
interface PaymentMethodResponse {
  id: string;
  code?: string;
  name: string;
  description: string;
  icon?: string;
  enabled?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

const paymentService = {
  /**
   * Lấy danh sách phương thức thanh toán
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    try {
      console.log("Calling API:", API_ENDPOINTS.PAYMENT.METHODS);
      const response = await apiClient.get(API_ENDPOINTS.PAYMENT.METHODS);
      console.log("Raw API response:", response);

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        // Debug thông tin từ backend
        console.log("Payment methods from API:", response.data.data);

        // Map dữ liệu API thành cấu trúc phù hợp với frontend
        return response.data.data.map((method: PaymentMethodResponse) => ({
          id: method.id,
          code: method.code || method.id, // Sử dụng id làm code nếu không có code
          name: method.name,
          description: method.description,
          // Xử lý icon:
          // 1. Sử dụng icon từ backend nếu có (và đường dẫn đầy đủ)
          // 2. Nếu không, tạo đường dẫn từ id
          icon:
            method.icon && method.icon.startsWith("/")
              ? method.icon
              : method.icon
              ? `/images/payment/${method.icon}`
              : `/images/payment/${method.id}.png`,
          // Xử lý trạng thái active:
          // Backend trả về enabled thay vì isActive
          isActive: method.enabled !== undefined ? method.enabled : true,
          enabled: method.enabled !== undefined ? method.enabled : true,
          sortOrder: method.sortOrder || 0,
        }));
      }

      console.error("API returned invalid data structure:", response.data);
      throw new Error("Không thể lấy phương thức thanh toán từ server");
    } catch (error) {
      console.error("Error fetching payment methods:", error);

      // Thông báo lỗi chi tiết
      if (error instanceof AxiosError) {
        console.error("API Status:", error.response?.status);
        console.error("API Response:", error.response?.data);

        // Xử lý các trường hợp lỗi cụ thể
        if (error.response?.status === 401) {
          throw new Error("Vui lòng đăng nhập để xem phương thức thanh toán");
        }
        if (error.response?.status === 403) {
          throw new Error("Bạn không có quyền xem phương thức thanh toán");
        }
        if (error.response?.status === 404) {
          throw new Error("API phương thức thanh toán không tồn tại");
        }
        if (error.response?.status === 500) {
          throw new Error("Lỗi server khi lấy phương thức thanh toán");
        }
      }

      // Ném lỗi để component xử lý
      throw new Error("Không thể kết nối đến server thanh toán");
    }
  },

  /**
   * Tạo yêu cầu thanh toán
   */
  createPayment: async (paymentData: {
    orderId: number;
    paymentMethod: PaymentMethodCode | string;
    clientUrl: string;
    orderNumber?: string;
    amount?: number;
  }): Promise<ProcessPaymentResponse> => {
    try {
      // Lấy thông tin đơn hàng từ API (nếu cần)
      const orderDetails =
        !paymentData.orderNumber || !paymentData.amount
          ? await orderService.getOrderById(paymentData.orderId)
          : null;

      // Biến đổi thành payload API cần
      const apiPayload: ProcessPaymentRequest = {
        orderId: paymentData.orderId,
        method: paymentData.paymentMethod.toLowerCase() as PaymentMethodCode,
        clientUrl: paymentData.clientUrl,
        returnUrl: `${paymentData.clientUrl}/checkout/complete?orderId=${paymentData.orderId}`,
        orderNumber:
          paymentData.orderNumber ||
          (orderDetails ? orderDetails.orderNumber : undefined),
        amount:
          paymentData.amount ||
          (orderDetails ? orderDetails.totalAmount : undefined),
      };

      const response = await apiClient.post(
        API_ENDPOINTS.PAYMENT.CREATE,
        apiPayload
      );
      return response.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },

  /**
   * Kiểm tra trạng thái thanh toán
   */
  verifyPayment: async (
    verifyData: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.PAYMENT.VERIFY,
        verifyData
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  },

  /**
   * Kiểm tra và xử lý trạng thái thanh toán
   */
  processPaymentStatus: async (
    orderId: number
  ): Promise<ProcessPaymentStatusResponse> => {
    try {
      const payload: ProcessPaymentStatusRequest = { orderId };
      const response = await apiClient.post(
        API_ENDPOINTS.PAYMENT.STATUS,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error processing payment status:", error);
      throw error;
    }
  },

  /**
   * Xử lý callback từ cổng thanh toán
   */
  handleCallback: async (
    provider: string,
    params: PaymentCallbackParams
  ): Promise<HandleCallbackResponse> => {
    try {
      // Sử dụng endpoint đúng - endpoint là một hàm nhận provider
      const response = await apiClient.post(
        API_ENDPOINTS.PAYMENT.CALLBACK(provider),
        { params }
      );
      return response.data;
    } catch (error) {
      console.error(`Error handling ${provider} callback:`, error);

      // Trả về kết quả lỗi nếu có exception
      return {
        success: false,
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể xử lý callback thanh toán",
      };
    }
  },

  /**
   * Áp dụng mã giảm giá
   */
  applyCoupon: async (couponData: {
    code: string;
    totalAmount: number;
    orderId?: number;
    cartItems?: Array<{
      productId: number;
      price: number;
      quantity: number;
    }>;
  }): Promise<ApplyCouponResponse> => {
    try {
      // Đảm bảo code không null/undefined và được trim
      if (!couponData.code?.trim()) {
        throw new Error("Mã giảm giá không được để trống");
      }

      // Chuẩn bị payload theo yêu cầu backend
      const apiPayload = {
        code: couponData.code.trim(),
        // Sử dụng cartItems nếu được cung cấp
        ...(couponData.cartItems && { cartItems: couponData.cartItems }),
        // Chỉ gửi subtotal nếu không có cartItems
        ...(!couponData.cartItems && { subtotal: couponData.totalAmount }),
        // Thêm orderId nếu có
        ...(couponData.orderId && { orderId: couponData.orderId }),
      };

      console.log("Sending coupon data:", apiPayload);

      const response = await apiClient.post(
        API_ENDPOINTS.COUPON.APPLY,
        apiPayload
      );

      // Xử lý response trả về
      const responseData = response.data;

      // Thêm trường discount cho phù hợp với interface cũ
      if (responseData.success && responseData.data) {
        if (
          responseData.data.discountAmount !== undefined &&
          responseData.data.discount === undefined
        ) {
          responseData.data.discount = responseData.data.discountAmount;
        }
      }

      return responseData;
    } catch (error: unknown) {
      console.error("Error applying coupon:", error);

      // Kiểm tra nếu error là AxiosError
      if (error instanceof AxiosError && error.response?.data) {
        const errorResponse = error.response.data;

        // Trả về response lỗi từ API nếu có định dạng phù hợp
        if (typeof errorResponse === "object") {
          return {
            success: false,
            message:
              errorResponse.message ||
              errorResponse.error?.message ||
              "Không thể áp dụng mã giảm giá",
            data: {
              valid: false,
              isValid: false,
              code: couponData.code,
              discountAmount: 0,
              discount: 0, // Thêm trường này
              subtotalAfterDiscount: couponData.totalAmount,
              cartTotal: couponData.totalAmount,
              finalTotal: couponData.totalAmount,
              discountType: "fixed",
              discountValue: 0,
            },
          };
        }
      }

      // Fallback error response
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể áp dụng mã giảm giá",
        data: {
          valid: false,
          isValid: false,
          code: couponData.code,
          discountAmount: 0,
          discount: 0, // Thêm trường này
          subtotalAfterDiscount: couponData.totalAmount,
          cartTotal: couponData.totalAmount,
          finalTotal: couponData.totalAmount,
          discountType: "fixed",
          discountValue: 0,
        },
      };
    }
  },
};

export default paymentService;
