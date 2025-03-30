import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "./api/endpoints";

// Interface định nghĩa mô hình Category
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  subCategories?: Category[];
  products?: ProductSummary[]; // Thay thế any[] bằng ProductSummary[]
}

// Thay đổi 1: Định nghĩa interface cho Product
export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  price?: number;
  // Thêm các thuộc tính cần thiết khác
}

// Interface cho các tham số tạo và cập nhật category
export interface CategoryInput {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: number | null;
  isActive?: boolean;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
}

// Interface cho các tham số query
export interface CategoryQueryParams {
  parent?: number | null;
  active?: boolean;
  sort?: "name_asc" | "name_desc" | "sort_asc" | "sort_desc";
}

/**
 * Service xử lý các API liên quan đến Category
 */
export const categoryService = {
  /**
   * Lấy danh sách tất cả category
   * @param params Các tham số query
   * @returns Promise với danh sách category
   */
  getAllCategories: async (
    params?: CategoryQueryParams
  ): Promise<Category[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORY.LIST, {
        params,
      });
      return response.data.success ? response.data.data.categories : [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một category theo slug
   * @param slug Slug của category
   * @returns Promise với thông tin chi tiết category
   */
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    try {
      // Sửa lại cách gọi API endpoint
      const response = await apiClient.get(
        `${API_ENDPOINTS.CATEGORY.BY_SLUG}/${slug}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching category with slug ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Tạo category mới (chỉ dành cho admin)
   * @param categoryData Dữ liệu category cần tạo
   * @returns Promise với category mới được tạo
   */
  createCategory: async (categoryData: CategoryInput): Promise<Category> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.CATEGORY.CREATE,
        categoryData
      );
      return response.data.data.category;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  /**
   * Cập nhật category (chỉ dành cho admin)
   * @param id ID của category
   * @param categoryData Dữ liệu cập nhật
   * @returns Promise với category đã cập nhật
   */
  updateCategory: async (
    id: number,
    categoryData: Partial<CategoryInput>
  ): Promise<Category> => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.CATEGORY.UPDATE(id),
        categoryData
      );
      return response.data.data.category;
    } catch (error) {
      console.error(`Error updating category with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa một category (chỉ dành cho admin)
   * @param id ID của category cần xóa
   * @returns Promise với thông báo xóa thành công
   */
  deleteCategory: async (
    id: number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.CATEGORY.DELETE(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting category with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách category cha (root categories)
   * @returns Promise với danh sách category cha
   */
  getRootCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORY.LIST, {
        params: { parentId: null },
      });
      return response.data.success ? response.data.data.categories : [];
    } catch (error) {
      console.error("Error fetching root categories:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách category con của một category cha
   * @param parentId ID của category cha
   * @returns Promise với danh sách category con
   */
  getSubCategories: async (parentId: number): Promise<Category[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORY.LIST, {
        params: { parentId },
      });
      return response.data.success ? response.data.data.categories : [];
    } catch (error) {
      console.error(
        `Error fetching subcategories for parent ${parentId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Lấy toàn bộ cây danh mục (categories tree)
   * @returns Promise với cây danh mục đã được tổ chức phân cấp
   */
  getCategoryTree: async (): Promise<Category[]> => {
    try {
      // Lấy tất cả danh mục
      const allCategories = await categoryService.getAllCategories();

      // Thay đổi 2: Loại bỏ biến rootCategories không sử dụng
      // Hàm đệ quy để tạo cây danh mục
      const buildTree = (
        categories: Category[],
        parentId: number | null
      ): Category[] => {
        return categories
          .filter((cat) => cat.parentId === parentId)
          .map((cat) => ({
            ...cat,
            subCategories: buildTree(categories, cat.id),
          }));
      };

      // Xây dựng cây từ danh mục gốc
      return buildTree(allCategories, null);
    } catch (error) {
      console.error("Error building category tree:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách category với phân trang và lọc
   * @param params Các tham số query
   * @returns Promise với danh sách category
   */
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORY.LIST);

      // Kiểm tra cấu trúc response và trả về đúng dữ liệu
      if (response.data && response.data.success && response.data.data) {
        // Chỉ trả về mảng categories, không phải toàn bộ response
        return response.data.data.categories || [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
};

export default categoryService;
