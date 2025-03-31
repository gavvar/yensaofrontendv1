import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/authContext";
import orderService from "@/services/orderService";
import paymentService from "@/services/paymentService";
import { CreateOrderRequest } from "@/types/order";
import {
  ShippingDetails,
  PaymentMethod,
  CouponResponse,
  CheckoutStep,
} from "@/types/checkout";
import {
  calculateOrderTotal,
  calculateShippingFee,
  calculateTax,
  cartItemsToOrderItems,
  generateOrderNumber,
} from "@/utils/order";
import { CartItem } from "@/contexts/CartContext";

interface CheckoutState {
  step: CheckoutStep;
  selectedItems: CartItem[];
  shippingDetails: ShippingDetails | null;
  paymentMethod: PaymentMethod | null;
  shippingFee: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  couponCode: string | null;
  couponDetails: CouponResponse | null;
  orderId: number | null;
  orderNumber: string | null;
  paymentUrl: string | null;
  paymentStatus?: string;
  paymentInfo?: {
    transactionId?: string; // Cho phép undefined
    paidAt?: string; // Cho phép undefined
    method: string;
  };
  error?: string;
}

interface UseCheckoutReturn {
  checkout: CheckoutState;
  initializeCheckout: (items: CartItem[]) => void;
  setShippingDetails: (details: ShippingDetails) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  placeOrder: () => Promise<boolean>;
  completePayment: () => Promise<boolean>;
  resetCheckout: () => void;
  calculateSummary: () => {
    subtotal: number;
    shippingFee: number;
    discount: number;
    tax: number;
    total: number;
  };
  checkPaymentStatus: (orderId: number) => Promise<boolean>;
}

export const useCheckout = (): UseCheckoutReturn => {
  const router = useRouter();
  const { getSelectedItems, removeItems } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Initialize with default state
  const [state, setState] = useState<CheckoutState>({
    step: "shipping",
    selectedItems: [],
    shippingDetails: null,
    paymentMethod: null,
    shippingFee: 0,
    discount: 0,
    tax: 0,
    subtotal: 0,
    total: 0,
    couponCode: null,
    couponDetails: null,
    orderId: null,
    orderNumber: null,
    paymentUrl: null,
  });

  // Initialize checkout with selected items from cart
  const initializeCheckout = useCallback(
    (items: CartItem[]) => {
      if (!items || items.length === 0) {
        // If no items, use selected items from cart
        items = getSelectedItems();
      }

      const subtotal = calculateOrderTotal(items);
      const shippingFee = calculateShippingFee(subtotal);
      const tax = calculateTax(subtotal);
      const total = subtotal + shippingFee + tax;

      setState((prev) => ({
        ...prev,
        selectedItems: items,
        subtotal,
        shippingFee,
        tax,
        total,
        // Pre-fill shipping details if we have user data
        shippingDetails: user
          ? {
              fullName: user.fullName || "",
              email: user.email || "",
              phone: user.phone || "",
              address: user.address || "",
              city: "",
              district: "",
              ward: "",
              note: "",
            }
          : null,
      }));
    },
    [getSelectedItems, user]
  );

  // Initialize checkout on first load if user is authenticated
  useEffect(() => {
    if (isAuthenticated && state.selectedItems.length === 0) {
      initializeCheckout([]);
    }
  }, [isAuthenticated, initializeCheckout, state.selectedItems.length]);

  // Set shipping details
  const setShippingDetails = useCallback((details: ShippingDetails) => {
    setState((prev) => {
      // Recalculate shipping fee based on new address
      const shippingFee = calculateShippingFee(
        prev.subtotal,
        `${details.address}, ${details.ward}, ${details.district}, ${details.city}`
      );

      // Recalculate total with new shipping fee
      const total = prev.subtotal + shippingFee - prev.discount + prev.tax;

      return {
        ...prev,
        shippingDetails: details,
        shippingFee,
        total,
      };
    });
  }, []);

  // Set payment method
  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setState((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  }, []);

  // Apply coupon code
  const applyCoupon = useCallback(
    async (code: string): Promise<boolean> => {
      try {
        // Validate we have items and shipping details
        if (state.selectedItems.length === 0) {
          toast.error("Vui lòng chọn sản phẩm để áp dụng mã giảm giá");
          return false;
        }

        const response: CouponResponse = await orderService.validateCoupon(
          code,
          state.subtotal
        );

        if (response.valid) {
          // Calculate discount amount
          let discountAmount = 0;

          // Nếu response đã có discountAmount, sử dụng nó
          if (response.discountAmount) {
            discountAmount = response.discountAmount;
          }
          // Nếu không, tính dựa vào thông tin mã giảm giá
          else if (response.coupon) {
            // Lấy thông tin từ coupon object nếu có
            const discountType = response.discountType || response.coupon.type;
            const discountValue =
              response.discountValue || response.coupon.value;
            const maxDiscount =
              response.maxDiscount || response.coupon.maxDiscount;

            if (discountType === "percentage") {
              discountAmount = (state.subtotal * discountValue) / 100;
              // Apply max discount if specified
              if (maxDiscount && discountAmount > maxDiscount) {
                discountAmount = maxDiscount;
              }
            } else {
              discountAmount = discountValue;
            }
          }

          // Recalculate total
          const total =
            state.subtotal + state.shippingFee - discountAmount + state.tax;

          setState((prev) => ({
            ...prev,
            couponCode: code,
            couponDetails: response,
            discount: discountAmount,
            total,
          }));

          toast.success("Mã giảm giá đã được áp dụng");
          return true;
        } else {
          toast.error(response.message || "Mã giảm giá không hợp lệ");
          return false;
        }
      } catch (err) {
        console.error("Error applying coupon:", err);
        toast.error("Không thể áp dụng mã giảm giá. Vui lòng thử lại sau.");
        return false;
      }
    },
    [state.selectedItems, state.subtotal, state.shippingFee, state.tax]
  );

  // Remove coupon
  const removeCoupon = useCallback(() => {
    setState((prev) => {
      // Recalculate total without discount
      const total = prev.subtotal + prev.shippingFee + prev.tax;

      return {
        ...prev,
        couponCode: null,
        couponDetails: null,
        discount: 0,
        total,
      };
    });

    toast.success("Đã xóa mã giảm giá");
  }, []);

  // Navigate to next checkout step
  const goToNextStep = useCallback(() => {
    setState((prev) => {
      const currentStepIndex = [
        "shipping",
        "payment",
        "review",
        "complete",
      ].indexOf(prev.step);
      const nextStep = ["shipping", "payment", "review", "complete"][
        Math.min(currentStepIndex + 1, 3)
      ];

      return {
        ...prev,
        step: nextStep as CheckoutStep,
      };
    });
  }, []);

  // Navigate to previous checkout step
  const goToPreviousStep = useCallback(() => {
    setState((prev) => {
      const currentStepIndex = [
        "shipping",
        "payment",
        "review",
        "complete",
      ].indexOf(prev.step);
      const prevStep = ["shipping", "payment", "review", "complete"][
        Math.max(0, currentStepIndex - 1)
      ];

      return {
        ...prev,
        step: prevStep as CheckoutStep,
      };
    });
  }, []);

  // Calculate order summary
  const calculateSummary = useCallback(() => {
    return {
      subtotal: state.subtotal,
      shippingFee: state.shippingFee,
      discount: state.discount,
      tax: state.tax,
      total: state.total,
    };
  }, [
    state.subtotal,
    state.shippingFee,
    state.discount,
    state.tax,
    state.total,
  ]);

  // Place the order
  const placeOrder = useCallback(async (): Promise<boolean> => {
    try {
      // Validate required data
      if (!state.shippingDetails) {
        toast.error("Vui lòng nhập thông tin giao hàng");
        return false;
      }

      if (!state.paymentMethod) {
        toast.error("Vui lòng chọn phương thức thanh toán");
        return false;
      }

      // Xác định paymentMethod một cách đơn giản
      let paymentMethodValue: string;
      if (typeof state.paymentMethod === "string") {
        paymentMethodValue = state.paymentMethod;
      } else if (state.paymentMethod?.code) {
        paymentMethodValue = state.paymentMethod.code;
      } else {
        toast.error("Phương thức thanh toán không hợp lệ");
        return false;
      }

      if (state.selectedItems.length === 0) {
        toast.error("Giỏ hàng của bạn đang trống");
        return false;
      }

      // Create order payload
      const orderData: CreateOrderRequest = {
        customerName: state.shippingDetails.fullName,
        customerEmail: state.shippingDetails.email,
        customerPhone: state.shippingDetails.phone,
        customerAddress: `${state.shippingDetails.address}, ${state.shippingDetails.ward}, ${state.shippingDetails.district}, ${state.shippingDetails.city}`,
        note: state.shippingDetails.note,
        orderNumber: generateOrderNumber(),
        subtotal: state.subtotal,
        shippingFee: state.shippingFee,
        discount: state.discount,
        tax: state.tax,
        totalAmount: state.total,
        paymentMethod: paymentMethodValue, // Sử dụng trực tiếp giá trị
        items: cartItemsToOrderItems(state.selectedItems),
        couponCode: state.couponCode || undefined,
      };

      console.log("Sending order data:", orderData);

      // Create the order
      const response = await orderService.createOrder(orderData);

      console.log("Order response:", response);

      if (response.success) {
        // Extracting data safely with fallbacks from response.data
        const orderId = response.data?.orderId || response.data?.id || null;
        const orderNumber =
          response.data?.orderNumber || orderData.orderNumber || null;

        setState((prev) => ({
          ...prev,
          orderId,
          orderNumber,
          step: "payment",
        }));

        toast.success("Đặt hàng thành công!");

        // Remove these items from the cart
        const itemIds = state.selectedItems.map((item) => item.id);
        if (itemIds.length > 0) {
          await removeItems(itemIds);
        }

        return true;
      } else {
        throw new Error(response.message || "Không thể tạo đơn hàng");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Không thể đặt hàng. Vui lòng thử lại sau."
      );
      return false;
    }
  }, [
    state.shippingDetails,
    state.paymentMethod,
    state.selectedItems,
    state.subtotal,
    state.shippingFee,
    state.discount,
    state.tax,
    state.total,
    state.couponCode,
    removeItems,
  ]);

  // Sửa hàm completePayment để đảm bảo luôn có giá trị trả về
  const completePayment = useCallback(async (): Promise<boolean> => {
    try {
      if (!state.orderId) {
        toast.error("Không có đơn hàng để thanh toán");
        return false;
      }

      // Xác định paymentMethod đơn giản
      let paymentMethod: string;
      if (typeof state.paymentMethod === "string") {
        paymentMethod = state.paymentMethod;
      } else if (state.paymentMethod?.code) {
        paymentMethod = state.paymentMethod.code;
      } else {
        paymentMethod = "cod"; // Mặc định
      }

      // Kiểm tra nếu là COD, bỏ qua việc chuẩn hóa viết hoa
      if (paymentMethod.toLowerCase() === "cod") {
        // Set step to complete
        setState((prev) => ({
          ...prev,
          step: "complete",
        }));

        // Redirect to success page
        router.push(`/checkout/success?orderId=${state.orderId}`);
        return true;
      }

      // Lưu thông tin để xác thực sau khi quay về từ cổng thanh toán
      if (typeof window !== "undefined") {
        localStorage.setItem("currentOrderId", state.orderId.toString());
        localStorage.setItem("currentOrderNumber", state.orderNumber || "");
        localStorage.setItem("currentOrderAmount", state.total.toString());
        localStorage.setItem("currentPaymentMethod", paymentMethod);
      }

      // For online payment methods, create payment and get payment URL
      const paymentResponse = await paymentService.createPayment({
        orderId: state.orderId,
        orderNumber: state.orderNumber!,
        amount: state.total,
        paymentMethod: paymentMethod, // Sử dụng trực tiếp
        clientUrl: window.location.origin,
      });

      if (paymentResponse.success && paymentResponse.data?.paymentUrl) {
        // Save payment URL in state - convert undefined to null
        setState((prev) => ({
          ...prev,
          paymentUrl: paymentResponse.data.paymentUrl || null,
        }));

        // Redirect to payment gateway
        window.location.href = paymentResponse.data.paymentUrl;
        return true;
      } else {
        // Handle error case
        toast.error(
          paymentResponse.message ||
            "Không thể tạo thanh toán. Vui lòng thử lại sau."
        );
        return false;
      }
    } catch (err) {
      console.error("Error completing payment:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Không thể hoàn tất thanh toán. Vui lòng thử lại sau."
      );
      return false;
    }
  }, [
    state.orderId,
    state.orderNumber,
    state.paymentMethod,
    state.total,
    router,
  ]);

  /**
   * Kiểm tra trạng thái thanh toán của đơn hàng
   */
  const checkPaymentStatus = useCallback(
    async (orderId: number): Promise<boolean> => {
      try {
        const paymentStatusResponse = await paymentService.processPaymentStatus(
          orderId
        );

        if (
          paymentStatusResponse.success &&
          (paymentStatusResponse.data.paymentStatus === "paid" ||
            paymentStatusResponse.data.status === "success")
        ) {
          // Cập nhật state với thông tin thanh toán
          setState((prev) => ({
            ...prev,
            paymentStatus: "paid",
            paymentInfo: {
              transactionId: paymentStatusResponse.data.transactionId || "",
              paidAt:
                paymentStatusResponse.data.paidAt || new Date().toISOString(),
              method: paymentStatusResponse.data.paymentMethod || "unknown",
            },
          }));

          return true;
        } else {
          // Cập nhật state với thông tin thanh toán thất bại/chưa hoàn tất
          setState((prev) => ({
            ...prev,
            paymentStatus: "pending",
            error:
              paymentStatusResponse.data.message || "Thanh toán chưa hoàn tất",
          }));

          return false;
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        toast.error("Không thể kiểm tra trạng thái thanh toán");
        return false;
      }
    },
    [setState]
  );

  // Reset checkout state
  const resetCheckout = useCallback(() => {
    setState({
      step: "shipping",
      selectedItems: [],
      shippingDetails: null,
      paymentMethod: null,
      shippingFee: 0,
      discount: 0,
      tax: 0,
      subtotal: 0,
      total: 0,
      couponCode: null,
      couponDetails: null,
      orderId: null,
      orderNumber: null,
      paymentUrl: null,
    });
  }, []);

  return {
    checkout: state,
    initializeCheckout,
    setShippingDetails,
    setPaymentMethod,
    applyCoupon,
    removeCoupon,
    goToNextStep,
    goToPreviousStep,
    placeOrder,
    completePayment,
    resetCheckout,
    calculateSummary,
    checkPaymentStatus,
  };
};
