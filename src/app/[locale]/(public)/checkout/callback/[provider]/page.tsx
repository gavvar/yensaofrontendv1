"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import PaymentProcessor from "@/components/payment/PaymentProcessor";

export default function PaymentCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  // Cập nhật state để tránh lỗi unused var
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Log thông tin callback
    console.log("Payment callback:", {
      provider: params.provider,
      params: Object.fromEntries(searchParams.entries()),
    });

    // Kiểm tra nếu có lỗi rõ ràng từ cổng thanh toán
    if (
      searchParams.get("resultCode") === "1003" || // MoMo error
      searchParams.get("errorCode") === "1" || // ZaloPay error
      searchParams.get("vnp_ResponseCode") === "24" // VNPay error
    ) {
      toast.error("Thanh toán đã bị hủy bởi người dùng");
    }

    setIsProcessing(false);
  }, [params, searchParams]);

  return (
    <div className="container mx-auto p-6">
      {isProcessing ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-lg">Đang xử lý kết quả thanh toán...</p>
        </div>
      ) : (
        <PaymentProcessor />
      )}
    </div>
  );
}
