import axios from "axios";
import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import {
  Product,
  ProductInput,
  ProductFilter,
  ProductsResponse,
  ApiSuccessResponse,
  ProductImageResponse,
  // ProductViewResponse,
} from "@/types/product";
import { Category } from "@/services/categoryService";
export const productService = {
  /**
   * Lấy danh sách sản phẩm với phân trang, lọc và tìm kiếm
   */
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    sort?: "price_asc" | "price_desc" | "newest" | "popular" | "bestselling"; // Thêm "bestselling"
    search?: string;
    filter?: ProductFilter;
  }): Promise<ProductsResponse> => {
    try {
      const queryParams: Record<string, string> = {};

      if (params?.page) queryParams.page = params.page.toString();
      if (params?.limit) queryParams.limit = params.limit.toString();
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.search) queryParams.search = params.search;

      if (params?.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams[`filter[${key}]`] = value.toString();
          }
        });
      }

      const response = await apiClient.get(API_ENDPOINTS.PRODUCT.LIST, {
        params: queryParams,
        withCredentials: true,
      });

      // Chuyển đổi cấu trúc API thành cấu trúc mong đợi
      const apiResponse = response.data;
      if (apiResponse.success && apiResponse.data) {
        return {
          success: true,
          data: {
            rows: apiResponse.data.products || [],
            count: apiResponse.data.pagination?.total || 0,
            totalPages: apiResponse.data.pagination?.totalPages || 1,
            currentPage: apiResponse.data.pagination?.page || 1,
          },
        };
      }

      return apiResponse;
    } catch (error) {
      console.error("Error fetching products:", error);
      handleAxiosError(error);
      throw error;
    }
  },

  // Update getProductBySlug
  getProductBySlug: async (slug: string): Promise<Product> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCT.BY_SLUG(slug));
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching product with slug ${slug}:`, error);
      handleAxiosError(error);
      throw error;
    }
  },

  // Update getFeaturedProducts
  getFeaturedProducts: async (limit = 4): Promise<Product[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCT.FEATURED, {
        params: { limit },
      });

      if (response.data && response.data.success) {
        return response.data.data || [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching featured products:", error);
      handleAxiosError(error);
      return [];
    }
  },

  // Update getRelatedProducts
  getRelatedProducts: async (
    productId: number,
    limit = 4
  ): Promise<Product[]> => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.PRODUCT.RELATED(productId.toString()),
        { params: { limit } }
      );

      if (response.data && response.data.success) {
        return response.data.data || [];
      }

      return [];
    } catch (error) {
      console.error(
        `Error fetching related products for product ${productId}:`,
        error
      );
      handleAxiosError(error);
      return [];
    }
  },

  // Sửa hàm getProductById trong productService
  getProductById: async (id: number): Promise<Product> => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.PRODUCT.BY_ID(id.toString())
      );

      // Kiểm tra cấu trúc và trả về đúng dữ liệu sản phẩm
      if (response.data && response.data.success && response.data.data) {
        return response.data.data; // Trả về phần data của response
      }

      throw new Error("Invalid product data structure");
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
        }
      }
      throw error;
    }
  },

  createProduct: async (
    productData: ProductInput | FormData
  ): Promise<Product> => {
    try {
      const isFormData = productData instanceof FormData;
      const response = await apiClient.post(
        API_ENDPOINTS.PRODUCT.CREATE,
        productData,
        isFormData
          ? { withCredentials: true } // Không đặt header Content-Type
          : { withCredentials: true }
      );

      return response.data.data.product;
    } catch (error) {
      console.error("Error creating product:", error);
      handleAxiosError(error);
      throw error;
    }
  },

  updateProduct: async (
    id: number,
    productData: Partial<ProductInput> | FormData
  ): Promise<Product> => {
    try {
      const isFormData = productData instanceof FormData;
      const response = await apiClient.put(
        API_ENDPOINTS.PRODUCT.UPDATE(id.toString()),
        productData,
        isFormData
          ? { withCredentials: true } // Không đặt header Content-Type
          : { withCredentials: true }
      );

      return response.data.data.product;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      handleAxiosError(error);
      throw error;
    }
  },

  deleteProduct: async (id: number): Promise<ApiSuccessResponse> => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.PRODUCT.DELETE(id.toString())
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      handleAxiosError(error);
      throw error;
    }
  },

  uploadProductImages: async (
    productId: number,
    imageData: {
      url: string;
      isFeatured?: boolean;
      altText?: string;
    }[]
  ): Promise<ProductImageResponse> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.PRODUCT.UPLOAD_IMAGES(productId.toString()),
        { images: imageData }
      );
      return response.data;
    } catch (error) {
      console.error(`Error uploading images for product ${productId}:`, error);
      handleAxiosError(error);
      throw error;
    }
  },

  deleteProductImage: async (
    productId: number,
    imageId: number
  ): Promise<ApiSuccessResponse> => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.PRODUCT.DETAIL(
          productId.toString()
        )}/images/${imageId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error deleting image ${imageId} for product ${productId}:`,
        error
      );
      handleAxiosError(error);
      throw error;
    }
  },

  setProductThumbnail: async (
    productId: number,
    imageId: number
  ): Promise<ApiSuccessResponse> => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.PRODUCT.SET_THUMBNAIL(
          productId.toString(),
          imageId.toString()
        )
      );
      return response.data;
    } catch (error) {
      console.error(`Error setting thumbnail for product ${productId}:`, error);
      handleAxiosError(error);
      throw error;
    }
  },

  // Update updateProductView - change to POST based on new API
  updateProductView: async (productId: number): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.PRODUCT.VIEW(productId.toString()));
      // No need to return anything as this is just tracking
    } catch (error) {
      console.error(
        `Error updating view count for product ${productId}:`,
        error
      );
      // Don't throw error, just log it as this is non-critical
    }
  },

  /**
   * Lấy danh sách sản phẩm theo danh mục
   * @param categorySlug Slug của danh mục
   * @param page Trang (mặc định: 1)
   * @param limit Số sản phẩm trên mỗi trang (mặc định: 10)
   */
  getProductsByCategory: async (
    categorySlug: string,
    page: number = 1,
    limit: number = 12
  ): Promise<{
    products: Product[];
    category: Category | null;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.PRODUCT.BY_CATEGORY(categorySlug)}`,
        {
          params: { page, limit },
        }
      );

      if (response.data && response.data.success) {
        return {
          products: response.data.data.products || [],
          category: response.data.data.category || null,
          pagination: response.data.data.pagination || {
            total: 0,
            page: 1,
            limit: limit,
            totalPages: 0,
          },
        };
      }

      return {
        products: [],
        category: null,
        pagination: {
          total: 0,
          page: 1,
          limit: limit,
          totalPages: 0,
        },
      };
    } catch (error) {
      console.error(
        `Error fetching products for category ${categorySlug}:`,
        error
      );

      // Trả về dữ liệu mặc định khi có lỗi
      return {
        products: [],
        category: null,
        pagination: {
          total: 0,
          page: 1,
          limit: limit,
          totalPages: 0,
        },
      };
    }
  },
};

// Helper function to handle Axios errors
function handleAxiosError(error: unknown): void {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
  }
}

export default productService;
