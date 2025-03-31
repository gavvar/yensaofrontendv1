import React, { useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { useCheckout } from "@/contexts/CheckoutContext";
import { formatCurrency } from "@/utils/format";

interface DiscountCodeProps {
  className?: string;
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ className = "" }) => {
  const { checkout, applyCoupon, removeCoupon } = useCheckout();
  const [couponCode, setCouponCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await applyCoupon(couponCode.trim());
    } catch (error) {
      console.error("Error applying coupon:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Đảm bảo discount là số hợp lệ
  const discountAmount =
    typeof checkout.discount === "number" && !isNaN(checkout.discount)
      ? checkout.discount
      : 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 sm:p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Mã giảm giá</h3>

      {checkout.couponApplied ? (
        <div className="bg-green-50 p-3 sm:p-4 rounded-md">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
            <div className="flex items-center w-full sm:w-auto">
              <FiCheck
                className="text-green-500 mr-2 flex-shrink-0"
                size={18}
              />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-green-700 truncate">
                  {checkout.couponCode}
                </div>
                <p className="text-sm text-green-600">
                  Đã áp dụng giảm {formatCurrency(discountAmount)}
                </p>
              </div>
            </div>

            <button
              onClick={removeCoupon}
              className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
              aria-label="Xóa mã giảm giá"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleApplyCoupon}>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Nhập mã giảm giá"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              className={`px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors whitespace-nowrap sm:flex-shrink-0 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Áp dụng"}
            </button>
          </div>
          {checkout.couponMessage && !checkout.couponApplied && (
            <p className="mt-2 text-red-600 text-sm">
              {checkout.couponMessage}
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default DiscountCode;
