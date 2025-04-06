"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import Image from "next/image";
import { toast } from "react-toastify";
import { AxiosError } from "axios"; // Thêm import này
import Image from "next/image";
import { FiSave, FiX, FiArrowLeft } from "react-icons/fi";
import categoryService, {
  Category,
  CategoryInput,
} from "@/services/categoryService";

// Định nghĩa interface cho validation error từ API
interface ValidationError {
  param: string;
  msg: string;
  location?: string;
}

interface ApiErrorData {
  error?: string;
  errors?: ValidationError[];
  message?: string;
}

interface CategoryFormProps {
  initialData?: Category;
  isEditing?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  isEditing = false,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data state
  const [formData, setFormData] = useState<CategoryInput>({
    name: "",
    description: "",
    imageUrl: "",
    parentId: null,
    isActive: true,
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
  });

  // Fetch parent categories for dropdown
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const categories = await categoryService.getAllCategories();
        // Filter out the current category (when editing) to prevent circular reference
        const filteredCategories = isEditing
          ? categories.filter((cat) => cat.id !== initialData?.id)
          : categories;
        setParentCategories(filteredCategories);
      } catch (error) {
        console.error("Error fetching parent categories:", error);
        toast.error("Không thể tải danh mục cha");
      }
    };

    fetchParentCategories();
  }, [isEditing, initialData]);

  // Set initial form data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        imageUrl: initialData.imageUrl || "",
        // Sửa lỗi: Thêm giá trị mặc định null cho parentId nếu undefined
        parentId:
          initialData.parentId === undefined ? null : initialData.parentId,
        // Sửa lỗi: Thêm giá trị mặc định true cho isActive nếu undefined
        isActive:
          initialData.isActive === undefined ? true : initialData.isActive,
        sortOrder: initialData.sortOrder || 0,
        metaTitle: initialData.metaTitle || "",
        metaDescription: initialData.metaDescription || "",
      });

      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    }
  }, [isEditing, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên danh mục không được để trống";
    } else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = "Tên danh mục phải từ 2 đến 100 ký tự";
    }

    if (formData.metaTitle && formData.metaTitle.length > 255) {
      newErrors.metaTitle = "Tiêu đề SEO không được vượt quá 255 ký tự";
    }

    if (formData.sortOrder !== undefined && formData.sortOrder < 0) {
      newErrors.sortOrder = "Thứ tự sắp xếp phải là số nguyên không âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === "parentId") {
      setFormData({
        ...formData,
        [name]: value === "" ? null : parseInt(value, 10),
      });
    } else if (name === "sortOrder") {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || 0,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ ...formData, imageUrl: value });
    setImagePreview(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditing && initialData) {
        // Update existing category
        await categoryService.updateCategory(initialData.id, formData);
        toast.success("Cập nhật danh mục thành công");
      } else {
        // Create new category
        await categoryService.createCategory(formData);
        toast.success("Tạo danh mục thành công");
      }

      // Redirect to category list
      router.push("/admin/categories");
    } catch (error: unknown) {
      console.error("Error saving category:", error);

      // Kiểm tra xem error có phải là AxiosError không
      if (error instanceof AxiosError) {
        const errorData = error.response?.data as ApiErrorData | undefined;

        if (errorData?.errors && Array.isArray(errorData.errors)) {
          // Handle validation errors from API
          const apiErrors: Record<string, string> = {};
          errorData.errors.forEach((err: ValidationError) => {
            apiErrors[err.param] = err.msg;
          });
          setErrors(apiErrors);
        } else {
          toast.error(errorData?.error || "Có lỗi xảy ra khi lưu danh mục");
        }
      } else {
        toast.error("Có lỗi xảy ra khi lưu danh mục");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mr-4 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 hover:text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100800">
          {isEditing ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
              >
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
              >
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Parent category */}
            <div>
              <label
                htmlFor="parentId"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
              >
                Danh mục cha
              </label>
              <select
                id="parentId"
                name="parentId"
                value={formData.parentId === null ? "" : formData.parentId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">-- Không có --</option>
                {parentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status and Sort Order */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="isActive"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                >
                  Trạng thái
                </label>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-100700"
                  >
                    Hoạt động
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor="sortOrder"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                >
                  Thứ tự sắp xếp
                </label>
                <input
                  type="number"
                  id="sortOrder"
                  name="sortOrder"
                  value={formData.sortOrder || 0}
                  onChange={handleChange}
                  min={0}
                  className={`w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 ${
                    errors.sortOrder ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.sortOrder && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.sortOrder}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Image URL */}
            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
              >
                Đường dẫn hình ảnh
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl || ""}
                onChange={handleImageChange}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />

              {/* Image preview */}
              {imagePreview && (
                <div className="mt-2 relative border border-gray-200 rounded-md p-2">
                  <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                      onError={() => setImagePreview(null)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, imageUrl: "" });
                    }}
                    className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* SEO fields */}
            <div>
              <label
                htmlFor="metaTitle"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
              >
                Tiêu đề SEO
              </label>
              <input
                type="text"
                id="metaTitle"
                name="metaTitle"
                value={formData.metaTitle || ""}
                onChange={handleChange}
                className={`w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 ${
                  errors.metaTitle ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.metaTitle && (
                <p className="mt-1 text-sm text-red-600">{errors.metaTitle}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="metaDescription"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
              >
                Mô tả SEO
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                value={formData.metaDescription || ""}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Form buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isEditing ? "Đang cập nhật..." : "Đang tạo..."}
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                {isEditing ? "Cập nhật" : "Tạo danh mục"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
