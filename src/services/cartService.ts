import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { Cart, CartItem } from "@/contexts/CartContext";
import { AxiosError } from "axios";

// Định nghĩa interface cho API Error Response
interface ApiErrorResponse {
  success: false;
  error: string;
}

// 1. Tạo interface cho API response
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 1. Đảm bảo getCart đúng với API
const getCart = async (): Promise<ApiResponse<Cart>> => {
  try {
    console.log("Calling API to get cart");
    const response = await apiClient.get(API_ENDPOINTS.CART.GET, {
      withCredentials: true, // Đảm bảo gửi cookies với request
    });
    console.log("Raw get cart response:", response.data);

    // Trả về toàn bộ response để xử lý trong context
    return response.data;
  } catch (error: unknown) {
    console.error("Error in getCart service:", error);
    throw error;
  }
};

// 2. Đảm bảo addToCart đúng với API
const addToCart = async (
  productId: number,
  quantity: number,
  notes?: string
): Promise<ApiResponse<CartItem>> => {
  try {
    console.log("Calling API to add to cart:", { productId, quantity, notes });
    const response = await apiClient.post(
      API_ENDPOINTS.CART.ADD,
      { productId, quantity, notes },
      { withCredentials: true }
    );
    console.log("Raw add to cart response:", response.data);

    // Trả về toàn bộ response để xử lý trong context
    return response.data;
  } catch (error: unknown) {
    console.error("Error in addToCart service:", error);
    throw error;
  }
};

/**
 * Xóa nhiều sản phẩm khỏi giỏ hàng
 * @param itemIds Danh sách ID các sản phẩm cần xóa
 */
const removeItems = async (itemIds: number[]): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.CART.REMOVE_ITEMS,
      { items: itemIds }, // Đổi tên từ itemIds thành items để khớp với API
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing items from cart:", error);

    // Xử lý lỗi chi tiết
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new Error(errorData.error || "Không thể xóa các sản phẩm");
    }

    throw new Error("Không thể xóa các sản phẩm");
  }
};

// 3. Đảm bảo các endpoint khác
const cartService = {
  getCart,
  addToCart,
  /**
   * Cập nhật số lượng của sản phẩm trong giỏ hàng
   */
  updateQuantity: async (
    cartItemId: number,
    quantity: number
  ): Promise<CartItem> => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.CART.UPDATE_QUANTITY(cartItemId),
        { quantity }
      );
      return response.data.data;
    } catch (error: unknown) {
      console.error("Error updating quantity:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error || "Không thể cập nhật số lượng");
      }

      throw new Error("Không thể cập nhật số lượng");
    }
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  removeItem: async (
    cartItemId: number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.CART.REMOVE_ITEM(cartItemId)
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error removing item:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error || "Không thể xóa sản phẩm");
      }

      throw new Error("Không thể xóa sản phẩm");
    }
  },

  removeItems, // Thêm ở đây

  /**
   * Chọn/bỏ chọn sản phẩm để thanh toán
   */
  toggleSelect: async (
    cartItemId: number,
    selected: boolean
  ): Promise<CartItem> => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.CART.TOGGLE_SELECT(cartItemId),
        { selected }
      );
      return response.data.data;
    } catch (error: unknown) {
      console.error("Error toggling select:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error || "Không thể cập nhật trạng thái");
      }

      throw new Error("Không thể cập nhật trạng thái");
    }
  },

  /**
   * Cập nhật ghi chú cho sản phẩm
   */
  updateNotes: async (cartItemId: number, notes: string): Promise<CartItem> => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.CART.UPDATE_NOTES(cartItemId),
        { notes }
      );
      return response.data.data;
    } catch (error: unknown) {
      console.error("Error updating notes:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error || "Không thể cập nhật ghi chú");
      }

      throw new Error("Không thể cập nhật ghi chú");
    }
  },

  /**
   * Cập nhật hàng loạt nhiều sản phẩm trong giỏ
   */
  batchUpdate: async (
    items: {
      id: number;
      quantity?: number;
      selected?: boolean;
      notes?: string;
    }[]
  ): Promise<CartItem[]> => {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.CART.BATCH_UPDATE, {
        items,
      });
      return response.data.data;
    } catch (error: unknown) {
      console.error("Error batch updating:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error || "Không thể cập nhật giỏ hàng");
      }

      throw new Error("Không thể cập nhật giỏ hàng");
    }
  },
};

export default cartService;
