import React from "react";
import { Order, PaymentMethod } from "@/types/order";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";
import OrderTimeline from "./OrderTimeline";
import OrderTrackingInfo from "./OrderTrackingInfo";
import {
  formatAmount,
  formatDateTime,
  formatPaymentMethod,
} from "@/utils/format";
import {
  FiPackage,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiFileText,
} from "react-icons/fi";

interface OrderDetailProps {
  order: Order;
  showTracking?: boolean;
  showTimeline?: boolean;
  className?: string;
}

/**
 * Component hiển thị chi tiết đơn hàng
 */
const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  showTracking = true,
  showTimeline = true,
  className = "",
}) => {
  return (
    <div
      className={`bg-white shadow-sm rounded-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FiPackage className="text-gray-900" />
              <h2 className="text-lg font-bold text-gray-800">
                Đơn hàng #{order.orderNumber}
              </h2>
            </div>
            <p className="text-sm text-gray-900 mt-1">
              Ngày đặt: {formatDateTime(order.orderDate, "long")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <OrderStatusBadge status={order.orderStatus} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </div>

      {/* Timeline nếu được yêu cầu */}
      {showTimeline && (
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <OrderTimeline order={order} />
        </div>
      )}

      {/* Tracking nếu được yêu cầu và đơn hàng đang giao */}
      {showTracking &&
        order.orderStatus === "shipped" &&
        order.trackingNumber && (
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <OrderTrackingInfo
              trackingNumber={order.trackingNumber}
              shippingProvider={order.shippingProvider}
              estimatedDeliveryDate={order.estimatedDeliveryDate}
            />
          </div>
        )}

      {/* Thông tin khách hàng và địa chỉ giao hàng */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          Thông tin khách hàng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-start">
              <FiUser className="mt-1 mr-2 text-gray-900" />
              <div>
                <p className="font-medium text-gray-800">
                  {order.customerName}
                </p>
                <div className="mt-1 space-y-1 text-sm text-gray-900">
                  {order.customerEmail && (
                    <div className="flex items-center">
                      <FiMail className="mr-2" />
                      <span>{order.customerEmail}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <FiPhone className="mr-2" />
                    <span>{order.customerPhone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-start">
              <FiMapPin className="mt-1 mr-2 text-gray-900" />
              <div>
                <p className="font-medium text-gray-800">Địa chỉ giao hàng</p>
                <p className="mt-1 text-sm text-gray-900">
                  {order.customerAddress}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thanh toán */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          Thông tin thanh toán
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-900">Phương thức thanh toán</p>
            <p className="font-medium text-gray-800">
              {formatPaymentMethod(order.paymentMethod as PaymentMethod)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-900">Trạng thái thanh toán</p>
            <div className="mt-1">
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* Sản phẩm */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Sản phẩm</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                >
                  Sản phẩm
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider"
                >
                  Số lượng
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider"
                >
                  Đơn giá
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider"
                >
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      {item.product?.image && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={item.product.image}
                            alt={item.productName}
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        {item.variantName && (
                          <div className="text-xs text-gray-900">
                            {item.variantName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-center text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-900">
                    {formatAmount(item.price, order.currency)}
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-900 font-medium">
                    {formatAmount(item.price * item.quantity, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              {/* Subtotal */}
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-2 text-sm text-right text-gray-900"
                >
                  Tạm tính:
                </td>
                <td className="px-4 py-2 text-sm text-right text-gray-900 font-medium">
                  {formatAmount(order.subtotal || 0, order.currency)}
                </td>
              </tr>

              {/* Shipping */}
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-2 text-sm text-right text-gray-900"
                >
                  Phí vận chuyển:
                </td>
                <td className="px-4 py-2 text-sm text-right text-gray-900 font-medium">
                  {formatAmount(order.shippingFee, order.currency)}
                </td>
              </tr>

              {/* Discount if applicable */}
              {order.discount > 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-sm text-right text-gray-900"
                  >
                    Giảm giá {order.couponCode && `(${order.couponCode})`}:
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-green-600 font-medium">
                    -{formatAmount(order.discount, order.currency)}
                  </td>
                </tr>
              )}

              {/* Tax if applicable */}
              {order.tax > 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-sm text-right text-gray-900"
                  >
                    Thuế:
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-gray-900 font-medium">
                    {formatAmount(order.tax, order.currency)}
                  </td>
                </tr>
              )}

              {/* Total */}
              <tr className="border-t border-gray-200">
                <td
                  colSpan={3}
                  className="px-4 py-3 text-sm text-right text-gray-800 font-bold"
                >
                  Tổng cộng:
                </td>
                <td className="px-4 py-3 text-base text-right text-gray-900 font-bold">
                  {formatAmount(order.totalAmount, order.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Ghi chú */}
      {order.note && (
        <div className="p-4 sm:p-6">
          <div className="flex items-start">
            <FiFileText className="mt-1 mr-2 text-gray-900" />
            <div>
              <p className="font-medium text-gray-800">Ghi chú đơn hàng</p>
              <p className="mt-1 text-sm text-gray-900">{order.note}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
