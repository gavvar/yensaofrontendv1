import React, { useEffect, useState } from "react";

import Image from "next/image";
import { FiArrowLeft, FiCreditCard, FiDollarSign } from "react-icons/fi";
import { useCheckout } from "@/contexts/CheckoutContext";
import paymentService from "@/services/paymentService";
import { PaymentMethod, PaymentMethodCode } from "@/types/payment";
import LoadingButton from "@/components/common/LoadingButton";

interface PaymentMethodsProps {
  onBack?: () => void;
  onSubmit?: () => void;
  className?: string;
  orderId?: number;
}

/**
 * Component chọn phương thức thanh toán
 */
const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  onBack,
  onSubmit,
  className = "",
  orderId,
}) => {
  const { checkout, setSelectedPaymentMethod } = useCheckout();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPayment] = useState(false);
  const [error, setError] = useState("");

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        setError("");
        console.log("Fetching payment methods...");

        const methods = await paymentService.getPaymentMethods();
        console.log("Payment methods received:", methods);

        // Kiểm tra dữ liệu
        if (!methods || methods.length === 0) {
          throw new Error("Không có phương thức thanh toán nào khả dụng");
        }

        // Không lọc isActive nữa vì đã xử lý trong API
        setPaymentMethods(methods);

        // Nếu chưa có phương thức thanh toán nào được chọn, đặt phương thức đầu tiên làm mặc định
        if (!checkout.selectedPaymentMethod && methods.length > 0) {
          const defaultMethodCode = (methods[0].code ||
            methods[0].id) as PaymentMethodCode;
          console.log("Setting default payment method:", defaultMethodCode);
          setSelectedPaymentMethod(defaultMethodCode);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải phương thức thanh toán"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [checkout.selectedPaymentMethod, setSelectedPaymentMethod]);

  // Handler khi chọn phương thức thanh toán
  const handleSelectPaymentMethod = (methodCode: PaymentMethodCode) => {
    console.log("Selected payment method:", methodCode);
    setSelectedPaymentMethod(methodCode);
  };

  // Render một phương thức thanh toán
  const renderPaymentMethod = (method: PaymentMethod) => {
    // Sử dụng method.code hoặc method.id (chuỗi) - ưu tiên code nếu có
    const methodCode = (method.code || method.id) as PaymentMethodCode;
    const isSelected = checkout.selectedPaymentMethod === methodCode;

    // Đảm bảo tất cả thuộc tính có giá trị mặc định khi không tồn tại
    const displayName =
      method.name || `Phương thức ${methodCode.toUpperCase()}`;
    const displayDescription = method.description || "Thanh toán đơn hàng";

    return (
      <div
        key={methodCode}
        className={`border rounded-lg p-4 cursor-pointer transition-all ${
          isSelected
            ? "border-amber-500 bg-amber-50"
            : "border-gray-200 hover:border-amber-300"
        }`}
        onClick={() => handleSelectPaymentMethod(methodCode)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 relative">
            {method.icon ? (
              <Image
                src={method.icon}
                alt={displayName}
                width={40}
                height={40}
                className="object-contain"
                onError={(e) => {
                  // Fallback icon nếu image lỗi
                  e.currentTarget.src =
                    methodCode === "cod"
                      ? "/images/payment/cod.png"
                      : "/images/payment/default.png";
                }}
              />
            ) : methodCode === "cod" ? (
              <FiDollarSign className="w-full h-full text-amber-500" />
            ) : (
              <FiCreditCard className="w-full h-full text-amber-500" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-medium">{displayName}</h3>
            <p className="text-sm text-gray-900">{displayDescription}</p>
          </div>

          <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center">
            {isSelected && (
              <div className="w-3 h-3 bg-amber-500 rounded-full" />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Handler cho nút Continue/Submit
  const handleSubmit = async () => {
    if (!checkout.selectedPaymentMethod) {
      setError("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (onSubmit) {
      onSubmit();
      return;
    }

    // Nếu không có onSubmit callback, xử lý payment tại đây
    // Bạn có thể thêm code xử lý payment ở đây nếu cần
  };

  // Trong phần render
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-900 hover:text-amber-600 flex items-center"
          >
            <FiArrowLeft className="mr-2" />
            Quay lại
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      ) : (
        <>
          <div className="space-y-3 my-6">
            {paymentMethods.length === 0 ? (
              <div className="p-4 border border-gray-200 rounded-md text-center text-gray-900">
                Không có phương thức thanh toán nào khả dụng
              </div>
            ) : (
              // Render tất cả phương thức từ API mà không lọc
              paymentMethods.map((method) => renderPaymentMethod(method))
            )}
          </div>

          {(onSubmit || orderId) && (
            <div className="mt-6">
              <LoadingButton
                type="button"
                className="w-full py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                loading={processingPayment}
                disabled={processingPayment || !checkout.selectedPaymentMethod}
                onClick={handleSubmit}
              >
                {processingPayment
                  ? "Đang xử lý..."
                  : onSubmit
                  ? "Tiếp tục"
                  : "Xác nhận thanh toán"}
              </LoadingButton>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentMethods;
