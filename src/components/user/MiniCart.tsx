"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiX, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/authContext";
import { formatCurrency } from "@/utils/format";
import { getProductImageUrl } from "@/utils/product";
import { useTranslations } from "next-intl";

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const MiniCart: React.FC<MiniCartProps> = ({ isOpen, onClose }) => {
  const { cart, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  // Sử dụng hooks useTranslations cho các đoạn văn bản
  const t = useTranslations("common");
  const tc = useTranslations("cart");

  // Thêm state client-side để tránh lỗi hydration
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Không render gì cả nếu không mở
  if (!isOpen) return null;

  // Kiểm tra chắc chắn đang ở client side
  if (!isClient) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Mini cart panel */}
      <div className="absolute top-0 right-0 h-full w-80 sm:w-96 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
            <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
              <FiShoppingCart className="mr-2" />
              {t("cart")}
              {cart && (
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  ({cart.items?.length || 0} {tc("items")})
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FiShoppingCart
                  size={64}
                  className="text-gray-400 dark:text-gray-600 mb-4"
                />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {tc("loginToView")}
                </p>
                <Link
                  href="/login"
                  className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors"
                >
                  {tc("login")}
                </Link>
              </div>
            ) : !cart || !cart.items || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FiShoppingCart
                  size={64}
                  className="text-gray-400 dark:text-gray-600 mb-4"
                />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {tc("emptyCart")}
                </p>
                <Link
                  href="/products"
                  className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors"
                >
                  {tc("shopNow")}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex border-b dark:border-gray-800 pb-4"
                  >
                    <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={getProductImageUrl(item.product)}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/product-placeholder.png";
                        }}
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="text-sm font-medium line-clamp-2 hover:text-amber-600 dark:hover:text-amber-500 text-gray-900 dark:text-gray-100"
                      >
                        {item.product.name}
                      </Link>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.quantity} x{" "}
                        {formatCurrency(
                          item.product.discountPrice || item.product.price
                        )}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                          {tc("notes")}: {item.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors"
                      title={tc("removeFromCart")}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - chỉ hiển thị khi có sản phẩm */}
          {isAuthenticated && cart && cart.items && cart.items.length > 0 && (
            <div className="p-4 border-t dark:border-gray-800">
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {tc("total")}:
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-500">
                  {formatCurrency(cart.total)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link
                  href="/cart"
                  className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={onClose}
                >
                  {tc("viewCart")}
                </Link>
                <Link
                  href="/checkout"
                  className="bg-amber-600 text-white px-4 py-2 rounded text-center hover:bg-amber-700 transition-colors"
                  onClick={onClose}
                >
                  {tc("checkout")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniCart;
