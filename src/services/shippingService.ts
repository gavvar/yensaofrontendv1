import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { AxiosError } from "axios";
import {
  ShippingProvider,
  CalculateShippingFeeRequest,
  CalculateShippingFeeResponse,
} from "@/types/shipping";

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

const shippingService = {
  /**
   * Lấy danh sách nhà cung cấp vận chuyển
   */
  getShippingProviders: async (): Promise<ShippingProvider[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SHIPPING.PROVIDERS);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching shipping providers:", error);
      handleAxiosError(error);
      throw error;
    }
  },

  /**
   * Tính phí vận chuyển dựa trên địa chỉ và thông tin sản phẩm
   * @param requestData Dữ liệu yêu cầu tính phí vận chuyển
   */
  calculateShippingFee: async (
    requestData: CalculateShippingFeeRequest
  ): Promise<ApiResponse<CalculateShippingFeeResponse>> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.SHIPPING.CALCULATE_FEE,
        requestData
      );
      return response.data;
    } catch (error) {
      console.error("Error calculating shipping fee:", error);
      handleAxiosError(error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tỉnh/thành phố (nếu API hỗ trợ)
   */
  getCities: async (): Promise<{ id: string; name: string }[]> => {
    try {
      // Nếu API của bạn hỗ trợ endpoint này
      const response = await apiClient.get("/shipping/cities");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching cities:", error);
      handleAxiosError(error);
      // Trả về mảng rỗng thay vì throw error để không làm gián đoạn UI
      return [];
    }
  },

  /**
   * Lấy danh sách quận/huyện theo tỉnh/thành phố (nếu API hỗ trợ)
   * @param cityId ID của tỉnh/thành phố
   */
  getDistricts: async (
    cityId: string
  ): Promise<{ id: string; name: string }[]> => {
    try {
      // Nếu API của bạn hỗ trợ endpoint này
      const response = await apiClient.get(`/shipping/districts/${cityId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching districts for city ${cityId}:`, error);
      handleAxiosError(error);
      // Trả về mảng rỗng thay vì throw error để không làm gián đoạn UI
      return [];
    }
  },

  /**
   * Lấy danh sách phường/xã theo quận/huyện (nếu API hỗ trợ)
   * @param districtId ID của quận/huyện
   */
  getWards: async (
    districtId: string
  ): Promise<{ id: string; name: string }[]> => {
    try {
      // Nếu API của bạn hỗ trợ endpoint này
      const response = await apiClient.get(`/shipping/wards/${districtId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching wards for district ${districtId}:`, error);
      handleAxiosError(error);
      // Trả về mảng rỗng thay vì throw error để không làm gián đoạn UI
      return [];
    }
  },
};

// Helper function to handle Axios errors
function handleAxiosError(error: unknown): void {
  if (error instanceof AxiosError && error.response?.data) {
    const errorData = error.response.data as ApiErrorResponse;
    console.error("API Error:", errorData.error);
  }
}

export default shippingService;
