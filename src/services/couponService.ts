import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { AxiosError } from "axios";
import {
  Coupon,
  ValidateCouponRequest,
  ValidateCouponResponse,
  ApplyCouponRequest,
  ApplyCouponResponse,
  CouponListParams,
  CouponListResponse,
  CouponInput,
} from "@/types/coupon";

// API Error Response interface
interface ApiErrorResponse {
  success: false;
  error:
    | string
    | {
        message: string;
        isValidationError?: boolean;
      };
}

// API response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Helper function để xử lý lỗi Axios
function handleAxiosError(
  error: unknown,
  defaultMessage = "Đã xảy ra lỗi"
): Error {
  if (error instanceof AxiosError && error.response?.data) {
    const errorData = error.response.data as ApiErrorResponse;
    let errorMessage = defaultMessage;

    if (
      typeof errorData.error === "object" &&
      errorData.error !== null &&
      "message" in errorData.error
    ) {
      // Nếu error là object có thuộc tính message
      errorMessage = errorData.error.message;
    } else if (typeof errorData.error === "string") {
      // Nếu error là string
      errorMessage = errorData.error;
    }

    return new Error(errorMessage);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(defaultMessage);
}

const couponService = {
  /**
   * Kiểm tra mã giảm giá có hợp lệ hay không
   * @param code Mã giảm giá
   * @param cartTotal Tổng giá trị giỏ hàng
   */
  validateCoupon: async (
    code: string,
    cartTotal: number
  ): Promise<ApiResponse<ValidateCouponResponse>> => {
    try {
      const request: ValidateCouponRequest = { code, cartTotal };
      const response = await apiClient.post(
        API_ENDPOINTS.COUPON.VALIDATE,
        request
      );
      return response.data;
    } catch (error) {
      const formattedError = handleAxiosError(
        error,
        "Không thể xác thực mã giảm giá"
      );
      throw formattedError;
    }
  },

  /**
   * Áp dụng mã giảm giá vào giỏ hàng
   * @param data Dữ liệu mã giảm giá và giỏ hàng
   */
  applyCoupon: async (
    data: ApplyCouponRequest
  ): Promise<ApiResponse<ApplyCouponResponse>> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.COUPON.APPLY, data, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      const formattedError = handleAxiosError(
        error,
        "Không thể áp dụng mã giảm giá"
      );
      throw formattedError;
    }
  },

  /**
   * Lấy danh sách mã giảm giá (chỉ dành cho Admin)
   * @param params Tham số lọc và phân trang
   */
  getCoupons: async (
    params?: CouponListParams
  ): Promise<ApiResponse<CouponListResponse>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.active !== undefined)
          queryParams.append("active", params.active.toString());
        if (params.type) queryParams.append("type", params.type);
        if (params.fromDate) queryParams.append("fromDate", params.fromDate);
        if (params.toDate) queryParams.append("toDate", params.toDate);
      }

      const response = await apiClient.get(
        `${API_ENDPOINTS.COUPON.LIST}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      const formattedError = handleAxiosError(
        error,
        "Không thể lấy danh sách mã giảm giá"
      );
      throw formattedError;
    }
  },

  /**
   * Lấy chi tiết mã giảm giá (chỉ dành cho Admin)
   * @param id ID của mã giảm giá
   */
  getCouponById: async (id: number): Promise<ApiResponse<Coupon>> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COUPON.DETAIL(id));
      return response.data;
    } catch (error) {
      const formattedError = handleAxiosError(
        error,
        "Không thể lấy thông tin mã giảm giá"
      );
      throw formattedError;
    }
  },

  /**
   * Tạo mã giảm giá mới (chỉ dành cho Admin)
   * @param couponData Dữ liệu mã giảm giá
   */
  createCoupon: async (
    couponData: CouponInput
  ): Promise<ApiResponse<Coupon>> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.COUPON.CREATE,
        couponData
      );
      return response.data;
    } catch (error) {
      const formattedError = handleAxiosError(
        error,
        "Không thể tạo mã giảm giá"
      );
      throw formattedError;
    }
  },

  /**
   * Cập nhật mã giảm giá (chỉ dành cho Admin)
   * @param id ID của mã giảm giá
   * @param couponData Dữ liệu cập nhật
   */
  updateCoupon: async (
    id: number,
    couponData: Partial<CouponInput>
  ): Promise<ApiResponse<Coupon>> => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.COUPON.UPDATE(id),
        couponData
      );
      return response.data;
    } catch (error) {
      const formattedError = handleAxiosError(
        error,
        "Không thể cập nhật mã giảm giá"
      );
      throw formattedError;
    }
  },

  /**
   * Xóa mã giảm giá (chỉ dành cho Admin)
   * @param id ID của mã giảm giá
   */
  deleteCoupon: async (id: number): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.COUPON.DELETE(id));
      return response.data;
    } catch (error) {
      const formattedError = handleAxiosError(
        error,
        "Không thể xóa mã giảm giá"
      );
      throw formattedError;
    }
  },
};

export default couponService;
