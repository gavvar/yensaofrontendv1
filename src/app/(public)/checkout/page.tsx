"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { FiArrowLeft, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/authContext";
import { useCheckout } from "@/contexts/CheckoutContext";

import ShippingForm from "@/components/checkout/ShippingForm";
import PaymentMethods from "@/components/checkout/PaymentMethods";
import OrderSummary from "@/components/checkout/OrderSummary";
import DiscountCode from "@/components/checkout/DiscountCode";
import CartActions from "@/components/cart/CartActions";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { getSelectedItems } = useCart();
  const {
    checkout,
    goToNextStep,
    goToPreviousStep,
    placeOrder,
    completePayment,
    resetCheckout,
  } = useCheckout();

  const [isInitializing, setIsInitializing] = useState(true);

  // Check if user is authenticated and cart has items
  useEffect(() => {
    const checkRequirements = async () => {
      // Short delay to allow contexts to initialize
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để tiến hành thanh toán");
        router.push("/login?redirect=/checkout");
        return;
      }

      const selectedItems = getSelectedItems();
      if (selectedItems.length === 0) {
        toast.error("Giỏ hàng của bạn đang trống");
        router.push("/cart");
        return;
      }

      setIsInitializing(false);
    };

    checkRequirements();

    // Reset checkout state when component unmounts
    return () => {
      resetCheckout();
    };
  }, [isAuthenticated, router, getSelectedItems, resetCheckout]);

  // Handle form submissions for each step
  const handleShippingSubmit = () => {
    goToNextStep();
  };

  const handlePaymentSubmit = () => {
    goToNextStep();
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    // Kiểm tra xem đã có phương thức thanh toán được chọn chưa
    if (!checkout.selectedPaymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    // Hiển thị loading
    toast.info("Đang xử lý đơn hàng của bạn...");

    const success = await placeOrder();
    if (success) {
      // If order was placed successfully, handle payment
      await completePayment();

      // Điều hướng đến trang success với các tham số
      if (checkout.orderId && checkout.orderNumber) {
        router.push(
          `/checkout/success?orderId=${checkout.orderId}&orderNumber=${checkout.orderNumber}`
        );
      }
    }
  };

  // Show loading state
  if (isInitializing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }

  // Render content based on the current step
  const renderStepContent = () => {
    switch (checkout.step) {
      case "shipping":
        return <ShippingForm onSubmit={handleShippingSubmit} />;

      case "payment":
        return (
          <PaymentMethods
            onBack={goToPreviousStep}
            onSubmit={handlePaymentSubmit}
          />
        );

      case "review":
        return (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Xác nhận đơn hàng</h2>

            <div className="mb-6">
              <p className="text-gray-900 mb-4">
                Vui lòng kiểm tra lại thông tin đơn hàng của bạn trước khi đặt
                hàng.
              </p>

              <div className="flex items-start p-4 bg-amber-50 text-amber-800 rounded-md mb-4">
                <FiAlertTriangle className="flex-shrink-0 mt-0.5 mr-3" />
                <p className="text-sm">
                  Lưu ý: Đơn hàng sau khi đặt sẽ không thể thay đổi thông tin
                  giao hàng. Bạn chỉ có thể hủy đơn hàng nếu đơn hàng chưa được
                  xử lý.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 space-y-2 sm:space-y-0">
              <button
                onClick={goToPreviousStep}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiArrowLeft className="mr-2" />
                Quay lại
              </button>

              <CartActions variant="checkout" onAction={handlePlaceOrder} />
            </div>
          </div>
        );

      case "complete":
        // After order is placed, user should be redirected to success page
        // This is just a fallback
        return (
          <div className="bg-white shadow-sm rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <FiCheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              Đặt hàng thành công!
            </h2>
            <p className="text-gray-900 mb-6">
              Đơn hàng của bạn đã được tạo thành công. Mã đơn hàng: #
              {checkout.orderNumber}
            </p>
            <Link
              href={`/orders/${checkout.orderId}`}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
            >
              Xem chi tiết đơn hàng
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

      {/* Checkout steps indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          <div
            className={`flex-1 text-center ${
              checkout.step === "shipping" ? "text-amber-600 font-medium" : ""
            }`}
          >
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                checkout.step === "shipping"
                  ? "bg-amber-600 text-white"
                  : checkout.step === "payment" ||
                    checkout.step === "review" ||
                    checkout.step === "complete"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              1
            </div>
            <div className="mt-2">Thông tin giao hàng</div>
          </div>

          <div
            className={`flex-1 text-center ${
              checkout.step === "payment" ? "text-amber-600 font-medium" : ""
            }`}
          >
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                checkout.step === "payment"
                  ? "bg-amber-600 text-white"
                  : checkout.step === "review" || checkout.step === "complete"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              2
            </div>
            <div className="mt-2">Phương thức thanh toán</div>
          </div>

          <div
            className={`flex-1 text-center ${
              checkout.step === "review" ? "text-amber-600 font-medium" : ""
            }`}
          >
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                checkout.step === "review"
                  ? "bg-amber-600 text-white"
                  : checkout.step === "complete"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              3
            </div>
            <div className="mt-2">Xác nhận đơn hàng</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - Changes based on current step */}
        <div className="lg:col-span-2">{renderStepContent()}</div>

        {/* Sidebar - Order summary & coupon */}
        <div className="lg:col-span-1 space-y-4">
          <OrderSummary
            showDetails={
              checkout.step === "review" || checkout.step === "complete"
            }
          />

          {checkout.step !== "complete" && <DiscountCode />}

          {/* Additional info */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-base font-medium mb-3">Hỗ trợ khách hàng</h3>
            <p className="text-sm text-gray-900 mb-2">
              Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với
              chúng tôi.
            </p>
            <div className="text-sm">
              <p>
                <span className="font-medium">Hotline:</span> 0123 456 789
              </p>
              <p>
                <span className="font-medium">Email:</span> support@yensao.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
