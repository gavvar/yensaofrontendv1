"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiChevronRight,
  FiFilter,
  FiCheck,
  FiX,
} from "react-icons/fi";
import categoryService, { Category } from "@/services/categoryService";
import { AxiosError } from "axios";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterParent, setFilterParent] = useState<number | null>(null);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>(
    {}
  );

  // Fetch categories
  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, [filterActive, filterParent]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const queryParams: {
        active?: boolean;
        parent?: number | null;
      } = {};

      if (filterActive !== null) {
        queryParams.active = filterActive;
      }

      if (filterParent !== undefined && filterParent !== null) {
        queryParams.parent = filterParent;
      }

      const data = await categoryService.getAllCategories(queryParams);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    try {
      // Lấy tất cả danh mục để hiển thị trong dropdown
      const allCategories = await categoryService.getAllCategories();
      setParentCategories(allCategories);
    } catch (error) {
      console.error("Error fetching parent categories:", error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await categoryService.deleteCategory(id);
      toast.success("Xóa danh mục thành công");
      setCategories(categories.filter((cat) => cat.id !== id));
      setConfirmDelete(null);
    } catch (error: unknown) {
      console.error("Error deleting category:", error);

      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.error || "Có lỗi xảy ra khi xóa danh mục"
        );
      } else {
        toast.error("Có lỗi xảy ra khi xóa danh mục");
      }
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterActive(null);
    setFilterParent(null);
  };

  const getBreadcrumb = (category: Category) => {
    if (!category.parentId) return null;

    const parent = categories.find((cat) => cat.id === category.parentId);
    if (!parent) return null;

    return (
      <span className="text-gray-900 text-xs flex items-center">
        {parent.name} <FiChevronRight className="mx-1" size={12} />
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <FiPlus className="mr-2" />
          Thêm danh mục
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center mb-2">
          <FiFilter className="mr-2 text-gray-900" />
          <h2 className="text-lg font-medium text-gray-700">Bộ lọc</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setFilterActive(true)}
                className={`px-3 py-1 rounded-md text-sm ${
                  filterActive === true
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                Hoạt động
              </button>
              <button
                onClick={() => setFilterActive(false)}
                className={`px-3 py-1 rounded-md text-sm ${
                  filterActive === false
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                Không hoạt động
              </button>
              {filterActive !== null && (
                <button
                  onClick={() => setFilterActive(null)}
                  className="px-2 py-1 text-gray-900 hover:text-gray-700"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục cha
            </label>
            <div className="flex">
              <select
                value={filterParent === null ? "" : filterParent}
                onChange={(e) =>
                  setFilterParent(
                    e.target.value === "" ? null : parseInt(e.target.value, 10)
                  )
                }
                className="border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
              >
                <option value="">Tất cả</option>
                {/* Đã loại bỏ option "Danh mục gốc" */}
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {filterParent !== null && (
                <button
                  onClick={() => setFilterParent(null)}
                  className="px-2 py-1 text-gray-900 hover:text-gray-700 ml-2"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Categories list */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-gray-900 mb-4">Không tìm thấy danh mục nào</p>
            <button
              onClick={resetFilters}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                >
                  Tên danh mục
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                >
                  Slug
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                >
                  Thứ tự
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                >
                  Trạng thái
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider"
                >
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {category.imageUrl && !imageErrors[category.id] ? (
                        <div className="flex-shrink-0 h-10 w-10 mr-3 relative">
                          <Image
                            className="rounded-md object-cover"
                            src={category.imageUrl}
                            alt={category.name}
                            fill
                            sizes="40px"
                            onError={() => {
                              setImageErrors((prev) => ({
                                ...prev,
                                [category.id]: true,
                              }));
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-10 w-10 mr-3 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-900">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center">
                          {getBreadcrumb(category)}
                          <p className="text-sm font-medium text-gray-900">
                            {category.name}
                          </p>
                        </div>
                        {category.description && (
                          <p className="text-xs text-gray-900 mt-1 truncate max-w-xs">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 font-mono">
                      {category.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {category.sortOrder}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {category.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {confirmDelete === category.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiCheck className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-gray-900 hover:text-gray-900"
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/category/${category.slug}`}
                          target="_blank"
                          className="text-gray-900 hover:text-gray-900"
                          title="Xem"
                        >
                          <FiEye className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/admin/categories/edit/${category.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Sửa"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(category.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
