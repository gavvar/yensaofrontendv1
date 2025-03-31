"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/authContext";
import orderService from "@/services/orderService";
import OrderList from "@/components/order/OrderList";
import OrderFilterForm from "@/components/order/OrderFilterForm";
import { OrderStatus, OrderSummary, PaymentStatus } from "@/types/order";
import { FiShoppingBag } from "react-icons/fi";
import Pagination from "@/components/common/Pagination";

// Định nghĩa interface cho filter params để đảm bảo type safety
interface OrderFilterParams {
  page: number;
  limit: number;
  orderStatus?: OrderStatus; // Thêm dấu ? để cho phép undefined
  paymentStatus?: PaymentStatus; // Thêm dấu ? để cho phép undefined
  orderNumber?: string;
  fromDate?: string;
  toDate?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // States
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Lấy filter từ URL với kiểu rõ ràng
  const [filterParams, setFilterParams] = useState<OrderFilterParams>({
    page: Number(searchParams.get("page")) || 1,
    limit: 10,
    orderStatus: (searchParams.get("orderStatus") as OrderStatus) || undefined,
    paymentStatus:
      (searchParams.get("paymentStatus") as PaymentStatus) || undefined,
    orderNumber: searchParams.get("orderNumber") || undefined,
    fromDate: searchParams.get("fromDate") || undefined,
    toDate: searchParams.get("toDate") || undefined,
  });

  // Check authentication and fetch orders
  const checkAuthAndFetchOrders = async () => {
    // Wait for auth state to be determined
    if (authLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để xem đơn hàng của bạn");
      router.push("/login?redirect=/account/orders"); // Thêm /account vào trước /orders
      return;
    }

    // Fetch orders if authenticated
    try {
      setLoading(true);
      setError("");
      const response = await orderService.getOrders(filterParams);

      // Debug log
      console.log("Orders API response:", response);

      // Check if response has the expected structure
      if (response && response.orders) {
        setOrders(response.orders); // Thay vì response.data
        setPagination({
          currentPage: response.pagination.page,
          totalPages: response.pagination.totalPages,
          totalItems: response.pagination.total || 0, // Thay vì totalItems và thêm fallback
        });
      } else {
        console.error("Unexpected API response structure:", response);
        setError("Định dạng dữ liệu không hợp lệ");
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Sử dụng lại trong useEffect
  useEffect(() => {
    checkAuthAndFetchOrders();
  }, [isAuthenticated, authLoading, router, filterParams]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilterParams((prev) => ({
      ...prev,
      page,
    }));

    // Scroll to top when page changes
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Handle filter form submission
  const handleFilterSubmit = (filters: Partial<OrderFilterParams>) => {
    setFilterParams((prev) => ({
      ...prev,
      ...filters,
      page: 1, // Reset to first page on filter change
    }));
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
        <p className="mt-1 text-sm text-gray-900">
          Quản lý và theo dõi tất cả đơn hàng của bạn
        </p>
      </div>

      {/* Filter form */}
      <div className="mb-6">
        <OrderFilterForm
          onSubmit={handleFilterSubmit}
          initialFilters={{
            orderNumber: filterParams.orderNumber,
            orderStatus: filterParams.orderStatus,
            paymentStatus: filterParams.paymentStatus,
            fromDate: filterParams.fromDate,
            toDate: filterParams.toDate,
          }}
        />
      </div>

      {/* Main content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          <p className="font-medium">Đã xảy ra lỗi</p>
          <p>{error}</p>
          <button
            onClick={() => {
              setError("");
              checkAuthAndFetchOrders();
            }}
            className="mt-2 bg-white text-red-600 px-4 py-2 rounded border border-red-300 hover:bg-red-50"
          >
            Thử lại
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <FiShoppingBag className="h-16 w-16 text-gray-900" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h2>
          <p className="text-gray-900 mb-6">
            {filterParams.orderStatus || filterParams.orderNumber
              ? "Không tìm thấy đơn hàng nào khớp với điều kiện tìm kiếm của bạn."
              : "Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!"}
          </p>
          <button
            onClick={() => router.push("/products")}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <OrderList initialOrders={orders} className="mb-8" />
      )}

      {/* Pagination controls */}
      {!loading && !error && orders.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
