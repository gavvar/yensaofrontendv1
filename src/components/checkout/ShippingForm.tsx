import React, { useEffect, useState } from "react";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useAuth } from "@/contexts/authContext";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiMessageSquare,
} from "react-icons/fi";

interface ShippingFormProps {
  onSubmit?: () => void;
  className?: string;
}

/**
 * Form nhập thông tin giao hàng
 */
const ShippingForm: React.FC<ShippingFormProps> = ({
  onSubmit,
  className = "",
}) => {
  const { user } = useAuth();
  const { checkout, setShippingInfo, calculateShippingFee } = useCheckout();

  // Form data state
  const [formData, setFormData] = useState({
    customerName: checkout.shippingInfo.customerName || "",
    customerEmail: checkout.shippingInfo.customerEmail || "",
    customerPhone: checkout.shippingInfo.customerPhone || "",
    customerAddress: checkout.shippingInfo.customerAddress || "",
    note: checkout.shippingInfo.note || "",
  });

  // Validation state
  const [errors, setErrors] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
  });

  // Loading state
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // Populate form with user data if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.fullName || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || prev.customerPhone,
        customerAddress: user.address || prev.customerAddress,
      }));
    }
  }, [user]);

  // Update form state when checkout context shipping info changes
  useEffect(() => {
    setFormData({
      customerName: checkout.shippingInfo.customerName || "",
      customerEmail: checkout.shippingInfo.customerEmail || "",
      customerPhone: checkout.shippingInfo.customerPhone || "",
      customerAddress: checkout.shippingInfo.customerAddress || "",
      note: checkout.shippingInfo.note || "",
    });
  }, [checkout.shippingInfo]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors = {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
    };

    let isValid = true;

    // Validate name
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Vui lòng nhập họ tên";
      isValid = false;
    }

    // Validate email
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Vui lòng nhập email";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Email không hợp lệ";
      isValid = false;
    }

    // Validate phone
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Vui lòng nhập số điện thoại";
      isValid = false;
    } else if (
      !/^\d{10,11}$/.test(formData.customerPhone.replace(/[^0-9]/g, ""))
    ) {
      newErrors.customerPhone = "Số điện thoại không hợp lệ";
      isValid = false;
    }

    // Validate address
    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = "Vui lòng nhập địa chỉ giao hàng";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Update shipping info in checkout context
    setShippingInfo(formData);

    // Calculate shipping fee based on address
    try {
      setIsCalculatingShipping(true);
      await calculateShippingFee(formData.customerAddress);

      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error("Error calculating shipping fee:", error);
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h2 className="text-lg font-semibold mb-4">Thông tin giao hàng</h2>

      <form onSubmit={handleSubmit}>
        {/* Họ tên */}
        <div className="mb-4">
          <label
            htmlFor="customerName"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
          >
            Họ tên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              <FiUser />
            </div>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className={`pl-10 w-full p-2.5 border rounded-md ${
                errors.customerName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nguyễn Văn A"
            />
          </div>
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label
            htmlFor="customerEmail"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              <FiMail />
            </div>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              className={`pl-10 w-full p-2.5 border rounded-md ${
                errors.customerEmail ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="example@gmail.com"
            />
          </div>
          {errors.customerEmail && (
            <p className="mt-1 text-sm text-red-500">{errors.customerEmail}</p>
          )}
        </div>

        {/* Số điện thoại */}
        <div className="mb-4">
          <label
            htmlFor="customerPhone"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
          >
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              <FiPhone />
            </div>
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              className={`pl-10 w-full p-2.5 border rounded-md ${
                errors.customerPhone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0912345678"
            />
          </div>
          {errors.customerPhone && (
            <p className="mt-1 text-sm text-red-500">{errors.customerPhone}</p>
          )}
        </div>

        {/* Địa chỉ */}
        <div className="mb-4">
          <label
            htmlFor="customerAddress"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
          >
            Địa chỉ giao hàng <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              <FiMapPin />
            </div>
            <input
              type="text"
              id="customerAddress"
              name="customerAddress"
              value={formData.customerAddress}
              onChange={handleChange}
              className={`pl-10 w-full p-2.5 border rounded-md ${
                errors.customerAddress ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            />
          </div>
          {errors.customerAddress && (
            <p className="mt-1 text-sm text-red-500">
              {errors.customerAddress}
            </p>
          )}
        </div>

        {/* Ghi chú */}
        <div className="mb-6">
          <label
            htmlFor="note"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
          >
            Ghi chú
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              <FiMessageSquare />
            </div>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className="pl-10 w-full p-2.5 border border-gray-300 rounded-md"
              placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn giao hàng chi tiết"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isCalculatingShipping || checkout.calculatingShipping}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isCalculatingShipping || checkout.calculatingShipping ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Đang xử lý...
            </span>
          ) : (
            "Tiếp tục đến phương thức thanh toán"
          )}
        </button>
      </form>
    </div>
  );
};

export default ShippingForm;
