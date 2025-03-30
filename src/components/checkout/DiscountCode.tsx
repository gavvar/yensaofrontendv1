import React, { useState } from "react";
import { useCheckout } from "@/contexts/CheckoutContext";
import { FiTag, FiX, FiCheck } from "react-icons/fi";
import { formatCurrency } from "@/utils/format";
//file nay dung de nhap ma giam gia va ap dung ma giam gia
interface DiscountCodeProps {
  className?: string;
}

/**
 * Component nhập và áp dụng mã giảm giá
 */
const DiscountCode: React.FC<DiscountCodeProps> = ({ className = "" }) => {
  const { checkout, applyCoupon, removeCoupon } = useCheckout();
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Xử lý khi nhập mã
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
    if (error) setError("");
  };

  // Xử lý áp dụng mã giảm giá
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      setError("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const success = await applyCoupon(couponCode.trim());

      if (success) {
        setCouponCode("");
      }
    } catch (err) {
      console.error("Error applying coupon:", err);
      setError("Có lỗi xảy ra khi áp dụng mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa mã giảm giá
  const handleRemoveCoupon = () => {
    removeCoupon();
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h2 className="text-base font-semibold mb-4">Mã giảm giá</h2>

      {checkout.couponApplied ? (
        <div className="bg-green-50 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiCheck className="text-green-500 mr-2" size={18} />
              <div>
                <p className="font-medium text-gray-800">
                  {checkout.couponCode}
                </p>
                <p className="text-sm text-green-600">
                  Đã áp dụng giảm {formatCurrency(checkout.discount)}
                </p>
              </div>
            </div>

            <button
              onClick={handleRemoveCoupon}
              className="text-gray-500 hover:text-red-500 p-1"
              aria-label="Xóa mã giảm giá"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleApplyCoupon} className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <FiTag />
            </div>

            <input
              type="text"
              value={couponCode}
              onChange={handleChange}
              placeholder="Nhập mã giảm giá"
              className={`pl-10 w-full p-2.5 border rounded-md ${
                error ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {checkout.couponMessage && !error && !checkout.couponApplied && (
            <p className="text-sm text-red-500">{checkout.couponMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
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
                Đang áp dụng...
              </span>
            ) : (
              "Áp dụng"
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default DiscountCode;
