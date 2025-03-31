"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import paymentService from "@/services/paymentService";
import { toast } from "react-toastify";

export default function PaymentProcessor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "pending" | "error" | null>(
    null
  );

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);

        // Lấy thông tin từ URL
        const orderId = searchParams.get("orderId");
        const paymentId = searchParams.get("paymentId");
        const paymentMethod = searchParams.get("method");
        const transactionId = searchParams.get("transactionId");

        if (!orderId || !paymentId || !paymentMethod) {
          throw new Error("Thiếu thông tin thanh toán");
        }

        // Gọi API verify payment với endpoint mới
        const result = await paymentService.verifyPayment({
          orderId: parseInt(orderId),
          paymentId,
          paymentMethod,
          // Chỉ gửi transactionId nếu không phải null
          ...(transactionId && { transactionId }),
        });

        if (result.success) {
          setStatus("success");
          toast.success("Thanh toán thành công!");
          // Chờ một chút rồi chuyển hướng về trang xác nhận đơn hàng
          setTimeout(() => {
            router.push(`/order-confirmation/${orderId}`);
          }, 2000);
        } else if (result.paymentStatus === "pending") {
          setStatus("pending");
          toast.info("Thanh toán đang được xử lý");
        } else {
          setStatus("error");
          toast.error(result.message || "Lỗi thanh toán");
        }
      } catch (error) {
        console.error("Lỗi xác minh thanh toán:", error);
        setStatus("error");

        // Xử lý thông báo lỗi một cách an toàn
        let errorMessage = "Không thể xác minh thanh toán";
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Đang xác thực thanh toán...</h2>
          <p className="text-gray-900 mt-2">Vui lòng không đóng trang này</p>
        </div>
      ) : status === "success" ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600">
            Thanh toán thành công!
          </h2>
          <p className="mt-2">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
          </p>
          <button
            onClick={() => router.push("/user/orders")}
            className="mt-6 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
          >
            Xem đơn hàng
          </button>
        </div>
      ) : status === "pending" ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-amber-600">
            Thanh toán đang xử lý
          </h2>
          <p className="mt-2">
            Thanh toán của bạn đang được xử lý. Chúng tôi sẽ thông báo khi hoàn
            tất.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
          >
            Quay lại trang chủ
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600">
            Thanh toán thất bại
          </h2>
          <p className="mt-2">
            Rất tiếc, thanh toán của bạn không thành công. Vui lòng thử lại.
          </p>
          <div className="mt-6 space-x-4">
            <button
              onClick={() => router.push("/checkout")}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
            >
              Thử lại
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
