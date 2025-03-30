"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiX, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/authContext"; // Thêm import này
import { formatCurrency } from "@/utils/format";
import { getProductImageUrl } from "@/utils/product";

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const MiniCart: React.FC<MiniCartProps> = ({ isOpen, onClose }) => {
  const { cart, removeItem } = useCart();
  const { isAuthenticated } = useAuth();

  // Thêm state client-side để tránh lỗi hydration
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Log dữ liệu giỏ hàng khi component mount
    console.log("MiniCart mounted, cart:", cart);
    console.log("MiniCart items:", cart?.items);
    console.log("isAuthenticated:", isAuthenticated);
  }, [cart, isAuthenticated]);

  // Log mỗi khi render để debug
  console.log("MiniCart rendering, isOpen:", isOpen);
  console.log("Current cart:", cart);
  console.log("Cart items:", cart?.items);

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
      <div className="absolute top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <FiShoppingCart className="mr-2" />
              Giỏ hàng
              {cart && (
                <span className="ml-2 text-sm text-gray-500">
                  ({cart.items?.length || 0} sản phẩm)
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FiShoppingCart size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">
                  Vui lòng đăng nhập để xem giỏ hàng của bạn
                </p>
                <Link
                  href="/login"
                  className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors"
                >
                  Đăng nhập
                </Link>
              </div>
            ) : !cart || !cart.items || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FiShoppingCart size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">
                  Giỏ hàng của bạn đang trống
                </p>
                <Link
                  href="/products"
                  className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors"
                >
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Thêm kiểm tra rõ ràng ở đây và log số lượng item */}
                {(() => {
                  console.log("Rendering items:", cart.items.length);
                  return null;
                })()}
                {cart.items.map((item) => (
                  <div key={item.id} className="flex border-b pb-4">
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
                        className="text-sm font-medium line-clamp-2 hover:text-amber-600"
                      >
                        {item.product.name}
                      </Link>
                      <div className="text-sm text-gray-500 mt-1">
                        {item.quantity} x{" "}
                        {formatCurrency(
                          item.product.discountPrice || item.product.price
                        )}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-gray-500 mt-1 italic">
                          Ghi chú: {item.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Xóa khỏi giỏ hàng"
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
            <div className="p-4 border-t">
              <div className="flex justify-between py-2">
                <span className="font-medium">Tổng tiền:</span>
                <span className="font-bold text-amber-600">
                  {formatCurrency(cart.total)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link
                  href="/cart"
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded text-center hover:bg-gray-200 transition-colors"
                  onClick={onClose}
                >
                  Xem giỏ hàng
                </Link>
                <Link
                  href="/checkout"
                  className="bg-amber-600 text-white px-4 py-2 rounded text-center hover:bg-amber-700 transition-colors"
                  onClick={onClose}
                >
                  Thanh toán
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
