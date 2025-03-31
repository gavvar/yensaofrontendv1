import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { FiExternalLink, FiShoppingBag, FiPackage } from "react-icons/fi";
import { OrderSummary, OrderStatus, PaymentStatus } from "@/types/order";
import { formatCurrency } from "@/utils/format";

interface OrderItemProps {
  order: OrderSummary;
  className?: string;
}

/**
 * Component hiển thị một đơn hàng trong danh sách
 */
const OrderItem: React.FC<OrderItemProps> = ({ order, className = "" }) => {
  // Helper function to get status color
  const getOrderStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-amber-100 text-amber-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get payment status color
  const getPaymentStatusColor = (status: PaymentStatus): string => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format order date
  const formattedDate = order.orderDate
    ? format(new Date(order.orderDate), "dd/MM/yyyy HH:mm", { locale: vi })
    : "Không xác định";

  // Get human-readable order status
  const getOrderStatusText = (status: OrderStatus): string => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  // Get human-readable payment status
  const getPaymentStatusText = (status: PaymentStatus): string => {
    switch (status) {
      case "pending":
        return "Chờ thanh toán";
      case "paid":
        return "Đã thanh toán";
      case "failed":
        return "Thanh toán thất bại";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return "Không xác định";
    }
  };

  // Check if order is cancelable
  const isOrderCancelable = (): boolean => {
    return ["pending", "processing"].includes(order.orderStatus);
  };

  return (
    <div
      className={`bg-white shadow-sm rounded-lg overflow-hidden ${className}`}
    >
      <div className="p-4 sm:p-6">
        {/* Header: Order number & date */}
        <div className="flex flex-col sm:flex-row justify-between mb-4">
          <div>
            <h3 className="font-medium flex items-center">
              <FiShoppingBag className="mr-2 text-amber-600" />
              <span>Đơn hàng #{order.orderNumber}</span>
            </h3>
            <p className="text-sm text-gray-900 mt-1">{formattedDate}</p>
          </div>

          <div className="mt-2 sm:mt-0 flex items-center space-x-2">
            {/* Order status badge */}
            <span
              className={`text-xs px-2 py-1 rounded-full ${getOrderStatusColor(
                order.orderStatus
              )}`}
            >
              {getOrderStatusText(order.orderStatus)}
            </span>

            {/* Payment status badge */}
            <span
              className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(
                order.paymentStatus
              )}`}
            >
              {getPaymentStatusText(order.paymentStatus)}
            </span>
          </div>
        </div>

        {/* Order summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2">
          <div className="mb-3 sm:mb-0">
            <div className="text-sm flex items-center">
              <FiPackage className="mr-2 text-gray-900" />
              <span>{order.itemCount} sản phẩm</span>
            </div>
            <h4 className="font-bold text-amber-600 mt-1">
              {formatCurrency(order.totalAmount)}
            </h4>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            {/* View order details button */}
            <Link
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiExternalLink className="mr-1" />
              Xem chi tiết
            </Link>

            {/* Cancel order button - only shown for cancelable orders */}
            {isOrderCancelable() && (
              <Link
                href={`/orders/${order.id}/cancel`}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Hủy đơn hàng
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
