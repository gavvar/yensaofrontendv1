"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";
import paymentService from "@/services/paymentService";
import { toast } from "react-toastify";

export default function PaymentProcessor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    orderId: number | null;
    orderNumber: string | null;
    status: "success" | "pending" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        setLoading(true);

        // Lấy các tham số từ URL
        const params: Record<string, string> = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        console.log("Processing payment return with params:", params);

        // Xử lý kết quả thanh toán
        const result = await paymentService.handlePaymentReturn({
          orderId: params.orderId,
          orderNumber: params.orderNumber,
          paymentId:
            params.paymentId || params.vnp_TransactionNo || params.transId,
          transactionId:
            params.transactionId || params.vnp_TransactionNo || params.transId,
          resultCode:
            params.resultCode || params.vnp_ResponseCode || params.errorCode,
          message: params.message || params.vnp_Message,
        });

        setPaymentResult(result);

        // Hiển thị thông báo dựa trên kết quả
        if (result.success) {
          toast.success(result.message || "Thanh toán thành công!");
        } else if (result.status === "pending") {
          toast.info(result.message || "Đang chờ xác nhận thanh toán");
        } else {
          toast.error(result.message || "Thanh toán thất bại");
        }
      } catch (error) {
        console.error("Error processing payment return:", error);
        setPaymentResult({
          success: false,
          orderId: null,
          orderNumber: null,
          status: "error",
          message:
            error instanceof Error ? error.message : "Lỗi không xác định",
        });
        toast.error("Có lỗi xảy ra khi xử lý kết quả thanh toán");
      } finally {
        setLoading(false);
      }
    };

    processPaymentReturn();
  }, [searchParams]);

  // Hàm để tạo URL xem chi tiết đơn hàng
  const getOrderDetailUrl = (orderId: number | null) => {
    if (!orderId) return "/account/orders";
    return `/account/orders/${orderId}`;
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-t-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              Đang xử lý thanh toán
            </h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
          </div>
        ) : paymentResult?.status === "success" ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <FiCheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600 mb-1">Cảm ơn bạn đã mua hàng.</p>
            {paymentResult.orderNumber && (
              <p className="text-gray-600 mb-4">
                Mã đơn hàng:{" "}
                <span className="font-semibold">
                  {paymentResult.orderNumber}
                </span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
              <Link
                href={getOrderDetailUrl(paymentResult.orderId)}
                className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors"
              >
                Xem chi tiết đơn hàng
              </Link>
              <Link
                href="/"
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        ) : paymentResult?.status === "pending" ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
              <FiClock className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Đang xử lý thanh toán
            </h2>
            <p className="text-gray-600 mb-1">
              Thanh toán của bạn đang được xử lý.
            </p>
            {paymentResult.orderNumber && (
              <p className="text-gray-600 mb-4">
                Mã đơn hàng:{" "}
                <span className="font-semibold">
                  {paymentResult.orderNumber}
                </span>
              </p>
            )}
            <p className="text-gray-500 italic mb-4">
              Chúng tôi sẽ thông báo khi xác nhận được thanh toán của bạn.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
              <Link
                href={getOrderDetailUrl(paymentResult.orderId)}
                className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors"
              >
                Kiểm tra trạng thái
              </Link>
              <Link
                href="/"
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <FiAlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Thanh toán thất bại
            </h2>
            <p className="text-gray-600 mb-4">
              {paymentResult?.message ||
                "Có lỗi xảy ra trong quá trình thanh toán"}
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
              <button
                onClick={() => router.back()}
                className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors flex items-center justify-center"
              >
                <FiArrowLeft className="mr-2" /> Quay lại
              </button>
              <Link
                href="/"
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
