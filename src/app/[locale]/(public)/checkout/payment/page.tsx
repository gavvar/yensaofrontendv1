"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

import { useCheckout } from "@/contexts/CheckoutContext";
import { useCart } from "@/contexts/CartContext";
import paymentService from "@/services/paymentService";

import PaymentMethods from "@/components/checkout/PaymentMethods";
import OrderSummary from "@/components/checkout/OrderSummary";
import DiscountCode from "@/components/checkout/DiscountCode";
import QRCodeModal from "@/components/checkout/QRCodeModal";
import LoadingButton from "@/components/common/LoadingButton";

export default function PaymentPage() {
  const router = useRouter();
  const { checkout, setSelectedPaymentMethod: updatePaymentMethod } =
    useCheckout();
  const { getSelectedItems } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [orderDetails, setOrderDetails] = useState({
    orderId: 0,
    orderNumber: "",
    amount: 0,
  });

  // Cập nhật phương thức thanh toán
  const handlePaymentMethodChange = (method: string) => {
    updatePaymentMethod(method);
  };

  // Kiểm tra nếu giỏ hàng trống
  useEffect(() => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      toast.error(
        "Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán"
      );
      router.push("/cart");
    }
  }, [getSelectedItems, router]);

  // Kiểm tra nếu chưa có thông tin giao hàng
  useEffect(() => {
    if (!checkout.shippingInfo.customerName) {
      toast.error("Vui lòng nhập thông tin giao hàng trước");
      router.push("/checkout/shipping");
    }
  }, [checkout.shippingInfo, router]);

  // Lưu phương thức thanh toán và tiếp tục
  const handleSavePaymentMethod = async () => {
    if (!checkout.selectedPaymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return false;
    }

    return true;
  };

  // Xử lý khi nhấn nút tiếp tục
  const handleContinue = async () => {
    if (!checkout.selectedPaymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    setIsLoading(true);

    try {
      // Lưu phương thức thanh toán
      const success = await handleSavePaymentMethod();
      if (!success) {
        setIsLoading(false);
        return;
      }

      // Chuẩn hóa phương thức thanh toán để so sánh
      const paymentMethod = checkout.selectedPaymentMethod.toLowerCase();
      console.log("Xử lý phương thức thanh toán:", paymentMethod);

      // Kiểm tra xem có phải thanh toán MoMo không
      if (paymentMethod === "momo") {
        console.log("Xử lý thanh toán MoMo");

        // Kiểm tra xem đã có orderId chưa
        if (!checkout.orderId) {
          toast.error("Không tìm thấy thông tin đơn hàng");
          router.push("/checkout/shipping");
          return;
        }

        // Gọi API để lấy payment URL
        const paymentResult = await paymentService.createPayment({
          orderId: checkout.orderId,
          paymentMethod: "momo",
          clientUrl: window.location.origin,
          orderNumber: checkout.orderNumber || "",
          amount:
            checkout.shippingFee +
            getSelectedItems().reduce(
              (sum, item) => sum + item.product.price * item.quantity,
              0
            ) -
            checkout.discount,
        });

        console.log("Payment result:", paymentResult);

        if (paymentResult.success && paymentResult.data?.paymentUrl) {
          // Lưu thông tin thanh toán
          setPaymentUrl(paymentResult.data.paymentUrl);
          setOrderDetails({
            orderId: checkout.orderId,
            orderNumber: checkout.orderNumber || "",
            amount:
              checkout.shippingFee +
              getSelectedItems().reduce(
                (sum, item) => sum + item.product.price * item.quantity,
                0
              ) -
              checkout.discount,
          });

          // Hiển thị modal để chuyển hướng đến thanh toán MoMo
          setShowQRModal(true);
          setIsLoading(false);
          return;
        } else {
          // Nếu không có paymentUrl, chuyển hướng trực tiếp
          if (paymentResult.data?.paymentUrl) {
            window.location.href = paymentResult.data.paymentUrl;
            return;
          } else {
            throw new Error(
              paymentResult.message || "Không thể khởi tạo thanh toán MoMo"
            );
          }
        }
      } else if (["zalopay", "vnpay"].includes(paymentMethod)) {
        // Xử lý các phương thức thanh toán online khác tương tự
        const paymentResult = await paymentService.createPayment({
          orderId: checkout.orderId || 0,
          paymentMethod: paymentMethod,
          clientUrl: window.location.origin,
          orderNumber: checkout.orderNumber || "",
          amount:
            checkout.shippingFee +
            getSelectedItems().reduce(
              (sum, item) => sum + item.product.price * item.quantity,
              0
            ) -
            checkout.discount,
        });

        if (paymentResult.success && paymentResult.data?.paymentUrl) {
          window.location.href = paymentResult.data.paymentUrl;
          return;
        } else {
          throw new Error(
            `Không thể khởi tạo thanh toán ${paymentMethod.toUpperCase()}`
          );
        }
      }

      // Nếu không phải thanh toán online, chuyển đến trang xác nhận đơn hàng
      router.push("/checkout/confirm");
    } catch (error) {
      console.error("Error in payment process:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra trong quá trình thanh toán"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý khi hoàn tất thanh toán
  const handlePaymentComplete = () => {
    setShowQRModal(false);
    router.push("/checkout/confirm");
  };

  const handleBack = () => {
    router.push("/checkout/shipping");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Tiêu đề trang */}
      <h1 className="text-2xl font-bold mb-6">Thanh toán đơn hàng</h1>

      {/* Các bước thanh toán */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-500 flex items-center justify-center border border-green-200">
              1
            </div>
            <span className="ml-2 text-green-500 font-medium">
              Thông tin giao hàng
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200">
              2
            </div>
            <span className="ml-2 text-amber-600 font-medium">
              Phương thức thanh toán
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center border border-gray-200">
              3
            </div>
            <span className="ml-2 text-gray-500">Xác nhận đơn hàng</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment methods section */}
        <div className="lg:col-span-2">
          <PaymentMethods
            onBack={handleBack}
            onSelectMethod={handlePaymentMethodChange}
            className="mb-6"
          />

          {/* Discount code */}
          <DiscountCode className="mb-6" />

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
            >
              <FiArrowLeft className="mr-2" /> Quay lại
            </button>

            <LoadingButton
              onClick={handleContinue}
              loading={isLoading}
              className="flex items-center px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              Tiếp tục <FiArrowRight className="ml-2" />
            </LoadingButton>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>

      {/* Modal thanh toán MoMo */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        paymentUrl={paymentUrl}
        orderInfo={orderDetails}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}
