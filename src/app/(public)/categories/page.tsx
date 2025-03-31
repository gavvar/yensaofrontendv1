"use client";

import React, { useState, useEffect } from "react";
import categoryService, { Category } from "@/services/categoryService";
import CategoryCard from "@/components/category/CategoryCard";
import { FiGrid } from "react-icons/fi";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.getAllCategories({
          active: true,
          sort: "name_asc",
        });

        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Đã xảy ra lỗi khi tải danh mục");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse h-8 w-48 bg-gray-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 h-64 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-red-500 text-center p-4">{error}</div>
      </div>
    );
  }

  // Lọc danh mục gốc (parentId = null)
  const rootCategories = categories.filter((cat) => cat.parentId === null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <FiGrid className="mr-2 text-amber-600" size={20} />
        <h1 className="text-2xl font-bold text-gray-800">Danh mục sản phẩm</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {rootCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {rootCategories.length === 0 && (
        <div className="text-gray-900 text-center p-4">
          Không có danh mục nào
        </div>
      )}
    </div>
  );
}
