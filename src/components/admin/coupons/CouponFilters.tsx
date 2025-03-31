import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiSearch, FiCalendar, FiX } from "react-icons/fi";
import { CouponListParams, CouponType } from "@/types/coupon";

interface CouponFiltersProps {
  initialFilters: {
    search?: string;
    type?: CouponType;
    active?: boolean;
    fromDate?: string;
    toDate?: string;
  };
  onFilterChange: (filters: CouponListParams) => void;
}

const CouponFilters: React.FC<CouponFiltersProps> = ({
  initialFilters,
  onFilterChange,
}) => {
  // Form state
  const [filters, setFilters] = useState({
    search: initialFilters.search || "",
    type: initialFilters.type || "",
    active: initialFilters.active,
    fromDate: initialFilters.fromDate
      ? new Date(initialFilters.fromDate)
      : null,
    toDate: initialFilters.toDate ? new Date(initialFilters.toDate) : null,
  });

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      if (target.name === "active") {
        // Handle undefined, true, false states for active filter
        let activeValue;
        if (target.value === "all") {
          activeValue = undefined;
        } else {
          activeValue = target.value === "true";
        }
        setFilters((prev) => ({ ...prev, active: activeValue }));
      } else {
        setFilters((prev) => ({ ...prev, [name]: target.checked }));
      }
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle date change
  const handleDateChange = (
    date: Date | null,
    field: "fromDate" | "toDate"
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    const params: CouponListParams = {
      search: filters.search || undefined,
      type: (filters.type as CouponType) || undefined,
      active: filters.active,
      fromDate: filters.fromDate ? filters.fromDate.toISOString() : undefined,
      toDate: filters.toDate ? filters.toDate.toISOString() : undefined,
    };

    onFilterChange(params);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: "",
      type: "",
      active: undefined,
      fromDate: null,
      toDate: null,
    });

    onFilterChange({});
  };

  // Apply filters when form is submitted
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  // Auto-apply filters when they change (except search field)
  useEffect(() => {
    const timerId = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(timerId);
  }, [filters.active, filters.type, filters.fromDate, filters.toDate]);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tìm kiếm
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-900" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={filters.search}
                onChange={handleChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Tìm mã giảm giá..."
              />
            </div>
          </div>

          {/* Coupon Type */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Loại giảm giá
            </label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Tất cả loại</option>
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed_amount">Số tiền cố định</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              <div className="flex items-center">
                <input
                  id="status-all"
                  name="active"
                  type="radio"
                  value="all"
                  checked={filters.active === undefined}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label
                  htmlFor="status-all"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Tất cả
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="status-active"
                  name="active"
                  type="radio"
                  value="true"
                  checked={filters.active === true}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label
                  htmlFor="status-active"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Kích hoạt
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="status-inactive"
                  name="active"
                  type="radio"
                  value="false"
                  checked={filters.active === false}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label
                  htmlFor="status-inactive"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Vô hiệu
                </label>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian hiệu lực
            </label>
            <div className="grid grid-cols-1 gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-900" />
                </div>
                <DatePicker
                  selected={filters.fromDate}
                  onChange={(date) => handleDateChange(date, "fromDate")}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Từ ngày"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-900" />
                </div>
                {/* Đây là thay đổi quan trọng */}
                <DatePicker
                  selected={filters.toDate}
                  onChange={(date) => handleDateChange(date, "toDate")}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Đến ngày"
                  minDate={filters.fromDate || undefined}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiX className="mr-2 h-4 w-4" />
            Xóa bộ lọc
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiSearch className="mr-2 h-4 w-4" />
            Tìm kiếm
          </button>
        </div>
      </form>
    </div>
  );
};

export default CouponFilters;
