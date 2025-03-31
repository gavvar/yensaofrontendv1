"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { FiPlus, FiFilter, FiRefreshCw } from "react-icons/fi";

import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import Loading from "@/components/common/Loading";
import ErrorMessage from "@/components/common/ErrorMessage";
import CouponList from "@/components/admin/coupons/CouponList";
import CouponFilters from "@/components/admin/coupons/CouponFilters";
import { CouponListParams, CouponType, Coupon } from "@/types/coupon";
import couponService from "@/services/couponService";

export default function CouponsAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Lấy các query params từ URL
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const limit = searchParams.get("limit")
    ? Number(searchParams.get("limit"))
    : 10;
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || undefined;
  const active = searchParams.has("active")
    ? searchParams.get("active") === "true"
    : undefined;
  const fromDate = searchParams.get("fromDate") || undefined;
  const toDate = searchParams.get("toDate") || undefined;

  // State để lưu kết quả
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load danh sách coupon khi params thay đổi
  useEffect(() => {
    fetchCoupons();
  }, [page, limit, search, type, active, fromDate, toDate]);

  // Hàm lấy danh sách coupon
  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: CouponListParams = {
        page,
        limit,
      };

      if (search) params.search = search;
      if (type) params.type = type as CouponType;
      if (active !== undefined) params.active = active;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const result = await couponService.getCoupons(params);

      setCoupons(result.data.coupons);
      setTotalItems(result.data.totalItems);
      setTotalPages(result.data.totalPages);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách mã giảm giá"
      );
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  // Hàm để cập nhật URL với filter mới
  const handleFilterChange = (filters: CouponListParams) => {
    const queryParams = new URLSearchParams();

    // Thêm các params vào URL
    if (filters.page) queryParams.set("page", filters.page.toString());
    if (filters.limit) queryParams.set("limit", filters.limit.toString());
    if (filters.search) queryParams.set("search", filters.search);
    if (filters.type) queryParams.set("type", filters.type);
    if (filters.active !== undefined)
      queryParams.set("active", filters.active.toString());
    if (filters.fromDate) queryParams.set("fromDate", filters.fromDate);
    if (filters.toDate) queryParams.set("toDate", filters.toDate);

    // Cập nhật URL mà không reload trang
    router.push(`/admin/coupons?${queryParams.toString()}`);
  };

  // Xử lý xóa coupon
  const handleDeleteCoupon = async (id: number) => {
    try {
      await couponService.deleteCoupon(id);
      toast.success("Đã xóa mã giảm giá");
      fetchCoupons(); // Tải lại danh sách
    } catch (err) {
      console.error("Error deleting coupon:", err);
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa mã giảm giá"
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <AdminPageHeader
        title="Quản lý mã giảm giá"
        description="Quản lý các mã giảm giá trong hệ thống"
      />

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="text-white" />
            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            onClick={fetchCoupons}
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>

        <Link
          href="/admin/coupons/create"
          className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          <FiPlus className="text-white" />
          Tạo mã giảm giá
        </Link>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6">
          <CouponFilters
            initialFilters={{
              search,
              type: type as CouponType | undefined,
              active,
              fromDate,
              toDate,
            }}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      {/* Results */}
      {loading ? (
        <Loading message="Đang tải danh sách mã giảm giá..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <CouponList
          coupons={coupons}
          totalItems={totalItems}
          totalPages={totalPages}
          currentPage={page}
          onPageChange={(newPage) =>
            handleFilterChange({
              page: newPage,
              limit,
              search,
              type: type as CouponType | undefined,
              active,
              fromDate,
              toDate,
            })
          }
          onDeleteCoupon={handleDeleteCoupon}
        />
      )}
    </div>
  );
}
