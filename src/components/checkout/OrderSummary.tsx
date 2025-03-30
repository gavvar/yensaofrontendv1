import React, { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { formatCurrency } from "@/utils/format";
import Image from "next/image";
import { getProductImageUrl } from "@/utils/product";
//file nay dung de hien thi tong ket don hang
interface OrderSummaryProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * Component hiển thị tổng kết đơn hàng
 */
const OrderSummary: React.FC<OrderSummaryProps> = ({
  className = "",
  showDetails = true,
}) => {
  const { getSelectedItems, getSubtotal } = useCart();
  const { checkout } = useCheckout();

  // Lấy items được chọn để thanh toán
  const selectedItems = useMemo(() => {
    return getSelectedItems();
  }, [getSelectedItems]);

  // Tính tổng tiền sản phẩm đã chọn
  const subtotal = useMemo(() => {
    return getSubtotal();
  }, [getSubtotal]);

  // Tính tổng thanh toán
  const total = useMemo(() => {
    return subtotal + checkout.shippingFee - checkout.discount + checkout.tax;
  }, [subtotal, checkout.shippingFee, checkout.discount, checkout.tax]);

  if (selectedItems.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <h2 className="text-lg font-semibold mb-4">Tổng kết đơn hàng</h2>
        <p className="text-gray-500 text-center py-4">
          Không có sản phẩm nào được chọn để thanh toán
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h2 className="text-lg font-semibold mb-4">Tổng kết đơn hàng</h2>

      {/* Danh sách sản phẩm được chọn để thanh toán */}
      {showDetails && (
        <div className="mb-6">
          <h3 className="font-medium text-sm text-gray-600 mb-3">
            Sản phẩm ({selectedItems.length})
          </h3>

          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex items-start">
                <div className="w-16 h-16 relative flex-shrink-0 rounded overflow-hidden">
                  <Image
                    src={getProductImageUrl(item.product)}
                    alt={item.product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                    onError={(e) => {
                      // Fallback khi ảnh lỗi
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/product-placeholder.png";
                    }}
                  />
                </div>

                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium line-clamp-2">
                    {item.product.name}
                  </h4>

                  <div className="mt-1 flex justify-between text-sm text-gray-500">
                    <div>SL: {item.quantity}</div>
                    <div className="font-medium">
                      {formatCurrency(item.product.price * item.quantity)}
                    </div>
                  </div>

                  {item.notes && (
                    <div className="mt-1 text-xs text-gray-500 italic line-clamp-1">
                      Ghi chú: {item.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thông tin người nhận */}
      {checkout.shippingInfo.customerName && showDetails && (
        <div className="mb-6 pt-4 border-t border-gray-100">
          <h3 className="font-medium text-sm text-gray-600 mb-2">
            Thông tin người nhận
          </h3>

          <div className="text-sm">
            <p className="mb-1">
              <span className="font-medium">Họ tên:</span>{" "}
              {checkout.shippingInfo.customerName}
            </p>
            <p className="mb-1">
              <span className="font-medium">Số điện thoại:</span>{" "}
              {checkout.shippingInfo.customerPhone}
            </p>
            <p className="mb-1 line-clamp-2">
              <span className="font-medium">Địa chỉ:</span>{" "}
              {checkout.shippingInfo.customerAddress}
            </p>

            {checkout.shippingInfo.note && (
              <p className="mt-2 text-xs text-gray-500 italic">
                <span className="font-medium">Ghi chú:</span>{" "}
                {checkout.shippingInfo.note}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Phương thức thanh toán */}
      {checkout.selectedPaymentMethod && showDetails && (
        <div className="mb-6 pt-4 border-t border-gray-100">
          <h3 className="font-medium text-sm text-gray-600 mb-2">
            Phương thức thanh toán
          </h3>

          <div className="text-sm">
            <p>
              {checkout.selectedPaymentMethod === "COD"
                ? "Thanh toán khi nhận hàng (COD)"
                : checkout.selectedPaymentMethod === "VNPAY"
                ? "Thanh toán qua VNPAY"
                : checkout.selectedPaymentMethod === "MOMO"
                ? "Thanh toán qua Ví MoMo"
                : checkout.selectedPaymentMethod}
            </p>
          </div>
        </div>
      )}

      {/* Tổng tiền và chi phí */}
      <div
        className={`space-y-3 ${
          showDetails ? "pt-4 border-t border-gray-100" : ""
        }`}
      >
        <div className="flex justify-between">
          <span className="text-gray-600">Tạm tính:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Phí vận chuyển:</span>
          <span>
            {checkout.shippingFee > 0
              ? formatCurrency(checkout.shippingFee)
              : "Miễn phí"}
          </span>
        </div>

        {checkout.discount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Giảm giá:</span>
            <span className="text-green-600">
              -{formatCurrency(checkout.discount)}
            </span>
          </div>
        )}

        {checkout.tax > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Thuế:</span>
            <span>{formatCurrency(checkout.tax)}</span>
          </div>
        )}
      </div>

      {/* Tổng thanh toán */}
      <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="font-bold">Tổng thanh toán:</span>
        <span className="text-lg font-bold text-amber-600">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Thông báo */}
      <p className="mt-4 text-xs text-gray-500">
        Bằng cách đặt hàng, bạn đồng ý với các điều khoản và điều kiện của chúng
        tôi.
      </p>
    </div>
  );
};

export default OrderSummary;
