import React from "react";
import { OrderSummary } from "@/types/order";
import { formatOrderDate, formatOrderAmount } from "@/utils/orderUtils";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";
import Link from "next/link";
import {
  FiChevronRight,
  FiPackage,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi";

interface OrderCardProps {
  order: OrderSummary;
  isLink?: boolean;
  className?: string;
}

/**
 * Card hiển thị thông tin đơn hàng trong danh sách
 */
const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isLink = true,
  className = "",
}) => {
  const cardContent = (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:border-gray-300 transition ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FiPackage className="text-gray-500" />
          <span className="text-sm font-medium text-gray-800">
            {order.orderNumber}
          </span>
        </div>
        <OrderStatusBadge status={order.orderStatus} size="sm" />
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {/* Order date */}
        <div className="flex items-center mb-2 text-sm text-gray-600">
          <FiCalendar className="mr-2" />
          <span>{formatOrderDate(order.orderDate, "short")}</span>
        </div>

        {/* Order total and items count */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-sm text-gray-600">
            <FiDollarSign className="mr-2" />
            <span className="font-medium text-gray-800">
              {formatOrderAmount(order.totalAmount, order.currency || "VND")}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {order.itemCount || "?"} sản phẩm
          </span>
        </div>

        {/* Payment status */}
        <div className="mt-3 flex justify-between items-center">
          <PaymentStatusBadge status={order.paymentStatus} size="sm" />

          {isLink && (
            <div className="flex items-center text-sm text-amber-600 font-medium">
              <span>Chi tiết</span>
              <FiChevronRight className="ml-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLink) {
    return (
      <Link href={`/orders/${order.id}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default OrderCard;
