"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useOrderPagination } from "@/hooks/useOrderPagination";
import { OrderFilters } from "@/types/orderFilters";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import PaymentStatusBadge from "@/components/order/PaymentStatusBadge";
import OrderFilterPanel from "@/components/admin/order/OrderFilterPanel";

import {
  formatDateTime as formatOrderDate,
  formatCurrency,
} from "@/utils/format";
import { OrderSummary } from "@/types/order";
import Link from "next/link";
import {
  FiShoppingBag,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiTrash2,
  FiRefreshCw,
  FiPrinter,
  FiPlus,
  FiEdit,
  FiEye,
} from "react-icons/fi";

export default function AdminOrdersPage() {
  const { isAuthorized, loading: authLoading } = useRequireAuth(
    "/login",
    "admin"
  );
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
  });
  const [showDeletedOrders, setShowDeletedOrders] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "restore" | null>(
    null
  );

  // Khởi tạo hook quản lý đơn hàng
  const {
    filters,
    orders,
    pagination,
    isLoading,
    error,
    selectedIds,
    updateFilters,
    changeSort,
    goToPage,
    refresh,
    toggleSelect,
    selectAll,
    bulkAction,
  } = useOrderPagination({
    initialFilters: { sortBy: "createdAt", sortOrder: "desc" },
    autoLoad: isAuthorized,
  });

  // Lấy thống kê đơn hàng
  const fetchOrderStats = useCallback(async () => {
    try {
      // TODO: Gọi API lấy thống kê đơn hàng
      // Thay thế bằng dữ liệu thực từ API
      setOrderStats({
        total: 16,
        pending: 2,
        processing: 3,
        completed: 11,
        cancelled: 0,
        revenue: 28500000,
      });
    } catch (error) {
      console.error("Error fetching order stats:", error);
    }
  }, []);

  // Khi component mount
  useEffect(() => {
    if (isAuthorized) {
      fetchOrderStats();
    }
  }, [isAuthorized, fetchOrderStats]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (newFilters: Partial<OrderFilters>) => {
    if (typeof updateFilters === "function") {
      updateFilters(newFilters);
    }
  };

  // Xử lý hiển thị đơn hàng đã xóa
  const handleToggleDeletedOrders = () => {
    setShowDeletedOrders(!showDeletedOrders);
    updateFilters({ deleted: !showDeletedOrders });
  };

  // Xử lý xác nhận hành động hàng loạt
  const handleConfirmAction = () => {
    if (actionType === "delete") {
      bulkAction("delete");
    } else if (actionType === "restore") {
      bulkAction("restore");
    }
    setConfirmModalOpen(false);
    setActionType(null);
  };

  // Xử lý xuất đơn hàng
  const handleExportOrders = () => {
    bulkAction("export");
  };

  // Tính toán số trang hiển thị trong phân trang
  const getPaginationRange = () => {
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;
    const pageRange = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageRange.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageRange.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageRange.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageRange.push(i);
        }
      }
    }

    return pageRange;
  };

  // Hiển thị loading khi kiểm tra quyền truy cập
  if (authLoading || !isAuthorized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Tiêu đề trang và công cụ tìm kiếm */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
          <p className="text-gray-900">
            Xem và quản lý tất cả đơn hàng của cửa hàng
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm đơn hàng..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={filters.search || ""}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" />
          </div>

          <button
            className="bg-white border border-gray-300 rounded-md p-2 hover:bg-gray-50 text-gray-900"
            onClick={() => setShowBulkActions(!showBulkActions)}
          >
            <FiFilter className="h-5 w-5" />
          </button>

          <Link
            href="/admin/orders/create"
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiPlus className="mr-2" /> Tạo đơn hàng
          </Link>
        </div>
      </div>

      {/* Thống kê đơn hàng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Tổng số đơn hàng */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-900 text-sm">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {isLoading ? (
                  <span className="text-gray-900">Đang tải...</span>
                ) : (
                  orderStats.total
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiShoppingBag className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Doanh thu */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-900 text-sm">Doanh thu</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {isLoading ? (
                  <span className="text-gray-900">Đang tải...</span>
                ) : (
                  formatCurrency(orderStats.revenue)
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FiDollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Đơn đang xử lý */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-900 text-sm">Đang xử lý</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {isLoading ? (
                  <span className="text-gray-900">Đang tải...</span>
                ) : (
                  orderStats.processing
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <FiClock className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Đơn hoàn thành */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-900 text-sm">Hoàn thành</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {isLoading ? (
                  <span className="text-gray-900">Đang tải...</span>
                ) : (
                  orderStats.completed
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
              <FiCheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Đơn hủy */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-900 text-sm">Đã hủy</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {isLoading ? (
                  <span className="text-gray-900">Đang tải...</span>
                ) : (
                  orderStats.cancelled
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FiAlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc đơn hàng */}
      <OrderFilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={() => refresh()}
        onApplyFilters={() => refresh()}
        loading={isLoading}
        className="mb-8"
      />

      {/* Thanh công cụ hàng loạt */}
      {showBulkActions && (
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4 border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="selectAll"
                className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                checked={
                  selectedIds.length > 0 && selectedIds.length === orders.length
                }
                onChange={(e) => selectAll(e.target.checked)}
              />
              <label htmlFor="selectAll" className="ml-2 text-gray-700">
                {selectedIds.length > 0
                  ? `Đã chọn ${selectedIds.length} đơn hàng`
                  : "Chọn tất cả"}
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportOrders}
                disabled={selectedIds.length === 0}
                className={`flex items-center px-4 py-2 rounded ${
                  selectedIds.length === 0
                    ? "bg-gray-100 text-gray-900 cursor-not-allowed"
                    : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                }`}
              >
                <FiDownload className="mr-2" /> Xuất file
              </button>
              <button
                onClick={() => {
                  setActionType("delete");
                  setConfirmModalOpen(true);
                }}
                disabled={selectedIds.length === 0}
                className={`flex items-center px-4 py-2 rounded ${
                  selectedIds.length === 0
                    ? "bg-gray-100 text-gray-900 cursor-not-allowed"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
              >
                <FiTrash2 className="mr-2" /> Xóa
              </button>
              <button
                onClick={handleToggleDeletedOrders}
                className={`flex items-center px-4 py-2 rounded ${
                  showDeletedOrders
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {showDeletedOrders ? (
                  <>
                    <FiRefreshCw className="mr-2" /> Đơn hàng đã xóa
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2" /> Xem đơn hàng đã xóa
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setActionType("restore");
                  setConfirmModalOpen(true);
                }}
                disabled={selectedIds.length === 0 || !showDeletedOrders}
                className={`flex items-center px-4 py-2 rounded ${
                  selectedIds.length === 0 || !showDeletedOrders
                    ? "bg-gray-100 text-gray-900 cursor-not-allowed"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                <FiRefreshCw className="mr-2" /> Khôi phục
              </button>
              <button
                onClick={refresh}
                className="flex items-center px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <FiRefreshCw className="mr-2" /> Làm mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bảng đơn hàng */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {showBulkActions && (
                      <th scope="col" className="px-6 py-3 w-10">
                        <span className="sr-only">Chọn</span>
                      </th>
                    )}
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer"
                      onClick={() =>
                        changeSort(
                          "orderNumber",
                          filters.sortOrder === "asc" ? "desc" : "asc"
                        )
                      }
                    >
                      <div className="flex items-center">
                        Mã đơn hàng
                        {filters.sortBy === "orderNumber" && (
                          <span className="ml-1">
                            {filters.sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Khách hàng
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer"
                      onClick={() =>
                        changeSort(
                          "totalAmount",
                          filters.sortOrder === "asc" ? "desc" : "asc"
                        )
                      }
                    >
                      <div className="flex items-center justify-end">
                        Giá trị
                        {filters.sortBy === "totalAmount" && (
                          <span className="ml-1">
                            {filters.sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer"
                      onClick={() =>
                        changeSort(
                          "orderStatus",
                          filters.sortOrder === "asc" ? "desc" : "asc"
                        )
                      }
                    >
                      <div className="flex items-center justify-center">
                        Trạng thái
                        {filters.sortBy === "orderStatus" && (
                          <span className="ml-1">
                            {filters.sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Thanh toán
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer"
                      onClick={() =>
                        changeSort(
                          "orderDate",
                          filters.sortOrder === "asc" ? "desc" : "asc"
                        )
                      }
                    >
                      <div className="flex items-center justify-end">
                        Ngày đặt
                        {filters.sortBy === "orderDate" && (
                          <span className="ml-1">
                            {filters.sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    orders.map((order: OrderSummary) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        {showBulkActions && (
                          <td className="px-6 py-4 whitespace-nowrap w-10">
                            <input
                              type="checkbox"
                              className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                              checked={selectedIds.includes(order.id)}
                              onChange={(e) =>
                                toggleSelect(order.id, e.target.checked)
                              }
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.orderNumber}
                          </div>
                          <div className="text-xs text-gray-900">
                            {order.itemCount} sản phẩm
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                          {order.email && (
                            <div className="text-xs text-gray-900">
                              {order.email}
                            </div>
                          )}
                          {order.phone && (
                            <div className="text-xs text-gray-900">
                              {order.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <OrderStatusBadge status={order.orderStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <PaymentStatusBadge status={order.paymentStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatOrderDate(order.orderDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Xem chi tiết"
                            >
                              <FiEye className="h-5 w-5" />
                            </Link>
                            <Link
                              href={`/admin/orders/${order.id}/edit`}
                              className="text-amber-600 hover:text-amber-900"
                              title="Sửa đơn hàng"
                            >
                              <FiEdit className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => {
                                setActionType("delete");
                                toggleSelect(order.id, true);
                                setConfirmModalOpen(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa đơn hàng"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => window.print()}
                              className="text-purple-600 hover:text-purple-900"
                              title="In đơn hàng"
                            >
                              <FiPrinter className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={showBulkActions ? 8 : 7}
                        className="px-6 py-10 text-center text-gray-900"
                      >
                        {error || "Không tìm thấy đơn hàng nào"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Hiển thị{" "}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{" "}
                      đến{" "}
                      <span className="font-medium">
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}
                      </span>{" "}
                      trong tổng số{" "}
                      <span className="font-medium">{pagination.total}</span>{" "}
                      đơn hàng
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          pagination.page <= 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <FiChevronLeft className="h-5 w-5" />
                      </button>

                      {getPaginationRange().map((pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                            pagination.page === pageNumber
                              ? "text-amber-600 bg-amber-50"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ))}

                      <button
                        onClick={() => goToPage(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          pagination.page >= pagination.totalPages
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <FiChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal xác nhận */}
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {actionType === "delete"
                ? "Xác nhận xóa đơn hàng"
                : "Xác nhận khôi phục đơn hàng"}
            </h3>
            <p className="text-gray-900 mb-6">
              {actionType === "delete"
                ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} đơn hàng đã chọn? Hành động này không thể hoàn tác.`
                : `Bạn có chắc chắn muốn khôi phục ${selectedIds.length} đơn hàng đã chọn?`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-md text-white ${
                  actionType === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {actionType === "delete" ? "Xóa" : "Khôi phục"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
