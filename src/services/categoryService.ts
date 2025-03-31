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

// Định nghĩa interface cho Product
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

// Interface mới cho yêu cầu sắp xếp lại danh mục
export interface ReorderCategoryRequest {
  categoryId: number;
  newOrder: number;
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
   * Lấy chi tiết một category theo ID
   * @param id ID của category
   * @returns Promise với thông tin chi tiết category
   */
  getCategoryById: async (id: number | string): Promise<Category> => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.CATEGORY.DETAIL(id.toString())
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching category with id ${id}:`, error);
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

  /**
   * Lấy đường dẫn phân cấp (breadcrumb) cho một danh mục
   * @param identifier ID hoặc slug của danh mục
   * @returns Promise với mảng chứa các danh mục từ gốc đến danh mục hiện tại
   */
  getCategoryBreadcrumb: async (
    identifier: string | number
  ): Promise<Category[]> => {
    try {
      // Xác định danh mục hiện tại
      const isNumeric = !isNaN(Number(identifier));
      let category: Category;

      if (isNumeric) {
        category = await categoryService.getCategoryById(identifier);
      } else {
        category = await categoryService.getCategoryBySlug(
          identifier as string
        );
      }

      // Khởi tạo mảng breadcrumb với danh mục hiện tại
      const breadcrumb: Category[] = [category];

      // Lấy tất cả các danh mục cha
      let parentId = category.parentId;
      while (parentId) {
        const parentCategory = await categoryService.getCategoryById(parentId);
        breadcrumb.unshift(parentCategory); // Thêm vào đầu mảng
        parentId = parentCategory.parentId;
      }

      return breadcrumb;
    } catch (error) {
      console.error(`Error getting breadcrumb for ${identifier}:`, error);
      throw error;
    }
  },

  /**
   * Sắp xếp lại thứ tự của danh mục
   * @param reorderData Mảng các đối tượng chứa categoryId và newOrder
   * @returns Promise với kết quả thao tác
   */
  reorderCategories: async (
    reorderData: ReorderCategoryRequest[]
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CATEGORY.REORDER, {
        categories: reorderData,
      });
      return response.data;
    } catch (error) {
      console.error("Error reordering categories:", error);
      throw error;
    }
  },
};

export default categoryService;
