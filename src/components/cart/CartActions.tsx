import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiShoppingBag, FiArrowRight, FiCheck } from "react-icons/fi";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/authContext";
import { toast } from "react-toastify";

interface CartActionsProps {
  className?: string;
  variant?: "default" | "checkout";
  redirectTo?: string;
  onAction?: () => void;
}

/**
 * Component hiển thị các nút thao tác giỏ hàng
 */
const CartActions: React.FC<CartActionsProps> = ({
  className = "",
  variant = "default",
  redirectTo = "/checkout",
  onAction,
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, getSelectedItems } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const selectedItems = getSelectedItems();
  const hasSelectedItems = selectedItems.length > 0;

  const handleAction = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      // Kiểm tra đăng nhập
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để tiếp tục thanh toán");
        router.push("/login?redirect=" + encodeURIComponent(redirectTo));
        return;
      }

      // Kiểm tra sản phẩm đã chọn
      if (!hasSelectedItems) {
        toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
        return;
      }

      // Gọi callback nếu được cung cấp
      if (onAction) {
        await onAction();
      } else {
        // Mặc định chuyển hướng đến trang thanh toán
        router.push(redirectTo);
      }
    } catch (error) {
      console.error("Error in cart action:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className={`flex flex-col ${className}`}>
        <Link
          href="/products"
          className="flex items-center justify-center w-full bg-amber-600 text-white p-3 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <FiShoppingBag className="mr-2" />
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  if (variant === "checkout") {
    // Phiên bản dành cho trang thanh toán
    return (
      <div className={`flex flex-col ${className}`}>
        <button
          onClick={handleAction}
          disabled={isLoading || !hasSelectedItems}
          className={`
            flex items-center justify-center w-full p-3 rounded-lg
            ${
              hasSelectedItems
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
            transition-colors
          `}
        >
          {isLoading ? (
            <span className="flex items-center">
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
              Đang xử lý...
            </span>
          ) : (
            <>
              <FiCheck className="mr-2" />
              Hoàn tất đơn hàng
            </>
          )}
        </button>
      </div>
    );
  }

  // Phiên bản mặc định
  return (
    <div className={`flex flex-col ${className}`}>
      <button
        onClick={handleAction}
        disabled={isLoading || !hasSelectedItems}
        className={`
          flex items-center justify-center w-full p-3 rounded-lg
          ${
            hasSelectedItems
              ? "bg-amber-600 text-white hover:bg-amber-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }
          transition-colors
        `}
      >
        {isLoading ? (
          <span className="flex items-center">
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
            Đang xử lý...
          </span>
        ) : (
          <>
            Tiến hành thanh toán
            <FiArrowRight className="ml-2" />
          </>
        )}
      </button>

      <Link
        href="/products"
        className="flex items-center justify-center mt-3 w-full border border-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <FiShoppingBag className="mr-2" />
        Tiếp tục mua sắm
      </Link>
    </div>
  );
};

export default CartActions;
