import React, { useState } from "react";
import { OrderSummary } from "@/types/order";
import { OrderSortField } from "@/types/orderFilters";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/order/OrderStatusBadge";
import { formatAmount, formatDateTime } from "@/utils/format";
import {
  FiEdit,
  FiEye,
  FiTrash2,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
} from "react-icons/fi";
import Link from "next/link";

interface OrderTableProps {
  orders: OrderSummary[];
  isLoading?: boolean;
  onDelete?: (orderId: number) => void;
  onRestore?: (orderId: number) => void;
  onSort?: (field: OrderSortField, order: "asc" | "desc") => void;
  sortBy?: OrderSortField;
  sortOrder?: "asc" | "desc";
  showSelectColumn?: boolean;
  selectedIds?: number[];
  onSelectChange?: (ids: number[]) => void;
  emptyMessage?: string;
  className?: string;
}

/**
 * Component bảng hiển thị danh sách đơn hàng cho admin
 */
const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  isLoading = false,
  onDelete,
  onRestore,
  onSort,
  sortBy,
  sortOrder = "desc",
  showSelectColumn = false,
  selectedIds = [],
  onSelectChange,
  emptyMessage = "Không có đơn hàng nào",
  className = "",
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    orderStatus: "",
    paymentStatus: "",
    minAmount: "",
    maxAmount: "",
  });

  // Xử lý sort
  const handleSortClick = (field: OrderSortField) => {
    if (!onSort) return;

    // Toggle order if same field, otherwise start with desc
    const newOrder = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
    onSort(field, newOrder);
  };

  // Hiển thị icon sort
  const renderSortIcon = (field: OrderSortField) => {
    if (sortBy !== field) return null;

    return sortOrder === "asc" ? (
      <FiChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <FiChevronDown className="ml-1 h-4 w-4" />
    );
  };

  // Xử lý select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectChange) return;

    if (e.target.checked) {
      onSelectChange(orders.map((order) => order.id));
    } else {
      onSelectChange([]);
    }
  };

  // Xử lý select individual
  const handleSelectOne = (orderId: number, checked: boolean) => {
    if (!onSelectChange) return;

    if (checked) {
      onSelectChange([...selectedIds, orderId]);
    } else {
      onSelectChange(selectedIds.filter((id) => id !== orderId));
    }
  };

  // Xử lý filter change
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  const filteredOrders = orders.filter((order) => {
    if (filters.orderStatus && order.orderStatus !== filters.orderStatus)
      return false;
    if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus)
      return false;
    if (filters.minAmount && order.totalAmount < parseInt(filters.minAmount))
      return false;
    if (filters.maxAmount && order.totalAmount > parseInt(filters.maxAmount))
      return false;
    return true;
  });

  if (isLoading) {
    return (
      <div
        className={`bg-white shadow overflow-hidden rounded-lg ${className}`}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div
        className={`bg-white shadow overflow-hidden rounded-lg ${className}`}
      >
        <div className="px-4 py-6 text-center">
          <p className="text-gray-900">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow overflow-hidden rounded-lg ${className}`}>
      {/* Table toolbar */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-700">
            {filteredOrders.length} đơn hàng
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-3 inline-flex items-center px-2 py-1 border border-gray-300 text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiFilter className="mr-1" />
            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </button>
        </div>

        {showSelectColumn && selectedIds.length > 0 && (
          <div className="flex space-x-2">
            <span className="text-sm text-gray-700">
              Đã chọn {selectedIds.length} đơn hàng
            </span>
            <button
              onClick={() => onSelectChange && onSelectChange([])}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        )}
      </div>

      {/* Filters row */}
      {showFilters && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label
              htmlFor="orderStatus"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Trạng thái đơn hàng
            </label>
            <select
              id="orderStatus"
              name="orderStatus"
              value={filters.orderStatus}
              onChange={handleFilterChange}
              className="block w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao hàng</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="paymentStatus"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Trạng thái thanh toán
            </label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="block w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="failed">Thanh toán thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="minAmount"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Giá trị tối thiểu
            </label>
            <input
              type="number"
              id="minAmount"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleFilterChange}
              placeholder="VD: 100000"
              className="block w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="maxAmount"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Giá trị tối đa
            </label>
            <input
              type="number"
              id="maxAmount"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleFilterChange}
              placeholder="VD: 1000000"
              className="block w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {showSelectColumn && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    checked={
                      selectedIds.length === orders.length && orders.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortClick("orderNumber")}
              >
                <div className="flex items-center">
                  Mã đơn hàng {renderSortIcon("orderNumber")}
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
                onClick={() => handleSortClick("totalAmount")}
              >
                <div className="flex items-center justify-end">
                  Giá trị {renderSortIcon("totalAmount")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortClick("orderStatus")}
              >
                <div className="flex items-center justify-center">
                  Trạng thái {renderSortIcon("orderStatus")}
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
                onClick={() => handleSortClick("orderDate")}
              >
                <div className="flex items-center justify-end">
                  Ngày đặt {renderSortIcon("orderDate")}
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
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                {showSelectColumn && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      checked={selectedIds.includes(order.id)}
                      onChange={(e) =>
                        handleSelectOne(order.id, e.target.checked)
                      }
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-amber-600 hover:text-amber-900">
                    <Link href={`/admin/orders/${order.id}`}>
                      {order.orderNumber}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {order.customerName}
                  </div>
                  {order.customerPhone && (
                    <div className="text-xs text-gray-900">
                      {order.customerPhone}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                  {formatAmount(order.totalAmount, order.currency || "VND")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <OrderStatusBadge status={order.orderStatus} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <PaymentStatusBadge status={order.paymentStatus} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatDateTime(order.orderDate, "short")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Xem chi tiết"
                    >
                      <FiEye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/orders/${order.id}/edit`}
                      className="text-amber-600 hover:text-amber-900"
                      title="Chỉnh sửa"
                    >
                      <FiEdit className="h-4 w-4" />
                    </Link>

                    {onDelete && (
                      <button
                        onClick={() => onDelete(order.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa đơn hàng"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    )}

                    {onRestore && order.deleted && (
                      <button
                        onClick={() => onRestore(order.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Khôi phục đơn hàng"
                      >
                        <FiRefreshCw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
