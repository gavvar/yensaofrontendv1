"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiFilter,
  FiSearch,
  FiCheck,
  FiX,
} from "react-icons/fi";
import productService from "@/services/productService";
import categoryService from "@/services/categoryService";
import { ProductFilter, ProductSummary } from "@/types/product";
import { Category } from "@/services/categoryService";

interface ApiErrorData {
  error?: string;
  message?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);

  // Filter state
  const [filter, setFilter] = useState<ProductFilter>({});
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<
    "newest" | "price_asc" | "price_desc" | "popular"
  >("newest");

  // Fetch products when component mounts or filter/pagination changes
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, limit, filter, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        sort: sort,
        filter,
        search: search || undefined,
      };

      const response = await productService.getProducts(params);
      // Kiểm tra dữ liệu trả về trước khi cập nhật state
      if (
        response.success &&
        response.data &&
        Array.isArray(response.data.rows)
      ) {
        setProducts(response.data.rows);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.count || 0);
      } else {
        console.error("Invalid response format:", response);
        setProducts([]); // Đặt về mảng rỗng khi dữ liệu không hợp lệ
        toast.error("Không thể tải danh sách sản phẩm");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); // Đặt về mảng rỗng khi có lỗi
      toast.error("Đã xảy ra lỗi khi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await categoryService.getAllCategories();
      setCategories(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await productService.deleteProduct(id);
      if (response.success) {
        toast.success("Xóa sản phẩm thành công");
        // Refresh danh sách sản phẩm
        fetchProducts();
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi xóa sản phẩm");
      }
    } catch (error: unknown) {
      console.error("Error deleting product:", error);

      if (error instanceof AxiosError) {
        const errorData = error.response?.data as ApiErrorData | undefined;
        toast.error(errorData?.error || "Có lỗi xảy ra khi xóa sản phẩm");
      } else {
        toast.error("Có lỗi xảy ra khi xóa sản phẩm");
      }
    } finally {
      setConfirmDelete(null);
    }
  };

  const resetFilters = () => {
    setFilter({});
    setSearch("");
    setSort("newest");
  };

  const getDiscountPercent = (price: number, discountPrice?: number) => {
    if (!discountPrice || discountPrice >= price) return null;
    const discount = ((price - discountPrice) / price) * 100;
    return Math.round(discount);
  };

  const getProductThumbnail = (product: ProductSummary) => {
    const featuredImage = product.images?.find((img) => img.isFeatured);
    const firstImage = product.images?.[0];
    return (featuredImage || firstImage)?.url;
  };

  const getFeaturedImage = (product: ProductSummary) => {
    if (
      !product.images ||
      product.images.length === 0 ||
      imageErrors[product.id]
    ) {
      return null;
    }

    const imageUrl = getProductThumbnail(product);
    return imageUrl || null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <FiPlus className="mr-2" />
          Thêm sản phẩm
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center mb-4">
          <FiFilter className="mr-2 text-gray-500" />
          <h2 className="text-lg font-medium text-gray-700">Tìm kiếm & Lọc</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search box */}
          <div className="md:col-span-2">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên, mô tả..."
                className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded-r-md hover:bg-amber-700"
              >
                <FiSearch />
              </button>
            </form>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={filter.category || ""}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  category: e.target.value || undefined,
                })
              }
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={filter.status || ""}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  status:
                    (e.target.value as "active" | "inactive" | undefined) ||
                    undefined,
                })
              }
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Price range filter */}
          <div className="md:col-span-2 grid grid-cols-2 gap-2">
            <input
              type="number"
              value={filter.price_min || ""}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  price_min: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              placeholder="Giá tối thiểu"
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <input
              type="number"
              value={filter.price_max || ""}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  price_max: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              placeholder="Giá tối đa"
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Sort option */}
          <div>
            <select
              value={sort}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "newest" ||
                  value === "price_asc" ||
                  value === "price_desc" ||
                  value === "popular"
                ) {
                  setSort(value);
                }
              }}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="popular">Phổ biến nhất</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="flex items-center justify-end">
            <button
              onClick={resetFilters}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Products list */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm nào</p>
            <button
              onClick={resetFilters}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sản phẩm
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Danh mục
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Giá
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Số lượng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trạng thái
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFeaturedImage(product) ? (
                          <div className="flex-shrink-0 h-10 w-10 mr-3 relative">
                            <Image
                              className="rounded-md object-cover"
                              src={getFeaturedImage(product) as string}
                              alt={product.name}
                              fill
                              sizes="40px"
                              onError={() => {
                                setImageErrors((prev) => ({
                                  ...prev,
                                  [product.id]: true,
                                }));
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 mr-3 bg-gray-100 rounded-md flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              {product.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            SKU: {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {product.category?.name || "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {product.discountPrice &&
                        product.discountPrice < product.price ? (
                          <>
                            <span className="text-sm font-medium text-gray-900">
                              {product.discountPrice.toLocaleString()}đ
                            </span>
                            <span className="ml-2 text-xs text-gray-500 line-through">
                              {product.price.toLocaleString()}đ
                            </span>
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                              -
                              {getDiscountPercent(
                                product.price,
                                product.discountPrice
                              )}
                              %
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            {product.price.toLocaleString()}đ
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {product.quantity} {product.unit || "cái"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.status === "active" ? "Đang bán" : "Ngừng bán"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {confirmDelete === product.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiCheck className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="text-gray-400 hover:text-gray-500"
                            title="Xem"
                          >
                            <FiEye className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Sửa"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => setConfirmDelete(product.id)}
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
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Hiển thị {products.length} / {totalItems} sản phẩm
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Trước
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Logic để hiển thị 5 trang với trang hiện tại ở giữa nếu có thể
              let pageToShow;
              if (totalPages <= 5) {
                pageToShow = i + 1;
              } else if (currentPage <= 3) {
                pageToShow = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i;
              } else {
                pageToShow = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageToShow}
                  onClick={() => setCurrentPage(pageToShow)}
                  className={`px-3 py-1 border rounded-md ${
                    currentPage === pageToShow
                      ? "bg-amber-600 text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {pageToShow}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Sau
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Hiển thị:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1); // Reset to page 1 when changing limit
              }}
              className="px-2 py-1 border rounded-md"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
