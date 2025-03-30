import React, { useEffect, useState } from "react";
import { useCheckout } from "@/contexts/CheckoutContext";
import { PaymentMethod } from "@/types/payment";
import { FiArrowLeft, FiCreditCard, FiDollarSign } from "react-icons/fi";
import paymentService from "@/services/paymentService";

interface PaymentMethodsProps {
  onBack?: () => void;
  onSubmit?: () => void;
  className?: string;
}

/**
 * Component chọn phương thức thanh toán
 */
const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  onBack,
  onSubmit,
  className = "",
}) => {
  const { checkout, setSelectedPaymentMethod } = useCheckout();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        const methods = await paymentService.getPaymentMethods();
        setPaymentMethods(methods);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        setError("Không thể tải phương thức thanh toán. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  // Cập nhật useEffect nếu có
  useEffect(() => {
    // Nếu không có phương thức thanh toán nào được chọn, đặt COD làm mặc định
    if (!checkout.selectedPaymentMethod) {
      // Thêm điều kiện để không gọi lại khi đã có giá trị
      setSelectedPaymentMethod("COD");
    }
    // Chỉ chạy effect này một lần khi component mount
  }, []); // Giữ mảng dependencies rỗng

  // Sửa event handler để đảm bảo giá trị hợp lệ
  // Thêm cách ngăn chặn auto-scroll
  const handleSelectMethod = (method: string) => {
    if (!method || method === checkout.selectedPaymentMethod) return;

    // Ngăn chặn cuộn trang tự động
    const scrollPosition = window.scrollY;

    setSelectedPaymentMethod(method);

    // Khôi phục vị trí cuộn sau khi render
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkout.selectedPaymentMethod) {
      setError("Vui lòng chọn một phương thức thanh toán");
      return;
    }

    if (onSubmit) {
      onSubmit();
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex justify-center items-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-amber-600"
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
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-3 mb-6">
          {paymentMethods.length === 0 ? (
            <div className="p-4 border border-gray-200 rounded-md text-center text-gray-500">
              Không có phương thức thanh toán nào khả dụng
            </div>
          ) : (
            paymentMethods
              .filter((method) => method.isAvailable)
              .map((method) => (
                <div
                  key={method.id}
                  className={`relative border rounded-md p-4 flex items-center cursor-pointer transition-colors ${
                    checkout.selectedPaymentMethod === method.code
                      ? "border-amber-600 bg-amber-50"
                      : "border-gray-200 hover:border-amber-300"
                  }`}
                  onClick={() => handleSelectMethod(method.code)}
                >
                  <div className="mr-4">
                    <input
                      type="radio"
                      id={`payment-${method.code}`}
                      name="paymentMethod"
                      value={method.code}
                      checked={checkout.selectedPaymentMethod === method.code}
                      // Sửa onChange handler để tránh kích hoạt nhiều lần
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSelectMethod(method.code);
                        }
                      }}
                      className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex-1">
                    <label
                      htmlFor={`payment-${method.code}`}
                      className="block text-sm font-medium cursor-pointer"
                    >
                      {method.name}
                    </label>

                    {method.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {method.description}
                      </p>
                    )}
                  </div>

                  {method.icon ? (
                    <div className="w-10 h-10 flex-shrink-0">
                      <img
                        src={method.icon}
                        alt={method.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-md">
                      {method.code === "COD" ? (
                        <FiDollarSign className="text-gray-500" size={20} />
                      ) : (
                        <FiCreditCard className="text-gray-500" size={20} />
                      )}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>

        <div className="mt-8 flex justify-between">
          {onBack && (
            <button
              type="button" // Đảm bảo đây là type="button" không phải "submit"
              onClick={onBack}
              className="flex items-center justify-center w-1/2 border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-md hover:bg-gray-50 transition-colors"
            >
              <FiArrowLeft className="mr-2" size={16} />
              Quay lại
            </button>
          )}

          <button
            type="submit" // Thay đổi type thành "submit"
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={
              !checkout.selectedPaymentMethod || paymentMethods.length === 0
            }
          >
            Tiếp tục đến xác nhận đơn hàng
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethods;
