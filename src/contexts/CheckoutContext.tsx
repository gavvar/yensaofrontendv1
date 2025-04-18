import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "react-toastify";

// Services
import orderService from "@/services/orderService";
import shippingService from "@/services/shippingService";
import paymentService from "@/services/paymentService";

// Types
import { CreateOrderRequest, OrderItem } from "@/types/order";
import {
  ShippingProvider,
  CalculateShippingFeeRequest,
} from "@/types/shipping";
import { PaymentMethod, PaymentData } from "@/types/payment";

// Hooks
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/authContext";

// Import thêm generateOrderNumber
import { generateOrderNumber } from "@/utils/order";
import { cartItemsToOrderItems } from "@/utils/order"; // Import hàm này để chuyển đổi cart items sang order items

// Types for shipping info
interface ShippingInfo {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  note?: string;
}

// Types for checkout state
interface CheckoutState {
  step: "shipping" | "payment" | "review" | "complete";
  shippingInfo: ShippingInfo;
  selectedPaymentMethod: string;
  shippingFee: number;
  couponCode: string;
  discount: number;
  tax: number;
  orderId?: number | null;
  orderNumber?: string;
  orderCreated: boolean;
  loading: boolean;
  shippingProviders: ShippingProvider[];
  paymentMethods: PaymentMethod[];
  couponApplied: boolean;
  couponMessage?: string;
  calculatingShipping: boolean;
  processingPayment: boolean;
  processingOrder: boolean;
  error?: string;
}

// Types for checkout context
interface CheckoutContextType {
  checkout: CheckoutState;
  setShippingInfo: (info: ShippingInfo) => void;
  setSelectedPaymentMethod: (methodId: string) => void;
  calculateShippingFee: (address: string) => Promise<number>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  placeOrder: () => Promise<boolean>;
  completePayment: (paymentData?: PaymentData) => Promise<boolean>;
  resetCheckout: () => void;
}

// Interface cho việc xử lý lỗi
interface ErrorObject {
  message: string;
  [key: string]: unknown;
}

interface ErrorResponse {
  response?: {
    data?: {
      error?: string | ErrorObject | Record<string, unknown>;
      message?: string;
    };
    status?: number;
  };
  message?: string;
  [key: string]: unknown;
}

// Create context
const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

// Initial state
const initialCheckoutState: CheckoutState = {
  step: "shipping",
  shippingInfo: {
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    note: "",
  },
  selectedPaymentMethod: "COD",
  shippingFee: 0,
  couponCode: "",
  discount: 0,
  tax: 0,
  orderCreated: false,
  loading: false,
  shippingProviders: [],
  paymentMethods: [],
  couponApplied: false,
  calculatingShipping: false,
  processingPayment: false,
  processingOrder: false,
};

// Thêm utility function để xử lý lỗi - đặt trước CheckoutProvider
const extractErrorMessage = (
  error: unknown,
  defaultMessage: string
): string => {
  // Trường hợp error là null hoặc undefined
  if (!error) return defaultMessage;

  // Trường hợp error là Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Trường hợp error là Axios error
  if (typeof error === "object" && "response" in error) {
    const axiosError = error as ErrorResponse;

    // Kiểm tra error.response.data.error
    if (axiosError.response?.data?.error) {
      const errorData = axiosError.response.data.error;

      if (typeof errorData === "string") {
        return errorData;
      } else if (
        typeof errorData === "object" &&
        "message" in errorData &&
        typeof errorData.message === "string"
      ) {
        return errorData.message;
      }
    }

    // Kiểm tra error.response.data.message
    if (
      axiosError.response?.data?.message &&
      typeof axiosError.response.data.message === "string"
    ) {
      return axiosError.response.data.message;
    }

    // Kiểm tra error.message
    if (axiosError.message && typeof axiosError.message === "string") {
      return axiosError.message;
    }
  }

  return defaultMessage;
};

// Cập nhật phần dependency injection
export const CheckoutProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [checkout, setCheckout] = useState<CheckoutState>(initialCheckoutState);
  const {
    clearCart,
    getSelectedItems,

    getTotalAmount,
  } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Load shipping providers and payment methods
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setCheckout((prev) => ({ ...prev, loading: true }));

        // Load shipping providers
        const providers = await shippingService.getShippingProviders();

        // Load payment methods
        const methods = await paymentService.getPaymentMethods();

        setCheckout((prev) => ({
          ...prev,
          shippingProviders: providers,
          paymentMethods: methods,
          loading: false,
        }));
      } catch (error) {
        console.error("Error loading checkout data:", error);
        setCheckout((prev) => ({
          ...prev,
          loading: false,
          error: "Không thể tải dữ liệu thanh toán. Vui lòng thử lại sau.",
        }));
      }
    };

    loadInitialData();
  }, []);

  // Prefill user information if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setCheckout((prev) => ({
        ...prev,
        shippingInfo: {
          ...prev.shippingInfo,
          customerName: user.fullName || "",
          customerEmail: user.email || "",
          customerPhone: user.phone || "",
          customerAddress: user.address || "",
        },
      }));
    }
  }, [isAuthenticated, user]);

  // Set shipping information
  const setShippingInfo = useCallback((info: ShippingInfo) => {
    setCheckout((prev) => ({
      ...prev,
      shippingInfo: info,
    }));
  }, []);

  // Sửa lại hàm setSelectedPaymentMethod để tránh giá trị undefined
  const setSelectedPaymentMethod = useCallback((methodId: string) => {
    if (!methodId) {
      console.warn("Attempt to set payment method with undefined/empty value");
      return; // Bỏ qua nếu giá trị là undefined hoặc chuỗi rỗng
    }

    console.log("Setting payment method to:", methodId);

    setCheckout((prev) => {
      // Chỉ cập nhật nếu phương thức khác với phương thức hiện tại
      if (prev.selectedPaymentMethod === methodId) return prev;

      return {
        ...prev,
        selectedPaymentMethod: methodId,
      };
    });
  }, []);

  // Calculate shipping fee
  const calculateShippingFee = useCallback(
    async (address: string): Promise<number> => {
      try {
        setCheckout((prev) => ({ ...prev, calculatingShipping: true }));

        const requestData: CalculateShippingFeeRequest = {
          address,
          totalAmount: getTotalAmount(),
          // Include other relevant data like product IDs, weight, etc.
        };

        const response = await shippingService.calculateShippingFee(
          requestData
        );

        if (response.success) {
          const fee = response.data.fee;
          setCheckout((prev) => ({
            ...prev,
            shippingFee: fee,
            calculatingShipping: false,
          }));
          return fee;
        } else {
          throw new Error(response.message || "Không thể tính phí vận chuyển");
        }
      } catch (error: unknown) {
        console.error("Error calculating shipping fee:", error);

        const errorMessage = extractErrorMessage(
          error,
          "Không thể tính phí vận chuyển"
        );

        setCheckout((prev) => ({
          ...prev,
          calculatingShipping: false,
          error: errorMessage,
        }));

        return 0;
      }
    },
    [getTotalAmount]
  );

  // Apply coupon
  const applyCoupon = useCallback(
    async (code: string): Promise<boolean> => {
      if (!code.trim()) {
        toast.error("Vui lòng nhập mã giảm giá");
        return false;
      }

      try {
        const requestData = {
          code,
          totalAmount: getTotalAmount(),
          // Optionally include items data if required by API
          cartItems: getSelectedItems().map((item) => ({
            productId: item.product.id,
            price: item.product.price,
            quantity: item.quantity,
          })),
        };

        const response = await paymentService.applyCoupon(requestData);

        if (response.success && response.data?.valid) {
          // Tìm giá trị discount từ response - ưu tiên dùng discountAmount
          const discountAmount =
            response.data.discountAmount !== undefined
              ? response.data.discountAmount
              : response.data.discount !== undefined
              ? response.data.discount
              : 0;

          // Đảm bảo giá trị là số
          const numericDiscount =
            typeof discountAmount === "number"
              ? discountAmount
              : parseFloat(String(discountAmount)) || 0;

          setCheckout((prev) => ({
            ...prev,
            couponCode: code,
            discount: numericDiscount,
            couponApplied: true,
            couponMessage: "Đã áp dụng mã giảm giá",
          }));

          toast.success("Đã áp dụng mã giảm giá");
          return true;
        } else {
          setCheckout((prev) => ({
            ...prev,
            couponApplied: false,
            couponMessage:
              response.data?.message ||
              response.message ||
              "Mã giảm giá không hợp lệ",
          }));

          toast.error(
            response.data?.message ||
              response.message ||
              "Mã giảm giá không hợp lệ"
          );
          return false;
        }
      } catch (error: unknown) {
        console.error("Error applying coupon:", error);

        const errorMessage = extractErrorMessage(
          error,
          "Lỗi khi áp dụng mã giảm giá"
        );

        setCheckout((prev) => ({
          ...prev,
          couponApplied: false,
          couponMessage: errorMessage,
        }));

        toast.error(errorMessage);
        return false;
      }
    },
    [getTotalAmount, getSelectedItems]
  );

  // Remove coupon
  const removeCoupon = useCallback(() => {
    setCheckout((prev) => ({
      ...prev,
      couponCode: "",
      discount: 0,
      couponApplied: false,
      couponMessage: undefined,
    }));

    toast.success("Đã xóa mã giảm giá");
  }, []);

  // Go to next step
  const goToNextStep = useCallback(() => {
    setCheckout((prev) => {
      let nextStep: CheckoutState["step"] = prev.step;

      if (prev.step === "shipping") nextStep = "payment";
      else if (prev.step === "payment") nextStep = "review";

      return {
        ...prev,
        step: nextStep,
      };
    });
  }, []);

  // Go to previous step
  const goToPreviousStep = useCallback(() => {
    setCheckout((prev) => {
      let prevStep: CheckoutState["step"] = prev.step;

      if (prev.step === "payment") prevStep = "shipping";
      else if (prev.step === "review") prevStep = "payment";

      return {
        ...prev,
        step: prevStep,
      };
    });
  }, []);

  // Trong placeOrder, sửa lại cách lấy orderItems
  const placeOrder = useCallback(async (): Promise<boolean> => {
    try {
      setCheckout((prev) => ({ ...prev, processingOrder: true }));

      // Đảm bảo mảng items luôn tồn tại và không rỗng
      const selectedItems = getSelectedItems() || [];

      if (selectedItems.length === 0) {
        toast.error("Vui lòng chọn sản phẩm để thanh toán");
        setCheckout((prev) => ({ ...prev, processingOrder: false }));
        return false;
      }

      // Tính tổng giá trị đơn hàng
      const subtotal = getTotalAmount();
      const totalAmount =
        subtotal + checkout.shippingFee - checkout.discount + checkout.tax;

      // Tạo mã đơn hàng ngẫu nhiên
      const orderNumber = generateOrderNumber();

      // Chuyển đổi cart items sang order items với định dạng phù hợp với API
      const cartItems = getSelectedItems();

      // Sử dụng hàm chuyển đổi từ utils/order.ts
      const orderItems = cartItemsToOrderItems(cartItems).map((item) => {
        return {
          productId: item.productId || 0,
          productName: item.productName || "",
          price: item.price || 0,
          quantity: item.quantity || 0,
          subtotal: item.subtotal || 0,
          productImage: item.productImage,
          // Thêm các trường bắt buộc mà backend sẽ điền sau
          id: 0, // ID tạm thời, server sẽ tạo ID thực tế
          orderId: 0, // OrderId tạm thời, server sẽ gán giá trị thực tế
        } as OrderItem;
      });

      // Log để debug
      console.log("Order data being prepared:", {
        customer: {
          name: checkout.shippingInfo.customerName,
          email: checkout.shippingInfo.customerEmail,
          phone: checkout.shippingInfo.customerPhone,
          address: checkout.shippingInfo.customerAddress,
        },
        payment: {
          method: checkout.selectedPaymentMethod,
          subtotal,
          shipping: checkout.shippingFee,
          discount: checkout.discount,
          tax: checkout.tax,
          total: totalAmount,
        },
        items: orderItems,
      });

      // Create order data theo đúng cấu trúc backend mong đợi
      const orderData: CreateOrderRequest = {
        customerName: checkout.shippingInfo.customerName,
        customerEmail: checkout.shippingInfo.customerEmail,
        customerPhone: checkout.shippingInfo.customerPhone,
        customerAddress: checkout.shippingInfo.customerAddress,
        paymentMethod: checkout.selectedPaymentMethod,
        shippingFee: checkout.shippingFee,
        discount: checkout.discount || 0,
        tax: checkout.tax || 0,
        couponCode: checkout.couponCode || undefined,
        note: checkout.shippingInfo.note || "",
        // Thêm các trường bắt buộc
        orderNumber: orderNumber,
        subtotal: subtotal,
        totalAmount: totalAmount,
        items: orderItems,
      };

      // Create order
      const response = await orderService.createOrder(orderData);

      if (response.success) {
        // Xử lý response.data an toàn hơn
        const responseData = response.data || {};
        const orderId = responseData.orderId || responseData.id || null;
        const respOrderNumber = responseData.orderNumber || orderNumber;

        if (!orderId) {
          console.warn("Missing orderId in response:", response);
        }

        setCheckout((prev) => ({
          ...prev,
          orderId: orderId,
          orderNumber: respOrderNumber,
          orderCreated: true,
          processingOrder: false,
          step: "complete",
        }));

        // Sau khi tạo đơn hàng thành công
        toast.success(`Đơn hàng #${respOrderNumber} đã được tạo thành công!`);

        // Clear cart without passing arguments
        clearCart();

        return true;
      } else {
        throw new Error(response.message || "Không thể tạo đơn hàng");
      }
    } catch (error: unknown) {
      // Thêm kiểu unknown
      console.error("Error placing order:", error);

      const errorMessage = extractErrorMessage(
        error,
        "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại."
      );

      setCheckout((prev) => ({
        ...prev,
        processingOrder: false,
        error: errorMessage,
      }));

      toast.error(errorMessage);
      return false;
    }
  }, [
    checkout.shippingInfo,
    checkout.selectedPaymentMethod,
    checkout.shippingFee,
    checkout.discount,
    checkout.tax,
    checkout.couponCode,
    getSelectedItems,
    getTotalAmount,
    clearCart,
  ]);

  // Complete payment (for online payment methods)
  const completePayment = useCallback(async (): Promise<boolean> => {
    if (
      !checkout.orderId ||
      !checkout.orderNumber ||
      !checkout.selectedPaymentMethod
    ) {
      setCheckout((prev) => ({
        ...prev,
        error: "Thiếu thông tin đơn hàng hoặc phương thức thanh toán",
      }));
      return false;
    }

    setCheckout((prev) => ({ ...prev, processingPayment: true }));

    try {
      // Chuẩn hóa mã phương thức thanh toán
      const paymentMethod = checkout.selectedPaymentMethod.toLowerCase();

      // Xử lý cho các phương thức thanh toán online
      if (["momo", "zalopay", "vnpay"].includes(paymentMethod)) {
        // Lưu thông tin đơn hàng vào localStorage để tái sử dụng sau khi quay lại
        localStorage.setItem("currentOrderId", checkout.orderId.toString());
        localStorage.setItem("currentOrderNumber", checkout.orderNumber);
        localStorage.setItem(
          "currentOrderAmount",
          (checkout.shippingFee + checkout.discount + checkout.tax).toString()
        );
        localStorage.setItem("currentPaymentMethod", paymentMethod);

        // Khởi tạo thanh toán
        const response = await paymentService.createPayment({
          orderId: checkout.orderId,
          paymentMethod: paymentMethod,
          clientUrl: window.location.origin,
          orderNumber: checkout.orderNumber,
          amount: checkout.shippingFee + checkout.discount + checkout.tax,
        });

        if (response.success && response.data?.paymentUrl) {
          // Chuyển hướng người dùng đến cổng thanh toán
          window.location.href = response.data.paymentUrl;
          return true;
        } else {
          throw new Error(
            response.message || "Không thể tạo yêu cầu thanh toán"
          );
        }
      }
      // Đối với thanh toán COD hoặc banking (không cần redirect)
      else {
        // Đánh dấu đơn hàng đã hoàn tất và chuyển đến trang xác nhận
        setCheckout((prev) => ({
          ...prev,
          step: "complete",
        }));

        return true;
      }
    } catch (error) {
      console.error("Payment error:", error);
      setCheckout((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi xử lý thanh toán",
      }));
      return false;
    } finally {
      setCheckout((prev) => ({ ...prev, processingPayment: false }));
    }
  }, [
    checkout.orderId,
    checkout.orderNumber,
    checkout.selectedPaymentMethod,
    checkout.total,
    checkout.discount,
    checkout.shippingFee,
    checkout.tax,
  ]);

  // Reset checkout state
  const resetCheckout = useCallback(() => {
    setCheckout(initialCheckoutState);
  }, []);

  // Context value
  const value: CheckoutContextType = {
    checkout,
    setShippingInfo,
    setSelectedPaymentMethod,
    calculateShippingFee,
    applyCoupon,
    removeCoupon,
    goToNextStep,
    goToPreviousStep,
    placeOrder,
    completePayment,
    resetCheckout,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

// Custom hook to use the checkout context
export const useCheckout = (): CheckoutContextType => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};
