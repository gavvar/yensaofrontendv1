"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import paymentService from "@/services/paymentService";
import orderService from "@/services/orderService";
import { FiLoader } from "react-icons/fi";
import { Order } from "@/types/order"; // Loại bỏ import PaymentMethod

// Tạo component loading nội bộ
const LoadingSpinner = ({ size = "large" }: { size?: string }) => {
  const sizeClass =
    size === "large" ? "h-12 w-12" : size === "small" ? "h-4 w-4" : "h-8 w-8";

  return (
    <div className="flex justify-center">
      <FiLoader className={`${sizeClass} animate-spin text-amber-600`} />
    </div>
  );
};

export default function CheckoutCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setVerifying(true);

        // Lấy thông tin từ localStorage
        const orderId = localStorage.getItem("currentOrderId");

        if (!orderId) {
          // Kiểm tra nếu có orderId trong URL (trường hợp COD)
          const urlOrderId = searchParams.get("orderId");
          if (urlOrderId) {
            const order = await orderService.getOrderById(Number(urlOrderId));
            setOrderDetails(order);
            setVerified(true);
            setVerifying(false);
            return;
          }

          throw new Error("Thông tin thanh toán không hợp lệ");
        }

        // Kiểm tra trạng thái thanh toán
        const paymentStatusResponse = await paymentService.processPaymentStatus(
          Number(orderId)
        );

        if (
          paymentStatusResponse.success &&
          (paymentStatusResponse.data.paymentStatus === "paid" ||
            paymentStatusResponse.data.status === "success")
        ) {
          // Lấy thông tin đơn hàng
          const order = await orderService.getOrderById(Number(orderId));
          setOrderDetails(order);
          setVerified(true);
          toast.success("Thanh toán thành công");
        } else {
          // Thử lấy thông tin đơn hàng ngay cả khi thanh toán không xác định được
          try {
            const order = await orderService.getOrderById(Number(orderId));
            setOrderDetails(order);

            // Nếu phương thức thanh toán là COD, vẫn coi là thành công
            if (order.paymentMethod === "cod") {
              // Sửa ở đây - sử dụng giá trị string trực tiếp
              setVerified(true);
              toast.success("Đặt hàng thành công");
            } else {
              setVerified(false);
              toast.error(
                paymentStatusResponse.data?.message ||
                  "Thanh toán chưa hoàn tất"
              );
            }
          } catch (orderError) {
            console.error("Error fetching order:", orderError);
            setVerified(false);
            toast.error("Không thể lấy thông tin đơn hàng");
          }
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("Không thể xác thực thanh toán");
        setVerified(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [router, searchParams]);

  // Clear localStorage after verification
  useEffect(() => {
    if (!verifying) {
      localStorage.removeItem("currentOrderId");
      localStorage.removeItem("currentOrderNumber");
      localStorage.removeItem("currentOrderAmount");
      localStorage.removeItem("currentPaymentMethod");
    }
  }, [verifying]);

  if (verifying) {
    return (
      <div className="container py-12 text-center">
        <LoadingSpinner size="large" />
        <h2 className="mt-4 text-xl font-semibold">
          Đang xác thực thanh toán...
        </h2>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="container py-12 text-center">
        <div className="bg-red-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Thanh toán không thành công
          </h2>
          <p className="mb-4">
            Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.
          </p>
          <button
            onClick={() => router.push("/cart")}
            className="bg-primary text-white px-4 py-2 rounded-md"
          >
            Quay lại giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="bg-green-50 p-6 rounded-lg text-center mb-8">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">
          Đặt hàng thành công!
        </h2>
        <p className="mb-4">
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
        </p>
        {orderDetails && (
          <div className="text-left bg-white p-4 rounded-md shadow-sm mt-4">
            <h3 className="font-medium mb-2">Thông tin đơn hàng:</h3>
            <p>
              <span className="font-medium">Mã đơn hàng:</span>{" "}
              {orderDetails.orderNumber}
            </p>
            <p>
              <span className="font-medium">Tổng tiền:</span>{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(orderDetails.totalAmount)}
            </p>
          </div>
        )}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="bg-secondary text-white px-4 py-2 rounded-md"
          >
            Tiếp tục mua sắm
          </button>
          {orderDetails && (
            <button
              onClick={() => router.push(`/orders/${orderDetails.orderNumber}`)}
              className="bg-primary text-white px-4 py-2 rounded-md"
            >
              Xem chi tiết đơn hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
