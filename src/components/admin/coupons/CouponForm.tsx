import React, { useState, useEffect } from "react";
import { FiSave } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CouponInput } from "@/types/coupon";

interface CouponFormProps {
  initialData?: CouponInput;
  onSubmit: (data: CouponInput) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

const CouponForm: React.FC<CouponFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  isEditing = false,
}) => {
  // Default initial data for new coupon
  const defaultData: CouponInput = {
    code: "",
    type: "percentage",
    value: 10,
    minOrderValue: 0,
    maxDiscount: null,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default: 30 days from now
    usageLimit: null,
    userLimit: null,
    active: true,
    description: "",
    userId: null,
    appliedProducts: null,
    appliedCategories: null,
  };

  // Form state
  const [formData, setFormData] = useState<CouponInput>(
    initialData || defaultData
  );
  const [startDateObj, setStartDateObj] = useState<Date | null>(null);
  const [endDateObj, setEndDateObj] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize dates from ISO strings
  useEffect(() => {
    if (formData.startDate) {
      setStartDateObj(new Date(formData.startDate));
    }
    if (formData.endDate) {
      setEndDateObj(new Date(formData.endDate));
    }
  }, [formData.startDate, formData.endDate]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked,
      });
    } else if (
      name === "value" ||
      name === "minOrderValue" ||
      name === "maxDiscount" ||
      name === "usageLimit" ||
      name === "userLimit"
    ) {
      const numValue = value === "" ? null : Number(value);
      setFormData({
        ...formData,
        [name]: numValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle date changes
  const handleStartDateChange = (date: Date | null) => {
    setStartDateObj(date);
    if (date) {
      setFormData({
        ...formData,
        startDate: date.toISOString(),
      });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDateObj(date);
    if (date) {
      setFormData({
        ...formData,
        endDate: date.toISOString(),
      });
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Code validation
    if (!formData.code.trim()) {
      newErrors.code = "Mã giảm giá không được để trống";
    } else if (!/^[A-Za-z0-9-_]+$/.test(formData.code.trim())) {
      newErrors.code =
        "Mã giảm giá chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới";
    }

    // Value validation
    if (formData.value === null || formData.value === undefined) {
      newErrors.value = "Giá trị giảm giá không được để trống";
    } else if (
      formData.type === "percentage" &&
      (formData.value < 0 || formData.value > 100)
    ) {
      newErrors.value = "Giá trị phần trăm phải từ 0 đến 100";
    } else if (formData.type === "fixed_amount" && formData.value < 0) {
      newErrors.value = "Giá trị giảm phải lớn hơn hoặc bằng 0";
    }

    // Min order value validation
    if (
      formData.minOrderValue === null ||
      formData.minOrderValue === undefined
    ) {
      newErrors.minOrderValue =
        "Giá trị đơn hàng tối thiểu không được để trống";
    } else if (formData.minOrderValue < 0) {
      newErrors.minOrderValue =
        "Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0";
    }

    // Max discount validation (only for percentage type)
    if (
      formData.type === "percentage" &&
      formData.maxDiscount !== null &&
      formData.maxDiscount !== undefined &&
      formData.maxDiscount < 0
    ) {
      newErrors.maxDiscount = "Giảm giá tối đa phải lớn hơn hoặc bằng 0";
    }

    // Date validation
    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu không được để trống";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc không được để trống";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    // Usage limits validation
    if (
      formData.usageLimit !== null &&
      formData.usageLimit !== undefined &&
      formData.usageLimit < 0
    ) {
      newErrors.usageLimit = "Số lần sử dụng phải lớn hơn hoặc bằng 0";
    }

    if (
      formData.userLimit !== null &&
      formData.userLimit !== undefined &&
      formData.userLimit < 0
    ) {
      newErrors.userLimit = "Giới hạn người dùng phải lớn hơn hoặc bằng 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mb-4">
          Thông tin cơ bản
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Code */}
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
            >
              Mã giảm giá <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={isEditing}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                isEditing ? "bg-gray-100" : ""
              } ${errors.code ? "border-red-500" : ""}`}
              placeholder="VD: SUMMER2023"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
            <p className="mt-1 text-xs text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              Mã giảm giá sẽ tự động chuyển thành chữ hoa. Chỉ sử dụng chữ cái,
              số, dấu gạch ngang và gạch dưới.
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Mô tả mã giảm giá này..."
            />
          </div>
        </div>
      </div>

      {/* Discount Settings */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mb-4">
          Cài đặt giảm giá
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discount Type */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
            >
              Loại giảm giá <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed_amount">Số tiền cố định (VNĐ)</option>
            </select>
          </div>

          {/* Value */}
          <div>
            <label
              htmlFor="value"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
            >
              Giá trị giảm giá <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="value"
                name="value"
                value={formData.value === null ? "" : formData.value}
                onChange={handleChange}
                min={0}
                max={formData.type === "percentage" ? 100 : undefined}
                step={formData.type === "percentage" ? 1 : 1000}
                className={`block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.value ? "border-red-500" : ""
                }`}
                placeholder={formData.type === "percentage" ? "10" : "50000"}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 sm:text-sm">
                  {formData.type === "percentage" ? "%" : "đ"}
                </span>
              </div>
            </div>
            {errors.value && (
              <p className="mt-1 text-sm text-red-600">{errors.value}</p>
            )}
          </div>

          {/* Min Order Value */}
          <div>
            <label
              htmlFor="minOrderValue"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
            >
              Giá trị đơn hàng tối thiểu <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="minOrderValue"
                name="minOrderValue"
                value={
                  formData.minOrderValue === null ? "" : formData.minOrderValue
                }
                onChange={handleChange}
                min={0}
                step={1000}
                className={`block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.minOrderValue ? "border-red-500" : ""
                }`}
                placeholder="0"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 sm:text-sm">
                  đ
                </span>
              </div>
            </div>
            {errors.minOrderValue && (
              <p className="mt-1 text-sm text-red-600">
                {errors.minOrderValue}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              Đặt giá trị 0 nếu không có giới hạn tối thiểu
            </p>
          </div>

          {/* Max Discount (only for percentage) */}
          {formData.type === "percentage" && (
            <div>
              <label
                htmlFor="maxDiscount"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
              >
                Giảm giá tối đa
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="maxDiscount"
                  name="maxDiscount"
                  value={
                    formData.maxDiscount === null ? "" : formData.maxDiscount
                  }
                  onChange={handleChange}
                  min={0}
                  step={1000}
                  className={`block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errors.maxDiscount ? "border-red-500" : ""
                  }`}
                  placeholder="100000"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 sm:text-sm">
                    đ
                  </span>
                </div>
              </div>
              {errors.maxDiscount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.maxDiscount}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                Bỏ trống nếu không giới hạn số tiền giảm tối đa
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Time Settings */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mb-4">
          Cài đặt thời gian
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
            >
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={startDateObj}
              onChange={handleStartDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={30}
              dateFormat="dd/MM/yyyy HH:mm"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.startDate ? "border-red-500" : ""
              }`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
            >
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={endDateObj}
              onChange={handleEndDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={30}
              dateFormat="dd/MM/yyyy HH:mm"
              minDate={startDateObj || undefined}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.endDate ? "border-red-500" : ""
              }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Usage Limits */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mb-4">
          Giới hạn sử dụng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Usage Limit */}
          <div>
            <label
              htmlFor="usageLimit"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
            >
              Tổng số lần sử dụng
            </label>
            <input
              type="number"
              id="usageLimit"
              name="usageLimit"
              value={formData.usageLimit === null ? "" : formData.usageLimit}
              onChange={handleChange}
              min={0}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.usageLimit ? "border-red-500" : ""
              }`}
              placeholder="100"
            />
            {errors.usageLimit && (
              <p className="mt-1 text-sm text-red-600">{errors.usageLimit}</p>
            )}
            <p className="mt-1 text-xs text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              Bỏ trống nếu không giới hạn số lần sử dụng
            </p>
          </div>

          {/* Per User Limit */}
          <div>
            <label
              htmlFor="userLimit"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
            >
              Số lần mỗi người dùng có thể sử dụng
            </label>
            <input
              type="number"
              id="userLimit"
              name="userLimit"
              value={formData.userLimit === null ? "" : formData.userLimit}
              onChange={handleChange}
              min={0}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.userLimit ? "border-red-500" : ""
              }`}
              placeholder="1"
            />
            {errors.userLimit && (
              <p className="mt-1 text-sm text-red-600">{errors.userLimit}</p>
            )}
            <p className="mt-1 text-xs text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              Bỏ trống nếu không giới hạn
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mb-4">
          Trạng thái
        </h3>

        <div className="flex items-center">
          <input
            id="active"
            name="active"
            type="checkbox"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            htmlFor="active"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100"
          >
            Kích hoạt mã giảm giá
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
          Bỏ chọn nếu bạn muốn tạo mã giảm giá nhưng chưa cho phép sử dụng
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          <FiSave className="mr-2 -ml-1 h-5 w-5" />
          {isSubmitting
            ? "Đang lưu..."
            : isEditing
            ? "Cập nhật"
            : "Tạo mã giảm giá"}
        </button>
      </div>
    </form>
  );
};

export default CouponForm;
