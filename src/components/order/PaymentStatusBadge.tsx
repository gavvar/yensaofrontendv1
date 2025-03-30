import React from "react";
import { PaymentStatus } from "@/types/order";

type BadgeSize = "sm" | "md" | "lg";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: BadgeSize;
  className?: string;
}

const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusText = (status: PaymentStatus): string => {
  switch (status) {
    case "paid":
      return "Đã thanh toán";
    case "pending":
      return "Chờ thanh toán";
    case "failed":
      return "Thanh toán thất bại";
    case "refunded":
      return "Đã hoàn tiền";
    default:
      return status;
  }
};

const getSizeClasses = (size: BadgeSize): string => {
  switch (size) {
    case "sm":
      return "text-xs px-2 py-0.5";
    case "md":
      return "text-sm px-2.5 py-0.5";
    case "lg":
      return "text-sm px-3 py-1";
    default:
      return "text-xs px-2 py-0.5";
  }
};

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  size = "md",
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${getPaymentStatusColor(
        status
      )} ${getSizeClasses(size)} ${className}`}
    >
      {getPaymentStatusText(status)}
    </span>
  );
};

export default PaymentStatusBadge;
