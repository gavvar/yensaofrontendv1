"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiChevronRight, FiFilter, FiX } from "react-icons/fi";
import ProductCard from "@/components/user/ProductCard";
import productService from "@/services/productService";
import { Product } from "@/types/product";
import { Category } from "@/services/categoryService";

export default function CategoryPage() {
  // Code hiện tại từ file d:\KLTN\yensaofontendend\src\app\category\[slug]\page.tsx
  // Không cần thay đổi gì về logic
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [filterPrice, setFilterPrice] = useState<[number, number] | null>(null);

  // Fetch products by category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Log cho debug
        console.log(`Fetching products for category: ${slug}`);

        // Gọi API lấy sản phẩm theo danh mục
        const result = await productService.getProductsByCategory(
          slug,
          pagination.page,
          pagination.limit
        );

        // Gán dữ liệu khi API trả về thành công
        setProducts(result.products || []);
        setCategory(result.category || null);
        setPagination((prevPagination) => ({
          ...prevPagination,
          // update values
        }));

        // Log kết quả
        console.log("Products fetched:", result.products?.length);
        console.log("Category:", result.category?.name);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProducts();
    }
  }, [slug, pagination.page, pagination.limit]);

  // Apply sorting
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case "price-asc":
        return Number(a.price) - Number(b.price);
      case "price-desc":
        return Number(b.price) - Number(a.price);
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default: // newest
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  // Apply price filter if set
  const filteredProducts = filterPrice
    ? sortedProducts.filter(
        (product) =>
          Number(product.price) >= filterPrice[0] &&
          Number(product.price) <= filterPrice[1]
      )
    : sortedProducts;

  // Hàm đổi trang
  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mb-6">
        <Link href="/" className="hover:text-amber-600">
          Trang chủ
        </Link>
        <FiChevronRight className="mx-2" />
        <Link href="/products" className="hover:text-amber-600">
          Sản phẩm
        </Link>
        <FiChevronRight className="mx-2" />
        <span className="text-amber-600 font-medium">
          {loading ? "Đang tải..." : category?.name || "Danh mục"}
        </span>
      </div>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {loading ? "Đang tải..." : category?.name || "Danh mục sản phẩm"}
        </h1>
        <p className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
          {category?.description ||
            "Khám phá các sản phẩm yến sào chất lượng cao"}
        </p>
      </div>

      {/* Filters and Products */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter sidebar - Mobile toggle */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 hover:text-amber-600"
          >
            {isFilterOpen ? (
              <>
                <FiX className="mr-2" /> Đóng bộ lọc
              </>
            ) : (
              <>
                <FiFilter className="mr-2" /> Lọc sản phẩm
              </>
            )}
          </button>

          <div className="flex items-center">
            <span className="text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mr-2">
              Sắp xếp:
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="text-sm border rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
            </select>
          </div>
        </div>

        {/* Filter sidebar */}
        <div
          className={`lg:w-1/4 bg-white p-6 rounded-lg shadow-sm border ${
            isFilterOpen ? "block" : "hidden lg:block"
          }`}
        >
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 font-semibold mb-3">
              Sắp xếp
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="sort-newest"
                  name="sort"
                  checked={sortOption === "newest"}
                  onChange={() => setSortOption("newest")}
                  className="mr-2 accent-amber-600"
                />
                <label htmlFor="sort-newest">Mới nhất</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="sort-price-asc"
                  name="sort"
                  checked={sortOption === "price-asc"}
                  onChange={() => setSortOption("price-asc")}
                  className="mr-2 accent-amber-600"
                />
                <label htmlFor="sort-price-asc">Giá tăng dần</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="sort-price-desc"
                  name="sort"
                  checked={sortOption === "price-desc"}
                  onChange={() => setSortOption("price-desc")}
                  className="mr-2 accent-amber-600"
                />
                <label htmlFor="sort-price-desc">Giá giảm dần</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="sort-name-asc"
                  name="sort"
                  checked={sortOption === "name-asc"}
                  onChange={() => setSortOption("name-asc")}
                  className="mr-2 accent-amber-600"
                />
                <label htmlFor="sort-name-asc">Tên A-Z</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="sort-name-desc"
                  name="sort"
                  checked={sortOption === "name-desc"}
                  onChange={() => setSortOption("name-desc")}
                  className="mr-2 accent-amber-600"
                />
                <label htmlFor="sort-name-desc">Tên Z-A</label>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Khoảng giá</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="price-all"
                  name="price"
                  checked={filterPrice === null}
                  onChange={() => setFilterPrice(null)}
                  className="mr-2 accent-amber-600"
                />
                <label htmlFor="price-all">Tất cả mức giá</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="price-100k"
                  name="price"
                  checked={
                    filterPrice !== null &&
                    filterPrice[0] === 0 &&
                    filterPrice[1] === 100000
                  }
                  onChange={() => setFilterPrice([0, 100000])}
                  className="mr-2 accent-amber-600"
                />
                <label htmlFor="price-100k">Dưới 100.000đ</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="price-100k-500k"
                  name="price"
                  checked={
                    filterPrice !== null &&
                    filterPrice[0] === 100000 &&
                    filterPrice[1] === 500000
                  }
                  onChange={() => setFilterPrice([100000, 500000])}
                  className="mr-2 accent-amber-600"
                />
                <label htmlFor="price-100k-500k">100.000đ - 500.000đ</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="price-500k-1m"
                  name="price"
                  checked={
                    filterPrice !== null &&
                    filterPrice[0] === 500000 &&
                    filterPrice[1] === 1000000
                  }
                  onChange={() => setFilterPrice([500000, 1000000])}
                  className="mr-2 accent-amber-600"
                />
                <label htmlFor="price-500k-1m">500.000đ - 1.000.000đ</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="price-1m"
                  name="price"
                  checked={
                    filterPrice !== null &&
                    filterPrice[0] === 1000000 &&
                    filterPrice[1] === 10000000
                  }
                  onChange={() => setFilterPrice([1000000, 10000000])}
                  className="mr-2 accent-amber-600"
                />
                <label htmlFor="price-1m">Trên 1.000.000đ</label>
              </div>
            </div>
          </div>

          {/* Reset Filters Button (Mobile) */}
          <div className="mt-6 pt-6 border-t lg:hidden">
            <button
              onClick={() => {
                setSortOption("newest");
                setFilterPrice(null);
                setIsFilterOpen(false);
              }}
              className="w-full py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:w-3/4">
          {/* Sort dropdown (desktop) */}
          <div className="hidden lg:flex justify-between items-center mb-6">
            <p className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              {loading
                ? "Đang tải sản phẩm..."
                : `Hiển thị ${filteredProducts.length} sản phẩm`}
            </p>
            <div className="flex items-center">
              <span className="text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mr-2">
                Sắp xếp:
              </span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-sm border rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
              </select>
            </div>
          </div>

          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-lg shadow-sm animate-pulse h-80"
                >
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-1">
                    <button
                      onClick={() => changePage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`px-3 py-1 rounded ${
                        pagination.page === 1
                          ? "text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 cursor-not-allowed"
                          : "text-gray-900 dark:text-gray-100700 hover:bg-amber-100"
                      }`}
                    >
                      &laquo;
                    </button>

                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => changePage(i + 1)}
                        className={`px-3 py-1 rounded ${
                          pagination.page === i + 1
                            ? "bg-amber-600 text-white"
                            : "text-gray-900 dark:text-gray-100700 hover:bg-amber-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => changePage(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`px-3 py-1 rounded ${
                        pagination.page === pagination.totalPages
                          ? "text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 cursor-not-allowed"
                          : "text-gray-900 dark:text-gray-100700 hover:bg-amber-100"
                      }`}
                    >
                      &raquo;
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mb-4">
                Không tìm thấy sản phẩm nào trong danh mục này với bộ lọc hiện
                tại.
              </p>
              <button
                onClick={() => {
                  setSortOption("newest");
                  setFilterPrice(null);
                }}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
