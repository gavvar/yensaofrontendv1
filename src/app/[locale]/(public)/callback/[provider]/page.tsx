"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
import Link from "next/link";
import paymentService from "@/services/paymentService";
import { PaymentCallbackParams } from "@/types/payment";

export default function PaymentCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const provider = params.provider as string;

  const [status, setStatus] = useState<
    "success" | "pending" | "error" | "loading"
  >("loading");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Chuyển đổi searchParams thành object
        const paramsObject: PaymentCallbackParams = {};
        searchParams.forEach((value, key) => {
          paramsObject[key] = value;
        });

        setOrderId(paramsObject.orderId || null);

        // Gọi API xử lý callback từ cổng thanh toán
        const response = await paymentService.handleCallback(
          provider,
          paramsObject
        );

        if (response.success) {
          setStatus("success");
          setMessage(response.message || "Thanh toán thành công");
        } else if (response.status === "pending") {
          setStatus("pending");
          setMessage(response.message || "Thanh toán đang xử lý");
        } else {
          setStatus("error");
          setMessage(response.message || "Thanh toán thất bại");
        }
      } catch (error: unknown) {
        console.error("Lỗi xử lý callback:", error);
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Không thể xử lý thanh toán"
        );
      }
    };

    processCallback();
  }, [provider, searchParams]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100800 mb-2">
              Đang xử lý thanh toán
            </h2>
            <p className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              Vui lòng đợi trong giây lát...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <FiCheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100800 mb-2">
              Thanh toán thành công
            </h2>
            <p className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mb-6">
              {message}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href={`/checkout/complete?orderId=${orderId}`}
                className="flex items-center justify-center bg-amber-600 text-white px-6 py-2.5 rounded-md hover:bg-amber-700 transition-colors"
              >
                <FiArrowRight className="mr-2" />
                Xem chi tiết đơn hàng
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center border border-gray-300 text-gray-900 dark:text-gray-100700 px-6 py-2.5 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                Quay về trang chủ
              </Link>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="flex flex-col items-center">
            <FiClock className="w-16 h-16 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100800 mb-2">
              Thanh toán đang xử lý
            </h2>
            <p className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mb-6">
              {message}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href={`/checkout/complete?orderId=${orderId}`}
                className="flex items-center justify-center bg-amber-600 text-white px-6 py-2.5 rounded-md hover:bg-amber-700 transition-colors"
              >
                <FiArrowRight className="mr-2" />
                Xem chi tiết đơn hàng
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center border border-gray-300 text-gray-900 dark:text-gray-100700 px-6 py-2.5 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                Quay về trang chủ
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <FiAlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100800 mb-2">
              Thanh toán thất bại
            </h2>
            <p className="text-red-600 mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {orderId && (
                <Link
                  href={`/checkout/complete?orderId=${orderId}`}
                  className="flex items-center justify-center bg-amber-600 text-white px-6 py-2.5 rounded-md hover:bg-amber-700 transition-colors"
                >
                  <FiArrowRight className="mr-2" />
                  Xem chi tiết đơn hàng
                </Link>
              )}
              <Link
                href="/"
                className="flex items-center justify-center border border-gray-300 text-gray-900 dark:text-gray-100700 px-6 py-2.5 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                Quay về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
