"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/authContext";
import orderService from "@/services/orderService";
import { Order } from "@/types/order";
import OrderDetail from "@/components/order/OrderDetail";
import { FiArrowLeft, FiAlertTriangle, FiShoppingBag } from "react-icons/fi";
import CancelOrderModal from "@/components/order/CancelOrderModal";
import { canCancelOrder } from "@/utils/orderUtils";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

// Định nghĩa kiểu cho lỗi
interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = params;
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth(); // Đổi tên từ authLoading thành loading và sử dụng alias

  // States
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      // Wait for auth state to be determined
      if (authLoading) return;

      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để xem chi tiết đơn hàng");
        router.push(`/login?redirect=/account/orders/${id}`);
        return;
      }

      // Fetch order details
      try {
        setLoading(true);
        setError("");

        // Validate order ID
        const orderId = parseInt(id);
        if (isNaN(orderId)) {
          setError("Mã đơn hàng không hợp lệ");
          setLoading(false);
          return;
        }

        const data = await orderService.getOrderById(orderId);
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
  }, [id, isAuthenticated, authLoading, router]);

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

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/account/orders" // Thêm /account/
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
          <p className="mt-1 text-sm text-gray-900">
            Xem thông tin chi tiết và trạng thái đơn hàng
          </p>
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
            onClick={() => router.push("/account/orders")} // Thêm /account/
            className="mt-2 bg-white text-red-600 px-4 py-2 rounded border border-red-300 hover:bg-red-50"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      ) : !order ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <FiShoppingBag className="h-16 w-16 text-gray-900" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-900 mb-6">
            Đơn hàng này không tồn tại hoặc bạn không có quyền xem.
          </p>
          <button
            onClick={() => router.push("/account/orders")} // Thêm /account/
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      ) : (
        <OrderDetail order={order} showTimeline showTracking />
      )}

      {/* Order repurchase */}
      {order && order.orderStatus !== "cancelled" && (
        <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-base font-medium text-amber-800">
                Bạn muốn mua lại sản phẩm này?
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Bạn có thể dễ dàng đặt lại đơn hàng này chỉ với một nút bấm.
              </p>
            </div>
            <button
              onClick={() => {
                // Implement repurchase functionality
                toast.info("Tính năng đang được phát triển");
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Mua lại đơn hàng
            </button>
          </div>
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
