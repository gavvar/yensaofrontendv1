import React, { useState, useEffect } from "react";
import OrderItem from "./OrderItem";
import { OrderSummary, OrderStatus, OrderListParams } from "@/types/order";
import orderService from "@/services/orderService";
import { FiFilter, FiRefreshCw, FiAlertCircle } from "react-icons/fi";

interface OrderListProps {
  initialOrders?: OrderSummary[];
  className?: string;
}

/**
 * Component hiển thị danh sách đơn hàng với lọc và phân trang
 */
const OrderList: React.FC<OrderListProps> = ({
  initialOrders,
  className = "",
}) => {
  console.log("OrderList received orders:", initialOrders);

  // State for orders data
  const [orders, setOrders] = useState<OrderSummary[]>(initialOrders || []);
  const [loading, setLoading] = useState(!initialOrders);
  const [error, setError] = useState("");

  // State for filtering and pagination
  const [filter, setFilter] = useState<OrderListParams>({
    page: 1, // Đã đặt giá trị mặc định là 1
    limit: 10,
  });

  // Khi sử dụng filter.page, thêm fallback để đảm bảo luôn có giá trị
  const currentPage = filter.page || 1;

  // State for total pages and orders count
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Available order statuses for filtering
  const orderStatuses: { value: OrderStatus | ""; label: string }[] = [
    { value: "", label: "Tất cả" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "processing", label: "Đang xử lý" },
    { value: "shipped", label: "Đang giao hàng" },
    { value: "delivered", label: "Đã giao hàng" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  // Fetch orders based on current filter
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await orderService.getOrders(filter);

      // Cập nhật đúng theo OrderListResponse interface
      setOrders(response.orders); // Thay vì response.data
      setTotalPages(response.pagination.totalPages);

      // Đảm bảo giá trị không bị undefined
      setTotalOrders(response.pagination.total || 0); // Thay vì response.pagination.totalItems

      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Handle status filter change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as OrderStatus | "";
    setFilter((prev) => ({
      ...prev,
      orderStatus: status || undefined,
      page: 1, // Reset to first page when filter changes
    }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    setFilter((prev) => ({ ...prev, page: newPage }));
  };

  // Handle refresh button
  const handleRefresh = () => {
    fetchOrders();
  };

  // Fetch orders when filter changes
  useEffect(() => {
    // Skip fetch if we have initial orders and it's the first render
    if (initialOrders && currentPage === 1 && !filter.orderStatus) {
      return;
    }

    fetchOrders();
  }, [filter]);

  useEffect(() => {
    console.log("OrderList initialOrders:", initialOrders);
  }, [initialOrders]);

  // Generate pagination buttons
  const renderPagination = () => {
    const pages = [];
    const maxPageButtons = 5;

    const currentPage = filter.page || 1;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded-md ${
            currentPage === i
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &laquo;
        </button>

        {pages}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 mx-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &raquo;
        </button>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Filter and actions row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-4 sm:mb-0">
          <FiFilter className="mr-2 text-gray-900" />
          <label htmlFor="status-filter" className="text-sm text-gray-700 mr-2">
            Lọc theo trạng thái:
          </label>
          <select
            id="status-filter"
            value={filter.orderStatus || ""}
            onChange={handleStatusChange}
            className="border rounded-md px-3 py-1.5 text-sm"
          >
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center text-sm bg-white border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
        >
          <FiRefreshCw className="mr-2" />
          Làm mới
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-amber-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 flex items-start">
          <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">Đã xảy ra lỗi</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không có đơn hàng nào
          </h3>
          <p className="mt-1 text-sm text-gray-900">
            {filter.orderStatus
              ? `Bạn chưa có đơn hàng nào ở trạng thái "${
                  orderStatuses.find((s) => s.value === filter.orderStatus)
                    ?.label
                }".`
              : "Bạn chưa đặt đơn hàng nào."}
          </p>
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Show pagination if there are orders and multiple pages */}
      {!loading &&
        !error &&
        orders.length > 0 &&
        totalPages > 1 &&
        renderPagination()}

      {/* Orders count */}
      {!loading && !error && orders.length > 0 && (
        <div className="text-sm text-gray-900 text-center mt-4">
          Hiển thị{" "}
          {Math.min((currentPage - 1) * (filter.limit || 10) + 1, totalOrders)}-
          {Math.min(currentPage * (filter.limit || 10), totalOrders)} trên{" "}
          {totalOrders} đơn hàng
        </div>
      )}
    </div>
  );
};

export default OrderList;
