import React, { useState, useEffect } from "react";
import { OrderSortField, OrderUIFilters } from "@/types/orderFilters";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from "@/constants/order";
import {
  FiSearch,
  FiFilter,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiMapPin,
  FiPhone,
  FiBarChart2,
  FiChevronDown,
  FiChevronUp,
  FiX,
} from "react-icons/fi";

interface OrderFilterPanelProps {
  filters: OrderUIFilters;
  onFilterChange: (filters: OrderUIFilters) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
  loading?: boolean;
  showAdvancedFilters?: boolean;
  className?: string;
}

/**
 * Panel lọc nâng cao cho quản lý đơn hàng
 */
const OrderFilterPanel: React.FC<OrderFilterPanelProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onApplyFilters,
  loading = false,
  showAdvancedFilters = true,
  className = "",
}) => {
  // Helper functions
  const safeString = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    return "";
  };

  const safeNumber = (value: unknown, defaultValue: number): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  };

  // Local state
  const [localFilters, setLocalFilters] = useState<OrderUIFilters>(filters);
  const [expandedSections, setExpandedSections] = useState({
    date: true,
    status: true,
    payment: showAdvancedFilters,
    customer: showAdvancedFilters,
    amount: showAdvancedFilters,
  });

  // Cập nhật local filters khi prop filters thay đổi
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Toggle section
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // Handle input changes
  const handleInputChange = (field: keyof OrderUIFilters, value: unknown) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply local filters
  const applyFilters = () => {
    onFilterChange(localFilters);
    onApplyFilters();
  };

  // Reset filters
  const resetFilters = () => {
    onResetFilters();
  };

  // Kiểm tra xem có filter nào đang active không
  const hasActiveFilters = () => {
    // Loại bỏ các filter mặc định như page, limit, sortBy, sortOrder
    const {
      //   page: _,
      //   limit: __,
      //   sortBy: ___,
      //   sortOrder: ____,
      ...filterValues
    } = localFilters;

    // Kiểm tra xem có giá trị filter nào
    return Object.values(filterValues).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim() !== "";
      return value !== undefined && value !== null;
    });
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100800 flex items-center">
          <FiFilter className="mr-2" /> Bộ lọc đơn hàng
        </h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={resetFilters}
            disabled={loading || !hasActiveFilters()}
            className="inline-flex items-center py-1.5 px-3 text-xs font-medium rounded-md text-gray-900 dark:text-gray-100700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <FiX className="mr-1" /> Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Basic search */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search by order number or customer */}
          <div>
            <label
              htmlFor="searchTerm"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
            >
              Tìm đơn hàng
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
              </div>
              <input
                type="text"
                id="searchTerm"
                value={safeString(localFilters.searchTerm)}
                onChange={(e) =>
                  handleInputChange("searchTerm", e.target.value)
                }
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="Mã đơn, tên KH, SĐT, email..."
              />
            </div>
          </div>

          {/* Order status */}
          <div>
            <label
              htmlFor="orderStatus"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
            >
              Trạng thái đơn hàng
            </label>
            <select
              id="orderStatus"
              value={safeString(localFilters.orderStatus)}
              onChange={(e) =>
                handleInputChange("orderStatus", e.target.value || undefined)
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

          {/* Date range type */}
          <div>
            <label
              htmlFor="dateRangeType"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
            >
              Thời gian
            </label>
            <select
              id="dateRangeType"
              value={safeString(localFilters.dateRangeType) || "all"}
              onChange={(e) =>
                handleInputChange("dateRangeType", e.target.value)
              }
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
            >
              <option value="all">Toàn thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="thisWeek">Tuần này</option>
              <option value="lastWeek">Tuần trước</option>
              <option value="thisMonth">Tháng này</option>
              <option value="lastMonth">Tháng trước</option>
              <option value="custom">Tùy chọn</option>
            </select>
          </div>
        </div>

        {/* Date Range Section - only show when dateRangeType is custom */}
        {localFilters.dateRangeType === "custom" && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="fromDate"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
              >
                Từ ngày
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
                </div>
                <input
                  type="date"
                  id="fromDate"
                  value={safeString(localFilters.fromDate)}
                  onChange={(e) =>
                    handleInputChange("fromDate", e.target.value)
                  }
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="toDate"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
              >
                Đến ngày
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
                </div>
                <input
                  type="date"
                  id="toDate"
                  value={safeString(localFilters.toDate)}
                  onChange={(e) => handleInputChange("toDate", e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <>
          {/* Payment Filters */}
          <div className="border-b border-gray-200">
            <button
              type="button"
              onClick={() => toggleSection("payment")}
              className="flex justify-between items-center w-full px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100700 hover:bg-gray-50"
            >
              <span className="flex items-center">
                <FiDollarSign className="mr-2" /> Thanh toán
              </span>
              {expandedSections.payment ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {expandedSections.payment && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Payment Status */}
                  <div>
                    <label
                      htmlFor="paymentStatus"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                    >
                      Trạng thái thanh toán
                    </label>
                    <select
                      id="paymentStatus"
                      value={safeString(localFilters.paymentStatus)}
                      onChange={(e) =>
                        handleInputChange(
                          "paymentStatus",
                          e.target.value || undefined
                        )
                      }
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                    >
                      <option value="">Tất cả trạng thái</option>
                      {PAYMENT_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label
                      htmlFor="paymentMethod"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                    >
                      Phương thức thanh toán
                    </label>
                    <select
                      id="paymentMethod"
                      value={safeString(localFilters.paymentMethod)}
                      onChange={(e) =>
                        handleInputChange(
                          "paymentMethod",
                          e.target.value || undefined
                        )
                      }
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                    >
                      <option value="">Tất cả phương thức</option>
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Min Order Amount */}
                  <div>
                    <label
                      htmlFor="minAmount"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                    >
                      Giá trị đơn từ
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 sm:text-sm">
                          ₫
                        </span>
                      </div>
                      <input
                        type="number"
                        id="minAmount"
                        value={safeNumber(localFilters.minAmount, 0)}
                        onChange={(e) =>
                          handleInputChange(
                            "minAmount",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="Nhập giá trị"
                      />
                    </div>
                  </div>

                  {/* Max Order Amount */}
                  <div>
                    <label
                      htmlFor="maxAmount"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                    >
                      Đến
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 sm:text-sm">
                          ₫
                        </span>
                      </div>
                      <input
                        type="number"
                        id="maxAmount"
                        value={safeNumber(localFilters.maxAmount, 0)}
                        onChange={(e) =>
                          handleInputChange(
                            "maxAmount",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="Nhập giá trị"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Filters */}
          <div className="border-b border-gray-200">
            <button
              type="button"
              onClick={() => toggleSection("customer")}
              className="flex justify-between items-center w-full px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100700 hover:bg-gray-50"
            >
              <span className="flex items-center">
                <FiUser className="mr-2" /> Khách hàng & Địa chỉ
              </span>
              {expandedSections.customer ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {expandedSections.customer && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Name */}
                  <div>
                    <label
                      htmlFor="customerName"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                    >
                      Tên khách hàng
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      value={safeString(localFilters.customerName)}
                      onChange={(e) =>
                        handleInputChange(
                          "customerName",
                          e.target.value || undefined
                        )
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      placeholder="Nhập tên khách hàng"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label
                      htmlFor="customerPhone"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                    >
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
                      </div>
                      <input
                        type="text"
                        id="customerPhone"
                        value={safeString(localFilters.customerPhone)}
                        onChange={(e) =>
                          handleInputChange(
                            "customerPhone",
                            e.target.value || undefined
                          )
                        }
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="Nhập SĐT khách hàng"
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Email */}
                <div>
                  <label
                    htmlFor="customerEmail"
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                  >
                    Email khách hàng
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    value={safeString(localFilters.customerEmail)}
                    onChange={(e) =>
                      handleInputChange(
                        "customerEmail",
                        e.target.value || undefined
                      )
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    placeholder="Nhập email khách hàng"
                  />
                </div>

                {/* Customer Address */}
                <div>
                  <label
                    htmlFor="customerAddress"
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                  >
                    Địa chỉ
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
                    </div>
                    <input
                      type="text"
                      id="customerAddress"
                      value={safeString(localFilters.customerAddress)}
                      onChange={(e) =>
                        handleInputChange(
                          "customerAddress",
                          e.target.value || undefined
                        )
                      }
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      placeholder="Tìm theo địa chỉ khách hàng"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sorting options */}
          <div className="border-b border-gray-200">
            <button
              type="button"
              onClick={() => toggleSection("amount")}
              className="flex justify-between items-center w-full px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100700 hover:bg-gray-50"
            >
              <span className="flex items-center">
                <FiBarChart2 className="mr-2" /> Sắp xếp & Hiển thị
              </span>
              {expandedSections.amount ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {expandedSections.amount && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sort By */}
                  <div>
                    <label
                      htmlFor="sortBy"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                    >
                      Sắp xếp theo
                    </label>
                    <select
                      id="sortBy"
                      value={safeString(localFilters.sortBy) || "createdAt"}
                      onChange={(e) =>
                        handleInputChange(
                          "sortBy",
                          e.target.value as OrderSortField
                        )
                      }
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                    >
                      <option value="createdAt">Ngày tạo đơn</option>
                      <option value="orderNumber">Mã đơn hàng</option>
                      <option value="totalAmount">Giá trị đơn hàng</option>
                      <option value="customerName">Tên khách hàng</option>
                      <option value="updatedAt">Ngày cập nhật</option>
                    </select>
                  </div>

                  {/* Sort Direction */}
                  <div>
                    <label
                      htmlFor="sortOrder"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                    >
                      Thứ tự
                    </label>
                    <select
                      id="sortOrder"
                      value={safeString(localFilters.sortOrder) || "desc"}
                      onChange={(e) =>
                        handleInputChange(
                          "sortOrder",
                          e.target.value as "asc" | "desc"
                        )
                      }
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                    >
                      <option value="desc">Giảm dần</option>
                      <option value="asc">Tăng dần</option>
                    </select>
                  </div>
                </div>

                {/* Items per page */}
                <div>
                  <label
                    htmlFor="limit"
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                  >
                    Số đơn hàng mỗi trang
                  </label>
                  <select
                    id="limit"
                    value={safeNumber(localFilters.limit, 10)}
                    onChange={(e) =>
                      handleInputChange("limit", Number(e.target.value))
                    }
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                  >
                    <option value={10}>10 đơn hàng</option>
                    <option value={20}>20 đơn hàng</option>
                    <option value={50}>50 đơn hàng</option>
                    <option value={100}>100 đơn hàng</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer - Apply Filters */}
      <div className="px-4 py-3 bg-gray-50 text-right">
        <button
          type="button"
          onClick={applyFilters}
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              <span>Đang lọc...</span>
            </>
          ) : (
            <>
              <FiFilter className="mr-2 -ml-1 h-4 w-4" />
              <span>Áp dụng bộ lọc</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderFilterPanel;
