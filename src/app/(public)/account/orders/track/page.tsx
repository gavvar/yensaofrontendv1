"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  FiSearch,
  FiPackage,
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiArrowLeft,
} from "react-icons/fi";

import orderService from "@/services/orderService";
import { Order } from "@/types/order";
import { ShippingInfo } from "@/types/shipping";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Mở rộng interface Order để bao gồm các trường thời gian
interface OrderWithTimestamps extends Order {
  cancelledAt?: string;
  cancelReason?: string;
  processedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export default function OrderTrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get tracking number and order number from URL if available
  const trackingNumber = searchParams.get("trackingNumber");
  const orderNumber = searchParams.get("orderNumber");

  const [trackingInput, setTrackingInput] = useState(trackingNumber || "");
  const [orderNumberInput, setOrderNumberInput] = useState(orderNumber || "");
  const [phoneInput, setPhoneInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingResult, setTrackingResult] = useState<{
    order: OrderWithTimestamps | null;
    tracking: ShippingInfo | null;
  }>({
    order: null,
    tracking: null,
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous results
    setError("");
    setTrackingResult({ order: null, tracking: null });

    // Validate inputs
    if (!trackingInput && !orderNumberInput) {
      setError("Vui lòng nhập mã vận đơn hoặc mã đơn hàng");
      return;
    }

    if (orderNumberInput && !phoneInput) {
      setError("Vui lòng nhập số điện thoại đã dùng khi đặt hàng");
      return;
    }

    try {
      setIsLoading(true);

      let result;

      // Track by tracking number
      if (trackingInput) {
        result = await orderService.trackOrderByTrackingNumber(trackingInput);
        // Update URL with tracking number
        router.push(`/orders/track?trackingNumber=${trackingInput}`);
      }
      // Track by order number and phone
      else if (orderNumberInput && phoneInput) {
        result = await orderService.trackOrderByOrderNumberAndPhone(
          orderNumberInput,
          phoneInput
        );
        // Update URL with order number
        router.push(`/orders/track?orderNumber=${orderNumberInput}`);
      }

      if (result) {
        setTrackingResult(result);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error tracking order:", err);
      setError(
        "Không tìm thấy thông tin đơn hàng. Vui lòng kiểm tra lại thông tin nhập vào."
      );
      setIsLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateString;
    }
  };

  type OrderStatusKey =
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "unknown";

  const getCurrentStatus = (): OrderStatusKey => {
    if (!trackingResult.order) return "unknown";

    switch (trackingResult.order.orderStatus) {
      case "pending":
        return "pending";
      case "processing":
        return "processing";
      case "shipped":
        return "shipped";
      case "delivered":
        return "delivered";
      case "cancelled":
        return "cancelled";
      default:
        return "unknown";
    }
  };

  const statusIndex: Record<OrderStatusKey, number> = {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1,
    unknown: -1,
  };

  // Render tracking progress
  const renderTrackingProgress = () => {
    const status = getCurrentStatus();

    // Define steps
    const steps = [
      { key: "pending", icon: FiClock, label: "Đơn hàng đã đặt" },
      { key: "processing", icon: FiPackage, label: "Đang xử lý" },
      { key: "shipped", icon: FiTruck, label: "Đang giao hàng" },
      { key: "delivered", icon: FiCheckCircle, label: "Đã giao hàng" },
    ];

    const currentIndex = statusIndex[status];

    // If cancelled, show special message
    if (status === "cancelled") {
      return (
        <div className="bg-red-50 p-6 rounded-lg border border-red-100 text-center">
          <FiAlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-red-800">
            Đơn hàng đã bị hủy
          </h3>
          <p className="text-sm text-red-600 mt-1">
            Đơn hàng này đã bị hủy vào{" "}
            {trackingResult.order?.cancelledAt
              ? formatDate(trackingResult.order.cancelledAt)
              : "một thời điểm không xác định"}
            .
          </p>
          {trackingResult.order?.cancelReason && (
            <p className="text-sm text-red-600 mt-2">
              Lý do: {trackingResult.order.cancelReason}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="py-6">
        <div className="flex items-center justify-between w-full mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.key}>
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentIndex >= index
                      ? "bg-amber-600 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <p
                  className={`mt-2 text-xs text-center ${
                    currentIndex >= index
                      ? "text-amber-600 font-medium"
                      : "text-gray-900"
                  }`}
                >
                  {step.label}
                </p>
                {trackingResult.order?.orderStatus === step.key && (
                  <p className="text-xs text-amber-600 mt-1">
                    {step.key === "pending" && trackingResult.order.orderDate
                      ? formatDate(trackingResult.order.orderDate)
                      : step.key === "processing" &&
                        trackingResult.order.processedAt
                      ? formatDate(trackingResult.order.processedAt)
                      : step.key === "shipped" && trackingResult.order.shippedAt
                      ? formatDate(trackingResult.order.shippedAt)
                      : step.key === "delivered" &&
                        trackingResult.order.deliveredAt
                      ? formatDate(trackingResult.order.deliveredAt)
                      : ""}
                  </p>
                )}
              </div>

              {/* Connecting line (except after last step) */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 ${
                    currentIndex > index ? "bg-amber-600" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FiTruck className="mr-2" />
          Theo dõi đơn hàng
        </h1>

        {/* Tracking Form */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="font-medium">Nhập thông tin để theo dõi đơn hàng</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label
                htmlFor="trackingNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mã vận đơn
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPackage className="text-gray-900" />
                </div>
                <input
                  type="text"
                  id="trackingNumber"
                  name="trackingNumber"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Nhập mã vận đơn"
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="relative flex items-center my-8">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-900 text-sm">
                HOẶC
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label
                  htmlFor="orderNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mã đơn hàng
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-900" />
                  </div>
                  <input
                    type="text"
                    id="orderNumber"
                    name="orderNumber"
                    value={orderNumberInput}
                    onChange={(e) => setOrderNumberInput(e.target.value)}
                    placeholder="Nhập mã đơn hàng"
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Số điện thoại đặt hàng
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Số điện thoại đã dùng khi đặt hàng"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 p-3 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang tra cứu...
                  </>
                ) : (
                  <>
                    <FiSearch className="mr-2" />
                    Theo dõi đơn hàng
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tracking Results */}
        {trackingResult.order && (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b">
              <h2 className="font-medium flex items-center">
                <FiTruck className="mr-2 text-amber-600" />
                Thông tin vận chuyển
              </h2>
            </div>

            <div className="p-6">
              {/* Order basic info */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Mã đơn hàng
                    </h3>
                    <p className="text-lg font-semibold">
                      #{trackingResult.order.orderNumber}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-0">
                    <h3 className="text-sm font-medium text-gray-900">
                      Ngày đặt hàng
                    </h3>
                    <p className="text-base">
                      {formatDate(trackingResult.order.orderDate)}
                    </p>
                  </div>

                  {trackingResult.order.trackingNumber && (
                    <div className="mt-4 sm:mt-0">
                      <h3 className="text-sm font-medium text-gray-900">
                        Mã vận đơn
                      </h3>
                      <p className="text-base">
                        {trackingResult.order.trackingNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking progress */}
              {renderTrackingProgress()}

              {/* Estimated delivery date */}
              {trackingResult.order.orderStatus !== "cancelled" &&
                trackingResult.order.estimatedDeliveryDate && (
                  <div className="my-6 bg-amber-50 p-4 rounded-md border border-amber-100">
                    <h3 className="font-medium text-amber-800">
                      Ngày giao hàng dự kiến
                    </h3>
                    <p className="text-amber-700 mt-1">
                      {formatDate(trackingResult.order.estimatedDeliveryDate)}
                    </p>
                  </div>
                )}

              {/* Tracking events (if available) */}
              {trackingResult.tracking &&
                trackingResult.tracking.history &&
                trackingResult.tracking.history.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Lịch sử vận chuyển</h3>

                    <div className="flow-root">
                      <ul className="-mb-8">
                        {trackingResult.tracking.history.map((event, idx) => (
                          <li key={idx}>
                            <div className="relative pb-8">
                              {idx !==
                              (trackingResult.tracking?.history?.length ?? 0) -
                                1 ? (
                                <span
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                  aria-hidden="true"
                                />
                              ) : null}

                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center ring-8 ring-white">
                                    <FiPackage className="h-4 w-4 text-amber-600" />
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-gray-900">
                                      {event.status}
                                    </p>
                                    {event.description && (
                                      <p className="text-sm text-gray-900">
                                        {event.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-900">
                                    {event.location && <p>{event.location}</p>}
                                    <time dateTime={event.timestamp}>
                                      {formatDate(event.timestamp)}
                                    </time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

              {/* Customer info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium mb-4">Thông tin giao hàng</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Người nhận
                    </h4>
                    <p className="mt-1">{trackingResult.order.customerName}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Số điện thoại
                    </h4>
                    <p className="mt-1">{trackingResult.order.customerPhone}</p>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      Địa chỉ giao hàng
                    </h4>
                    <p className="mt-1">
                      {trackingResult.order.customerAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <p className="text-sm text-gray-900 mb-4 sm:mb-0">
                    Có vấn đề với đơn hàng? Vui lòng liên hệ với chúng tôi qua
                    số hotline 1900 1234.
                  </p>

                  {trackingResult.order.id && (
                    <Link
                      href={`/orders/${trackingResult.order.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700"
                    >
                      Xem chi tiết đơn hàng
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="flex justify-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-amber-600 hover:text-amber-800"
          >
            <FiArrowLeft className="mr-1" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
