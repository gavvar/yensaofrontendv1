import React from "react";
import { OrderStatus, PaymentStatus } from "@/types/order";
import { getOrderStatusInfo, getPaymentStatusInfo } from "@/utils/orderUtils";

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus;
  type: "order" | "payment";
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Component hiển thị trạng thái đơn hàng hoặc thanh toán dưới dạng badge
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type,
  className = "",
  size = "md",
}) => {
  // Lấy thông tin status tương ứng
  const statusInfo =
    type === "order"
      ? getOrderStatusInfo(status as OrderStatus)
      : getPaymentStatusInfo(status as PaymentStatus);

  // Map màu sắc từ statusInfo.color sang class Tailwind
  const colorClasses: Record<string, string> = {
    gray: "bg-gray-100 text-gray-800",
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    orange: "bg-orange-100 text-orange-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
  };

  // Lấy class màu tương ứng hoặc mặc định là gray
  const colorClass = colorClasses[statusInfo.color] || colorClasses.gray;

  // Xác định kích thước
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  // Kết hợp các class
  const badgeClasses = `inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClasses[size]} ${className}`;

  return <span className={badgeClasses}>{statusInfo.label}</span>;
};

/**
 * Component hiển thị trạng thái đơn hàng dưới dạng badge
 */
export const OrderStatusBadge: React.FC<{
  status: OrderStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}> = (props) => {
  return <StatusBadge type="order" {...props} />;
};

/**
 * Component hiển thị trạng thái thanh toán dưới dạng badge
 */
export const PaymentStatusBadge: React.FC<{
  status: PaymentStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}> = (props) => {
  return <StatusBadge type="payment" {...props} />;
};

export default OrderStatusBadge;
