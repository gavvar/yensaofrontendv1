"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FiCheckCircle,
  FiArrowRight,
  FiPackage,
  FiCreditCard,
} from "react-icons/fi";
import { useCheckout } from "@/contexts/CheckoutContext";
import { formatCurrency } from "@/utils/format";
import orderService from "@/services/orderService";
import { Order, OrderItem } from "@/types/order";

// Thêm helper function với xử lý undefined/null
const calculateSubtotal = (items: OrderItem[]): number => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return sum + price * quantity;
  }, 0);
};

// Helper function để hiển thị phương thức thanh toán
const getPaymentMethodDisplay = (method: string | undefined): string => {
  if (!method) return "Không có thông tin";

  switch (method.toLowerCase()) {
    case "cod":
      return "Thanh toán khi nhận hàng (COD)";
    case "vnpay":
      return "Thanh toán qua VNPAY";
    case "momo":
      return "Thanh toán qua Ví MoMo";
    default:
      return method;
  }
};

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkout, resetCheckout } = useCheckout();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get order ID either from query params or checkout context
  const orderId = searchParams.get("orderId") || checkout.orderId;
  const orderNumber = searchParams.get("orderNumber") || checkout.orderNumber;

  useEffect(() => {
    // If no order ID is available, redirect to home
    if (!orderId && !orderNumber) {
      router.push("/");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        let orderData: Order;

        if (orderId) {
          orderData = await orderService.getOrderById(Number(orderId));
        } else if (orderNumber) {
          orderData = await orderService.getOrderByNumber(orderNumber);
        } else {
          throw new Error("No order identifier provided");
        }

        setOrder(orderData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchOrderDetails();

    // Reset checkout context on component unmount
    return () => {
      resetCheckout();
    };
  }, [orderId, orderNumber, router, resetCheckout]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-xl font-semibold mb-2">Đã xảy ra lỗi</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
            >
              Về trang chủ
            </Link>
            <Link
              href="/orders"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Xem đơn hàng của bạn
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">Không tìm thấy thông tin đơn hàng.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-8">
          <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Đặt hàng thành công!
          </h1>
          <p className="text-gray-600">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.
          </p>
        </div>

        {/* Order information */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
          <div className="border-b px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-lg font-semibold">
                  Đơn hàng #{order.orderNumber}
                </h2>
                <p className="text-sm text-gray-500">
                  Ngày đặt:{" "}
                  {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className="mt-2 sm:mt-0">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.orderStatus === "pending"
                      ? "bg-gray-100 text-gray-800"
                      : order.orderStatus === "processing"
                      ? "bg-blue-100 text-blue-800"
                      : order.orderStatus === "shipped"
                      ? "bg-amber-100 text-amber-800"
                      : order.orderStatus === "delivered"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.orderStatus === "pending"
                    ? "Chờ xác nhận"
                    : order.orderStatus === "processing"
                    ? "Đang xử lý"
                    : order.orderStatus === "shipped"
                    ? "Đang giao hàng"
                    : order.orderStatus === "delivered"
                    ? "Đã giao hàng"
                    : "Đã hủy"}
                </span>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="px-6 py-4">
            <h3 className="font-medium text-gray-900 mb-3">Tóm tắt đơn hàng</h3>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng sản phẩm:</span>
                <span>{order.items.length} sản phẩm</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span>
                  {formatCurrency(
                    order.subtotal || calculateSubtotal(order.items)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="text-green-600">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}

              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thuế:</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-medium pt-3 border-t">
                <span>Tổng thanh toán:</span>
                <span className="text-amber-600">
                  {formatCurrency(order.totalAmount || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Shipping info */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-medium text-gray-900 flex items-center">
                <FiPackage className="mr-2 text-amber-600" />
                Thông tin giao hàng
              </h3>
            </div>

            <div className="px-6 py-4">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-sm text-gray-600">{order.customerPhone}</p>
              <p className="text-sm text-gray-600 mt-2">
                {order.customerEmail}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {order.customerAddress}
              </p>

              {order.note && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500 italic">
                    <span className="font-medium">Ghi chú:</span> {order.note}
                  </p>
                </div>
              )}

              {order.trackingNumber && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm">
                    <span className="font-medium">Mã vận đơn:</span>{" "}
                    {order.trackingNumber}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-medium text-gray-900 flex items-center">
                <FiCreditCard className="mr-2 text-amber-600" />
                Thông tin thanh toán
              </h3>
            </div>

            <div className="px-6 py-4">
              <p className="font-medium">
                {getPaymentMethodDisplay(order.paymentMethod as string)}
              </p>

              <p className="text-sm text-gray-600 mt-2">
                Trạng thái thanh toán:
                <span
                  className={`ml-1 ${
                    (order.paymentStatus || "pending") === "paid"
                      ? "text-green-600"
                      : (order.paymentStatus || "pending") === "pending"
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {(order.paymentStatus || "pending") === "paid"
                    ? "Đã thanh toán"
                    : (order.paymentStatus || "pending") === "pending"
                    ? "Chờ thanh toán"
                    : (order.paymentStatus || "pending") === "failed"
                    ? "Thanh toán thất bại"
                    : "Đã hoàn tiền"}
                </span>
              </p>

              {order.couponCode && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm">
                    <span className="font-medium">Mã giảm giá:</span>{" "}
                    {order.couponCode}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order items preview (first few items) */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b">
            <h3 className="font-medium text-gray-900">Sản phẩm đã mua</h3>
          </div>

          <div className="divide-y">
            {(order.items || []).length > 0 ? (
              (order.items || []).slice(0, 3).map((item) => (
                <div
                  key={item.id || `item-${Math.random()}`}
                  className="px-6 py-4 flex items-start"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                    <Image
                      src={
                        item.productImage || "/images/product-placeholder.png"
                      }
                      alt={item.productName || "Sản phẩm"} // Thêm giá trị mặc định
                      fill
                      sizes="64px"
                      className="object-cover object-center"
                    />
                  </div>

                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h4 className="line-clamp-1">
                          {item.productName || "Sản phẩm không tên"}
                        </h4>
                        <p className="ml-4">
                          {formatCurrency((item.price || 0) * item.quantity)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.quantity} x {formatCurrency(item.price || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                Không có sản phẩm nào trong đơn hàng
              </div>
            )}

            {(order.items || []).length > 3 && (
              <div className="px-6 py-3 text-center text-sm">
                <p className="text-gray-500">
                  + {(order.items || []).length - 3} sản phẩm khác
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            href={`/orders/${order.id}`}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-amber-600 hover:bg-amber-700"
          >
            Xem chi tiết đơn hàng
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Tiếp tục mua sắm <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
