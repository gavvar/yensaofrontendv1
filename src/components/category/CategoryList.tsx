"use client";

import React, { useState, useEffect } from "react";
import categoryService, { Category } from "@/services/categoryService";
import CategoryCard from "./CategoryCard";

interface CategoryListProps {
  parentId?: number | null;
  limit?: number;
}

export default function CategoryList({
  parentId = null,
  limit,
}: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.getAllCategories({
          parent: parentId,
          active: true,
          sort: "sort_asc",
        });

        // Service đã xử lý và trả về mảng categories luôn
        let categoriesData = data;
        if (limit && categoriesData.length > limit) {
          categoriesData = categoriesData.slice(0, limit);
        }
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Đã xảy ra lỗi khi tải danh mục");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [parentId, limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 h-64 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (categories.length === 0) {
    return <div className="text-gray-900">Không có danh mục nào</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
