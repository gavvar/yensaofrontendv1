import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "@/services/api/endpoints";

import { AxiosError } from "axios";
import { toast } from "react-toastify";
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
      // Normalize payment method to lowercase
      const normalizedMethod = paymentData.paymentMethod.toLowerCase();

      console.log("Creating payment with data:", {
        ...paymentData,
        paymentMethod: normalizedMethod,
      });

      // Đảm bảo orderNumber và amount không bị undefined
      const apiPayload: ProcessPaymentRequest = {
        orderId: paymentData.orderId,
        method: normalizedMethod as PaymentMethodCode,
        clientUrl: paymentData.clientUrl,
        returnUrl: `${paymentData.clientUrl}/checkout/complete?orderId=${paymentData.orderId}`,
        orderNumber: paymentData.orderNumber || "",
        amount: paymentData.amount || 0,
      };

      const response = await apiClient.post(
        API_ENDPOINTS.PAYMENT.CREATE,
        apiPayload
      );

      console.log("Payment API response:", response.data);

      // Return full response for better debugging
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

  /**
   * Chuyển hướng đến cổng thanh toán
   */
  redirectToPaymentGateway: async (paymentData: {
    orderId: number;
    orderNumber: string;
    paymentMethod: PaymentMethodCode | string;
    amount: number;
  }): Promise<boolean> => {
    try {
      // Log thông tin thanh toán
      console.log("Processing payment:", paymentData);

      // Xác định xem phương thức thanh toán có cần chuyển hướng không
      const isRedirectPayment = ["momo", "zalopay", "vnpay"].includes(
        paymentData.paymentMethod.toLowerCase()
      );

      // Nếu không cần chuyển hướng (ví dụ: COD, chuyển khoản ngân hàng)
      if (!isRedirectPayment) {
        return true; // Trả về true để tiếp tục xử lý
      }

      // Tạo yêu cầu thanh toán với API
      const response = await paymentService.createPayment({
        orderId: paymentData.orderId,
        paymentMethod: paymentData.paymentMethod as PaymentMethodCode,
        clientUrl: typeof window !== "undefined" ? window.location.origin : "",
        orderNumber: paymentData.orderNumber,
        amount: paymentData.amount,
      });

      if (response.success && response.data?.paymentUrl) {
        // Lưu thông tin thanh toán vào localStorage để kiểm tra sau
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "pendingOrderId",
            paymentData.orderId.toString()
          );
          localStorage.setItem("pendingOrderNumber", paymentData.orderNumber);
          localStorage.setItem(
            "pendingPaymentMethod",
            paymentData.paymentMethod
          );
          localStorage.setItem(
            "pendingPaymentAmount",
            paymentData.amount.toString()
          );
          localStorage.setItem("pendingPaymentTime", new Date().toISOString());
        }

        // Chuyển hướng người dùng đến trang thanh toán
        window.location.href = response.data.paymentUrl;
        return true;
      } else {
        // Xử lý thông báo lỗi
        toast.error(response.message || "Không thể khởi tạo thanh toán");
        return false;
      }
    } catch (error) {
      console.error("Payment redirect error:", error);
      toast.error(
        error instanceof Error ? error.message : "Lỗi khi xử lý thanh toán"
      );
      return false;
    }
  },

  /**
   * Xử lý kết quả thanh toán sau khi quay lại từ cổng thanh toán
   */
  handlePaymentReturn: async (params: {
    orderId?: string | number;
    orderNumber?: string;
    paymentId?: string;
    transactionId?: string;
    resultCode?: string;
    message?: string;
  }): Promise<{
    success: boolean;
    orderId: number | null;
    orderNumber: string | null;
    status: "success" | "pending" | "error";
    message: string;
  }> => {
    try {
      // Lấy orderId từ params hoặc localStorage
      const orderId = params.orderId
        ? Number(params.orderId)
        : localStorage.getItem("pendingOrderId")
        ? Number(localStorage.getItem("pendingOrderId"))
        : null;

      // Lấy orderNumber từ params hoặc localStorage
      const orderNumber =
        params.orderNumber ||
        localStorage.getItem("pendingOrderNumber") ||
        null;

      if (!orderId) {
        throw new Error("Không tìm thấy thông tin đơn hàng");
      }

      // Xác minh thanh toán với backend
      const verifyResult = await paymentService.verifyPayment({
        orderId,
        ...(params.paymentId && { paymentId: params.paymentId }),
        ...(params.transactionId && { transactionId: params.transactionId }),
      });

      // Xóa thông tin thanh toán đang chờ từ localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("pendingOrderId");
        localStorage.removeItem("pendingOrderNumber");
        localStorage.removeItem("pendingPaymentMethod");
        localStorage.removeItem("pendingPaymentAmount");
        localStorage.removeItem("pendingPaymentTime");
      }

      // Xử lý kết quả xác minh
      if (verifyResult.success) {
        const paymentStatus = verifyResult.data?.paymentStatus || "pending";

        return {
          success: paymentStatus === "paid",
          orderId: orderId,
          orderNumber: orderNumber,
          status:
            paymentStatus === "paid"
              ? "success"
              : paymentStatus === "pending"
              ? "pending"
              : "error",
          message:
            verifyResult.data?.message ||
            (paymentStatus === "paid"
              ? "Thanh toán thành công"
              : "Đang chờ xác nhận thanh toán"),
        };
      } else {
        return {
          success: false,
          orderId: orderId,
          orderNumber: orderNumber,
          status: "error",
          message: verifyResult.message || "Không thể xác minh thanh toán",
        };
      }
    } catch (error) {
      console.error("Payment return handling error:", error);
      return {
        success: false,
        orderId: null,
        orderNumber: null,
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Lỗi khi xử lý kết quả thanh toán",
      };
    }
  },

  /**
   * Kiểm tra tiến độ thanh toán
   */
  checkPaymentProgress: async (
    orderId: number
  ): Promise<{
    success: boolean;
    status: "paid" | "pending" | "cancelled" | "error";
    message: string;
  }> => {
    try {
      const response = await paymentService.processPaymentStatus(orderId);

      if (response.success) {
        const paymentStatus =
          response.data?.paymentStatus || response.data?.status || "pending";

        return {
          success: true,
          status:
            paymentStatus === "paid" || paymentStatus === "success"
              ? "paid"
              : paymentStatus === "pending"
              ? "pending"
              : paymentStatus === "cancelled"
              ? "cancelled"
              : "error",
          message: response.data?.message || "Kiểm tra thành công",
        };
      } else {
        return {
          success: false,
          status: "error",
          message: response.message || "Không thể kiểm tra tiến độ thanh toán",
        };
      }
    } catch (error) {
      console.error("Payment progress check error:", error);
      return {
        success: false,
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Lỗi khi kiểm tra tiến độ thanh toán",
      };
    }
  },
};

export default paymentService;
