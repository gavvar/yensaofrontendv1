"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/authContext";
import orderService from "@/services/orderService";
import { Order, OrderStatus } from "@/types/order";
import {
  FiArrowLeft,
  FiAlertTriangle,
  FiShoppingBag,
  FiCheck,
  FiFile,
  FiClock,
  FiTruck,
} from "react-icons/fi";
import CancelOrderModal from "@/components/order/CancelOrderModal";
import { canCancelOrder } from "@/utils/order"; // Sử dụng trực tiếp các utility functions
import { formatCurrency, formatDate } from "@/utils/format";

// Định nghĩa kiểu cho props của client component
interface OrderDetailClientProps {
  id: string;
  locale: string;
}

// Định nghĩa kiểu cho lỗi API
interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function OrderDetailClient({
  id,
  locale,
}: OrderDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // States
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Tạo mảng các trạng thái đơn hàng để hiển thị timeline
  const orderStatusSteps: {
    status: OrderStatus;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      status: "pending",
      label: "Chờ xác nhận",
      icon: <FiFile className="h-5 w-5" />,
    },
    {
      status: "processing",
      label: "Đang xử lý",
      icon: <FiClock className="h-5 w-5" />,
    },
    {
      status: "shipped",
      label: "Đang giao hàng",
      icon: <FiTruck className="h-5 w-5" />,
    },
    {
      status: "delivered",
      label: "Đã giao hàng",
      icon: <FiCheck className="h-5 w-5" />,
    },
  ];

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      // Wait for auth state to be determined
      if (authLoading) return;

      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để xem chi tiết đơn hàng");
        router.push(
          `/${locale}/login?redirect=/${locale}/account/orders/${id}`
        );
        return;
      }

      // Fetch order details
      try {
        setLoading(true);
        setError("");

        // Validate order ID
        const orderIdNum = parseInt(id);
        if (isNaN(orderIdNum)) {
          setError("Mã đơn hàng không hợp lệ");
          setLoading(false);
          return;
        }

        const data = await orderService.getOrderById(orderIdNum);
        setOrder(data);
      } catch (err: unknown) {
        console.error("Failed to fetch order details:", err);
        const apiError = err as ApiError;
        setError(
          apiError.message ||
            apiError.response?.data?.message ||
            "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, isAuthenticated, authLoading, router, locale]);

  // Handle order cancellation
  const handleCancelOrder = async (reason: string) => {
    if (!order) return;

    try {
      setCancelling(true);
      await orderService.cancelOrder(order.id, reason);
      toast.success("Đơn hàng đã được hủy thành công");

      // Refresh order data
      const updatedOrder = await orderService.getOrderById(order.id);
      setOrder(updatedOrder);

      // Close modal
      setCancelModalOpen(false);
    } catch (err: unknown) {
      console.error("Failed to cancel order:", err);
      const apiError = err as ApiError;
      toast.error(
        apiError.message ||
          apiError.response?.data?.message ||
          "Không thể hủy đơn hàng. Vui lòng thử lại sau."
      );
    } finally {
      setCancelling(false);
    }
  };

  // Check if order can be cancelled
  const orderCanBeCancelled = order ? canCancelOrder(order) : false;

  // Get status step index for timeline
  const getCurrentStatusIndex = (status: OrderStatus): number => {
    if (status === "cancelled") return -1;
    return orderStatusSteps.findIndex((step) => step.status === status);
  };

  // Hàm để lấy class cho timeline item
  const getTimelineItemClass = (index: number, currentStatus: OrderStatus) => {
    const currentIndex = getCurrentStatusIndex(currentStatus);

    if (currentStatus === "cancelled") {
      return "text-red-500";
    }

    if (index < currentIndex) {
      return "text-green-500"; // completed step
    } else if (index === currentIndex) {
      return "text-blue-500"; // current step
    } else {
      return "text-gray-400"; // future step
    }
  };

  // Render order timeline
  const renderOrderTimeline = () => {
    if (!order) return null;

    const currentIndex = getCurrentStatusIndex(order.orderStatus);

    return (
      <div className="mb-8">
        <h3 className="font-medium text-lg mb-4">Trạng thái đơn hàng</h3>

        {order.orderStatus === "cancelled" ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <FiAlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <h4 className="font-medium text-red-700">Đơn hàng đã bị hủy</h4>
            <p className="text-sm text-red-600 mt-1">
              {order.cancellationReason || "Không có lý do được cung cấp"}
            </p>
            <p className="text-xs text-red-500 mt-2">
              Thời gian hủy: {formatDate(order.updatedAt)}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Timeline steps */}
            <div className="space-y-8">
              {orderStatusSteps.map((step, index) => (
                <div key={step.status} className="flex items-start relative">
                  <div
                    className={`flex items-center justify-center h-14 w-14 rounded-full border-2 ${
                      index <= currentIndex
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <span
                      className={`${getTimelineItemClass(
                        index,
                        order.orderStatus
                      )}`}
                    >
                      {step.icon}
                    </span>
                  </div>

                  <div className="ml-4">
                    <p
                      className={`font-medium ${getTimelineItemClass(
                        index,
                        order.orderStatus
                      )}`}
                    >
                      {step.label}
                    </p>

                    {index <= currentIndex && (
                      <p className="text-sm text-gray-500">
                        {index === currentIndex
                          ? `Cập nhật lần cuối: ${formatDate(order.updatedAt)}`
                          : formatDate(order.updatedAt)}
                      </p>
                    )}

                    {index < currentIndex && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                        <FiCheck className="mr-1" /> Hoàn thành
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render order items
  const renderOrderItems = () => {
    if (!order) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium">Chi tiết sản phẩm</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {order.orderItems.map((item) => (
            <div key={item.id} className="p-4 flex items-center">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <Image
                  src={`/api/images/${
                    item.product?.thumbnail || "placeholder.jpg"
                  }`}
                  alt={item.product?.name || "Sản phẩm"}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/placeholder.jpg";
                  }}
                />
              </div>

              <div className="ml-4 flex-1">
                <h4 className="font-medium text-gray-900">
                  {item.product?.name || "Sản phẩm không còn tồn tại"}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {item.quantity} x {formatCurrency(item.price)}
                </p>
              </div>

              <div className="font-medium">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render order summary
  const renderOrderSummary = () => {
    if (!order) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium">Tóm tắt đơn hàng</h3>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Tạm tính:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Phí vận chuyển:</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 flex justify-between font-medium">
              <span>Tổng cộng:</span>
              <span className="text-lg text-amber-600">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render shipping info
  const renderShippingInfo = () => {
    if (!order) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium">Thông tin giao hàng</h3>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Người nhận</p>
              <p className="font-medium">{order.shippingAddress.fullName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Số điện thoại</p>
              <p className="font-medium">{order.shippingAddress.phone}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Địa chỉ</p>
              <p className="font-medium">
                {order.shippingAddress.address}, {order.shippingAddress.ward},{" "}
                {order.shippingAddress.district},{" "}
                {order.shippingAddress.province}
              </p>
            </div>

            {order.shippingAddress.note && (
              <div>
                <p className="text-sm text-gray-500">Ghi chú</p>
                <p>{order.shippingAddress.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render payment info
  const renderPaymentInfo = () => {
    if (!order) return null;

    const paymentMethodLabels: Record<string, string> = {
      COD: "Thanh toán khi nhận hàng",
      VNPAY: "Thanh toán qua VNPAY",
      MOMO: "Thanh toán qua Ví MoMo",
      BANK_TRANSFER: "Chuyển khoản ngân hàng",
    };

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium">Thông tin thanh toán</h3>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Phương thức thanh toán</p>
              <p className="font-medium">
                {paymentMethodLabels[order.paymentMethod] ||
                  order.paymentMethod}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
              <p
                className={`font-medium ${
                  order.paymentStatus === "paid"
                    ? "text-green-600"
                    : order.paymentStatus === "pending"
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {order.paymentStatus === "paid"
                  ? "Đã thanh toán"
                  : order.paymentStatus === "pending"
                  ? "Chờ thanh toán"
                  : "Chưa thanh toán"}
              </p>
            </div>

            {order.paymentStatus === "paid" && order.paidAt && (
              <div>
                <p className="text-sm text-gray-500">Thời gian thanh toán</p>
                <p className="font-medium">{formatDate(order.paidAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href={`/${locale}/account/orders`}
          className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-800"
        >
          <FiArrowLeft className="mr-1" />
          Quay lại danh sách đơn hàng
        </Link>
      </div>

      {/* Page header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết đơn hàng
          </h1>
          {order && (
            <p className="mt-1 text-sm text-gray-500">
              Mã đơn hàng:{" "}
              <span className="font-medium">{order.orderNumber}</span> | Ngày
              đặt:{" "}
              <span className="font-medium">{formatDate(order.createdAt)}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        {order && orderCanBeCancelled && (
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FiAlertTriangle className="mr-2 -ml-1 h-5 w-5" />
              Hủy đơn hàng
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          <p className="font-medium">Đã xảy ra lỗi</p>
          <p>{error}</p>
          <button
            onClick={() => router.push(`/${locale}/account/orders`)}
            className="mt-2 bg-white text-red-600 px-4 py-2 rounded border border-red-300 hover:bg-red-50"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      ) : !order ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <FiShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-500 mb-6">
            Đơn hàng này không tồn tại hoặc bạn không có quyền xem.
          </p>
          <button
            onClick={() => router.push(`/${locale}/account/orders`)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {renderOrderTimeline()}
            {renderOrderItems()}
          </div>

          <div className="space-y-6">
            {renderOrderSummary()}
            {renderShippingInfo()}
            {renderPaymentInfo()}
          </div>
        </div>
      )}

      {/* Order repurchase */}
      {order && order.orderStatus !== "cancelled" && (
        <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h3 className="font-medium mb-2">Bạn muốn đặt lại đơn hàng này?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Bạn có thể dễ dàng đặt lại toàn bộ đơn hàng với một vài bước đơn
            giản.
          </p>
          <button
            onClick={() => {
              // Implement reorder functionality
              toast.info("Tính năng đặt lại đơn hàng đang được phát triển");
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Đặt lại đơn hàng
          </button>
        </div>
      )}

      {/* Cancel Order Modal */}
      {order && (
        <CancelOrderModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={handleCancelOrder}
          isLoading={cancelling}
          orderNumber={order.orderNumber}
        />
      )}
    </div>
  );
}
