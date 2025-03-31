import React, { useState } from "react";
import { OrderStatus, PaymentStatus } from "@/types/order";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/constants/order";
import { FiSearch, FiFilter, FiCalendar, FiX } from "react-icons/fi";

interface OrderFilterFormProps {
  onSubmit: (filters: {
    orderNumber?: string;
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fromDate?: string;
    toDate?: string;
  }) => void;
  initialFilters?: {
    orderNumber?: string;
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fromDate?: string;
    toDate?: string;
  };
  showPaymentFilter?: boolean;
  showDateFilter?: boolean;
  className?: string;
}

/**
 * Form lọc đơn hàng
 */
const OrderFilterForm: React.FC<OrderFilterFormProps> = ({
  onSubmit,
  initialFilters = {},
  showPaymentFilter = true,
  showDateFilter = true,
  className = "",
}) => {
  // State cho filter
  const [orderNumber, setOrderNumber] = useState(
    initialFilters.orderNumber || ""
  );
  const [orderStatus, setOrderStatus] = useState<OrderStatus | "">(
    initialFilters.orderStatus || ""
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">(
    initialFilters.paymentStatus || ""
  );
  const [fromDate, setFromDate] = useState(initialFilters.fromDate || "");
  const [toDate, setToDate] = useState(initialFilters.toDate || "");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Xử lý submit form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Xây dựng filter từ state
    const filters: OrderFilterFormProps["initialFilters"] = {};

    if (orderNumber?.trim()) filters.orderNumber = orderNumber.trim();
    if (orderStatus) filters.orderStatus = orderStatus;
    if (paymentStatus && showPaymentFilter)
      filters.paymentStatus = paymentStatus;
    if (fromDate && showDateFilter) filters.fromDate = fromDate;
    if (toDate && showDateFilter) filters.toDate = toDate;

    // Gọi callback onSubmit
    onSubmit(filters);
  };

  // Reset form
  const handleReset = () => {
    setOrderNumber("");
    setOrderStatus("");
    setPaymentStatus("");
    setFromDate("");
    setToDate("");
    onSubmit({});
  };

  return (
    <div
      className={`bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Search form */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-2">
          {/* Search by order number */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-900" />
              </div>
              <input
                type="text"
                name="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Tìm theo mã đơn hàng"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Order status filter */}
          <div className="sm:w-48">
            <select
              value={orderStatus}
              onChange={(e) =>
                setOrderStatus(e.target.value as OrderStatus | "")
              }
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
            >
              <option value="">Tất cả trạng thái</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search and reset buttons */}
          <div className="flex space-x-2">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Tìm kiếm
            </button>

            {/* Advanced filter toggle */}
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <FiFilter className="mr-2 h-4 w-4" />
              Lọc
            </button>

            {/* Reset button - only show if there are active filters */}
            {(orderNumber ||
              orderStatus ||
              paymentStatus ||
              fromDate ||
              toDate) && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <FiX className="mr-1 h-4 w-4" />
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Advanced filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Payment status filter */}
            {showPaymentFilter && (
              <div>
                <label
                  htmlFor="payment-status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Trạng thái thanh toán
                </label>
                <select
                  id="payment-status"
                  value={paymentStatus}
                  onChange={(e) =>
                    setPaymentStatus(e.target.value as PaymentStatus | "")
                  }
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                >
                  <option value="">Tất cả</option>
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date range filter */}
            {showDateFilter && (
              <>
                <div>
                  <label
                    htmlFor="from-date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Từ ngày
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-900" />
                    </div>
                    <input
                      type="date"
                      id="from-date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="to-date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Đến ngày
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-900" />
                    </div>
                    <input
                      type="date"
                      id="to-date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </form>

      {/* Active filters */}
      {(orderNumber || orderStatus || paymentStatus || fromDate || toDate) && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-900">Bộ lọc đang áp dụng:</span>

            {orderNumber && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Mã đơn: {orderNumber}
                <button
                  type="button"
                  onClick={() => setOrderNumber("")}
                  className="ml-1 text-gray-900 hover:text-gray-700"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}

            {orderStatus && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Trạng thái:{" "}
                {ORDER_STATUSES.find((s) => s.value === orderStatus)?.label}
                <button
                  type="button"
                  onClick={() => setOrderStatus("")}
                  className="ml-1 text-gray-900 hover:text-gray-700"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}

            {paymentStatus && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Thanh toán:{" "}
                {PAYMENT_STATUSES.find((s) => s.value === paymentStatus)?.label}
                <button
                  type="button"
                  onClick={() => setPaymentStatus("")}
                  className="ml-1 text-gray-900 hover:text-gray-700"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}

            {fromDate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Từ ngày: {fromDate}
                <button
                  type="button"
                  onClick={() => setFromDate("")}
                  className="ml-1 text-gray-900 hover:text-gray-700"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}

            {toDate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Đến ngày: {toDate}
                <button
                  type="button"
                  onClick={() => setToDate("")}
                  className="ml-1 text-gray-900 hover:text-gray-700"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFilterForm;
