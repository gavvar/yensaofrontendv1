"use client";

import { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import PaymentProcessor from "@/components/payment/PaymentProcessor";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const provider = params.provider as string;

  useEffect(() => {
    // Log thông tin callback
    console.log("Payment callback:", {
      provider,
      params: Object.fromEntries(searchParams.entries()),
    });

    // Kiểm tra nếu có lỗi rõ ràng từ cổng thanh toán
    if (
      searchParams.get("resultCode") === "1003" || // MoMo error
      searchParams.get("errorCode") === "1" || // ZaloPay error
      searchParams.get("vnp_ResponseCode") === "24" // VNPay error
    ) {
      // Chuyển hướng đến trang lỗi thanh toán
      router.push(
        `/payment-error?message=${encodeURIComponent(
          "Thanh toán đã bị hủy bởi người dùng"
        )}`
      );
    }
  }, [provider, searchParams, router]);

  return <PaymentProcessor />;
}
