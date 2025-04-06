"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/user/ProductCard";
import { productService } from "@/services/productService";
import categoryService from "@/services/categoryService";
import { Product } from "@/types/product";
import { Category } from "@/services/categoryService";
import { FiFilter, FiX, FiChevronDown, FiGrid, FiList } from "react-icons/fi";
import Breadcrumb from "@/components/user/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import { formatCurrency } from "@/utils/format";
import { debounce } from "lodash";
import Image from "next/image";

// Định nghĩa kiểu dữ liệu cho các tham số của getProducts
interface ProductsFilter {
  categorySlug?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
}

type SortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "popular"
  | "bestselling";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Query params
  const initialPage = parseInt(searchParams.get("page") || "1");
  const initialLimit = parseInt(searchParams.get("limit") || "12");
  const initialSort = (searchParams.get("sort") as SortOption) || "newest";
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialMinPrice = searchParams.get("minPrice") || "";
  const initialMaxPrice = searchParams.get("maxPrice") || "";

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsPerPage, setProductsPerPage] = useState(initialLimit);
  const [selectedSort, setSelectedSort] = useState<SortOption>(initialSort);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState({
    min: initialMinPrice,
    max: initialMaxPrice,
  });
  const [priceError, setPriceError] = useState("");

  // Sort options
  const sortOptions = [
    { value: "newest", label: "Mới nhất" },
    { value: "price_asc", label: "Giá thấp đến cao" },
    { value: "price_desc", label: "Giá cao đến thấp" },
    { value: "popular", label: "Phổ biến nhất" },
    { value: "bestselling", label: "Bán chạy nhất" },
  ];

  // Per page options
  const perPageOptions = [
    { value: 12, label: "12" },
    { value: 24, label: "24" },
    { value: 48, label: "48" },
  ];

  // Update URL with current filters
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();

    params.set("page", currentPage.toString());
    params.set("limit", productsPerPage.toString());
    params.set("sort", selectedSort);

    if (searchQuery) {
      params.set("search", searchQuery);
    }

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    if (priceRange.min) {
      params.set("minPrice", priceRange.min.toString());
    }

    if (priceRange.max) {
      params.set("maxPrice", priceRange.max.toString());
    }

    // Update URL without reload
    const url = `/product?${params.toString()}`;
    router.push(url, { scroll: false });
  }, [
    currentPage,
    productsPerPage,
    selectedSort,
    searchQuery,
    selectedCategory,
    priceRange,
    router,
  ]);

  // Fetch products based on current filters and pagination
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Build filter object
      const filter: ProductsFilter = {};

      if (selectedCategory) {
        filter.categorySlug = selectedCategory;
      }

      if (priceRange.min) {
        filter.minPrice = priceRange.min;
      }

      if (priceRange.max) {
        filter.maxPrice = priceRange.max;
      }

      // Fetch products
      const result = await productService.getProducts({
        page: currentPage,
        limit: productsPerPage,
        sort: selectedSort,
        search: searchQuery,
        filter: filter,
      });

      setProducts(result.data.rows);
      setTotalProducts(result.data.count);
      setTotalPages(result.data.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    productsPerPage,
    selectedSort,
    searchQuery,
    selectedCategory,
    priceRange,
  ]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const result = await categoryService.getCategories();
      setCategories(result);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Validate price filter
  useEffect(() => {
    // Reset error
    setPriceError("");

    // Check if both min & max are set
    if (priceRange.min && priceRange.max) {
      const min = Number(priceRange.min);
      const max = Number(priceRange.max);

      // Validate
      if (min > max) {
        setPriceError("Giá tối thiểu không thể lớn hơn giá tối đa");
      }
    }
  }, [priceRange]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedSort,
    searchQuery,
    selectedCategory,
    priceRange,
    productsPerPage,
  ]);

  // Debounced search
  const debouncedSearch = useCallback((value: string) => {
    const handler = debounce((searchValue: string) => {
      setSearchQuery(searchValue);
    }, 500);

    handler(value);

    // Clean up debounce khi component unmount
    return () => {
      handler.cancel();
    };
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Update input immediately, but debounce the actual search
    e.target.value = value;
    debouncedSearch(value);
  };

  // Handle price input change
  const handlePriceChange = (type: "min" | "max", value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    setPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Handle category selection
  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(selectedCategory === slug ? "" : slug);
    setIsMobileFilterOpen(false);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setSelectedSort("newest");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản phẩm", href: "/product" },
        ]}
      />

      <h1 className="text-3xl font-bold mb-6">Tất cả sản phẩm</h1>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Search Box */}
        <div className="w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              defaultValue={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={() => {
                  setSearchQuery("");
                  // Also clear the input field
                  const input = document.querySelector(
                    'input[type="text"]'
                  ) as HTMLInputElement;
                  if (input) input.value = "";
                }}
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Mobile Filter Button */}
          <button
            className="md:hidden flex items-center px-4 py-2 bg-gray-100 rounded-md"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <FiFilter className="mr-2" /> Lọc
          </button>

          {/* View Mode Switcher */}
          <div className="hidden md:flex items-center border border-gray-300 rounded-md">
            <button
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-amber-500 text-white"
                  : "bg-white text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <FiGrid size={20} />
            </button>
            <button
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-amber-500 text-white"
                  : "bg-white text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <FiList size={20} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as SortOption)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-300 pointer-events-none" />
          </div>

          {/* Per Page Dropdown */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={productsPerPage}
              onChange={(e) => setProductsPerPage(parseInt(e.target.value))}
            >
              {perPageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} / trang
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-300 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter Sidebar (Desktop) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sticky top-24">
            <div className="flex justify-between items-center border-b dark:border-gray-700 pb-4 mb-4">
              <h2 className="font-bold text-lg dark:text-white">Bộ lọc</h2>
              <button
                onClick={resetFilters}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 text-sm"
              >
                Xóa tất cả
              </button>
            </div>

            {/* Categories Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 dark:text-white">Danh mục</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 rounded"
                        checked={selectedCategory === category.slug}
                        onChange={() => handleCategorySelect(category.slug)}
                      />
                      <span className="dark:text-gray-200">
                        {category.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 dark:text-white">Giá</h3>
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Từ"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Đến"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                  />
                </div>
              </div>
              {priceError && (
                <p className="text-red-500 text-xs mb-3">{priceError}</p>
              )}
              <button
                onClick={() => {
                  if (!priceError) {
                    fetchProducts();
                  }
                }}
                disabled={!!priceError}
                className={`w-full py-2 rounded-md text-sm font-medium ${
                  priceError
                    ? "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed"
                    : "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                }`}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filter Sidebar */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMobileFilterOpen(false)}
            ></div>
            <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg dark:text-white">Bộ lọc</h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-gray-700 dark:text-gray-300"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Mobile Categories Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 dark:text-white">Danh mục</h3>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 rounded"
                          checked={selectedCategory === category.slug}
                          onChange={() => handleCategorySelect(category.slug)}
                        />
                        <span className="dark:text-gray-200">
                          {category.name}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mobile Price Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 dark:text-white">Giá</h3>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Từ"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Đến"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                    />
                  </div>
                </div>
                {priceError && (
                  <p className="text-red-500 text-xs mb-3">{priceError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-2 bg-gray-200 rounded-md text-gray-700 dark:text-gray-300 text-sm font-medium"
                >
                  Xóa tất cả
                </button>
                <button
                  onClick={() => {
                    if (!priceError) {
                      fetchProducts();
                      setIsMobileFilterOpen(false);
                    }
                  }}
                  disabled={!!priceError}
                  className={`flex-1 py-2 rounded-md text-sm font-medium ${
                    priceError
                      ? "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                      : "bg-amber-500 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
                  }`}
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {/* Active filters display */}
          {(selectedCategory ||
            priceRange.min ||
            priceRange.max ||
            searchQuery) && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Đang lọc theo:
              </span>

              {selectedCategory && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center">
                  Danh mục:{" "}
                  <span className="text-gray-900 dark:text-gray-200">
                    {categories.find((c) => c.slug === selectedCategory)?.name}
                  </span>
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="ml-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}

              {(priceRange.min || priceRange.max) && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center">
                  Giá:
                  {priceRange.min &&
                    ` từ ${formatCurrency(Number(priceRange.min))}`}
                  {priceRange.min && priceRange.max && " - "}
                  {priceRange.max &&
                    ` đến ${formatCurrency(Number(priceRange.max))}`}
                  <button
                    onClick={() => setPriceRange({ min: "", max: "" })}
                    className="ml-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}

              {searchQuery && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center">
                  Tìm kiếm: {searchQuery}
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      // Also clear the input field
                      const input = document.querySelector(
                        'input[type="text"]'
                      ) as HTMLInputElement;
                      if (input) input.value = "";
                    }}
                    className="ml-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}

              <button
                onClick={resetFilters}
                className="text-amber-600 hover:text-amber-800 text-sm ml-auto"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Results count + mobile sorting */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            <p className="text-gray-700 dark:text-gray-300">
              Hiển thị {products.length} / {totalProducts} sản phẩm
            </p>
          </div>

          {/* Products */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: productsPerPage }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 h-80 animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden"
                    >
                      <div className="md:w-48 h-48 relative">
                        <Image
                          src={
                            product.images?.[0]?.url ||
                            "/images/placeholder.jpg"
                          }
                          alt={product.name}
                          width={192} // Matching the 48 (3rem) × 4 = 192px
                          height={192}
                          className="w-full h-full object-cover"
                          priority={index === 0} // Add priority for the first image in the list
                          // Use fill property as an alternative approach
                          // fill={true}
                          // style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="text-lg font-semibold mb-2 dark:text-white">
                          {product.name}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center mb-3">
                          {product.discountPrice ? (
                            <>
                              <span className="text-lg font-bold text-amber-600 dark:text-amber-500">
                                {formatCurrency(product.discountPrice)}
                              </span>
                              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 line-through">
                                {formatCurrency(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-amber-600 dark:text-amber-500">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            {product.viewCount !== undefined && (
                              <span className="mr-4">
                                {product.viewCount} lượt xem
                              </span>
                            )}
                            {product.saleCount !== undefined &&
                              product.saleCount > 0 && (
                                <span>Đã bán {product.saleCount}</span>
                              )}
                          </div>
                          <a
                            href={`/product/${product.slug}`}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-md transition-colors text-sm"
                          >
                            Xem chi tiết
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiX size={24} className="text-gray-700 dark:text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-colors"
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
