import React, { ReactElement } from "react";
import { Order, OrderStatus } from "@/types/order";
import { formatDateTime } from "@/utils/format";
import {
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiHome,
  FiXCircle,
} from "react-icons/fi";

// Mở rộng interface Order để bao gồm các trường về thời gian và lý do hủy
interface OrderWithTimelineDetails extends Order {
  processedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

interface OrderTimelineProps {
  order: OrderWithTimelineDetails;
  className?: string;
}

/**
 * Component hiển thị timeline trạng thái đơn hàng
 */
const OrderTimeline: React.FC<OrderTimelineProps> = ({
  order,
  className = "",
}) => {
  // Định nghĩa các trạng thái trong timeline
  const timelineSteps: {
    status: OrderStatus;
    label: string;
    date?: string;
    icon: ReactElement; // Thay đổi từ ReactNode sang ReactElement
    description: string;
  }[] = [
    {
      status: "pending",
      label: "Đơn hàng đã đặt",
      date: order.orderDate,
      icon: <FiPackage />,
      description: "Đơn hàng của bạn đã được tạo và đang chờ xác nhận",
    },
    {
      status: "processing",
      label: "Đã xác nhận",
      date: order.processedAt,
      icon: <FiCheckCircle />,
      description: "Đơn hàng đã được xác nhận và đang được chuẩn bị",
    },
    {
      status: "shipped",
      label: "Đang giao hàng",
      date: order.shippedAt,
      icon: <FiTruck />,
      description: "Đơn hàng đã được giao cho đơn vị vận chuyển",
    },
    {
      status: "delivered",
      label: "Đã giao hàng",
      date: order.deliveredAt,
      icon: <FiHome />,
      description: "Đơn hàng đã được giao thành công",
    },
  ];

  // Xác định trạng thái hiện tại của đơn hàng
  const currentStatus = order.orderStatus;

  // Xử lý trường hợp đơn hàng bị hủy
  const isOrderCancelled = currentStatus === "cancelled";

  // Helper function để render icon an toàn với kiểu dữ liệu
  const renderIcon = (icon: ReactElement, isCompleted: boolean) => {
    // Thêm type assertion cho props để giải quyết lỗi
    return React.cloneElement(icon, {
      className: `h-5 w-5 ${isCompleted ? "text-amber-600" : "text-gray-400"}`,
    } as React.SVGProps<SVGSVGElement>); // Xác định kiểu props chính xác
  };

  return (
    <div className={`${className}`}>
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        Trạng thái đơn hàng
      </h3>

      {isOrderCancelled ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
            <FiXCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-red-800">Đơn hàng đã bị hủy</p>
            {order.cancelledAt && (
              <p className="text-sm text-red-700 mt-1">
                Vào lúc: {formatDateTime(order.cancelledAt, "long")}
              </p>
            )}
            {order.cancelReason && (
              <p className="text-sm text-red-700 mt-1">
                Lý do: {order.cancelReason}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline */}
          <div className="ml-6 border-l-2 border-gray-200 pt-2 pb-1">
            {timelineSteps.map((step, index) => {
              // Kiểm tra xem bước này đã hoàn thành chưa
              const isCompleted =
                (currentStatus === "pending" && step.status === "pending") ||
                (currentStatus === "processing" &&
                  ["pending", "processing"].includes(step.status)) ||
                (currentStatus === "shipped" &&
                  ["pending", "processing", "shipped"].includes(step.status)) ||
                (currentStatus === "delivered" &&
                  ["pending", "processing", "shipped", "delivered"].includes(
                    step.status
                  ));

              // Trạng thái hiện tại
              const isCurrent = currentStatus === step.status;

              // Styles dựa trên trạng thái
              const stepColor = isCompleted
                ? "text-amber-600 border-amber-600 bg-amber-100"
                : "text-gray-400 border-gray-200 bg-gray-100";

              const textColor = isCompleted ? "text-gray-900" : "text-gray-500";

              const labelColor = isCurrent
                ? "font-semibold text-amber-700"
                : isCompleted
                ? "font-medium text-gray-900"
                : "font-medium text-gray-500";

              return (
                <div
                  key={step.status}
                  className={`relative pl-8 pr-4 py-3 ${
                    index < timelineSteps.length - 1 ? "mb-3" : ""
                  }`}
                >
                  {/* Circle indicator */}
                  <div
                    className={`absolute left-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${stepColor} flex items-center justify-center`}
                    style={{ top: "2rem" }}
                  >
                    {renderIcon(step.icon, isCompleted)}
                  </div>

                  {/* Content */}
                  <div className="ml-2">
                    <p className={`text-sm ${labelColor}`}>{step.label}</p>
                    {step.date ? (
                      <p className={`text-xs ${textColor} mt-1`}>
                        {formatDateTime(step.date, "long")}
                      </p>
                    ) : isCurrent ? (
                      <p className="text-xs text-amber-600 mt-1 flex items-center">
                        <FiClock className="mr-1" /> Đang chờ cập nhật
                      </p>
                    ) : null}
                    <p className={`text-xs ${textColor} mt-1`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
