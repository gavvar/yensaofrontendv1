import React, { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/utils/format";

interface CartSummaryProps {
  showCheckoutItems?: boolean;
  className?: string;
}

/**
 * Component hiển thị tổng tiền giỏ hàng
 */
const CartSummary: React.FC<CartSummaryProps> = ({
  showCheckoutItems = false,
  className = "",
}) => {
  const { cart, getSelectedItems, getSubtotal, getTotalAmount } = useCart();

  // Lấy items được chọn để thanh toán
  const selectedItems = useMemo(() => {
    return getSelectedItems();
  }, [getSelectedItems]);

  // Tính tổng tiền sản phẩm đã chọn
  const subtotal = useMemo(() => {
    return getSubtotal();
  }, [getSubtotal]);

  // Tổng số sản phẩm được chọn
  const totalSelectedQuantity = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedItems]);

  // Số lượng loại sản phẩm được chọn
  const totalSelectedItems = useMemo(() => {
    return selectedItems.length;
  }, [selectedItems]);

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <p className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 text-center">
          Giỏ hàng của bạn đang trống
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <h2 className="text-lg font-medium mb-4">Tổng giỏ hàng</h2>

      {/* Hiển thị thông tin số lượng sản phẩm */}
      <div className="flex justify-between mb-2">
        <span className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
          {showCheckoutItems
            ? `Sản phẩm thanh toán (${totalSelectedItems})`
            : `Tổng sản phẩm (${cart.items.length})`}
        </span>
        <span className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
          {showCheckoutItems
            ? totalSelectedQuantity
            : cart.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
          sản phẩm
        </span>
      </div>

      {/* Hiển thị danh sách sản phẩm thanh toán nếu cần */}
      {showCheckoutItems && selectedItems.length > 0 && (
        <div className="border-t border-b py-3 my-3">
          {selectedItems.map((item) => (
            <div key={item.id} className="flex justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-gray-100700 line-clamp-1">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  SL: {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tổng tiền sản phẩm */}
      <div className="flex justify-between mb-2">
        <span className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
          Tạm tính
        </span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>

      {/* Có thể thêm phần giảm giá và phí vận chuyển ở đây */}

      {/* Tổng thanh toán */}
      <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-base font-medium">Tổng cộng</span>
        <span className="text-lg font-bold text-amber-600">
          {formatCurrency(getTotalAmount())}
        </span>
      </div>

      {/* Thông báo mô tả */}
      <p className="text-xs text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mt-4">
        Đã bao gồm thuế VAT (nếu có). Phí vận chuyển sẽ được tính ở trang thanh
        toán.
      </p>
    </div>
  );
};

export default CartSummary;
