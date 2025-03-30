/**
 * Định nghĩa các type cho quá trình checkout
 */

// Các phương thức thanh toán
export type PaymentMethodCode =
  | "COD"
  | "ONLINE"
  | "TRANSFER"
  | "MOMO"
  | "VNPAY"
  | "ZALOPAY";

// Đổi tên interface này
export interface CheckoutPaymentMethod {
  code: PaymentMethodCode;
  name: string;
  description?: string;
  icon?: string;
  enabled: boolean;
}

// Import PaymentMethod từ payment.ts
import { PaymentMethod } from "./payment";
export type { PaymentMethod }; // Re-export

// Bước trong quá trình thanh toán
export type CheckoutStep = "shipping" | "payment" | "review" | "complete";

// Thông tin vận chuyển
export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note?: string;
}

// Response khi áp dụng mã giảm giá
export interface CouponResponse {
  valid: boolean;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscount?: number;
  message?: string;
}

// Các phương thức thanh toán mở rộng từ PaymentMethod (nếu cần)
// export interface CheckoutPaymentMethod extends PaymentMethod {
//   // Các trường bổ sung nếu cần
// }

// Thông tin tóm tắt đơn hàng
export interface OrderSummary {
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total: number;
}

// Request tạo đơn hàng
export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  note?: string;
  orderNumber: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string | PaymentMethod;
  items: {
    productId: number;
    quantity: number;
    price?: number;
    options?: Record<string, string | number | boolean>;
  }[];
  couponCode?: string;
}

// Response khi tạo đơn hàng
export interface CreateOrderResponse {
  success: boolean;
  orderId: number;
  orderNumber: string;
  message?: string;
}

// Request để xác thực mã giảm giá
export interface ValidateCouponRequest {
  code: string;
  totalAmount: number;
  items?: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

// Request cho thanh toán
export interface CreatePaymentRequest {
  orderId: number;
  orderNumber: string;
  amount: number;
  paymentMethod: string | PaymentMethod;
  returnUrl: string;
  cancelUrl?: string;
}

// Response cho thanh toán
export interface CreatePaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  message?: string;
}

// Thông tin cần thiết cho quá trình thanh toán
export interface CheckoutPaymentInfo {
  orderId: number;
  orderNumber: string;
  amount: number;
  paymentMethod: string | PaymentMethod;
  paymentUrl?: string;
  transactionId?: string;
  status?: string;
}
