"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import categoryService, { Category } from "@/services/categoryService";

export default function EditCategoryPage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const id = parseInt(params.id as string, 10);

        // Lấy tất cả danh mục rồi tìm theo ID
        // Lý do: API có thể không có endpoint lấy theo ID mà chỉ có slug
        const categories = await categoryService.getAllCategories();
        const foundCategory = categories.find((cat) => cat.id === id);

        if (foundCategory) {
          setCategory(foundCategory);
        } else {
          toast.error("Không tìm thấy danh mục");
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        toast.error("Không thể tải thông tin danh mục");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCategory();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Không tìm thấy danh mục
          </h2>
          <p className="text-gray-900 mb-6">
            Danh mục bạn đang tìm không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryForm initialData={category} isEditing={true} />
    </div>
  );
}
